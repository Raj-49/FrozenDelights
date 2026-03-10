const PDFDocument = require('pdfkit');

const generateInvoice = (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Invoice content will be generated here
      doc.fontSize(20).text('FrozenDelights Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Order ID: ${order._id}`);
      doc.text(`Customer: ${user.name}`);
      doc.text(`Email: ${user.email}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      // Add order items
      doc.text('Order Items:');
      order.items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.name} - ${item.flavor} (${item.size})`);
        doc.text(`   Quantity: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}`);
      });

      doc.moveDown();
      doc.text(`Subtotal: ₹${order.subtotal}`);
      doc.text(`Tax: ₹${order.tax}`);
      doc.text(`Total: ₹${order.totalAmount}`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
