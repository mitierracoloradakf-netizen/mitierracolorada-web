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
    const btnCheckoutMail = document.getElementById('btn-checkout-mail');
    
    // Formulario
    const inputName = document.getElementById('cart-name');
    const inputAddress = document.getElementById('cart-address');
    const inputDate = document.getElementById('cart-date');

    // Datos estáticos
    let products = [
        {
            "id": 1,
            "categoria": "panaderia",
            "nombre": "Pan Dúo (Masa Madre)",
            "descripcion": "80% harina blanca y 20% harina integral. Corteza crujiente y miga suave.",
            "imagen": "pan_real.jpg",
            "tag": "Masa Madre",
            "precio": 3500
        },
        {
            "id": 11,
            "categoria": "panaderia",
            "nombre": "Pan Dúo Semilla (Masa Madre)",
            "descripcion": "Mezcla de harina blanca e integral con un exquisito mix de semillas.",
            "imagen": "pan_real.jpg",
            "tag": "Masa Madre",
            "precio": 4000
        },
        {
            "id": 12,
            "categoria": "panaderia",
            "nombre": "Pan Integral (Masa Madre)",
            "descripcion": "100% harina integral. Rico en fibra, con el sabor característico del campo.",
            "imagen": "pan_real.jpg",
            "tag": "Masa Madre",
            "precio": 3500
        },
        {
            "id": 13,
            "categoria": "panaderia",
            "nombre": "Pan Integral Semilla (Masa Madre)",
            "descripcion": "100% integral enriquecido con un mix de semillas tostadas. Sabor profundo.",
            "imagen": "pan_real.jpg",
            "tag": "Masa Madre",
            "precio": 4000
        },
        {
            "id": 2,
            "categoria": "mermeladas",
            "nombre": "Tomate & Albahaca",
            "descripcion": "El balance perfecto entre el dulzor del tomate y el aroma de la albahaca fresca recolectada en nuestro huerto.",
            "imagen": "tomate_albaca.jpg",
            "tag": "Firma",
            "precio": 4500
        },
        {
            "id": 3,
            "categoria": "mermeladas",
            "nombre": "Mermelada de Pimentón",
            "descripcion": "Elegante y versátil, ideal para maridar con quesos, carnes blancas y picoteos gourmet.",
            "imagen": "pimenton.jpg",
            "tag": "Especial",
            "precio": 4500
        },
        {
            "id": 4,
            "categoria": "mermeladas",
            "nombre": "Mermelada de Mora",
            "descripcion": "Sabor intenso y frutal, recolectada en su punto justo de madurez en la precordillera.",
            "imagen": "mora.jpg",
            "tag": "Bosque",
            "precio": 4000
        },
        {
            "id": 5,
            "categoria": "mermeladas",
            "nombre": "Mermelada de Berries",
            "descripcion": "Una explosión de frutos rojos seleccionados: frambuesas, arándanos y frutillas de nuestra zona.",
            "imagen": "berries.jpg",
            "tag": "Mix",
            "precio": 4500
        },
        {
            "id": 6,
            "categoria": "mermeladas",
            "nombre": "Mermelada de Ají Cristal",
            "descripcion": "Un toque atrevido y dulce que sorprende. Ideal para los que buscan un picor sutil y sofisticado.",
            "imagen": "grupo1.jpg",
            "tag": "Picante Suave",
            "precio": 5000
        },
        {
            "id": 7,
            "categoria": "conservas",
            "nombre": "Berenjenas Agridulces",
            "descripcion": "Nuestra receta secreta agridulce que resalta la textura única de la berenjena asada.",
            "imagen": "berenjenas_real.jpg",
            "tag": "Gourmet",
            "precio": 5500
        },
        {
            "id": 8,
            "categoria": "conservas",
            "nombre": "Ajos Asados en Aceite de Oliva",
            "descripcion": "Suaves, cremosos y listos para untar. Una delicia para los amantes del ajo premium.",
            "imagen": "ajos.jpg",
            "tag": "Novedad",
            "precio": 6000
        },
        {
            "id": 9,
            "categoria": "conservas",
            "nombre": "Salsa Ají Cacho de Cabra",
            "descripcion": "El sabor ahumado e intenso con el picor tradicional y rústico del campo chileno.",
            "imagen": "cacho_cabra.jpg",
            "tag": "Chileno",
            "precio": 4500
        },
        {
            "id": 10,
            "categoria": "conservas",
            "nombre": "Salsa de Ají Cristal",
            "descripcion": "Picor vibrante, fresco y con una fragancia inconfundible. Ideal para comidas diarias.",
            "imagen": "aji_cristal.jpg",
            "tag": "Aromática",
            "precio": 4000
        }
    ];
    let cart = JSON.parse(localStorage.getItem('mtc_cart')) || [];

    // Funciones de Formateo
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(price);
    };

    // Inicialización
    const init = () => {
        renderCatalog();
        updateCartUI();
    };

    // Renderizar Catálogo
    const renderCatalog = () => {
        catalogContainer.innerHTML = '';
        
        // Agrupar por categoría
        const categories = {
            panaderia: '🥖 Panadería Artesanal',
            mermeladas: '🍓 Mermeladas Gourmet',
            conservas: '🧄 Salsas y Conservas'
        };

        for (const [key, title] of Object.entries(categories)) {
            const categoryProducts = products.filter(p => p.categoria === key);
            
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
                        <span class="product-tag">${product.tag}</span>
                        <img src="${product.imagen}" alt="${product.nombre}" class="product-img" loading="lazy" width="400" height="300">
                        <div class="product-info">
                            <h4>${product.nombre}</h4>
                            <p class="product-desc">${product.descripcion}</p>
                            <div class="product-price">${formatPrice(product.precio)}</div>
                            <div class="add-to-cart-group">
                                <input type="number" class="qty-input" id="qty-${product.id}" value="1" min="1" max="99">
                                <button class="btn btn-primary btn-add" data-id="${product.id}">Agregar</button>
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
                const id = parseInt(e.target.getAttribute('data-id'));
                const qtyInput = document.getElementById(`qty-${id}`);
                const qty = parseInt(qtyInput.value) || 1;
                addToCart(id, qty);
                qtyInput.value = 1; // reset
                
                // Feedback visual breve
                const originalText = e.target.textContent;
                e.target.textContent = '¡Agregado!';
                e.target.style.backgroundColor = '#25D366';
                e.target.style.borderColor = '#25D366';
                setTimeout(() => {
                    e.target.textContent = originalText;
                    e.target.style.backgroundColor = '';
                    e.target.style.borderColor = '';
                }, 1000);
            });
        });
    };

    // Lógica del Carrito
    const addToCart = (productId, quantity) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        
        saveCart();
        updateCartUI();
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(item => item.id !== productId);
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
                        <button class="cart-item-remove" data-id="${item.id}" title="Eliminar">&times;</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemDiv);
            });
            
            // Eventos eliminar
            document.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    removeFromCart(id);
                });
            });
        }

        cartTotalPrice.textContent = formatPrice(total);
        cartCount.textContent = count;
    };

    // Abrir/Cerrar Carrito
    const openCart = () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevenir scroll fondo
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
        if (!inputName.value.trim() || !inputAddress.value.trim() || !inputDate.value.trim()) {
            alert('Por favor, completa tus datos de entrega.');
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
        
        text += `\n*Total:* ${formatPrice(total)}\n`;
        text += `*Nombre:* ${inputName.value.trim()}\n`;
        text += `*Dirección/Ciudad:* ${inputAddress.value.trim()}\n`;
        text += `*Fecha deseada:* ${inputDate.value.trim()}`;
        
        return text;
    };

    btnCheckoutWsp.addEventListener('click', () => {
        if (!validateForm()) return;
        const text = encodeURIComponent(buildOrderText());
        const phone = '56978521748';
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    });

    btnCheckoutMail.addEventListener('click', () => {
        if (!validateForm()) return;
        const text = encodeURIComponent(buildOrderText());
        const subject = encodeURIComponent('Nuevo Pedido - Mi Tierra Colorada');
        window.location.href = `mailto:mitierracolorada.kf@gmail.com?subject=${subject}&body=${text}`;
    });

    // Iniciar app
    init();
});
