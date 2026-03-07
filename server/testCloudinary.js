require('dotenv').config();
const { uploadImageToCloudinary } = require('./src/config/cloudinary');
(async () => {
   try {
     const buffer = Buffer.from('placeholder image buffer data');
     const res = await uploadImageToCloudinary(buffer, 'test');
     console.log('SUCCESS:', res);
   } catch(e) {
     console.error('ERROR OCCURRED:', e);
   }
})();
