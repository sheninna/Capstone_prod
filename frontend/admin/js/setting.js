document.addEventListener('DOMContentLoaded', function () {

    function checkEmptyTable() {
        const tbody = document.querySelector('#menuTable tbody');
        if (tbody.rows.length === 0) {
            const newRow = tbody.insertRow();
            newRow.id = 'noDataRow';
            newRow.innerHTML = '<td colspan="6">No menu items yet</td>';
        }
    }

    document.getElementById('addBtn').addEventListener('click', async function() {
        const name = document.getElementById('Name').value.trim();
        const price = document.getElementById('Price').value.trim();
        const category = document.getElementById('Category').value;
        const portion = document.getElementById('Portion').value;
        const imageInput = document.getElementById('Image');
        const file = imageInput.files[0];

        // Validation
        if (!name || !price || category === "Select" || !file) {
            alert('Please fill out all required fields including the image.');
            return;
        }
        if (isNaN(parseFloat(price)) || !isFinite(price)) {
            alert('Please enter a valid price.');
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('portion', portion);
        formData.append('image', file);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:5000/api/foods', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to add food');
            await loadMenu();
            // Clear form
            document.getElementById('Name').value = '';
            document.getElementById('Price').value = '';
            document.getElementById('Category').selectedIndex = 0;
            document.getElementById('Portion').selectedIndex = 0;
            document.getElementById('Image').value = '';
        } catch (err) {
            alert('Error adding food.');
            console.error(err);
        }
    });

    let currentEditingRow = null;
    
    function openEditModal(row) {
        currentEditingRow = row;
        const cells = row.cells;
        
        document.getElementById('editName').value = cells[0].textContent;
        document.getElementById('editPrice').value = cells[1].textContent.replace('₱', '');
        document.getElementById('editCategory').value = cells[2].textContent;
        document.getElementById('editPortion').value = cells[3].textContent;
        document.getElementById('editPreview').src = cells[4].querySelector('img').src;
        
        document.getElementById('editModal').style.display = 'flex';
    }
    
    document.getElementById('saveEditBtn').addEventListener('click', async function() {
        if (!currentEditingRow) return;
        
        const name = document.getElementById('editName').value.trim();
        const price = document.getElementById('editPrice').value.trim();
        const category = document.getElementById('editCategory').value;
        const portion = document.getElementById('editPortion').value;
        
        if (!name || !price) {
            alert('Please fill out all required fields.');
            return;
        }
        
        if (isNaN(parseFloat(price)) || !isFinite(price)) {
            alert('Please enter a valid price.');
            return;
        }
        
        const id = currentEditingRow.getAttribute('data-id');
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('category', category);
        formData.append('portion', portion);
        const newFile = document.getElementById('editImage').files[0];
        if (newFile) formData.append('image', newFile);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/foods/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to update food');
            await loadMenu();
        } catch (err) {
            alert('Error updating food.');
            console.error(err);
        }
        
        document.getElementById('editModal').style.display = 'none';
        currentEditingRow = null;
        document.getElementById('editImage').value = '';
    });
    
    let rowToDelete = null;
    
    function openDeleteModal(row) {
        rowToDelete = row;
        document.getElementById('deleteModal').style.display = 'flex';
    }
    
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        if (rowToDelete) {
            rowToDelete.remove();
            checkEmptyTable(); // ✅ check after deletion
            document.getElementById('deleteModal').style.display = 'none';
            rowToDelete = null;
        }
    });
    
    document.getElementById('businessLogoUpload').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('businessLogoPreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('closeModal').addEventListener('click', function() {
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('editImage').value = '';
    });
    
    document.getElementById('closeDeleteModal').addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
    });
    
    document.getElementById('cancelDeleteBtn').addEventListener('click', function() {
        document.getElementById('deleteModal').style.display = 'none';
    });
    
    document.getElementById('closePreview').addEventListener('click', function() {
        document.getElementById('imagePreviewModal').style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === document.getElementById('editModal')) {
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('editImage').value = '';
        }
        if (event.target === document.getElementById('deleteModal')) {
            document.getElementById('deleteModal').style.display = 'none';
        }
        if (event.target === document.getElementById('imagePreviewModal')) {
            document.getElementById('imagePreviewModal').style.display = 'none';
        }
    });

    initializeSampleData();
    
    function initializeSampleData() {
        const tbody = document.querySelector('#menuTable tbody');
        if (tbody.rows.length === 1 && tbody.rows[0].id === 'noDataRow') {
            tbody.deleteRow(0);

        }
        checkEmptyTable(); 
    }
});


document.getElementById('saveBusinessInfo').addEventListener('click', async function () {
    const contact = document.getElementById('businessContact').value.trim();
    const email = document.getElementById('businessEmail').value.trim();
    const address = document.getElementById('businessAddress').value.trim();
    const website = document.getElementById('businessWebsite').value.trim();
    const gcashName = document.getElementById('businessGcashName').value.trim();
    // For QR, you may want to handle file upload separately
    // Here we just send the file name as a placeholder
    const gcashQRInput = document.getElementById('businessQR');
    let gcashQR = '';
    if (gcashQRInput && gcashQRInput.files.length > 0) {
        gcashQR = gcashQRInput.files[0].name;
    }

    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/business-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ contact, email, address, website, gcashName, gcashQR })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || result.message || 'Failed to update business info');
        alert('✅ Business information saved successfully!');
        loadBusinessInfo();
    } catch (err) {
        alert('Error updating business info: ' + err.message);
        console.error(err);
    }
});


document.addEventListener('DOMContentLoaded', function() {
  // Redirect to login if not authenticated
  if (!localStorage.getItem('adminToken')) {
    window.location.replace('../html/adminlogin.html');
  }

  // Logout functionality
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('adminToken');
      window.location.replace('../html/adminlogin.html');
    });
  }
});


async function loadBusinessInfo() {
    try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('http://localhost:5000/api/business-info', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch business info');
        const info = await response.json();
        if (info) {
            document.getElementById('businessContact').value = info.contact || '';
            document.getElementById('businessEmail').value = info.email || '';
            document.getElementById('businessAddress').value = info.address || '';
            document.getElementById('businessWebsite').value = info.website || '';
            document.getElementById('businessGcashName').value = info.gcashName || '';
            // Optionally preview QR if you want
            // if (info.gcashQR) { ... }
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', loadBusinessInfo);

async function loadMenu() {
    try {
        const response = await fetch('http://localhost:5000/api/foods');
        const foods = await response.json();
        const tbody = document.querySelector('#menuTable tbody');
        tbody.innerHTML = '';
        if (foods.length === 0) {
            tbody.innerHTML = `<tr id="noDataRow"><td colspan="6">No menu items yet</td></tr>`;
        } else {
            foods.forEach(food => {
                tbody.innerHTML += `
                    <tr data-id="${food._id}">
                        <td>${food.name}</td>
                        <td>₱${parseFloat(food.price).toFixed(2)}</td>
                        <td>${food.category}</td>
                        <td>${food.portion || ''}</td>
                        <td>
                            ${food.image ? `<img src="http://localhost:5000/${food.image}" class="menu-img" style="width:60px;height:50px;object-fit:cover;border-radius:5px;">` : ''}
                        </td>
                        <td>
                            <button class="action-btn edit-btn">Edit</button>
                            <button class="action-btn delete-btn">Delete</button>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (err) {
        console.error('Error loading menu:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadMenu);

document.querySelector('#menuTable').addEventListener('click', async function (e) {
    if (e.target.classList.contains('delete-btn')) {
        const row = e.target.closest('tr');
        const id = row.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this menu item?')) {
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch(`http://localhost:5000/api/foods/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to delete food');
                await loadMenu();
            } catch (err) {
                alert('Error deleting food.');
                console.error(err);
            }
        }
    }
});