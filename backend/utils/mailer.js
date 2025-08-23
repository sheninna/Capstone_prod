const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail account
    pass: process.env.GMAIL_PASS, // Your Gmail app-specific password
  },
});

// Send reset password email
const sendPasswordResetEmail = async (email, resetLink) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset link sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


const sendOrderReceiptEmail = async (order, email) => {
  // Log the order object to ensure it's structured correctly
  console.log(order);

  const receiptDetails = `
    <h3>Receipt for Your Order</h3>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Items:</strong></p>
    <ul>
      ${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
    </ul>
    <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
    <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
  `;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Order Receipt',
    html: receiptDetails,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Receipt email sent to:', email);
  } catch (error) {
    console.error('Error sending receipt email:', error);
  }
};


const sendStatusUpdateEmail = async (order, email, newStatus) => {
  let statusMessage = '';
  
  // Customize the email content based on the status
  switch (newStatus) {
    case 'in process':
      statusMessage = `
        <h3>Your Order is Now in Process</h3>
        <p>Your order ID: <strong>${order._id}</strong> is being processed. We are preparing your items for delivery.</p>
        <p>Items:</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
        <p>Thank you for your patience, we’ll notify you when your order is ready for delivery!</p>
      `;
      break;

    case 'out for delivery':
      statusMessage = `
        <h3>Your Order is Out for Delivery</h3>
        <p>Your order ID: <strong>${order._id}</strong> is now on its way to your address. Expect delivery soon!</p>
        <p>Items:</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
        <p>We’re on our way! You’ll receive another update when your order is delivered.</p>
      `;
      break;

    case 'delivered':
      statusMessage = `
        <h3>Your Order Has Been Delivered</h3>
        <p>Your order ID: <strong>${order._id}</strong> has been successfully delivered to the address provided.</p>
        <p>Items:</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
        <p>Thank you for choosing us! We hope you enjoy your meal. If you have any questions, feel free to contact us.</p>
      `;
      break;

    default:
      statusMessage = `
        <h3>Your Order Status Update</h3>
        <p>Your order ID: <strong>${order._id}</strong> has been updated to <strong>${newStatus}</strong>.</p>
        <p>Items:</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
        <p>Thank you for your order! We'll keep you updated on its progress.</p>
      `;
      break;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Your Order Status - ${newStatus}`,
    html: statusMessage,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order status update email sent to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};




module.exports = { sendPasswordResetEmail, sendOrderReceiptEmail, sendStatusUpdateEmail};
