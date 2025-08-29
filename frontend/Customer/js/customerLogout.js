function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'customerlogin.html';
}

document.addEventListener('DOMContentLoaded', function() {
    // Remove the token from localStorage and redirect on page load
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Attach event listener to the button
    var loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', handleLogout);
    }
});
