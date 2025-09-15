document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const username = document.getElementById('adminlogin').value.trim();
  const password = document.getElementById('adminpassword').value.trim();

  try {
    const response = await fetch('http://localhost:5000/api/pos/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // Save token for authenticated requests
      localStorage.setItem('posToken', data.token);
      window.location.replace('../html/POS.html');
    } else {
      alert(data.message || 'Login failed');
    }
  } catch (err) {
    alert('Server error. Please try again.');
  }
});