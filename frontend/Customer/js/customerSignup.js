document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  // Show OTP modal
  function showOtpModal({ username, email, password }) {
    const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
    otpModal.show();

    document.getElementById('submitOtpBtn').onclick = async function() {
      const otp = document.getElementById('otpInput').value;
      // Verify OTP and create account
      const response = await fetch('http://localhost:5000/api/otp/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, otp })
      });
      const result = await response.json();
      if (response.ok) {
        otpModal.hide();
        alert('Sign Up Successful! Please log in.');
        window.location.href = 'customerlogin.html';
      } else {
        document.getElementById('otpError').innerText = result.message;
        document.getElementById('otpError').style.display = 'block';
      }
    };
  }

  signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate passwords
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    // Step 1: Send OTP for signup
    try {
      const response = await fetch('http://localhost:5000/api/otp/send-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (response.ok) {
        showOtpModal({ username, email, password });
      } else {
        alert(result.message || 'Failed to send OTP!');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      alert('An error occurred. Please try again later.');
    }
  });
});
