require('dotenv').config();
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('SUCCESS: Script ran to completion');
