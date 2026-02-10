/**
 * Migration Script: Add structured location fields to Users and Events tables
 * Run this script to add location picker support
 */

const { sql, connectDB } = require('../config/db');

async function migrate() {
    try {
        console.log('Connecting to database...');
        await connectDB();

        // Get a connection pool
        const pool = await sql.connect();

        console.log('Starting location fields migration...\n');

        // ============================================
        // 1. Add location fields to Users table
        // ============================================
        console.log('1. Adding location fields to Users table...');

        const userColumns = [
            { name: 'LocationID', type: 'NVARCHAR(100)' },
            { name: 'LocationProvider', type: 'NVARCHAR(50)' },
            { name: 'CountryCode', type: 'NVARCHAR(10)' },
            { name: 'CityNameEn', type: 'NVARCHAR(100)' },
            { name: 'CityNameAr', type: 'NVARCHAR(100)' },
            { name: 'LocationLat', type: 'DECIMAL(10,7)' },
            { name: 'LocationLng', type: 'DECIMAL(10,7)' }
        ];

        for (const col of userColumns) {
            try {
                await pool.request().query(`ALTER TABLE Users ADD ${col.name} ${col.type}`);
                console.log(`   ✓ Added Users.${col.name}`);
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('Column names')) {
                    console.log(`   - Users.${col.name} already exists, skipping`);
                } else {
                    throw err;
                }
            }
        }

        // ============================================
        // 2. Add location fields to Events table
        // ============================================
        console.log('\n2. Adding location fields to Events table...');

        const eventColumns = [
            { name: 'LocationID', type: 'NVARCHAR(100)' },
            { name: 'LocationProvider', type: 'NVARCHAR(50)' },
            { name: 'CountryCode', type: 'NVARCHAR(10)' },
            { name: 'CityNameEn', type: 'NVARCHAR(100)' },
            { name: 'CityNameAr', type: 'NVARCHAR(100)' },
            { name: 'LocationDisplay', type: 'NVARCHAR(200)' }, // Display label
            { name: 'LocationLat', type: 'DECIMAL(10,7)' },
            { name: 'LocationLng', type: 'DECIMAL(10,7)' }
        ];

        for (const col of eventColumns) {
            try {
                await pool.request().query(`ALTER TABLE Events ADD ${col.name} ${col.type}`);
                console.log(`   ✓ Added Events.${col.name}`);
            } catch (err) {
                if (err.message.includes('already exists') || err.message.includes('Column names')) {
                    console.log(`   - Events.${col.name} already exists, skipping`);
                } else {
                    throw err;
                }
            }
        }

        console.log('\n✅ Migration completed successfully!');
        console.log('\nNew fields added:');
        console.log('  Users: LocationID, LocationProvider, CountryCode, CityNameEn, CityNameAr, LocationLat, LocationLng');
        console.log('  Events: LocationID, LocationProvider, CountryCode, CityNameEn, CityNameAr, LocationDisplay, LocationLat, LocationLng');

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
