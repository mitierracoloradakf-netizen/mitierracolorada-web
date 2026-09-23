import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const catalogContainer = document.getElementById('catalog-container');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const cartCount = document.getElementById('cart-count');
    
    // Botones de checkout
    const btnCheckoutWsp = document.getElementById('btn-checkout-wsp');
    
    // Formulario
    const inputName = document.getElementById('cart-name');
    const inputLastname = document.getElementById('cart-lastname');
    const inputAddress = document.getElementById('cart-address');
    const inputPhone = document.getElementById('cart-phone');
    const inputDate = document.getElementById('cart-date');

    let products = [];
    let cart = JSON.parse(localStorage.getItem('mtc_cart')) || [];

    // Funciones de Formateo
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    // Inicialización
    const init = async () => {
        try {
            const q = query(collection(db, "productos"), orderBy("id", "asc"));
            const querySnapshot = await getDocs(q);
            products = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const prodId = data.id !== undefined && data.id !== null ? String(data.id) : String(doc.id);
                products.push({
                    ...data,
                    id: prodId
                });
            });
            
            renderCatalog();
            updateCartUI();
        } catch (error) {
            console.error("Error cargando productos de Firebase:", error);
            catalogContainer.innerHTML = '<p style="text-align:center;color:red;">Error al cargar el catálogo. Por favor, intente más tarde.</p>';
        }
    };

    // Renderizar Catálogo
    const renderCatalog = () => {
        catalogContainer.innerHTML = '';
        
        const categories = {
            panaderia: '🥖 Panadería Artesanal',
            mermeladas: '🍓 Mermeladas Gourmet',
            conservas: '🧄 Salsas y Conservas'
        };

        for (const [key, title] of Object.entries(categories)) {
            const categoryProducts = products.filter(p => p.categoria === key && p.activo !== false && p.disponible !== false);
            
            if (categoryProducts.length > 0) {
                const categoryBlock = document.createElement('div');
                categoryBlock.className = 'category-block';
                
                const categoryTitle = document.createElement('h3');
                categoryTitle.textContent = title;
                categoryBlock.appendChild(categoryTitle);
                
                const productGrid = document.createElement('div');
                productGrid.className = 'product-grid';
                
                categoryProducts.forEach(product => {
                    const card = document.createElement('div');
                    card.className = 'product-card';
                    card.innerHTML = `
                        <span class="product-tag">${product.tag || ''}</span>
                        <img src="${product.imagen}" alt="${product.nombre}" class="product-img" loading="lazy" width="400" height="300">
                        <div class="product-info">
                            <h4>${product.nombre}</h4>
                            <p class="product-desc">${product.descripcion || ''}</p>
                            <div class="product-price">${formatPrice(product.precio)}</div>
                            <div class="add-to-cart-group">
                                <input type="number" class="qty-input" id="qty-${product.id}" value="1" min="1" max="99">
                                <button type="button" class="btn btn-primary btn-add" data-id="${product.id}">Agregar</button>
                            </div>
                        </div>
                    `;
                    productGrid.appendChild(card);
                });
                
                categoryBlock.appendChild(productGrid);
                catalogContainer.appendChild(categoryBlock);
            }
        }

        // Agregar eventos a botones
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.currentTarget || e.target.closest('.btn-add');
                const id = String(targetBtn.getAttribute('data-id'));
                const qtyInput = document.getElementById(`qty-${id}`);
                const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;
                
                addToCart(id, qty);
                if (qtyInput) qtyInput.value = 1; // reset
                
                const originalText = targetBtn.textContent;
                targetBtn.textContent = '¡Agregado!';
                targetBtn.style.backgroundColor = '#25D366';
                targetBtn.style.borderColor = '#25D366';
                setTimeout(() => {
                    targetBtn.textContent = originalText;
                    targetBtn.style.backgroundColor = '';
                    targetBtn.style.borderColor = '';
                }, 1000);
            });
        });
    };

    // Lógica del Carrito
    const addToCart = (productId, quantity) => {
        const pIdStr = String(productId);
        const product = products.find(p => String(p.id) === pIdStr);
        if (!product) {
            console.error("Producto no encontrado en catálogo:", productId);
            return;
        }

        const existingItem = cart.find(item => String(item.id) === pIdStr);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, id: pIdStr, quantity });
        }
        
        saveCart();
        updateCartUI();
    };

    const removeFromCart = (productId) => {
        const pIdStr = String(productId);
        cart = cart.filter(item => String(item.id) !== pIdStr);
        saveCart();
        updateCartUI();
    };

    const saveCart = () => {
        localStorage.setItem('mtc_cart', JSON.stringify(cart));
    };

    const updateCartUI = () => {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        let count = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="muted">Tu carrito está vacío.</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.precio * item.quantity;
                total += itemTotal;
                count += item.quantity;
                
                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <h5>${item.nombre}</h5>
                        <p>${item.quantity}x ${formatPrice(item.precio)}</p>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span class="cart-item-price">${formatPrice(itemTotal)}</span>
                        <button type="button" class="cart-item-remove" data-id="${item.id}" title="Eliminar">&times;</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
            
            document.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const targetBtn = e.currentTarget || e.target.closest('.cart-item-remove');
                    const id = String(targetBtn.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
        }

        cartTotalPrice.textContent = formatPrice(total);
        cartCount.textContent = count;
    };

    const openCart = () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Checkout functions
    const validateForm = () => {
        if (cart.length === 0) {
            alert('El carrito está vacío. Agrega productos antes de enviar.');
            return false;
        }
        if (!inputName.value.trim() || !inputLastname.value.trim() || !inputAddress.value.trim() || !inputDate.value.trim() || !inputPhone.value.trim()) {
            alert('Por favor, completa todos tus datos de entrega, incluyendo el teléfono.');
            return false;
        }
        // Validar telefono min length
        if (inputPhone.value.trim().length < 8) {
            alert('Por favor, ingresa un número de teléfono válido.');
            return false;
        }
        return true;
    };

    const buildOrderText = () => {
        let text = `Hola Mi Tierra Colorada, quiero realizar el siguiente pedido:\n\n`;
        let total = 0;
        
        cart.forEach(item => {
            const itemTotal = item.precio * item.quantity;
            total += itemTotal;
            text += `- ${item.quantity}x ${item.nombre} (${formatPrice(itemTotal)})\n`;
        });
        
        const dateParts = inputDate.value.split('-');
        const dateFormatted = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : inputDate.value;

        text += `\n*Total:* ${formatPrice(total)}\n`;
        text += `*Nombre:* ${inputName.value.trim()} ${inputLastname.value.trim()}\n`;
        text += `*Teléfono:* ${inputPhone.value.trim()}\n`;
        text += `*Dirección/Ciudad:* ${inputAddress.value.trim()}\n`;
        text += `*Fecha deseada:* ${dateFormatted}`;
        
        return text;
    };

    btnCheckoutWsp.addEventListener('click', async () => {
        if (!validateForm()) return;
        
        const originalText = btnCheckoutWsp.textContent;
        btnCheckoutWsp.textContent = 'Procesando...';
        btnCheckoutWsp.disabled = true;

        try {
            // Guardar pedido en Firebase "pedidos_web"
            const orderData = {
                cliente: {
                    nombre: `${inputName.value.trim()} ${inputLastname.value.trim()}`,
                    telefono: inputPhone.value.trim(),
                    direccion: inputAddress.value.trim()
                },
                fecha_deseada: inputDate.value.trim(),
                productos: cart.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    precio: item.precio,
                    cantidad: item.quantity,
                    subtotal: item.precio * item.quantity
                })),
                total: cart.reduce((acc, item) => acc + (item.precio * item.quantity), 0),
                estado: "Pendiente",
                origen: "Web",
                fecha_creacion: serverTimestamp()
            };

            await addDoc(collection(db, "pedidos_web"), orderData);

            // Generar link WhatsApp
            const text = encodeURIComponent(buildOrderText());
            const phone = '56978521748';
            window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
            
            // Desocupar el carro después de enviar
            cart = [];
            saveCart();
            updateCartUI();
            
            // Limpiar el formulario y cerrar el modal
            inputName.value = '';
            inputLastname.value = '';
            inputAddress.value = '';
            inputPhone.value = '+56 ';
            inputDate.value = '';
            closeCart();

        } catch (error) {
            console.error("Error al guardar el pedido:", error);
            alert("Hubo un error al procesar tu pedido: " + error.message);
        } finally {
            btnCheckoutWsp.textContent = originalText;
            btnCheckoutWsp.disabled = false;
        }
    });

    // Iniciar app
    init();
});