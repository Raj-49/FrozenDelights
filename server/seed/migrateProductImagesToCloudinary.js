const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

const isCloudinaryUrl = (url) => typeof url === 'string' && url.includes('res.cloudinary.com');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const PRODUCT_DELAY_MS = Number(process.env.MIGRATE_DELAY_MS || 3200);
const RETRY_BASE_MS = Number(process.env.MIGRATE_RETRY_BASE_MS || 3500);
const MAX_ATTEMPTS = Number(process.env.MIGRATE_MAX_ATTEMPTS || 10);

const normalizeImages = (product) => {
  const merged = [];

  if (Array.isArray(product.images)) {
    for (const image of product.images) {
      if (typeof image === 'string' && image.trim()) {
        merged.push(image.trim());
      }
    }
  }

  if (!merged.length && typeof product.image === 'string' && product.image.trim()) {
    merged.push(product.image.trim());
  }

  return merged.slice(0, 4);
};

const uploadImageToCloudinary = async (imageUrl, publicId) => {
  let response;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    response = await fetch(imageUrl);
    if (response.ok) {
      break;
    }

    if (response.status !== 429) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }

    attempt += 1;
    const jitter = Math.floor(Math.random() * 1200);
    const backoff = RETRY_BASE_MS * attempt + jitter;
    await wait(backoff);
  }

  if (!response || !response.ok) {
    throw new Error(`Image fetch failed with status ${response?.status || 'unknown'}`);
  }

  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const dataUri = `data:${contentType};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'frozendelights/products',
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 900, crop: 'limit', quality: 'auto' }
    ]
  });

  return result.secure_url || result.url;
};

const migrateProductImagesToCloudinary = async () => {
  const hasCloudinaryConfig = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET
  );

  if (!hasCloudinaryConfig) {
    console.error('Cloudinary credentials are missing in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for image migration');

    const products = await Product.find({}).sort({ createdAt: 1 });
    console.log(`Products found: ${products.length}`);

    let migratedProducts = 0;
    let migratedImages = 0;

    for (let productIndex = 0; productIndex < products.length; productIndex += 1) {
      const product = products[productIndex];
      const sourceImages = normalizeImages(product);

      if (!sourceImages.length) {
        console.log(`[${productIndex + 1}/${products.length}] ${product.name}: no images to migrate`);
        continue;
      }

      const primaryImage = sourceImages[0];
      let finalPrimaryImage = primaryImage;

      if (!isCloudinaryUrl(primaryImage)) {
        try {
          const publicId = `catalog_${product._id}_primary`;
          const uploadedUrl = await uploadImageToCloudinary(primaryImage, publicId);
          if (uploadedUrl) {
            finalPrimaryImage = uploadedUrl;
            migratedImages += 1;
          }
        } catch (error) {
          const details = error?.message || error?.error?.message || JSON.stringify(error);
          console.error(`Upload failed for ${product.name} primary image: ${details}`);
        }
      }

      const nextImages = [finalPrimaryImage];

      if (nextImages.length) {
        product.images = nextImages.slice(0, 4);
        product.image = product.images[0];
        await product.save();
        migratedProducts += 1;
      }

      console.log(`[${productIndex + 1}/${products.length}] ${product.name}: primary image processed`);
      await wait(PRODUCT_DELAY_MS);
    }

    console.log(`Migration completed. Products updated: ${migratedProducts}, images uploaded: ${migratedImages}`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateProductImagesToCloudinary();
