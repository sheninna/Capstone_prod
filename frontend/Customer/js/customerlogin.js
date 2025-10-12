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
            <div style="margin-top: 1rem; font-weight: bold; color: #b8860b;">Signing you in...</div>
          `;
          document.body.appendChild(loadingDiv);

          // After successful login:
          const redirectTo = localStorage.getItem('redirectAfterLogin') || 'homepage.html';
          localStorage.removeItem('redirectAfterLogin');
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 1500);
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
