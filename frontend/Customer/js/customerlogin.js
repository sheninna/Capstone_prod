document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in (redirect if so)
  if (localStorage.getItem('authToken')) {
    window.location.href = '../html/customerLogout.html'; 
  }

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

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
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        alert('Login Successful!');
        window.location.href = '../html/customerLogout.html';
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
