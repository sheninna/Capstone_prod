document.addEventListener('DOMContentLoaded', function () {

    function checkEmptyTable() {
        const tbody = document.querySelector('#menuTable tbody');
        if (tbody.rows.length === 0) {
            const newRow = tbody.insertRow();
            newRow.id = 'noDataRow';
            newRow.innerHTML = '<td colspan="6">No menu items yet</td>';
        }
    }

    document.getElementById('addBtn').addEventListener('click', function() {
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
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const table = document.getElementById('menuTable');
            const tbody = table.querySelector('tbody');
            const noDataRow = document.getElementById('noDataRow');
            
            if (noDataRow) {
                noDataRow.remove(); // ✅ remove message row when adding
            }
            
            const row = tbody.insertRow();
            row.insertCell(0).textContent = name;
            row.insertCell(1).textContent = '₱' + parseFloat(price).toFixed(2);
            row.insertCell(2).textContent = category;
            row.insertCell(3).textContent = (portion === "Select") ? "" : portion;

            const imgCell = row.insertCell(4);
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'menu-img';
            img.alt = name;
            imgCell.appendChild(img);

            img.addEventListener('click', function() {
                document.getElementById('previewImage').src = this.src;
                document.getElementById('imagePreviewModal').style.display = 'flex';
            });

            const actionsCell = row.insertCell(5);
            actionsCell.innerHTML = `
                <button class="action-btn edit-btn">Edit</button>
                <button class="action-btn delete-btn">Delete</button>
            `;

            actionsCell.querySelector('.delete-btn').addEventListener('click', function() {
                openDeleteModal(row);
            });
            actionsCell.querySelector('.edit-btn').addEventListener('click', function() {
                openEditModal(row);
            });

            // Clear form
            document.getElementById('Name').value = '';
            document.getElementById('Price').value = '';
            document.getElementById('Category').selectedIndex = 0;
            document.getElementById('Portion').selectedIndex = 0;
            document.getElementById('Image').value = '';
        };
        reader.readAsDataURL(file);
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
    
    document.getElementById('saveEditBtn').addEventListener('click', function() {
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
        
        const cells = currentEditingRow.cells;
        cells[0].textContent = name;
        cells[1].textContent = '₱' + parseFloat(price).toFixed(2);
        cells[2].textContent = category;
        cells[3].textContent = portion; 
        
        const newFile = document.getElementById('editImage').files[0];
        if (newFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                cells[4].querySelector('img').src = e.target.result;
            };
            reader.readAsDataURL(newFile);
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


document.getElementById('saveBusinessInfo').addEventListener('click', function () {
    const businessInfo = {
        contact: document.getElementById('businessContact').value.trim(),
        email: document.getElementById('businessEmail').value.trim(),
        address: document.getElementById('businessAddress').value.trim(),
        website: document.getElementById('businessWebsite').value.trim(),
        gcashName: document.getElementById('businessGcashName').value.trim(),
        qrFile: document.getElementById('businessQR').files[0] || null
    };

    console.log("Business Info Saved:", businessInfo);

    alert("✅ Business information saved successfully!");

});
