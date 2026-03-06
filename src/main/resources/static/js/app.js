// API Base URL
const API_BASE_URL = '/api/products';

// DOM Elements
const addProductForm = document.getElementById('addProductForm');
const editProductForm = document.getElementById('editProductForm');
const productsTableBody = document.getElementById('productsTableBody');
const noProducts = document.getElementById('noProducts');
const editModal = document.getElementById('editModal');
const toast = document.getElementById('toast');

// Modal Elements
const closeBtn = document.querySelector('.close');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadAllProducts();
});

addProductForm.addEventListener('submit', handleAddProduct);
editProductForm.addEventListener('submit', handleEditProduct);
closeBtn.addEventListener('click', closeEditModal);

window.addEventListener('click', (event) => {
    if (event.target === editModal) {
        closeEditModal();
    }
});

// Product Management Functions
async function loadAllProducts() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const products = await response.json();
        displayProducts(products);
        showToast('Products loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products', 'error');
    }
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    const formData = new FormData(addProductForm);
    const product = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity'))
    };
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) throw new Error('Failed to add product');
        
        const newProduct = await response.json();
        addProductToTable(newProduct);
        addProductForm.reset();
        showToast('Product added successfully', 'success');
    } catch (error) {
        console.error('Error adding product:', error);
        showToast('Failed to add product', 'error');
    }
}

async function handleEditProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('editProductId').value;
    const formData = new FormData(editProductForm);
    const product = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        quantity: parseInt(formData.get('quantity'))
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(product)
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        
        const updatedProduct = await response.json();
        updateProductInTable(updatedProduct);
        closeEditModal();
        showToast('Product updated successfully', 'success');
    } catch (error) {
        console.error('Error updating product:', error);
        showToast('Failed to update product', 'error');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        
        removeProductFromTable(id);
        showToast('Product deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Failed to delete product', 'error');
    }
}

// Search and Filter Functions
async function searchByName() {
    const name = document.getElementById('searchName').value.trim();
    if (!name) {
        showToast('Please enter a product name to search', 'info');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/search?name=${encodeURIComponent(name)}`);
        if (!response.ok) throw new Error('Failed to search products');
        
        const products = await response.json();
        displayProducts(products);
        showToast(`Found ${products.length} products matching "${name}"`, 'info');
    } catch (error) {
        console.error('Error searching products:', error);
        showToast('Failed to search products', 'error');
    }
}

async function filterByPrice() {
    const maxPrice = document.getElementById('maxPrice').value;
    if (!maxPrice || maxPrice <= 0) {
        showToast('Please enter a valid maximum price', 'info');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/affordable?maxPrice=${maxPrice}`);
        if (!response.ok) throw new Error('Failed to filter products');
        
        const products = await response.json();
        displayProducts(products);
        showToast(`Found ${products.length} products under $${maxPrice}`, 'info');
    } catch (error) {
        console.error('Error filtering products:', error);
        showToast('Failed to filter products', 'error');
    }
}

async function showInStock() {
    try {
        const response = await fetch(`${API_BASE_URL}/in-stock`);
        if (!response.ok) throw new Error('Failed to fetch in-stock products');
        
        const products = await response.json();
        displayProducts(products);
        showToast(`Found ${products.length} products in stock`, 'info');
    } catch (error) {
        console.error('Error fetching in-stock products:', error);
        showToast('Failed to fetch in-stock products', 'error');
    }
}

// UI Functions
function displayProducts(products) {
    productsTableBody.innerHTML = '';
    
    if (products.length === 0) {
        productsTableBody.parentElement.style.display = 'none';
        noProducts.style.display = 'block';
        return;
    }
    
    productsTableBody.parentElement.style.display = 'table';
    noProducts.style.display = 'none';
    
    products.forEach(product => {
        addProductToTable(product);
    });
}

function addProductToTable(product) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>$${product.price.toFixed(2)}</td>
        <td>${product.quantity}</td>
        <td>
            <span class="status-badge ${product.quantity > 0 ? 'status-in-stock' : 'status-out-of-stock'}">
                ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-success btn-sm" onclick="openEditModal(${product.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </td>
    `;
    productsTableBody.appendChild(row);
}

function updateProductInTable(product) {
    const rows = productsTableBody.getElementsByTagName('tr');
    for (let row of rows) {
        const idCell = row.cells[0];
        if (idCell && idCell.textContent == product.id) {
            row.cells[1].textContent = product.name;
            row.cells[2].textContent = `$${product.price.toFixed(2)}`;
            row.cells[3].textContent = product.quantity;
            
            const statusBadge = row.cells[4].querySelector('.status-badge');
            statusBadge.className = `status-badge ${product.quantity > 0 ? 'status-in-stock' : 'status-out-of-stock'}`;
            statusBadge.textContent = product.quantity > 0 ? 'In Stock' : 'Out of Stock';
            
            break;
        }
    }
}

function removeProductFromTable(id) {
    const rows = productsTableBody.getElementsByTagName('tr');
    for (let row of rows) {
        const idCell = row.cells[0];
        if (idCell && idCell.textContent == id) {
            row.remove();
            
            if (rows.length === 0) {
                productsTableBody.parentElement.style.display = 'none';
                noProducts.style.display = 'block';
            }
            break;
        }
    }
}

// Modal Functions
async function openEditModal(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const product = await response.json();
        
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductQuantity').value = product.quantity;
        
        editModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching product for edit:', error);
        showToast('Failed to load product for editing', 'error');
    }
}

function closeEditModal() {
    editModal.style.display = 'none';
    editProductForm.reset();
}

// Toast Notification
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Search on Enter key
document.getElementById('searchName').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByName();
    }
});

document.getElementById('maxPrice').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        filterByPrice();
    }
});
