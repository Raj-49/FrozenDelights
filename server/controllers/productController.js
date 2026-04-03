const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

const DEFAULT_PRODUCT_IMAGE = 'https://loremflickr.com/1200/900/icecream,dessert?lock=9090';

const normalizeImageList = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string' && item.trim() && item.trim() !== DEFAULT_PRODUCT_IMAGE)
    .map((item) => item.trim())
    .slice(0, 4);
};

const fileToImageUrl = (file) => {
  if (!file) {
    return '';
  }

  if (typeof file.path === 'string' && file.path.trim()) {
    return file.path;
  }

  if (typeof file.secure_url === 'string' && file.secure_url.trim()) {
    return file.secure_url;
  }

  if (typeof file.url === 'string' && file.url.trim()) {
    return file.url;
  }

  if (typeof file.filename === 'string' && file.filename.trim()) {
    try {
      return cloudinary.url(file.filename, { secure: true });
    } catch (error) {
      return '';
    }
  }

  if (file.buffer) {
    const mimeType = file.mimetype || 'image/jpeg';
    const base64 = file.buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  return '';
};

const getUploadedImages = (req) => {
  const uploaded = [];

  if (req.file) {
    const singleImage = fileToImageUrl(req.file);
    if (singleImage) {
      uploaded.push(singleImage);
    }
  }

  if (req.files && typeof req.files === 'object') {
    const imagesFiles = Array.isArray(req.files.images) ? req.files.images : [];
    const legacyImageFile = Array.isArray(req.files.image) ? req.files.image : [];
    const allFiles = [...imagesFiles, ...legacyImageFile];

    for (const file of allFiles) {
      const imageUrl = fileToImageUrl(file);
      if (imageUrl) {
        uploaded.push(imageUrl);
      }
    }
  }

  return normalizeImageList(uploaded);
};

const getBodyImages = (body) => {
  const directImages = normalizeImageList(body?.images);
  if (directImages.length) {
    return directImages;
  }

  if (typeof body?.images === 'string' && body.images.trim()) {
    try {
      const parsed = JSON.parse(body.images);
      const parsedImages = normalizeImageList(parsed);
      if (parsedImages.length) {
        return parsedImages;
      }
    } catch (error) {
      const commaSeparated = body.images.split(',').map((item) => item.trim());
      const parsedImages = normalizeImageList(commaSeparated);
      if (parsedImages.length) {
        return parsedImages;
      }
    }
  }

  if (typeof body?.image === 'string' && body.image.trim()) {
    return [body.image.trim()];
  }

  return [];
};

const resolveProductImages = (req, existingImages = []) => {
  const uploadedImages = getUploadedImages(req);
  if (uploadedImages.length) {
    return uploadedImages;
  }

  const bodyImages = getBodyImages(req.body);
  if (bodyImages.length) {
    return bodyImages;
  }

  const previousImages = normalizeImageList(existingImages);
  if (previousImages.length) {
    return previousImages;
  }

  return [];
};

const extractCloudinaryPublicId = (imageUrl) => {
  if (typeof imageUrl !== 'string' || !imageUrl.includes('cloudinary')) {
    return '';
  }

  const uploadSegment = '/upload/';
  const uploadIndex = imageUrl.indexOf(uploadSegment);
  if (uploadIndex === -1) {
    return '';
  }

  const pathAfterUpload = imageUrl.slice(uploadIndex + uploadSegment.length);
  const pathParts = pathAfterUpload.split('/').filter(Boolean);

  if (!pathParts.length) {
    return '';
  }

  const cleanedParts = pathParts[0].startsWith('v')
    ? pathParts.slice(1)
    : pathParts;

  if (!cleanedParts.length) {
    return '';
  }

  const lastPart = cleanedParts[cleanedParts.length - 1];
  cleanedParts[cleanedParts.length - 1] = lastPart.replace(/\.[a-zA-Z0-9]+$/, '');

  return cleanedParts.join('/');
};

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ available: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const getAllProductsAdmin = async (req, res, next) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { image, images, ...rest } = req.body || {};
    const resolvedImages = resolveProductImages(req);

    const product = new Product({
      ...rest,
      images: resolvedImages,
      image: resolvedImages[0]
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { image, images, ...rest } = req.body || {};
    const existingImages = normalizeImageList(existingProduct.images).length
      ? existingProduct.images
      : [existingProduct.image].filter(Boolean);
    const resolvedImages = resolveProductImages(req, existingImages);

    const updateData = {
      ...rest,
      images: resolvedImages,
      image: resolvedImages[0]
    };

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

const toggleAvailable = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product.available = !product.available;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
      message: `Product ${product.available ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const allImages = normalizeImageList(product.images).length
      ? product.images
      : [product.image].filter(Boolean);

    for (const imageUrl of allImages) {
      const publicId = extractCloudinaryPublicId(imageUrl);
      if (!publicId) {
        continue;
      }

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  toggleAvailable,
  deleteProduct
};
