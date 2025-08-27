document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = emailInput.value;
    const password = passwordInput.value;

    const data = {
      email,
      password
    };

    try {
      // Send POST request to login API
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the JWT token in localStorage or sessionStorage
        localStorage.setItem('authToken', result.token);  // Or sessionStorage, depending on your preference

        // Optional: Store user info if needed
        localStorage.setItem('user', JSON.stringify(result.user));

        alert('Login Successful!');
        window.location.href = 'dashboard.html'; // Redirect to the dashboard or home page
      } else {
        // Handle errors (invalid credentials)
        alert(result.message || 'Login Failed!');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred. Please try again later.');
    }
  });
});
