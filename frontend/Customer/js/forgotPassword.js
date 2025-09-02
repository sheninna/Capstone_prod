document.addEventListener('DOMContentLoaded', () => {
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const emailInput = document.getElementById('forgotEmail');
  const forgotMessage = document.getElementById('forgotMessage');
  const sendLinkButton = document.getElementById('sendLinkButton');

  forgotPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const email = emailInput.value.trim();

    // Clear previous messages
    forgotMessage.textContent = '';

    // Basic validation for email
    if (!email) {
      forgotMessage.textContent = 'Please enter your email address.';
      return;
    }

    // Disable the button while the request is being processed
    sendLinkButton.disabled = true;
    sendLinkButton.textContent = 'Sending...';

    try {
      // Send the request to your backend API for the forgot password process
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        // If successful, show the success message
        forgotMessage.classList.remove('text-danger');
        forgotMessage.classList.add('text-success');
        forgotMessage.textContent = result.message || 'Please check your email for the password reset link.';
      } else {
        // If there's an error, show the error message
        forgotMessage.classList.remove('text-success');
        forgotMessage.classList.add('text-danger');
        forgotMessage.textContent = result.message || 'An error occurred while sending the reset link.';
      }
    } catch (error) {
      console.error('Error during password reset request:', error);
      forgotMessage.classList.remove('text-success');
      forgotMessage.classList.add('text-danger');
      forgotMessage.textContent = 'An error occurred. Please try again later.';
    } finally {
      // Re-enable the button and reset text
      sendLinkButton.disabled = false;
      sendLinkButton.textContent = 'Send Reset Link';
    }
  });
});
