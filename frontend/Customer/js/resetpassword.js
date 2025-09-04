document.addEventListener('DOMContentLoaded', () => {
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  const newPasswordInput = document.getElementById('newPassword');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const resetMessage = document.getElementById('resetMessage');
  const resetButton = document.getElementById('resetButton');

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  resetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    
    resetMessage.textContent = '';
    resetMessage.classList.remove('text-danger', 'text-success');

    
    if (newPassword.length < 6) {
      resetMessage.textContent = 'Password must be at least 6 characters.';
      resetMessage.classList.add('text-danger');
      return;
    }

    
    if (newPassword !== confirmPassword) {
      resetMessage.textContent = 'Passwords do not match.';
      resetMessage.classList.add('text-danger');
      return;
    }

    resetButton.disabled = true;
    resetButton.textContent = 'Resetting...';

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        resetMessage.textContent = result.message || 'Password reset successfully! You can now log in.';
        resetMessage.classList.remove('text-danger');
        resetMessage.classList.add('text-success');

        setTimeout(() => {
          window.location.href = 'customerlogin.html';
        }, 2000);
      } else {
        resetMessage.textContent = result.message || 'Error resetting password.';
        resetMessage.classList.add('text-danger');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      resetMessage.textContent = 'An error occurred. Please try again later.';
      resetMessage.classList.add('text-danger');
    } finally {
      resetButton.disabled = false;
      resetButton.textContent = 'Reset Password';
    }
  });

  // Toggle password visibility
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = button.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
});
