
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'password123';

let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];
let products = JSON.parse(localStorage.getItem('products')) || [];

function saveRegisteredUsers() {
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}



const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginView = document.getElementById('loginView');
const registerView = document.getElementById('registerView');
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');

// Control de Pestañas
if (showLoginBtn && showRegisterBtn) {
    const setActiveTab = (showLogin) => {
        if (showLogin) {
            loginView.classList.remove('hidden');
            registerView.classList.add('hidden');
            showLoginBtn.classList.add('active');
            showRegisterBtn.classList.remove('active');
        } else {
            loginView.classList.add('hidden');
            registerView.classList.remove('hidden');
            showRegisterBtn.classList.add('active');
            showLoginBtn.classList.remove('active');
        }
        document.getElementById('errorMessage').textContent = 'Credenciales inválidas.';
        document.getElementById('registerMessage').textContent = 'Regirsto exitoso. Por favor, inicia sesión.';
    };

    showLoginBtn.addEventListener('click', () => setActiveTab(true));
    showRegisterBtn.addEventListener('click', () => setActiveTab(false));
}


if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;
        const registerMessage = document.getElementById('registerMessage');
        registerMessage.textContent = '';
        
        if (username === VALID_USERNAME || registeredUsers.some(u => u.username === username)) {
            registerMessage.textContent = '❌ Este email ya está registrado o es el administrador.';
            registerMessage.style.color = 'red';
            return;
        }

        const newUser = { id: Date.now(), username, password, role: 'client' };
        registeredUsers.push(newUser);
        saveRegisteredUsers();
        
        registerMessage.textContent = '✅ Registro exitoso. Por favor, inicia sesión.';
        registerMessage.style.color = 'green';
        registerForm.reset();
        
        // Redirigir al Login después de un momento
        setTimeout(() => setActiveTab(true), 1500); 
    });
}

// LÓGICA DE LOGIN (ADMIN O CLIENTE)
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = ''; 

        let userRole = null;
        
   
        if (username === VALID_USERNAME && password === VALID_PASSWORD) {
            userRole = 'admin';
        } 

        else {
            const client = registeredUsers.find(u => u.username === username && u.password === password);
            if (client) {
                userRole = 'client';
            }
        }
        
        if (userRole) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', userRole); 
            window.location.href = 'dashboard.html'; 
        } else {
            errorMessage.textContent = 'Credenciales inválidas.';
        }
    });
}




const logoutButton = document.getElementById('logoutButton');


function checkAuth() {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userRole = localStorage.getItem('userRole');
    const adminPanel = document.getElementById('adminPanel');

    if (!isAuthenticated) {
        
        window.location.href = 'index.html';
        return;
    }
    
   
    if (logoutButton) {
        logoutButton.classList.remove('hidden');
        logoutButton.textContent = `Cerrar Sesión (${userRole === 'admin' ? 'Admin' : 'Cliente'})`;
    }

    // Mostrar/Ocultar el panel de administración (CRUD)
    if (adminPanel) {
        if (userRole === 'admin') {
            adminPanel.classList.remove('hidden');
        } else {
            adminPanel.classList.add('hidden');
        }
    }
    
    // Inicializar la vista de productos
    renderProducts();
}


if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
    });
}



const productForm = document.getElementById('productForm');
const saveButton = document.getElementById('saveButton');
const formMessage = document.getElementById('formMessage');

// READ (Leer) - Renderiza la tabla de administración y las tarjetas de marketplace
function renderProducts() {
    const adminTableBody = document.getElementById('adminTableBody'); 
    const productCardsContainer = document.getElementById('productCardsContainer');
    const userRole = localStorage.getItem('userRole');

    if (!productCardsContainer) return; 

    productCardsContainer.innerHTML = '';
    
   
    if (userRole === 'admin' && adminTableBody) {
        adminTableBody.innerHTML = '';
    }
    
    if (products.length === 0) {
        if (adminTableBody) adminTableBody.innerHTML = '<tr><td colspan="5">No hay productos.</td></tr>';
        productCardsContainer.innerHTML = '<p>Lo sentimos, no hay productos disponibles en este momento.</p>';
        return;
    }

    products.forEach(product => {
        
        if (userRole === 'admin' && adminTableBody) {
            const row = adminTableBody.insertRow();
            row.id = `product-row-${product.id}`; // ID de fila CLAVE para Selenium

            row.insertCell().textContent = product.id;
            row.insertCell().textContent = product.name;
            row.insertCell().textContent = `$${product.price.toFixed(2)}`;
            row.insertCell().textContent = product.stock;

            const actionCell = row.insertCell();
            
            // Botón de EDITAR (UPDATE)
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-button';
            editBtn.textContent = 'Editar';
            editBtn.setAttribute('data-id', product.id); 
            editBtn.onclick = () => editProduct(product.id);
            actionCell.appendChild(editBtn);

            // Botón de ELIMINAR (DELETE)
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-button';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.setAttribute('data-id', product.id); 
            deleteBtn.onclick = () => deleteProduct(product.id);
            actionCell.appendChild(deleteBtn);
        }

        // VISTA DE USUARIO (Marketplace de Tarjetas) - Siempre se renderiza
        const card = document.createElement('div');
        card.className = 'product-card';
        card.id = `card-${product.id}`; // ID de la tarjeta CLAVE para Selenium

        card.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" onerror="this.onerror=null;this.src='https://via.placeholder.com/180/007bff/ffffff?text=No+Img';">
            <h4 id="card-name-${product.id}">${product.name}</h4>
            <p class="description">${product.description}</p>
            <p class="price" id="card-price-${product.id}">$${product.price.toFixed(2)}</p>
            <button class="btn-primary" id="buy-btn-${product.id}" data-id="${product.id}">Comprar</button>
        `;
        productCardsContainer.appendChild(card);
    });
}

// CREATE / UPDATE
if (productForm) {
    productForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('productId').value;
        const name = document.getElementById('productName').value;
        const description = document.getElementById('productDescription').value;
        const imageUrl = document.getElementById('productImageUrl').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);

        formMessage.textContent = ''; 
        
        if (id) {
            // Lógica de ACTUALIZAR
            const index = products.findIndex(p => p.id === parseInt(id));
            if (index !== -1) {
                products[index] = { ...products[index], name, description, imageUrl, price, stock };
                formMessage.textContent = `✅ Producto ID ${id} actualizado con exito.`;
                formMessage.style.color = 'green';
            }
        } else {
            // Lógica de CREAR
            const newProduct = {
                id: Date.now(), name, description, imageUrl, price, stock
            };
            products.push(newProduct);
            formMessage.textContent = '✅ Producto creado con éxito.';
            formMessage.style.color = 'green';
        }

        saveProducts();
        renderProducts(); // Vuelve a renderizar ambas vistas
        productForm.reset();
        document.getElementById('productId').value = ''; 
        saveButton.textContent = 'Crear Producto';
    });
}

// UPDATE (Carga el producto en el formulario)
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productImageUrl').value = product.imageUrl;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productStock').value = product.stock;
    
    saveButton.textContent = 'Guardar Cambios';
    formMessage.textContent = `📝 Editando Producto ID ${product.id}.`;
    formMessage.style.color = 'blue';

    document.getElementById('adminFormSection').scrollIntoView({ behavior: 'smooth' });
}

// DELETE (Eliminar)
function deleteProduct(id) {
    if (confirm(`¿Está seguro de eliminar el producto ID ${id}: ${products.find(p => p.id === id)?.name}?`)) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderProducts();
        formMessage.textContent = `❌ Producto ID ${id} eliminado con éxito.`;
        formMessage.style.color = 'orange';
    }
}

// =========================================================
// 4. INICIALIZACIÓN
// =========================================================

// Esta línea asegura que la lógica se ejecute solo en el dashboard al cargar
if (document.querySelector('body[onload="checkAuth()"]')) {
    checkAuth();
}



// =========================================================
// 4. INICIALIZACIÓN Y LÓGICA DE COMPRA
// =========================================================

// Esta línea asegura que la lógica se ejecute solo en el dashboard al cargar
if (document.querySelector('body[onload="checkAuth()"]')) {
    checkAuth();
}

// LÓGICA DE COMPRA (Simulación)
document.addEventListener('click', (e) => {
    // Verifica si el clic fue en un botón con el prefijo de ID 'buy-btn-'
    if (e.target.matches('[id^="buy-btn-"]')) {
        const productId = parseInt(e.target.getAttribute('data-id'));
        simulatePurchase(productId);
    }
});

function simulatePurchase(productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    const product = products[productIndex];

    if (!product) {
        alert('Error: Producto no encontrado.');
        return;
    }

    if (product.stock > 0) {
        // Simulación: reducir el stock en 1
        product.stock--; 
        saveProducts();
        renderProducts(); // Vuelve a renderizar para actualizar el stock/tarjetas

        alert(`✅ Compra exitosa de "${product.name}". ¡Gracias! (Stock restante: ${product.stock})`);
    } else {
        alert(`❌ Lo sentimos, "${product.name}" está agotado.`);
    }

}
