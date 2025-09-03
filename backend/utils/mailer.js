const nodemailer = require('nodemailer');
require('dotenv').config();

// Create the Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_PASS, 
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
  
  switch (newStatus) {
    case 'in process':
      statusMessage = `
        <h3>Your Order is Now in Process</h3>
        <p>Your order ID: <strong>${order._id}</strong> is being processed.</p>
        <p>Items:</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
        <p>Thank you for your patience, we’ll notify you when your order is ready!</p>
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
        <p>Thank you for choosing us! We hope you enjoy your meal.</p>
      `;
      break;

    case 'ready for pick-up':
      statusMessage = `
        <h3>Your Order is ready for Pick Up</h3>
        <p>Your order ID: <strong>${order._id}</strong></p>
        <p>Items:</p>
        <ul>
          ${order.items.map(item => `<li>${item.name} x${item.quantity}</li>`).join('')}
        </ul>
        <p><strong>Total Amount:</strong> ₱${order.totalAmount}</p>
        <p>Thank you for choosing us! We hope you enjoy your meal.</p>
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


const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Secure OTP Code for Login',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto; border: 1px solid #e0e0e0; padding: 32px; border-radius: 10px; background: #fafbfc;">
        <div style="text-align:center; margin-bottom: 24px;">
          <img src="https://res.cloudinary.com/dcl8dksb0/image/upload/v1756827552/logo_b5s2mg.png" alt="Logo" style="height:67px;">
          <h1 style="color:#FFEB99; margin: 16px 0 0 0;">El Callejon Lomi Hauz</h1>
        </div>
        <h2 style="color: #2d7ff9; text-align:center;">Your OTP Code</h2>
        <p style="font-size: 18px; color: #FFFFFF; text-align:center;">Enter this code to log in to your account:</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #333; margin: 24px 0; text-align: center;">${otp}</div>
        <p style="color: #888; text-align:center;">This code will expire in <b>5 minutes</b>.</p>
        <hr style="margin: 32px 0;">
        <p style="font-size: 14px; color: #aaa; text-align:center;">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);
  } catch (error) {
    console.error('Error sending OTP email:', error);
  }
};


module.exports = { 
  sendPasswordResetEmail, sendOrderReceiptEmail, sendStatusUpdateEmail, sendOtpEmail
};
