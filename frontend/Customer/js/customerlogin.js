//LOGIN-SIGNUP
// Handle form submission
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';

    // Simulate API call
    setTimeout(() => {
        // Redirect to landing page after successful login
        window.location.href = "landingpage.html"; // Change this to your actual landing page
    }, 1500);
});

// Handle Google Sign-In response
function handleCredentialResponse(response) {
    // Here you would process the Google auth response
    console.log("Google Auth Response:", response);

    // For demo, redirect to landing page
    window.location.href = "landingpage.html"; // Change this to your actual landing page
}

// You might also want to add some initialization code when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Any initialization code can go here
});