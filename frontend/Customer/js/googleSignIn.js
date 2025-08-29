function handleCredentialResponse(response) {
  const idToken = response.credential;  // Google ID token received from frontend

  // Send the ID token to the backend for verification
  fetch('http://localhost:5000/api/auth/google-sign-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: idToken }),  // Send the Google ID token to backend
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('User authenticated:', data.user);

      // Store the JWT token received from backend in localStorage (or sessionStorage)
      localStorage.setItem('jwtToken', data.token);  // Store token for future requests

      // Redirect to the customer dashboard or homepage after successful login
      window.location.href = '/customerDashboard.html';  // Replace with the appropriate page
    } else {
      console.error('Authentication failed');
    }
  })
  .catch(err => {
    console.error('Error during Google authentication:', err);
  });
}
