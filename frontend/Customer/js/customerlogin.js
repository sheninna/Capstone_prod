document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in (redirect if so)
  if (localStorage.getItem('authToken')) {
    window.location.href = 'homepage.html'; // Redirect to homepage if logged in
  }

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    const email = emailInput.value;
    const password = passwordInput.value;

    const data = { email, password };

    try {
      // Send POST request to backend login API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      console.log('Backend Response:', result);  // Debugging line

      if (response.ok) {
        // Store JWT token in localStorage
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        alert('Login Successful!');
        window.location.href = 'dashboard.html'; // Redirect to dashboard
      } else {
        alert(result.message || 'Login Failed!');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again.');
    }
  });
});
