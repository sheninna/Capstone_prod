document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const usernameInput = document.getElementById('username');
  const emailInput = document.querySelector('input[type="email"]');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  signupForm.addEventListener('submit', async function (event) {
    event.preventDefault(); 

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const data = { username, email, password };

    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Sign Up Successful! Please log in.');
        window.location.href = 'customerlogin.html'; 
      } else {
        alert(result.message || 'Sign Up Failed!');
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      alert('An error occurred. Please try again later.');
    }
  });
});
