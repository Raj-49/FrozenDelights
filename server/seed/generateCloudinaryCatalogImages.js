const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const COLOR_PALETTES = [
  ['#fff3d6', '#ffd18a', '#ff9f6e', '#ff6f91'],
  ['#fef6ff', '#e5d5ff', '#c9b6ff', '#8a6dff'],
  ['#f2fff9', '#b8f3d5', '#77dfb3', '#41b883'],
  ['#eef6ff', '#c6dcff', '#8fb7ff', '#6f8bff'],
  ['#fff5f2', '#ffd7c7', '#ffb39a', '#ff8f78']
];

const hashString = (value) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const createDessertSvg = (product, index) => {
  const seed = hashString(`${product.name}-${product.flavor || ''}-${index}`);
  const palette = COLOR_PALETTES[seed % COLOR_PALETTES.length];
  const accentHue = seed % 360;
  const scoopOffset = 280 + (seed % 120);
  const swirlHeight = 220 + (seed % 80);
  const sparkleX = 180 + (seed % 420);
  const sparkleY = 140 + (seed % 220);
  const label = escapeXml(product.name || 'Frozen Delights');
  const flavor = escapeXml(product.flavor || 'Signature Flavor');

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette[0]}"/>
      <stop offset="35%" stop-color="${palette[1]}"/>
      <stop offset="70%" stop-color="${palette[2]}"/>
      <stop offset="100%" stop-color="${palette[3]}"/>
    </linearGradient>
    <radialGradient id="cream" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="hsl(${accentHue}, 78%, 84%)" stop-opacity="0.95"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12"/>
    </filter>
  </defs>

  <rect width="1200" height="900" fill="url(#bg)"/>
  <ellipse cx="600" cy="770" rx="290" ry="72" fill="#000000" opacity="0.12" filter="url(#soft)"/>

  <g opacity="0.28">
    <circle cx="130" cy="120" r="110" fill="#ffffff"/>
    <circle cx="1040" cy="180" r="140" fill="#ffffff"/>
    <circle cx="1030" cy="700" r="190" fill="#ffffff"/>
  </g>

  <g transform="translate(600, ${scoopOffset})">
    <path d="M -150 330 Q -110 150 0 ${-swirlHeight} Q 110 150 150 330 Z" fill="url(#cream)"/>
    <ellipse cx="0" cy="330" rx="165" ry="44" fill="#f4bc91"/>
    <path d="M -140 320 Q 0 410 140 320 L 120 520 Q 0 590 -120 520 Z" fill="#dca16f"/>
    <path d="M -130 520 Q 0 590 130 520 L 85 770 Q 0 810 -85 770 Z" fill="#bf8357"/>
    <circle cx="0" cy="-18" r="20" fill="hsl(${(accentHue + 40) % 360}, 78%, 58%)"/>
    <circle cx="-44" cy="42" r="12" fill="hsl(${(accentHue + 90) % 360}, 75%, 62%)"/>
    <circle cx="52" cy="74" r="14" fill="hsl(${(accentHue + 150) % 360}, 72%, 66%)"/>
  </g>

  <g opacity="0.9">
    <path d="M ${sparkleX} ${sparkleY} l 18 0 l -9 18 z" fill="#ffffff"/>
    <path d="M ${sparkleX + 520} ${sparkleY + 65} l 14 0 l -7 14 z" fill="#ffffff"/>
    <circle cx="${sparkleX + 80}" cy="${sparkleY + 420}" r="6" fill="#ffffff"/>
  </g>

  <text x="600" y="96" text-anchor="middle" font-size="56" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" font-weight="700">Frozen Delights</text>
  <text x="600" y="150" text-anchor="middle" font-size="34" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" opacity="0.95">${label}</text>
  <text x="600" y="195" text-anchor="middle" font-size="24" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif" opacity="0.88">${flavor}</text>
</svg>`;
};

const uploadSvgToCloudinary = async (svgMarkup, publicId) => {
  const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgMarkup).toString('base64')}`;
  const uploaded = await cloudinary.uploader.upload(dataUri, {
    folder: 'frozendelights/products/generated',
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image'
  });

  return uploaded.secure_url || uploaded.url;
};

const generateCloudinaryCatalogImages = async () => {
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
    console.log('Connected to MongoDB for Cloudinary generation');

    const products = await Product.find({}).sort({ createdAt: 1 });
    console.log(`Products found: ${products.length}`);

    let updatedCount = 0;

    for (let index = 0; index < products.length; index += 1) {
      const product = products[index];
      const svg = createDessertSvg(product, index + 1);
      const publicId = `catalog_${product._id}_generated_primary`;
      const cloudinaryUrl = await uploadSvgToCloudinary(svg, publicId);

      await Product.updateOne(
        { _id: product._id },
        {
          $set: {
            images: [cloudinaryUrl],
            image: cloudinaryUrl
          }
        }
      );
      updatedCount += 1;

      console.log(`[${index + 1}/${products.length}] Updated ${product.name}`);
      await wait(150);
    }

    console.log(`Generation completed. Products updated: ${updatedCount}`);
    process.exit(0);
  } catch (error) {
    console.error('Generation failed:', error);
    process.exit(1);
  }
};

generateCloudinaryCatalogImages();