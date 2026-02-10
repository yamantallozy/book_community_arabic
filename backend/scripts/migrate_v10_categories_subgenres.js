const { sql, connectDB } = require('../config/db');

async function migrate() {
    try {
        await connectDB();
        const pool = await sql.connect();
        console.log('Connected to database...');

        // Full category and subgenre data based on user specification
        const categoriesData = [
            {
                name: 'رواية',
                displayNameAr: 'رواية',
                subgenres: [
                    { name: 'بوليسية/غموض', ar: 'بوليسية/غموض' },
                    { name: 'تاريخية', ar: 'تاريخية' },
                    { name: 'خيال علمي', ar: 'خيال علمي' },
                    { name: 'فانتازيا', ar: 'فانتازيا' },
                    { name: 'رعب', ar: 'رعب' },
                    { name: 'رومانسية', ar: 'رومانسية' },
                    { name: 'واقعية اجتماعية', ar: 'واقعية اجتماعية' },
                    { name: 'سياسية', ar: 'سياسية' },
                    { name: 'ديستوبيا', ar: 'ديستوبيا' },
                    { name: 'مغامرة', ar: 'مغامرة' },
                    { name: 'ساخرة', ar: 'ساخرة' }
                ]
            },
            {
                name: 'قصص قصيرة',
                displayNameAr: 'قصص قصيرة',
                subgenres: [
                    { name: 'اجتماعية', ar: 'اجتماعية' },
                    { name: 'رعب', ar: 'رعب' },
                    { name: 'خيال علمي', ar: 'خيال علمي' },
                    { name: 'ساخرة', ar: 'ساخرة' },
                    { name: 'واقعية', ar: 'واقعية' }
                ]
            },
            {
                name: 'شعر',
                displayNameAr: 'شعر',
                subgenres: [
                    { name: 'فصيح', ar: 'فصيح' },
                    { name: 'حديث', ar: 'حديث' },
                    { name: 'كلاسيكي', ar: 'كلاسيكي' },
                    { name: 'وطني/وجداني', ar: 'وطني/وجداني' }
                ]
            },
            {
                name: 'سيرة / مذكرات',
                displayNameAr: 'سيرة / مذكرات',
                subgenres: [
                    { name: 'سيرة ذاتية', ar: 'سيرة ذاتية' },
                    { name: 'مذكرات', ar: 'مذكرات' },
                    { name: 'سير الأعلام', ar: 'سير الأعلام' },
                    { name: 'سيرة سياسية', ar: 'سيرة سياسية' },
                    { name: 'سيرة فكرية', ar: 'سيرة فكرية' },
                    { name: 'يوميات / رسائل', ar: 'يوميات / رسائل' },
                    { name: 'رحلات', ar: 'رحلات' }
                ]
            },
            {
                name: 'ديني',
                displayNameAr: 'ديني',
                subgenres: [
                    { name: 'القرآن وعلومه', ar: 'القرآن وعلومه' },
                    { name: 'الحديث وعلومه', ar: 'الحديث وعلومه' },
                    { name: 'الفقه', ar: 'الفقه' },
                    { name: 'أصول الفقه', ar: 'أصول الفقه' },
                    { name: 'العقيدة', ar: 'العقيدة' },
                    { name: 'السيرة النبوية', ar: 'السيرة النبوية' },
                    { name: 'سير الصحابة والتابعين', ar: 'سير الصحابة والتابعين' },
                    { name: 'سير العلماء والدعاة', ar: 'سير العلماء والدعاة' },
                    { name: 'التفسير', ar: 'التفسير' },
                    { name: 'الرقائق والتزكية', ar: 'الرقائق والتزكية' },
                    { name: 'الفتاوى', ar: 'الفتاوى' },
                    { name: 'مقارنة الأديان', ar: 'مقارنة الأديان' }
                ]
            },
            {
                name: 'تاريخ',
                displayNameAr: 'تاريخ',
                subgenres: [
                    { name: 'تاريخ إسلامي', ar: 'تاريخ إسلامي' },
                    { name: 'تاريخ عربي', ar: 'تاريخ عربي' },
                    { name: 'تاريخ حديث ومعاصر', ar: 'تاريخ حديث ومعاصر' },
                    { name: 'تاريخ قديم وحضارات', ar: 'تاريخ قديم وحضارات' },
                    { name: 'تاريخ محلي', ar: 'تاريخ محلي' },
                    { name: 'تاريخ سياسي', ar: 'تاريخ سياسي' },
                    { name: 'تاريخ عسكري', ar: 'تاريخ عسكري' },
                    { name: 'سير تاريخية', ar: 'سير تاريخية' }
                ]
            },
            {
                name: 'فكر وفلسفة',
                displayNameAr: 'فكر وفلسفة',
                subgenres: [
                    { name: 'فلسفة', ar: 'فلسفة' },
                    { name: 'منطق', ar: 'منطق' },
                    { name: 'فلسفة الدين', ar: 'فلسفة الدين' },
                    { name: 'فلسفة الأخلاق', ar: 'فلسفة الأخلاق' },
                    { name: 'فلسفة سياسية', ar: 'فلسفة سياسية' },
                    { name: 'فكر عربي/إسلامي', ar: 'فكر عربي/إسلامي' },
                    { name: 'نقد فكري', ar: 'نقد فكري' }
                ]
            },
            {
                name: 'سياسة ومجتمع',
                displayNameAr: 'سياسة ومجتمع',
                subgenres: [
                    { name: 'علوم سياسية', ar: 'علوم سياسية' },
                    { name: 'علاقات دولية', ar: 'علاقات دولية' },
                    { name: 'قضايا اجتماعية', ar: 'قضايا اجتماعية' },
                    { name: 'سوسيولوجيا', ar: 'سوسيولوجيا' },
                    { name: 'إعلام وصحافة', ar: 'إعلام وصحافة' },
                    { name: 'قانون وحقوق', ar: 'قانون وحقوق' },
                    { name: 'دراسات ثقافية', ar: 'دراسات ثقافية' }
                ]
            },
            {
                name: 'علم نفس وتربية',
                displayNameAr: 'علم نفس وتربية',
                subgenres: [
                    { name: 'علم النفس', ar: 'علم النفس' },
                    { name: 'تربية وتعليم', ar: 'تربية وتعليم' },
                    { name: 'تنمية الطفل', ar: 'تنمية الطفل' },
                    { name: 'الإرشاد الأسري', ar: 'الإرشاد الأسري' },
                    { name: 'مهارات التواصل', ar: 'مهارات التواصل' }
                ]
            },
            {
                name: 'تطوير الذات',
                displayNameAr: 'تطوير الذات',
                subgenres: [
                    { name: 'العادات والانضباط', ar: 'العادات والانضباط' },
                    { name: 'الإنتاجية وإدارة الوقت', ar: 'الإنتاجية وإدارة الوقت' },
                    { name: 'الثقة بالنفس', ar: 'الثقة بالنفس' },
                    { name: 'العلاقات', ar: 'العلاقات' },
                    { name: 'القيادة', ar: 'القيادة' },
                    { name: 'التحفيز', ar: 'التحفيز' }
                ]
            },
            {
                name: 'اقتصاد وإدارة',
                displayNameAr: 'اقتصاد وإدارة',
                subgenres: [
                    { name: 'إدارة أعمال', ar: 'إدارة أعمال' },
                    { name: 'ريادة أعمال', ar: 'ريادة أعمال' },
                    { name: 'تسويق', ar: 'تسويق' },
                    { name: 'تمويل واستثمار', ar: 'تمويل واستثمار' },
                    { name: 'اقتصاد', ar: 'اقتصاد' },
                    { name: 'إدارة مشاريع', ar: 'إدارة مشاريع' }
                ]
            },
            {
                name: 'علوم ومعرفة',
                displayNameAr: 'علوم ومعرفة',
                subgenres: [
                    { name: 'علوم طبيعية', ar: 'علوم طبيعية' },
                    { name: 'تقنية وحاسوب', ar: 'تقنية وحاسوب' },
                    { name: 'طب وصحة عامة', ar: 'طب وصحة عامة' },
                    { name: 'بيئة', ar: 'بيئة' },
                    { name: 'تبسيط العلوم', ar: 'تبسيط العلوم' },
                    { name: 'ثقافة عامة', ar: 'ثقافة عامة' }
                ]
            }
        ];

        // Tags (وسوم / مواضيع)
        const tagsData = [
            { name: 'أدب سجون', ar: 'أدب سجون' },
            { name: 'حرب', ar: 'حرب' },
            { name: 'منفى/هجرة', ar: 'منفى/هجرة' },
            { name: 'هوية', ar: 'هوية' },
            { name: 'نسوية', ar: 'نسوية' },
            { name: 'ديستوبيا', ar: 'ديستوبيا' },
            { name: 'سياسة', ar: 'سياسة' },
            { name: 'رومانسية', ar: 'رومانسية' },
            { name: 'صحة نفسية', ar: 'صحة نفسية' }
        ];

        console.log('Clearing existing subgenres...');
        // Clear BookSubgenres first (due to FK)
        await pool.query('DELETE FROM BookSubgenres');
        await pool.query('DELETE FROM Subgenres');

        console.log('Clearing existing categories...');
        // Clear CategoryID from books first
        await pool.query('UPDATE Books SET CategoryID = NULL');
        await pool.query('DELETE FROM Categories');

        console.log('Seeding new categories and subgenres...');

        for (const cat of categoriesData) {
            // Insert category
            const catResult = await pool.request()
                .input('name', sql.NVarChar, cat.name)
                .input('displayNameAr', sql.NVarChar, cat.displayNameAr)
                .query(`
                    INSERT INTO Categories (Name, DisplayName_Ar) 
                    OUTPUT inserted.CategoryID
                    VALUES (@name, @displayNameAr)
                `);

            const categoryId = catResult.recordset[0].CategoryID;
            console.log(`  ✓ Created category: ${cat.displayNameAr} (ID: ${categoryId})`);

            // Insert subgenres for this category
            for (const sub of cat.subgenres) {
                await pool.request()
                    .input('name', sql.NVarChar, sub.name)
                    .input('displayNameAr', sql.NVarChar, sub.ar)
                    .input('categoryId', sql.Int, categoryId)
                    .query(`
                        INSERT INTO Subgenres (Name, DisplayName_Ar, CategoryID) 
                        VALUES (@name, @displayNameAr, @categoryId)
                    `);
            }
            console.log(`    → Added ${cat.subgenres.length} subgenres`);
        }

        // Seed/Update Tags
        console.log('\nSeeding tags...');
        for (const tag of tagsData) {
            const check = await pool.request()
                .input('name', sql.NVarChar, tag.name)
                .query(`SELECT TagID FROM Tags WHERE Name = @name`);

            if (check.recordset.length === 0) {
                await pool.request()
                    .input('name', sql.NVarChar, tag.name)
                    .input('ar', sql.NVarChar, tag.ar)
                    .query(`INSERT INTO Tags (Name, DisplayName_Ar) VALUES (@name, @ar)`);
                console.log(`  ✓ Created tag: ${tag.ar}`);
            } else {
                await pool.request()
                    .input('name', sql.NVarChar, tag.name)
                    .input('ar', sql.NVarChar, tag.ar)
                    .query(`UPDATE Tags SET DisplayName_Ar = @ar WHERE Name = @name`);
                console.log(`  ↻ Updated tag: ${tag.ar}`);
            }
        }

        console.log('\n✅ Migration v10 completed successfully!');
        console.log(`   - ${categoriesData.length} categories created`);
        console.log(`   - ${categoriesData.reduce((sum, cat) => sum + cat.subgenres.length, 0)} subgenres created`);
        console.log(`   - ${tagsData.length} tags seeded`);

        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
