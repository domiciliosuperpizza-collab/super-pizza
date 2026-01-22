// ========================================
// Super Pizza - JavaScript Application
// ========================================

// Configuration
const APPS_SCRIPT_URL = 'TU_URL_DE_APPS_SCRIPT_AQUI'; // Reemplazar después de desplegar Apps Script

const WHATSAPP_NUMBERS = {
    madrid: '573202569597',
    centro: '573133597806',
    santana: '573123642016',
    villanueva: '573213101242',
    funza: '573209355962'
};

const NEQUI_NUMBER = '573202036430';
const DAVIPLATA_NUMBER = '573112100765';
const DELIVERY_FEE = 4000;

// State
let cart = [];
let selectedRating = 0;
let customerDeliveryCount = 0;

// ========================================
// DOM Elements
// ========================================

// Customer Data
const customerName = document.getElementById('customerName');
const customerAddress = document.getElementById('customerAddress');
const customerPhone = document.getElementById('customerPhone');
const deliveryOption = document.getElementById('deliveryOption');
const selectedStore = document.getElementById('selectedStore');
const customerObservations = document.getElementById('customerObservations');

// Pizza
const pizzaSize = document.getElementById('pizzaSize');
const saboresContainer = document.getElementById('saboresContainer');
const maxSaboresText = document.getElementById('maxSaboresText');
const saborCheckboxes = document.querySelectorAll('.sabor-checkbox');
const addPizzaBtn = document.getElementById('addPizzaBtn');

// Juice
const juiceType = document.getElementById('juiceType');
const juiceFlavorsContainer = document.getElementById('juiceFlavorsContainer');
const juiceFlavor = document.getElementById('juiceFlavor');
const addJuiceBtn = document.getElementById('addJuiceBtn');

// Cart
const cartEmpty = document.getElementById('cartEmpty');
const cartItems = document.getElementById('cartItems');
const cartSummary = document.getElementById('cartSummary');
const subtotalAmount = document.getElementById('subtotalAmount');
const deliveryAmount = document.getElementById('deliveryAmount');
const totalAmount = document.getElementById('totalAmount');

// Payment
const paymentMethod = document.getElementById('paymentMethod');
const digitalPaymentButtons = document.getElementById('digitalPaymentButtons');
const nequiPayBtn = document.getElementById('nequiPayBtn');
const daviplataPayBtn = document.getElementById('daviplataPayBtn');
const referenceContainer = document.getElementById('referenceContainer');
const paymentReference = document.getElementById('paymentReference');
const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');

// Rating
const ratingStars = document.querySelectorAll('.rating-stars i');
const ratingComment = document.getElementById('ratingComment');

// Final Actions
const sendOrderBtn = document.getElementById('sendOrderBtn');
const finalBreakdown = document.getElementById('finalBreakdown');
const breakdownDetails = document.getElementById('breakdownDetails');
const closeBreakdownBtn = document.getElementById('closeBreakdownBtn');

// Loyalty
const loyaltyProgress = document.getElementById('loyaltyProgress');
const currentDeliveries = document.getElementById('currentDeliveries');
const progressFill = document.getElementById('progressFill');
const loyaltySuccess = document.getElementById('loyaltySuccess');

// ========================================
// Initialization
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializePizzaSelector();
    initializeJuiceSelector();
    initializeSimpleItems();
    initializePayment();
    initializeRating();
    initializeDeliveryOption();
    checkLoyaltyStatus();
});

// ========================================
// Tabs
// ========================================

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// ========================================
// Pizza Selector
// ========================================

function initializePizzaSelector() {
    pizzaSize.addEventListener('change', () => {
        const selectedOption = pizzaSize.options[pizzaSize.selectedIndex];
        
        if (pizzaSize.value) {
            const maxSabores = parseInt(selectedOption.dataset.maxsabores);
            saboresContainer.style.display = 'block';
            maxSaboresText.textContent = `(máximo ${maxSabores})`;
            addPizzaBtn.style.display = 'block';

            // Reset checkboxes
            saborCheckboxes.forEach(cb => {
                cb.checked = false;
                cb.disabled = false;
            });

            // Add validation
            saborCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    const checkedCount = document.querySelectorAll('.sabor-checkbox:checked').length;
                    if (checkedCount >= maxSabores) {
                        saborCheckboxes.forEach(checkbox => {
                            if (!checkbox.checked) {
                                checkbox.disabled = true;
                            }
                        });
                    } else {
                        saborCheckboxes.forEach(checkbox => {
                            checkbox.disabled = false;
                        });
                    }
                });
            });
        } else {
            saboresContainer.style.display = 'none';
            addPizzaBtn.style.display = 'none';
        }
    });

    addPizzaBtn.addEventListener('click', () => {
        const selectedOption = pizzaSize.options[pizzaSize.selectedIndex];
        const size = selectedOption.value;
        const price = parseInt(selectedOption.dataset.price);
        const selectedSabores = Array.from(document.querySelectorAll('.sabor-checkbox:checked'))
            .map(cb => cb.value);

        if (!size) {
            alert('Por favor selecciona un tamaño de pizza');
            return;
        }

        if (selectedSabores.length === 0) {
            alert('Por favor selecciona al menos un sabor');
            return;
        }

        const sizeText = selectedOption.text;
        const item = {
            id: Date.now(),
            type: 'pizza',
            name: `Pizza ${sizeText.split(' - ')[0]}`,
            details: `Sabores: ${selectedSabores.join(', ')}`,
            price: price,
            quantity: 1
        };

        addToCart(item);

        // Reset
        pizzaSize.value = '';
        saboresContainer.style.display = 'none';
        addPizzaBtn.style.display = 'none';
        saborCheckboxes.forEach(cb => {
            cb.checked = false;
            cb.disabled = false;
        });
    });
}

// ========================================
// Juice Selector
// ========================================

function initializeJuiceSelector() {
    juiceType.addEventListener('change', () => {
        if (juiceType.value) {
            juiceFlavorsContainer.style.display = 'block';
            addJuiceBtn.style.display = 'block';
        } else {
            juiceFlavorsContainer.style.display = 'none';
            addJuiceBtn.style.display = 'none';
        }
    });

    addJuiceBtn.addEventListener('click', () => {
        const selectedTypeOption = juiceType.options[juiceType.selectedIndex];
        const selectedFlavorOption = juiceFlavor.options[juiceFlavor.selectedIndex];

        if (!juiceType.value || !juiceFlavor.value) {
            alert('Por favor selecciona el tipo y sabor del jugo');
            return;
        }

        const type = selectedTypeOption.text.split(' - ')[0];
        const flavor = selectedFlavorOption.value;
        const price = parseInt(selectedTypeOption.dataset.price);

        const item = {
            id: Date.now(),
            type: 'juice',
            name: `Jugo de ${flavor}`,
            details: type,
            price: price,
            quantity: 1
        };

        addToCart(item);

        // Reset
        juiceType.value = '';
        juiceFlavor.value = '';
        juiceFlavorsContainer.style.display = 'none';
        addJuiceBtn.style.display = 'none';
    });
}

// ========================================
// Simple Items (Direct Add)
// ========================================

function initializeSimpleItems() {
    const simpleButtons = document.querySelectorAll('.btn-add-simple');
    
    simpleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const menuItem = btn.closest('.menu-item, .menu-item-detailed');
            const itemName = menuItem.dataset.item;
            const itemPrice = parseInt(menuItem.dataset.price);

            // Check if item already in cart
            const existingItem = cart.find(item => item.name === itemName);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                const item = {
                    id: Date.now(),
                    type: 'simple',
                    name: itemName,
                    details: '',
                    price: itemPrice,
                    quantity: 1
                };
                cart.push(item);
            }

            updateCart();
            showNotification('Producto agregado al carrito');
        });
    });
}

// ========================================
// Cart Management
// ========================================

function addToCart(item) {
    cart.push(item);
    updateCart();
    showNotification('Producto agregado al carrito');
}

function updateCart() {
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartItems.innerHTML = '';
        cartSummary.style.display = 'none';
        return;
    }

    cartEmpty.style.display = 'none';
    cartSummary.style.display = 'block';

    // Render cart items
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                ${item.details ? `<div class="cart-item-details">${item.details}</div>` : ''}
                <div class="cart-item-price">${formatCurrency(item.price)} x ${item.quantity} = ${formatCurrency(item.price * item.quantity)}</div>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn btn-decrease" data-id="${item.id}">−</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn btn-increase" data-id="${item.id}">+</button>
                </div>
                <button class="btn btn-remove" data-id="${item.id}">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === itemId);
            if (item) {
                item.quantity++;
                updateCart();
            }
        });
    });

    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.id);
            const item = cart.find(i => i.id === itemId);
            if (item && item.quantity > 1) {
                item.quantity--;
                updateCart();
            }
        });
    });

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemId = parseInt(btn.dataset.id);
            cart = cart.filter(i => i.id !== itemId);
            updateCart();
            showNotification('Producto eliminado');
        });
    });

    // Update totals
    updateTotals();
}

function updateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = deliveryOption.value === 'domicilio' ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;

    subtotalAmount.textContent = formatCurrency(subtotal);
    deliveryAmount.textContent = formatCurrency(delivery);
    totalAmount.textContent = formatCurrency(total);
}

// ========================================
// Delivery Option
// ========================================

function initializeDeliveryOption() {
    deliveryOption.addEventListener('change', updateTotals);
}

// ========================================
// Payment
// ========================================

function initializePayment() {
    paymentMethod.addEventListener('change', () => {
        const method = paymentMethod.value;
        
        if (method === 'nequi' || method === 'daviplata') {
            digitalPaymentButtons.style.display = 'block';
            nequiPayBtn.style.display = method === 'nequi' ? 'block' : 'none';
            daviplataPayBtn.style.display = method === 'daviplata' ? 'block' : 'none';
            referenceContainer.style.display = 'block';
            confirmPaymentBtn.style.display = 'block';
            sendOrderBtn.disabled = true;
        } else if (method === 'efectivo') {
            digitalPaymentButtons.style.display = 'none';
            sendOrderBtn.disabled = false;
        } else {
            digitalPaymentButtons.style.display = 'none';
            sendOrderBtn.disabled = true;
        }
    });

    nequiPayBtn.addEventListener('click', () => {
        const total = calculateTotal();
        window.open(`https://wa.me/${NEQUI_NUMBER}?text=Pago%20Super%20Pizza%20-%20${formatCurrency(total)}`, '_blank');
    });

    daviplataPayBtn.addEventListener('click', () => {
        const total = calculateTotal();
        window.open(`https://wa.me/${DAVIPLATA_NUMBER}?text=Pago%20Super%20Pizza%20-%20${formatCurrency(total)}`, '_blank');
    });

    confirmPaymentBtn.addEventListener('click', () => {
        const reference = paymentReference.value.trim();
        
        if (!reference) {
            alert('Por favor ingresa la referencia o últimos 4 dígitos del pago');
            return;
        }

        showFinalBreakdown();
    });
}

// ========================================
// Final Breakdown
// ========================================

function showFinalBreakdown() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = deliveryOption.value === 'domicilio' ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;

    let html = '<div style="margin-bottom: 20px;">';
    
    cart.forEach(item => {
        html += `
            <div class="breakdown-item">
                <div class="breakdown-item-name">${item.name} x ${item.quantity}</div>
                ${item.details ? `<div class="breakdown-item-detail">${item.details}</div>` : ''}
                <div class="breakdown-item-detail" style="font-weight: 700; color: var(--color-primary);">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `;
    });

    html += `
        <div class="breakdown-item" style="margin-top: 15px; padding-top: 15px; border-top: 2px solid var(--color-primary);">
            <div class="breakdown-item-name">Subtotal</div>
            <div class="breakdown-item-detail" style="font-weight: 700;">${formatCurrency(subtotal)}</div>
        </div>
        <div class="breakdown-item">
            <div class="breakdown-item-name">Domicilio</div>
            <div class="breakdown-item-detail" style="font-weight: 700;">${formatCurrency(delivery)}</div>
        </div>
        <div class="breakdown-item" style="font-size: 1.2rem; color: var(--color-primary);">
            <div class="breakdown-item-name" style="font-weight: 700;">TOTAL</div>
            <div class="breakdown-item-detail" style="font-weight: 700;">${formatCurrency(total)}</div>
        </div>
    `;

    html += '</div>';

    breakdownDetails.innerHTML = html;
    finalBreakdown.style.display = 'flex';
    sendOrderBtn.disabled = false;
}

closeBreakdownBtn.addEventListener('click', () => {
    finalBreakdown.style.display = 'none';
});

// ========================================
// Rating
// ========================================

function initializeRating() {
    ratingStars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            
            ratingStars.forEach((s, i) => {
                if (i < selectedRating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
    });
}

// ========================================
// Send Order
// ========================================

sendOrderBtn.addEventListener('click', async () => {
    // Validate customer data
    if (!customerName.value.trim()) {
        alert('Por favor ingresa tu nombre');
        customerName.focus();
        return;
    }

    if (!customerAddress.value.trim()) {
        alert('Por favor ingresa tu dirección');
        customerAddress.focus();
        return;
    }

    if (!customerPhone.value.trim()) {
        alert('Por favor ingresa tu número celular');
        customerPhone.focus();
        return;
    }

    if (cart.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de enviar el pedido');
        return;
    }

    if (!paymentMethod.value) {
        alert('Por favor selecciona una forma de pago');
        paymentMethod.focus();
        return;
    }

    // Build WhatsApp message
    const message = buildWhatsAppMessage();
    const store = selectedStore.value;
    const whatsappNumber = WHATSAPP_NUMBERS[store];
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Send to Apps Script for loyalty tracking
    try {
        await registerOrder();
    } catch (error) {
        console.error('Error registering order:', error);
        // Continue even if registration fails
    }

    // Open WhatsApp
    window.open(whatsappURL, '_blank');

    // Show success message
    setTimeout(() => {
        alert('¡Pedido enviado! Te responderemos pronto por WhatsApp');
        // Optionally reset form
        // resetForm();
    }, 500);
});

function buildWhatsAppMessage() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = deliveryOption.value === 'domicilio' ? DELIVERY_FEE : 0;
    const total = subtotal + delivery;

    let message = '🍕 *PEDIDO SUPER PIZZA* 🍕\n\n';
    
    // Customer data
    message += '*DATOS DEL CLIENTE*\n';
    message += `👤 Nombre: ${customerName.value}\n`;
    message += `📍 Dirección: ${customerAddress.value}\n`;
    message += `📱 Celular: ${customerPhone.value}\n`;
    message += `🏪 Punto de venta: ${selectedStore.options[selectedStore.selectedIndex].text}\n`;
    message += `🚚 Tipo: ${deliveryOption.value === 'domicilio' ? 'Domicilio' : 'Recoge en tienda'}\n\n`;

    // Order items
    message += '*PEDIDO*\n';
    cart.forEach(item => {
        message += `▪️ ${item.name} x${item.quantity}\n`;
        if (item.details) {
            message += `   ${item.details}\n`;
        }
        message += `   ${formatCurrency(item.price * item.quantity)}\n\n`;
    });

    // Totals
    message += `*Subtotal:* ${formatCurrency(subtotal)}\n`;
    message += `*Domicilio:* ${formatCurrency(delivery)}\n`;
    message += `*TOTAL:* ${formatCurrency(total)}\n\n`;

    // Payment
    message += `*Forma de pago:* ${paymentMethod.options[paymentMethod.selectedIndex].text}\n`;
    if (paymentReference.value) {
        message += `*Referencia:* ${paymentReference.value}\n`;
    }

    // Observations
    if (customerObservations.value.trim()) {
        message += `\n*Observaciones:*\n${customerObservations.value}\n`;
    }

    // Rating
    if (selectedRating > 0) {
        message += `\n*Calificación:* ${'⭐'.repeat(selectedRating)}\n`;
        if (ratingComment.value.trim()) {
            message += `*Comentario:* ${ratingComment.value}\n`;
        }
    }

    return message;
}

// ========================================
// Loyalty System
// ========================================

async function registerOrder() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI') {
        console.warn('Apps Script URL not configured');
        return;
    }

    const total = calculateTotal();
    const data = {
        nombre: customerName.value,
        celular: customerPhone.value,
        sede: selectedStore.options[selectedStore.selectedIndex].text,
        total: total,
        fecha: new Date().toISOString()
    };

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Check loyalty status
        await checkLoyaltyStatus();

        // Send registration message to WhatsApp
        const registrationMessage = buildRegistrationMessage(data);
        const whatsappURL = `https://wa.me/${WHATSAPP_NUMBERS.madrid}?text=${encodeURIComponent(registrationMessage)}`;
        
        // Open in a small window or just log
        console.log('Registration WhatsApp:', whatsappURL);
        
    } catch (error) {
        console.error('Error in registerOrder:', error);
        throw error;
    }
}

function buildRegistrationMessage(data) {
    let message = '📋 *REGISTRO DE FIDELIZACIÓN*\n\n';
    message += `👤 Cliente: ${data.nombre}\n`;
    message += `📱 Celular: ${data.celular}\n`;
    message += `🏪 Sede: ${data.sede}\n`;
    message += `💰 Total: ${formatCurrency(data.total)}\n`;
    message += `📅 Fecha: ${new Date().toLocaleDateString('es-CO')}\n`;
    message += `\n🎯 Domicilios acumulados: ${customerDeliveryCount + 1}/12`;
    
    return message;
}

async function checkLoyaltyStatus() {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI') {
        return;
    }

    const phone = customerPhone.value.trim();
    if (!phone) return;

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?celular=${phone}`);
        const data = await response.json();
        
        if (data.count !== undefined) {
            customerDeliveryCount = data.count;
            
            if (customerDeliveryCount >= 12) {
                loyaltyProgress.style.display = 'none';
                loyaltySuccess.style.display = 'block';
            } else {
                loyaltyProgress.style.display = 'block';
                loyaltySuccess.style.display = 'none';
                currentDeliveries.textContent = customerDeliveryCount;
                
                const percentage = (customerDeliveryCount / 12) * 100;
                progressFill.style.width = `${percentage}%`;
            }
        }
    } catch (error) {
        console.error('Error checking loyalty status:', error);
    }
}

// Listen to phone changes for loyalty check
customerPhone.addEventListener('blur', checkLoyaltyStatus);

// ========================================
// Utility Functions
// ========================================

function formatCurrency(amount) {
    return `$${amount.toLocaleString('es-CO')}`;
}

function calculateTotal() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = deliveryOption.value === 'domicilio' ? DELIVERY_FEE : 0;
    return subtotal + delivery;
}

function showNotification(message) {
    // Simple notification (could be enhanced with a toast library)
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-success);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
