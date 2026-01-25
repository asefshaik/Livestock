const cloudinary = require('cloudinary').v2;
const https = require('https');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Monkey patch Cloudinary timestamp generation to avoid "Stale request" errors 
// due to the 2026 simulated environment time difference.
let timeOffset = 0;
https.get('https://google.com', (res) => {
  const realTime = new Date(res.headers.date).getTime();
  timeOffset = Date.now() - realTime;
  console.log(`[Cloudinary] Time offset synced: ${timeOffset}ms`);
}).on('error', (err) => {
  console.error(`[Cloudinary] Time sync failed:`, err.message);
});

const originalTimestamp = cloudinary.utils.timestamp;
cloudinary.utils.timestamp = function() {
  return Math.round((Date.now() - timeOffset) / 1000);
};

module.exports = cloudinary;
