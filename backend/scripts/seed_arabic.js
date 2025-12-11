const sql = require('mssql/msnodesqlv8');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const buildConnString = (dbName) =>
    `Driver={ODBC Driver 17 for SQL Server};Server=${process.env.DB_SERVER || 'localhost\\SQLEXPRESS'};Database=${dbName};Trusted_Connection=yes;`;

async function seedArabicBooks() {
    try {
        console.log('--- Seeding Arabic Database ---');

        const connString = buildConnString(process.env.DB_NAME || 'BookCommunityDB');
        console.log(`Connecting to database...`);

        const pool = await sql.connect({
            driver: 'msnodesqlv8',
            connectionString: connString
        });

        console.log('Clearing existing data (Books, Reviews, UserShelves)...');
        // Delete in order of constraints
        await pool.request().query('DELETE FROM UserShelves');
        await pool.request().query('DELETE FROM Reviews');
        await pool.request().query('DELETE FROM Books');
        // Reset ID counters
        await pool.request().query('DBCC CHECKIDENT (\'Books\', RESEED, 0)');
        await pool.request().query('DBCC CHECKIDENT (\'Reviews\', RESEED, 0)');
        await pool.request().query('DBCC CHECKIDENT (\'UserShelves\', RESEED, 0)');

        console.log('Inserting 10 Arabic books...');

        const books = [
            {
                title: 'بين القصرين (ثلاثية القاهرة)',
                author: 'نجيب محفوظ',
                desc: 'رواية تصور حياة أسرة مصرية في فترة ما بين الحربين، وتعتبر الجزء الأول من ثلاثية القاهرة الشهيرة.',
                cover: 'https://placehold.co/300x450/2c3e50/ecf0f1?text=Cairo+Trilogy'
            },
            {
                title: 'موسم الهجرة إلى الشمال',
                author: 'الطيب صالح',
                desc: 'رواية ما بعد كولونيالية تستكشف العلاقة المعقدة بين الشرق والغرب من خلال قصة مصطفى سعيد.',
                cover: 'https://placehold.co/300x450/c0392b/ecf0f1?text=Migration+to+North'
            },
            {
                title: 'رجال في الشمس',
                author: 'غسان كنفاني',
                desc: 'رواية تروي معاناة اللاجئين الفلسطينيين ومحاولتهم الهروب عبر الصحراء للبحث عن حياة أفضل.',
                cover: 'https://placehold.co/300x450/e67e22/ecf0f1?text=Men+in+the+Sun'
            },
            {
                title: 'ذاكرة الجسد',
                author: 'أحلام مستغانمي',
                desc: 'رواية تجمع بين الحب والوطن، وتحكي قصة رسام فقد ذراعه في الحرب ويقع في حب ابنة مناضل قديم.',
                cover: 'https://placehold.co/300x450/8e44ad/ecf0f1?text=Memory+in+the+Flesh'
            },
            {
                title: 'عمارة يعقوبيان',
                author: 'علاء الأسواني',
                desc: 'تصوير بانورامي للمجتمع المصري المعاصر من خلال سكان عمارة وسط القاهرة.',
                cover: 'https://placehold.co/300x450/27ae60/ecf0f1?text=Yacoubian+Building'
            },
            {
                title: 'فرانكشتاين في بغداد',
                author: 'أحمد سعداوي',
                desc: 'رواية خيالية تدور أحداثها في بغداد، حيث يقوم بائع عتيق بتجميع بقايا ضحايا الانفجارات ليخلق كائناً غريباً.',
                cover: 'https://placehold.co/300x450/7f8c8d/ecf0f1?text=Frankenstein+Baghdad'
            },
            {
                title: 'ساق البامبو',
                author: 'سعود السنعوسي',
                desc: 'رواية تتناول قضايا الهوية والانتماء من خلال قصة شاب من أم فلبينية وأب كويتي.',
                cover: 'https://placehold.co/300x450/16a085/white?text=The+Bamboo+Stalk'
            },
            {
                title: 'مدن الملح',
                author: 'عبد الرحمن منيف',
                desc: 'ملحمة روائية ترصد التحولات الاجتماعية والاقتصادية التي طرأت على الجزيرة العربية بعد اكتشاف النفط.',
                cover: 'https://placehold.co/300x450/f39c12/white?text=Cities+of+Salt'
            },
            {
                title: 'عزازيل',
                author: 'يوسف زيدان',
                desc: 'رواية تاريخية تقع أحداثها في القرن الخامس الميلادي، وتتناول الصراعات الدينية والإنسانية في تلك الحقبة.',
                cover: 'https://placehold.co/300x450/d35400/white?text=Azazeel'
            },
            {
                title: 'ثلاثية غرناطة',
                author: 'رضوى عاشور',
                desc: 'رواية تحكي قصة سقوط غرناطة ومعاناة الموريسكيين، بأسلوب أدبي رفيع.',
                cover: 'https://placehold.co/300x450/2980b9/white?text=Granada+Trilogy'
            }
        ];

        for (const book of books) {
            await pool.request()
                .input('Title', sql.NVarChar, book.title)
                .input('Author', sql.NVarChar, book.author)
                .input('Description', sql.NVarChar, book.desc)
                .input('CoverImageURL', sql.NVarChar, book.cover)
                .query(`
                    INSERT INTO Books (Title, Author, Description, CoverImageURL)
                    VALUES (@Title, @Author, @Description, @CoverImageURL)
                `);
            console.log(`Addsed: ${book.title}`);
        }

        console.log('\n✅ Database seeded with Arabic books successfully!');
        await pool.close();

    } catch (err) {
        console.error('\n❌ Error seeding database:', err);
    }
}

seedArabicBooks();
