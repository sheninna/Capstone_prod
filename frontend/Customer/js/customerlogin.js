document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, you can optionally update the navbar here

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');

  if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const email = emailInput.value;
      const password = passwordInput.value;

      const data = { email, password };

      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.token) {
          // Store as customerToken for consistency
          localStorage.setItem('customerToken', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          // Close the modal
          const loginModalEl = document.getElementById('loginModal');
          if (loginModalEl && typeof bootstrap !== "undefined") {
            const modalInstance = bootstrap.Modal.getInstance(loginModalEl) || new bootstrap.Modal(loginModalEl);
            modalInstance.hide();
          }
          // Update navbar if you have a function for it
          if (typeof updateCustomerNavActions === "function") updateCustomerNavActions();

          // After successful login:
          const redirectTo = localStorage.getItem('redirectAfterLogin') || 'homepage.html';
          localStorage.removeItem('redirectAfterLogin');
          window.location.href = redirectTo;
        } else {
          alert(result.message || 'Login Failed!');
        }
      } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
      }
    });
  }

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = button.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        }
      } else {
        input.type = 'password';
        if (icon) {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      }
    });
  });
});
