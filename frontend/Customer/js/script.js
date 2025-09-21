//NAVBAR TOGGLE
//funtion to navbar toggle

function openNavSidebar() {
    document.getElementById('mobileNavSidebar').classList.add('show');
    document.getElementById('mobileNavSidebarBackdrop').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closeNavSidebar() {
    document.getElementById('mobileNavSidebar').classList.remove('show');
    document.getElementById('mobileNavSidebarBackdrop').classList.remove('show');
    document.body.style.overflow = '';
}



