// Variables globales
let servicioSeleccionado = null;
let transacciones = JSON.parse(localStorage.getItem('transacciones')) || [];
let citas = JSON.parse(localStorage.getItem('citas')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Inicializar según la página actual
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch(currentPage) {
        case 'index.html':
        case '':
            initHomePage();
            break;
        case 'citas.html':
            initBookingPage();
            break;
        case 'admin.html':
            initAdminPage();
            break;
    }
    
    // Inicializar componentes comunes
    initNavigation();
    initNotifications();
}

// Navegación
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Página Principal
function initHomePage() {
    initGalleryFilters();
    initScrollAnimations();
}

function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filtro-btn');
    const trabajoItems = document.querySelectorAll('.trabajo-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Agregar clase active al botón clickeado
            button.classList.add('active');
            
            const filter = button.getAttribute('data-filter');
            
            trabajoItems.forEach(item => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                    item.classList.add('fade-in');
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observar elementos que queremos animar
    document.querySelectorAll('.servicio-card, .trabajo-item').forEach(el => {
        observer.observe(el);
    });
}

// Página de Citas
function initBookingPage() {
    initServiceSelector();
    initBookingForm();
    initDateValidation();
}

function initServiceSelector() {
    const servicioOpciones = document.querySelectorAll('.servicio-opcion');
    const servicioInput = document.getElementById('servicio');
    const resumenServicio = document.getElementById('resumenServicio');
    const resumenDuracion = document.getElementById('resumenDuracion');
    const resumenPrecio = document.getElementById('resumenPrecio');
    
    servicioOpciones.forEach(opcion => {
        opcion.addEventListener('click', () => {
            // Remover selección previa
            servicioOpciones.forEach(op => op.classList.remove('selected'));
            // Seleccionar actual
            opcion.classList.add('selected');
            
            // Obtener datos del servicio
            const servicio = opcion.getAttribute('data-servicio');
            const precio = opcion.getAttribute('data-precio');
            const duracion = opcion.getAttribute('data-duracion');
            const nombre = opcion.querySelector('h4').textContent;
            
            servicioSeleccionado = {
                id: servicio,
                nombre: nombre,
                precio: precio,
                duracion: duracion
            };
            
            // Actualizar formulario y resumen
            servicioInput.value = nombre;
            resumenServicio.textContent = nombre;
            resumenDuracion.textContent = duracion + ' minutos';
            resumenPrecio.textContent = precio + '€';
        });
    });
}

function initBookingForm() {
    const form = document.getElementById('citaForm');
    
    if (form) {
        form.addEventListener('submit', handleBookingSubmit);
    }
}

function initDateValidation() {
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        // Establecer fecha mínima como hoy
        const today = new Date().toISOString().split('T');
        fechaInput.min = today;
        
        // Establecer fecha máxima (3 meses adelante)
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        fechaInput.max = maxDate.toISOString().split('T');
    }
}

function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const citaData = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        email: formData.get('email'),
        servicio: servicioSeleccionado ? servicioSeleccionado.nombre : formData.get('servicio'),
        precio: servicioSeleccionado ? servicioSeleccionado.precio : 0,
        fechaCita: formData.get('fecha'),
        hora: formData.get('hora'),
        notas: formData.get('notas'),
        estado: 'pendiente'
    };
    
    // Validar datos
    if (!citaData.nombre || !citaData.telefono || !citaData.servicio || !citaData.fechaCita || !citaData.hora) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    // Guardar cita
    citas.push(citaData);
    localStorage.setItem('citas', JSON.stringify(citas));
    
    // Mostrar confirmación
    showNotification('¡Cita reservada exitosamente! Te contactaremos pronto.', 'success');
    
    // Limpiar formulario
    e.target.reset();
    document.querySelectorAll('.servicio-opcion').forEach(op => op.classList.remove('selected'));
    servicioSeleccionado = null;
    
    // Limpiar resumen
    document.getElementById('resumenServicio').textContent = 'No seleccionado';
    document.getElementById('resumenDuracion').textContent = '-';
    document.getElementById('resumenPrecio').textContent = '-';
}

// Página de Administración
function initAdminPage() {
    checkAdminAuth();
    initLoginForm();
    initLogoutButton();
}

function checkAdminAuth() {
    const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
    const loginScreen = document.getElementById('loginScreen');
    const adminPanel = document.getElementById('adminPanel');
    
    if (isAuthenticated) {
        loginScreen.style.display = 'none';
        adminPanel.style.display = 'block';
        initAdminPanel();
    }
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    
    if (password === 'admin123') {
        sessionStorage.setItem('adminAuth', 'true');
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        initAdminPanel();
        showNotification('Acceso concedido', 'success');
    } else {
        showNotification('Contraseña incorrecta', 'error');
    }
}

function initLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('adminAuth');
            location.reload();
        });
    }
}

function initAdminPanel() {
    updateFinancialStats();
    initTransactionForm();
    loadTransactions();
    loadAppointments();
}

function updateFinancialStats() {
    const ingresos = transacciones
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + parseFloat(t.cantidad), 0);
    
    const gastos = transacciones
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + parseFloat(t.cantidad), 0);
    
    const balance = ingresos - gastos;
    
    document.getElementById('totalIngresos').textContent = ingresos.toFixed(2) + '€';
    document.getElementById('totalGastos').textContent = gastos.toFixed(2) + '€';
    document.getElementById('balance').textContent = balance.toFixed(2) + '€';
    document.getElementById('totalCitas').textContent = citas.length;
    
    // Cambiar color del balance
    const balanceElement = document.getElementById('balance');
    if (balance >= 0) {
        balanceElement.style.color = '#27ae60';
    } else {
        balanceElement.style.color = '#e74c3c';
    }
}

function initTransactionForm() {
    const form = document.getElementById('transactionForm');
    
    if (form) {
        // Establecer fecha actual por defecto
        document.getElementById('fechaTransaccion').value = new Date().toISOString().split('T');
        
        form.addEventListener('submit', handleTransactionSubmit);
    }
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const transaccion = {
        id: Date.now(),
        tipo: formData.get('tipo'),
        cantidad: parseFloat(formData.get('cantidad')),
        descripcion: formData.get('descripcion'),
        fecha: formData.get('fecha')
    };
    
    // Validar
    if (!transaccion.cantidad || !transaccion.descripcion || !transaccion.fecha) {
        showNotification('Completa todos los campos', 'error');
        return;
    }
    
    // Guardar
    transacciones.unshift(transaccion);
    localStorage.setItem('transacciones', JSON.stringify(transacciones));
    
    // Actualizar interfaz
    updateFinancialStats();
    loadTransactions();
    
    // Limpiar formulario
    e.target.reset();
    document.getElementById('fechaTransaccion').value = new Date().toISOString().split('T');
    
    showNotification('Transacción agregada exitosamente', 'success');
}

function loadTransactions() {
    const container = document.getElementById('transactionsList');
    
    if (!container) return;
    
    if (transacciones.length === 0) {
        container.innerHTML = '<p class="no-data">No hay transacciones registradas</p>';
        return;
    }
    
    container.innerHTML = transacciones.slice(0, 10).map(transaccion => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-type">
                    <span class="transaction-indicator ${transaccion.tipo}"></span>
                    <strong>${transaccion.descripcion}</strong>
                </div>
                <small>${formatDate(transaccion.fecha)}</small>
            </div>
            <div class="transaction-actions">
                <span class="transaction-amount ${transaccion.tipo}">
                    ${transaccion.tipo === 'ingreso' ? '+' : '-'}${transaccion.cantidad.toFixed(2)}€
                </span>
                <button class="delete-btn" onclick="deleteTransaction(${transaccion.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function loadAppointments() {
    const container = document.getElementById('citasList');
    
    if (!container) return;
    
    if (citas.length === 0) {
        container.innerHTML = '<p class="no-data">No hay citas reservadas</p>';
        return;
    }
    
    container.innerHTML = citas.map(cita => `
        <div class="cita-item">
            <div class="cita-info">
                <strong>${cita.nombre}</strong> - ${cita.servicio}
                <br>
                <small>📅 ${formatDate(cita.fechaCita)} a las ${cita.hora}</small>
                <br>
                <small>📞 ${cita.telefono}</small>
                ${cita.email ? `<br><small>✉️ ${cita.email}</small>` : ''}
            </div>
            <div class="cita-actions">
                <span class="cita-price">${cita.precio}€</span>
                <button class="delete-btn" onclick="deleteAppointment(${cita.id})">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function deleteTransaction(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
        transacciones = transacciones.filter(t => t.id !== id);
        localStorage.setItem('transacciones', JSON.stringify(transacciones));
        updateFinancialStats();
        loadTransactions();
        showNotification('Transacción eliminada', 'success');
    }
}

function deleteAppointment(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
        citas = citas.filter(c => c.id !== id);
        localStorage.setItem('citas', JSON.stringify(citas));
        loadAppointments();
        updateFinancialStats();
        showNotification('Cita eliminada', 'success');
    }
}

// Sistema de Notificaciones
function initNotifications() {
    // Crear contenedor de notificaciones si no existe
    if (!document.getElementById('notificacion')) {
        const notifContainer = document.createElement('div');
        notifContainer.id = 'notificacion';
        notifContainer.className = 'notificacion';
        notifContainer.innerHTML = `
            <div class="notificacion-content">
                <span class="notificacion-text"></span>
                <button class="notificacion-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notifContainer);
    }
    
    // Agregar event listener para cerrar notificación
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('notificacion-close')) {
            hideNotification();
        }
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notificacion');
    const content = notification.querySelector('.notificacion-content');
    const text = notification.querySelector('.notificacion-text');
    
    text.textContent = message;
    content.className = `notificacion-content ${type}`;
    notification.classList.add('show');
    
    // Auto-hide después de 5 segundos
    setTimeout(() => {
        hideNotification();
    }, 5000);
}

function hideNotification() {
    const notification = document.getElementById('notificacion');
    notification.classList.remove('show');
}

// Utilidades
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Funciones globales para botones
window.deleteTransaction = deleteTransaction;
window.deleteAppointment = deleteAppointment;

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    showNotification('Ha ocurrido un error inesperado', 'error');
});

// Manejar cambios de visibilidad (para actualizar datos)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && window.location.pathname.includes('admin.html')) {
        // Recargar datos cuando la pestaña vuelve a estar activa
        setTimeout(() => {
            if (sessionStorage.getItem('adminAuth') === 'true') {
                updateFinancialStats();
                loadTransactions();
                loadAppointments();
            }
        }, 1000);
    }
});
