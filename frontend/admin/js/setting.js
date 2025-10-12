document.addEventListener('DOMContentLoaded', function () {
    const addBtn = document.getElementById('addBtn');
    const addMenuModal = document.getElementById('addMenuModal');
    let addMenuModalInstance = null;

    window.selectedPortions = [];

    // Ensure Bootstrap JS is loaded and modal instance is created
    if (addBtn && addMenuModal && typeof bootstrap !== "undefined" && bootstrap.Modal) {
        addMenuModalInstance = new bootstrap.Modal(addMenuModal);
        addBtn.addEventListener('click', function () {
            // Defensive: check if all modal elements exist before accessing
            const modalName = document.getElementById('modalName');
            const modalPrice = document.getElementById('modalPrice');
            const modalCategory = document.getElementById('modalCategory');
            const modalImage = document.getElementById('modalImage');
            const portionSummary = document.getElementById('portionSummary');
            if (modalName) modalName.value = '';
            if (modalPrice) modalPrice.value = '';
            if (modalCategory) modalCategory.selectedIndex = 0;
            if (modalImage) modalImage.value = '';
            window.selectedPortions = [];
            if (portionSummary) portionSummary.innerText = 'No portion selected';
            updateAddMenuPriceInputVisibility();
            addMenuModalInstance.show();
        });
    } else {
        // If modal or button not found, log for debugging
        console.warn('Add button or Add Menu Modal not found, or Bootstrap JS not loaded.');
    }

    // --- Add Menu Logic ---
    const modalAddBtn = document.getElementById('modalAddBtn');
    if (modalAddBtn) {
        modalAddBtn.addEventListener('click', async function () {
            const name = document.getElementById('modalName').value.trim();
            const price = document.getElementById('modalPrice').value.trim();
            const category = document.getElementById('modalCategory').value;
            const imageInput = document.getElementById('modalImage');
            const file = imageInput.files[0];

            if (!name || category === "Select" || !file) {
                alert('Please fill out all required fields including the image.');
                return;
            }

            // Only require price if no portions are selected
            if (window.selectedPortions.length === 0) {
                if (!price || isNaN(parseFloat(price))) {
                    alert('Please enter a valid price.');
                    return;
                }
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('image', file);

            if (window.selectedPortions.length > 0) {
                formData.append('portions', JSON.stringify(window.selectedPortions));
            } else {
                formData.append('portion', 'N/A');
                formData.append('price', price);
            }

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
                // Hide modal after adding
                if (addMenuModalInstance) addMenuModalInstance.hide();
            } catch (err) {
                alert('Error adding food.');
                console.error(err);
            }
        });
    }

    // --- Utility: Hide price input in Add Menu modal if portions are selected ---
    window.updateAddMenuPriceInputVisibility = function () {
        const priceInputDiv = document.getElementById('modalPrice').closest('div');
        if (window.selectedPortions.length > 0) {
            priceInputDiv.style.display = 'none';
        } else {
            priceInputDiv.style.display = '';
        }
    };

    // --- Load Menu and Attach Edit/Delete/View Events ---
    async function loadMenu() {
        try {
            const response = await fetch('http://localhost:5000/api/foods');
            const foods = await response.json();
            const tbody = document.querySelector('#menuTable tbody');
            tbody.innerHTML = '';
            if (foods.length === 0) {
                tbody.innerHTML = `<tr id="noDataRow"><td colspan="4">No menu items yet</td></tr>`;
            } else {
                foods.forEach(food => {
                    let portionDisplay = 'N/A';
                    let priceDisplay = '';
                    if (food.portions && Array.isArray(food.portions) && food.portions.length > 0) {
                        portionDisplay = food.portions.map(p => p.portion).join(', ');
                        priceDisplay = food.portions.map(p => `${p.portion}: ₱${parseFloat(p.price).toFixed(2)}`).join('<br>');
                    } else {
                        portionDisplay = food.portion || 'N/A';
                        priceDisplay = `₱${parseFloat(food.price).toFixed(2)}`;
                    }

                    tbody.innerHTML += `
                        <tr data-id="${food._id}" 
                            data-name="${food.name}" 
                            data-category="${food.category}" 
                            data-portion="${portionDisplay}" 
                            data-price="${priceDisplay}">
                            <td class="menu-name-cell">
                                ${food.image ? `<img src="http://localhost:5000/${food.image}" class="menu-img">` : ''}
                                <span><strong>${food.name}</strong></span>
                            </td>
                            <td><strong>${food.category}</strong></td>
                            <td>
                                <button class="action-btn edit-btn">Edit</button>
                                <button class="action-btn delete-btn">Delete</button>
                                <button class="btn btn-outline-info btn-sm viewDetailBtn" title="View Details">
                                    <i class="bi bi-eye-fill"></i>
                                </button>
                            </td>
                        </tr>
                    `;
                });
            }
            attachRowEvents();
        } catch (err) {
            console.error('Error loading menu:', err);
        }
    }

    // --- Attach Edit/Delete/View Events to Table Rows ---
    function attachRowEvents() {
        document.querySelectorAll('#menuTable .edit-btn').forEach(btn => {
            btn.onclick = function () {
                const row = btn.closest('tr');
                openEditModal(row);
            };
        });
        document.querySelectorAll('#menuTable .delete-btn').forEach(btn => {
            btn.onclick = function () {
                const row = btn.closest('tr');
                openDeleteModal(row);
            };
        });
        document.querySelectorAll('#menuTable .viewDetailBtn').forEach(btn => {
            btn.onclick = function () {
                const row = btn.closest('tr');
                if (!row) return;
                const name = row.getAttribute('data-name');
                const category = row.getAttribute('data-category');
                const portion = row.getAttribute('data-portion');
                const price = row.getAttribute('data-price');
                let html = `
                    <div class="menu-detail-simple">
                        <div class="menu-detail-simple-title">${name}</div>
                        <hr class="menu-detail-simple-divider">
                        <div class="menu-detail-simple-row">
                            <span class="menu-detail-simple-label">Category:</span>
                            <span class="menu-detail-simple-value">${category}</span>
                        </div>
                        <div class="menu-detail-simple-row">
                            <span class="menu-detail-simple-label">Portion:</span>
                            <span class="menu-detail-simple-value">${portion}</span>
                        </div>
                        <div class="menu-detail-simple-row">
                            <span class="menu-detail-simple-label">Price:</span>
                            <span class="menu-detail-simple-value text-success">${price}</span>
                        </div>
                    </div>
                `;
                document.getElementById('menuDetailBody').innerHTML = html;
                const modal = new bootstrap.Modal(document.getElementById('viewMenuDetailModal'));
                modal.show();
            };
        });
    }

    // --- Edit Modal Logic (reuse Select Portion modal for Edit) ---
    let currentEditingRow = null;
    let editSelectedPortions = [];

    // Open Edit Modal and populate fields
    window.openEditModal = function(row) {
        currentEditingRow = row;
        // Get data from row attributes
        const name = row.getAttribute('data-name');
        const category = row.getAttribute('data-category');
        const priceStr = row.getAttribute('data-price');
        const img = row.querySelector('img') ? row.querySelector('img').src : '';

        // Fill modal fields
        document.getElementById('editName').value = name;
        document.getElementById('editCategory').value = category;
        document.getElementById('editPrice').value = priceStr.replace(/<br>/g, ', ').replace(/[^0-9.,₱ ]/g, '');
        document.getElementById('editPreview').src = img;

        // Parse portions from row
        const portionStr = row.getAttribute('data-portion');
        editSelectedPortions = [];
        if (portionStr && priceStr && priceStr.includes(':')) {
            const portions = portionStr.split(',').map(p => p.trim());
            const prices = priceStr.split('<br>');
            portions.forEach((portion, idx) => {
                const priceMatch = prices[idx] ? prices[idx].match(/₱([\d.]+)/) : null;
                editSelectedPortions.push({
                    portion,
                    price: priceMatch ? parseFloat(priceMatch[1]) : 0
                });
            });
        } else if (portionStr && priceStr) {
            const priceMatch = priceStr.match(/₱([\d.]+)/);
            editSelectedPortions.push({
                portion: portionStr,
                price: priceMatch ? parseFloat(priceMatch[1]) : 0
            });
        }
        document.getElementById('editPortionSummary').innerText =
            editSelectedPortions.length
                ? editSelectedPortions.map(p => `${p.portion}: ₱${p.price.toFixed(2)}`).join(', ')
                : 'No portion selected';

        document.getElementById('editModal').style.display = 'flex';
    };

    // Close Edit Modal
    document.getElementById('closeModal').onclick = function () {
        document.getElementById('editModal').style.display = 'none';
        currentEditingRow = null;
    };

    // Image preview on file select
    document.getElementById('editImage').onchange = function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (evt) {
                document.getElementById('editPreview').src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const editModalContainer = document.getElementById('editModalContainer');
    const editModal = document.getElementById('editModal');
    const portionModal = document.getElementById('portionModal');

    // Helper to show/hide edit modal
    function showEditModal() {
        if (!document.body.contains(editModalContainer)) {
            document.body.appendChild(editModalContainer);
        }
        editModal.style.display = 'flex';
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
    }
    function hideEditModal() {
        editModal.style.display = 'none';
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
    }

    // --- Reuse Select Portion Modal for Edit ---
    let isEditPortionMode = false;
    const editSetPortionBtn = document.getElementById('editSetPortionBtn');
    if (editSetPortionBtn && portionModal) {
        editSetPortionBtn.addEventListener('click', function () {
            isEditPortionMode = true;
            // Remove edit modal from DOM
            if (document.body.contains(editModalContainer)) {
                document.body.removeChild(editModalContainer);
            }
            portionModal.style.display = 'flex';
        });
    }

    // When saving portions, update either Add or Edit summary
    savePortionBtn.onclick = function () {
        let selected = [];
        document.querySelectorAll('#portionModal .portion-checkbox').forEach(cb => {
            if (cb.checked) {
                // Get the price input next to this checkbox
                const priceInput = cb.closest('.d-flex').querySelector('.portion-price');
                selected.push({
                    portion: priceInput.getAttribute('data-portion'),
                    price: priceInput.value ? parseFloat(priceInput.value) : 0
                });
            }
        });
        if (isEditPortionMode) {
            editSelectedPortions = selected;
            document.getElementById('editPortionSummary').innerText =
                editSelectedPortions.length
                    ? editSelectedPortions.map(p => `${p.portion}: ₱${p.price.toFixed(2)}`).join(', ')
                    : 'No portion selected';
            isEditPortionMode = false;
            portionModal.style.display = 'none';
            hideBootstrapAddMenuModal();
            document.getElementById('editModal').style.display = 'flex';
        } else {
            window.selectedPortions = selected;
            document.getElementById('portionSummary').innerText =
                window.selectedPortions.length
                    ? window.selectedPortions.map(p => `${p.portion}: ₱${p.price.toFixed(2)}`).join(', ')
                    : 'No portion selected';
            portionModal.style.display = 'none';
            addMenuModalInstance.show();
            updateAddMenuPriceInputVisibility();
        }
    };

    // When closing the portion modal, show the correct modal again
    closePortionModal.onclick = function () {
        portionModal.style.display = 'none';
        if (isEditPortionMode) {
            hideBootstrapAddMenuModal();
            document.getElementById('editModal').style.display = 'flex';
            isEditPortionMode = false;
        } else {
            addMenuModalInstance.show();
        }
    };

    // --- Save Edit (connects to backend and sends portions & image) ---
    document.getElementById('saveEditBtn').onclick = async function() {
        if (!currentEditingRow) return;
        const id = currentEditingRow.getAttribute('data-id');
        const name = document.getElementById('editName').value.trim();
        const category = document.getElementById('editCategory').value;
        const price = document.getElementById('editPrice').value.trim();
        const imageInput = document.getElementById('editImage');
        const file = imageInput.files[0];

        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);

        // Send portions array if present, otherwise send single portion/price
        if (editSelectedPortions && editSelectedPortions.length > 0) {
            formData.append('portions', JSON.stringify(editSelectedPortions));
        } else {
            formData.append('portion', 'N/A');
            formData.append('price', price);
        }
        if (file) formData.append('image', file);

        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/foods/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to update food');
            document.getElementById('editModal').style.display = 'none';
            currentEditingRow = null;
            await loadMenu();
        } catch (err) {
            alert('Error updating food.');
            console.error(err);
        }
    };

    // --- Delete Modal Logic (custom modal, not Bootstrap) ---
    let rowToDelete = null;

    // Open Delete Modal when delete button is clicked
    document.querySelector('#menuTable').addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            rowToDelete = deleteBtn.closest('tr');
            document.getElementById('deleteModal').style.display = 'flex';
        }
    });

    // Confirm Delete
    document.getElementById('confirmDeleteBtn').onclick = async function () {
        if (!rowToDelete) return;
        const id = rowToDelete.getAttribute('data-id');
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/foods/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete food');
            rowToDelete.remove();
            rowToDelete = null;
            document.getElementById('deleteModal').style.display = 'none';
            await loadMenu();
        } catch (err) {
            alert('Error deleting food.');
            console.error(err);
        }
    };

    // Cancel or Close Delete Modal
    document.getElementById('cancelDeleteBtn').onclick =
    document.getElementById('closeDeleteModal').onclick = function () {
        document.getElementById('deleteModal').style.display = 'none';
        rowToDelete = null;
    };

    // --- Initial Load ---
    loadMenu();

    // --- Add Menu: Portion Modal Logic ---
    const setPortionBtn = document.getElementById('setPortionBtn');
    // portionModal, savePortionBtn, closePortionModal are already defined above

    if (setPortionBtn && portionModal) {
        setPortionBtn.addEventListener('click', function () {
            // Hide the Add Menu modal (Bootstrap)
            if (addMenuModalInstance) addMenuModalInstance.hide();
            // Show the custom Portion modal
            portionModal.style.display = 'flex';

            // Reset all checkboxes and price inputs
            document.querySelectorAll('#portionModal .portion-checkbox').forEach(cb => {
                cb.checked = false;
                const priceInput = cb.closest('.d-flex').querySelector('.portion-price');
                priceInput.value = '';
                priceInput.disabled = true;
            });

            // Restore previous selections if any
            if (window.selectedPortions && window.selectedPortions.length > 0) {
                window.selectedPortions.forEach(sel => {
                    const cb = document.querySelector(`#portionModal .portion-checkbox[value="${sel.portion}"]`);
                    if (cb) {
                        cb.checked = true;
                        const priceInput = cb.closest('.d-flex').querySelector('.portion-price');
                        priceInput.value = sel.price;
                        priceInput.disabled = false;
                    }
                });
            }
        });
    }

    // Enable/disable price input based on checkbox
    document.querySelectorAll('#portionModal .portion-checkbox').forEach(cb => {
        cb.addEventListener('change', function () {
            const priceInput = cb.closest('.d-flex').querySelector('.portion-price');
            priceInput.disabled = !cb.checked;
            if (!cb.checked) priceInput.value = '';
        });
    });

    // Save Portions button in Portion Modal (for Add Menu)
    if (savePortionBtn) {
        savePortionBtn.addEventListener('click', function () {
            let selected = [];
            document.querySelectorAll('#portionModal .portion-checkbox').forEach(cb => {
                if (cb.checked) {
                    const priceInput = cb.closest('.d-flex').querySelector('.portion-price');
                    selected.push({
                        portion: priceInput.getAttribute('data-portion'),
                        price: priceInput.value ? parseFloat(priceInput.value) : 0
                    });
                }
            });
            window.selectedPortions = selected;
            const portionSummary = document.getElementById('portionSummary');
            if (portionSummary) {
                portionSummary.innerText =
                    window.selectedPortions.length
                        ? window.selectedPortions.map(p => `${p.portion}: ₱${p.price.toFixed(2)}`).join(', ')
                        : 'No portion selected';
            }
            portionModal.style.display = 'none';
            if (addMenuModalInstance) addMenuModalInstance.show();
            updateAddMenuPriceInputVisibility();
        });
    }

    // Close Portion Modal (X button)
    if (closePortionModal) {
        closePortionModal.addEventListener('click', function () {
            portionModal.style.display = 'none';
            if (addMenuModalInstance) addMenuModalInstance.show();
        });
    }

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logoutButton');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function (e) {
            e.preventDefault();
            const token = localStorage.getItem('adminToken');
            try {
                // Call backend to revoke token (adjust endpoint as needed)
                await fetch('http://localhost:5000/api/admin/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (err) {
                // Optionally log error, but proceed to logout anyway
                console.error('Error revoking token:', err);
            }
            localStorage.removeItem('adminToken');
            // Prevent back navigation to protected pages
            window.location.replace('adminlogin.html'); // Use replace so back won't return here
        });
    }

    // --- Block access if not logged in ---
    if (!localStorage.getItem('adminToken')) {
        window.location.replace('adminlogin.html');
    }

    // Business Hours Tab Logic
    const openTimeInput = document.getElementById('openTime');
    const closeTimeInput = document.getElementById('closeTime');
    const holidaysInput = document.getElementById('holidays');
    const businessHoursForm = document.getElementById('businessHoursForm');
    const businessHoursMsg = document.getElementById('businessHoursMsg');
    const closedDaysCheckboxes = [
        { day: 'Sunday', el: document.getElementById('closedSunday') },
        { day: 'Monday', el: document.getElementById('closedMonday') },
        { day: 'Tuesday', el: document.getElementById('closedTuesday') },
        { day: 'Wednesday', el: document.getElementById('closedWednesday') },
        { day: 'Thursday', el: document.getElementById('closedThursday') },
        { day: 'Friday', el: document.getElementById('closedFriday') },
        { day: 'Saturday', el: document.getElementById('closedSaturday') },
    ];

    async function loadBusinessHours() {
        try {
            const res = await fetch('http://localhost:5000/api/business-settings');
            const data = await res.json();
            if (data) {
                openTimeInput.value = data.openTime || '';
                closeTimeInput.value = data.closeTime || '';
                holidaysInput.value = (data.holidays || []).map(d => d.slice(0, 10)).join(',');
                (data.closedDays || []).forEach(day => {
                    const cb = closedDaysCheckboxes.find(c => c.day === day);
                    if (cb) cb.el.checked = true;
                });
            }
        } catch (err) {
            businessHoursMsg.textContent = "Failed to load business hours.";
            businessHoursMsg.className = "text-danger";
        }
    }

    if (businessHoursForm) {
        businessHoursForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const openTime = openTimeInput.value;
            const closeTime = closeTimeInput.value;
            const closedDays = closedDaysCheckboxes.filter(cb => cb.el.checked).map(cb => cb.day);
            const holidays = holidaysInput.value.split(',').map(s => s.trim()).filter(Boolean);

            try {
                const token = localStorage.getItem('adminToken');
                const res = await fetch('http://localhost:5000/api/business-settings', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ openTime, closeTime, closedDays, holidays }),
                });
                if (res.ok) {
                    businessHoursMsg.textContent = "Business hours updated!";
                    businessHoursMsg.className = "text-success";
                } else {
                    businessHoursMsg.textContent = "Failed to update business hours.";
                    businessHoursMsg.className = "text-danger";
                }
            } catch (err) {
                businessHoursMsg.textContent = "Error updating business hours.";
                businessHoursMsg.className = "text-danger";
            }
        });

        loadBusinessHours();
    }
});