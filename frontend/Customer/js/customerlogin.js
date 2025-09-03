document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in (redirect if so)
  if (localStorage.getItem('authToken')) {
    // If token is found, redirect to the dashboard
    window.location.href = '../html/customerLogout.html'; 
  }

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  // Helper to show OTP modal
  function showOtpModal(email) {
    const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
    otpModal.show();

    document.getElementById('submitOtpBtn').onclick = async function() {
      const otp = document.getElementById('otpInput').value;
      // Send OTP to backend for verification
      const response = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const result = await response.json();
      if (response.ok) {
        otpModal.hide();
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        alert('Login Successful!');
        window.location.href = '../html/customerLogout.html';
      } else {
        document.getElementById('otpError').innerText = result.message;
        document.getElementById('otpError').style.display = 'block';
      }
    };
  }

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); 

    const email = emailInput.value;
    const password = passwordInput.value;

    const data = { email, password };

    try {
      // Step 1: Check credentials
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      console.log('Backend Response:', result);  

      if (response.ok) {
        // Step 2: Send OTP
        const otpResponse = await fetch('http://localhost:5000/api/otp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const otpResult = await otpResponse.json();
        if (otpResponse.ok) {
          showOtpModal(email);
        } else {
          alert(otpResult.message || 'Failed to send OTP!');
        }
      } else {
        alert(result.message || 'Login Failed!');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  });
});


document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const icon = button.querySelector('i');

    if (input.type === 'passwordInput') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'passwordInput';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
  });
});
