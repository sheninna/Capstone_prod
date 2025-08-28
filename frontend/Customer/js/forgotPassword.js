document.addEventListener('DOMContentLoaded', () => {
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const forgotEmail = document.getElementById('forgotEmail');
  const forgotMessage = document.getElementById('forgotMessage');

  forgotPasswordForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = forgotEmail.value;

    const data = {
      email
    };

    try {
      // Send POST request to forgot password API
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Show success message
        forgotMessage.classList.remove('text-danger');
        forgotMessage.classList.add('text-success');
        forgotMessage.textContent = 'Password reset link sent to your email.';
      } else {
        // Show error message (user not found)
        forgotMessage.classList.remove('text-success');
        forgotMessage.classList.add('text-danger');
        forgotMessage.textContent = result.message || 'Error sending password reset email';
      }
    } catch (error) {
      console.error('Error during forgot password request:', error);
      forgotMessage.classList.remove('text-success');
      forgotMessage.classList.add('text-danger');
      forgotMessage.textContent = 'An error occurred. Please try again later.';
    }
  });
});
