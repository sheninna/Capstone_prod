
function showCategory(category) {
  // Hide all food lists first
  const allCategories = document.querySelectorAll('.food-list');
  allCategories.forEach(category => category.style.display = 'none');

  // Show the selected category
  const selectedCategory = document.getElementById(category);
  selectedCategory.style.display = 'flex';
}

// Show 'Dishes' by default when the page loads
window.onload = function() {
  showCategory('dishes');
};
