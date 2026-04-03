const DEFAULT_PRODUCT_IMAGE = 'https://loremflickr.com/1200/900/icecream,dessert?lock=9090';

const isDefaultImage = (value) => typeof value === 'string'
  && value.trim() === DEFAULT_PRODUCT_IMAGE;

export const resolveProductImages = (product) => {
  const imageList = Array.isArray(product?.images) ? product.images : [];
  const normalizedList = imageList
    .filter((item) => typeof item === 'string' && item.trim())
    .map((item) => item.trim())
    .filter((item) => !isDefaultImage(item));

  if (normalizedList.length) {
    return normalizedList.slice(0, 4);
  }

  if (typeof product?.image === 'string' && product.image.trim() && !isDefaultImage(product.image)) {
    return [product.image.trim()];
  }

  return [];
};

export const resolveProductImage = (product) => {
  const images = resolveProductImages(product);
  return images[0] || '';
};

export default DEFAULT_PRODUCT_IMAGE;