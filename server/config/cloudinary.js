const cloudinary = require('cloudinary');
const CloudinaryStorage = require('multer-storage-cloudinary');
const multer = require('multer');

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

let storage;

if (hasCloudinaryConfig) {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'frozendelights/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' }
      ]
    }
  });
} else {
  storage = multer.memoryStorage();
  console.warn('Cloudinary config missing. Using local memory upload fallback for product image field.');
}

// Export upload middleware
const baseUploader = multer({ storage });
const uploadSingleImage = baseUploader.single('image');
const uploadProductImages = baseUploader.fields([
  { name: 'images', maxCount: 4 },
  { name: 'image', maxCount: 1 }
]);

module.exports = {
  cloudinary: cloudinary.v2,
  uploadSingleImage,
  uploadProductImages,
  upload: uploadSingleImage
};
