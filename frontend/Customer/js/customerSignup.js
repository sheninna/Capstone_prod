document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const otpInputs = document.querySelectorAll('#otpInputs .otp-input');
  const otpError = document.getElementById('otpError');
  const submitOtpBtn = document.getElementById('submitOtpBtn');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  let signupInfo = {};

  // Hide OTP modal initially
  const otpModalEl = document.getElementById('otpModal');
  let otpModal;
  if (otpModalEl && typeof bootstrap !== "undefined") {
    otpModal = bootstrap.Modal.getOrCreateInstance(otpModalEl);
  }

  // Show OTP modal for verification
  function showOtpModal({ username, email, password }) {
    signupInfo = { username, email, password };
    otpInputs.forEach(input => input.value = '');
    if (otpError) otpError.style.display = 'none';
    if (otpModal) {
      otpModal.show();
      setTimeout(() => otpInputs[0].focus(), 300);
    }
  }

  // OTP input auto-focus
  otpInputs.forEach((input, idx) => {
    input.addEventListener('input', function () {
      this.value = this.value.replace(/[^0-9]/g, '');
      if (this.value.length === 1 && idx < otpInputs.length - 1) {
        otpInputs[idx + 1].focus();
      }
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !this.value && idx > 0) {
        otpInputs[idx - 1].focus();
      }
    });
    input.addEventListener('paste', function (e) {
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      if (/^\d{6}$/.test(paste)) {
        otpInputs.forEach((el, i) => el.value = paste[i] || '');
        otpInputs[5].focus();
        e.preventDefault();
      }
    });
  });

  // Handle OTP verification
  if (submitOtpBtn) {
    submitOtpBtn.onclick = async function() {
      const otp = Array.from(otpInputs).map(input => input.value).join('');
      otpError.style.display = 'none';
      if (otp.length !== 6) {
        otpError.innerText = "Please enter the 6-digit code.";
        otpError.style.display = 'block';
        return;
      }
      // Verify OTP and create account
      const response = await fetch('http://localhost:5000/api/otp/verify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...signupInfo, otp })
      });
      const result = await response.json();
      if (response.ok) {
        if (otpModal) otpModal.hide();

        // Show loading spinner/message before redirect
        const loadingDiv = document.createElement('div');
        loadingDiv.style.position = 'fixed';
        loadingDiv.style.top = 0;
        loadingDiv.style.left = 0;
        loadingDiv.style.width = '100vw';
        loadingDiv.style.height = '100vh';
        loadingDiv.style.background = 'rgba(255,255,255,0.8)';
        loadingDiv.style.display = 'flex';
        loadingDiv.style.flexDirection = 'column';
        loadingDiv.style.justifyContent = 'center';
        loadingDiv.style.alignItems = 'center';
        loadingDiv.style.zIndex = 9999;
        loadingDiv.innerHTML = `
          <div class="spinner-border text-warning" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div style="margin-top: 1rem; font-weight: bold; color: #b8860b;">Creating your account...</div>
        `;
        document.body.appendChild(loadingDiv);

        setTimeout(() => {
          window.location.href = 'customerlogin.html';
        }, 1800);
      } else {
        otpError.innerText = result.message;
        otpError.style.display = 'block';
      }
    };
  }

  // Resend OTP
  if (resendOtpBtn) {
    resendOtpBtn.onclick = async function() {
      if (!signupInfo.email || !signupInfo.username || !signupInfo.password) return;
      try {
        const response = await fetch('http://localhost:5000/api/otp/send-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(signupInfo)
        });
        const result = await response.json();
        if (response.ok) {
          alert('OTP code resent to your email.');
        } else {
          alert(result.message || 'Failed to resend OTP.');
        }
      } catch (err) {
        alert('Error resending OTP. Please try again.');
      }
    };
  }

  // Handle sign up form submission
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

    // Step 1: Send OTP for signup (send all fields)
    try {
      const response = await fetch('http://localhost:5000/api/otp/send-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
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
