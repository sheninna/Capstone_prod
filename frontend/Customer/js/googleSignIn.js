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
      console.log('User authenticated:', data.user);
      localStorage.setItem('jwtToken', data.token);
      // Wait for manual redirect
      console.log('Copy the token, then run: window.location.href = "../html/customerLogout.html"');
    } else {
      console.error('Authentication failed:', data.message || data.error);
    }
  })
  .catch(err => {
    console.error('Error during Google authentication:', err);
  });
}