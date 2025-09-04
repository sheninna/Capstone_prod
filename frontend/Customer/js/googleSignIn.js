function showOtpModal(email) {
  const otpModal = new bootstrap.Modal(document.getElementById('otpModal'));
  otpModal.show();

  document.getElementById('submitOtpBtn').onclick = async function() {
    const otp = document.getElementById('otpInput').value;
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
      window.location.href = "../html/customerLogout.html";
    } else {
      document.getElementById('otpError').innerText = result.message;
      document.getElementById('otpError').style.display = 'block';
    }
  };
}

function handleCredentialResponse(response) {
  const idToken = response.credential;
  console.log('ID TOKEN:', idToken);

  fetch('http://localhost:5000/api/auth/google-sign-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: idToken }),
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Google authentication successful
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = "../html/customerLogout.html";
    } else {
      alert(data.message || 'Google Sign-In failed!');
      console.error('Authentication failed:', data.message || data.error);
    }
  })
  .catch(err => {
    console.error('Error during Google authentication:', err);
    alert('Google Sign-In error!');
  });
}