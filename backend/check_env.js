const dotenv = require('dotenv');
const result = dotenv.config();

console.log('--- Environment Check ---');
if (result.error) {
    console.log('❌ dotenv config failed:', result.error);
} else {
    console.log('✅ dotenv config loaded');
}

console.log('JWT_SECRET from env:', process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
    console.log('❌ JWT_SECRET is MISSING!');
} else {
    console.log('✅ JWT_SECRET is present (length: ' + process.env.JWT_SECRET.length + ')');
}
