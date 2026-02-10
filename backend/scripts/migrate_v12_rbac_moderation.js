const { sql, connectDB } = require('../config/db');
require('dotenv').config();

const SUPER_ADMIN_EMAIL = 'yaman.tallozi@gmail.com';

async function migrateRBAC() {
    try {
        await connectDB();
        const pool = await sql.connect();

        console.log('Starting RBAC & Moderation Migration...');

        // 1. UPDATE USERS TABLE
        console.log('--- updating Users table ---');

        // Check if Role column exists
        const checkRole = await pool.request().query(`
            SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'Role'
        `);

        if (checkRole.recordset.length === 0) {
            console.log('Adding Role column to Users...');
            await pool.request().query(`
                ALTER TABLE Users ADD Role NVARCHAR(50) DEFAULT 'user' NOT NULL;
            `);
        } else {
            console.log('Role column already exists.');
        }

        // Migrate Data
        console.log('Migrating existing admin data...');
        await pool.request().query(`
            UPDATE Users SET Role = 'admin' WHERE IsAdmin = 1;
            UPDATE Users SET Role = 'user' WHERE IsAdmin = 0 OR IsAdmin IS NULL;
        `);

        // Set Super Admin
        console.log(`Setting Super Admin: ${SUPER_ADMIN_EMAIL}`);
        const superAdminResult = await pool.request()
            .input('email', sql.NVarChar, SUPER_ADMIN_EMAIL)
            .query(`UPDATE Users SET Role = 'super_admin', IsAdmin = 1 WHERE Email = @email`); // Keep IsAdmin=1 for safety during transition

        if (superAdminResult.rowsAffected[0] === 0) {
            console.warn(`WARNING: Super Admin email '${SUPER_ADMIN_EMAIL}' not found in database! User must register first.`);
        }

        // 2. UPDATE BOOKS TABLE
        console.log('--- updating Books table ---');

        const bookColumns = [
            { name: 'Status', type: "NVARCHAR(20) DEFAULT 'PENDING' NOT NULL" },
            { name: 'RejectionReason', type: "NVARCHAR(MAX)" },
            { name: 'CreatedBy', type: "INT" },
            { name: 'ApprovedBy', type: "INT" },
            { name: 'ApprovedAt', type: "DATETIME" }
        ];

        for (const col of bookColumns) {
            const checkCol = await pool.request().query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Books' AND COLUMN_NAME = '${col.name}'
            `);

            if (checkCol.recordset.length === 0) {
                console.log(`Adding ${col.name} column to Books...`);
                // For Status, we need to handle the NOT NULL constraint carefully with existing data
                if (col.name === 'Status') {
                    // First add nullable, then update, then alter to not null? 
                    // Or just add with default value, which applies to existing rows in SQL Server usually if NOT NULL specified? 
                    // SQL Server: Adding NOT NULL column with DEFAULT populates existing rows.
                    await pool.request().query(`ALTER TABLE Books ADD ${col.name} ${col.type}`);
                } else {
                    await pool.request().query(`ALTER TABLE Books ADD ${col.name} ${col.type}`);
                }
            }
        }

        // IMPORTANT: Set all EXISTING books to APPROVED so they don't disappear
        console.log('Setting all existing books to APPROVED...');
        await pool.request().query(`
            UPDATE Books SET Status = 'APPROVED', ApprovedAt = GETDATE() WHERE Status = 'PENDING' OR Status IS NULL
        `);

        // 3. ADD INT CONSTRAINTS (FKs) - Optional but good for integrity
        // Checking if we should enforce FK for CreatedBy/ApprovedBy. 
        // Let's do loose coupling for now to avoid migration errors if users were deleted, 
        // but ideally we should have FK. Skipped for simplicity in this migration script.

        console.log('Migration Completed Successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
}

migrateRBAC();
