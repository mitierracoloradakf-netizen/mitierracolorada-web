import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let products = [];

// Exponer funciones al scope global para que funcionen con los onclick del HTML
window.showAddModal = showAddModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.closeModal = closeModal;
window.logout = logout;

// Load products from Firestore
async function fetchProducts() {
    const list = document.getElementById('admin-product-list');
    list.innerHTML = '<p style="text-align:center;">Cargando productos desde la nube...</p>';
    
    try {
        const q = query(collection(db, "productos"), orderBy("id", "asc"));
        const querySnapshot = await getDocs(q);
        
        products = [];
        querySnapshot.forEach((documento) => {
            products.push(documento.data());
        });
        
        renderAdminList();
    } catch (error) {
        console.error("Error cargando productos:", error);
        list.innerHTML = '<p style="color:red; text-align:center;">Error al cargar productos. Revisa la consola.</p>';
    }
}

function renderAdminList() {
    const list = document.getElementById('admin-product-list');
    const searchTerm = (document.getElementById('admin-search-input')?.value || '').toLowerCase().trim();
    list.innerHTML = '';

    const filtered = products.filter(p => {
        if (!searchTerm) return true;
        return (p.nombre && p.nombre.toLowerCase().includes(searchTerm)) ||
               (p.categoria && p.categoria.toLowerCase().includes(searchTerm)) ||
               (p.tag && p.tag.toLowerCase().includes(searchTerm));
    });

    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No se encontraron productos.</p>';
        return;
    }

    filtered.forEach(p => {
        const isActivo = p.activo !== false && p.disponible !== false;
        const row = document.createElement('div');
        row.className = 'product-edit-card';
        row.innerHTML = `
            <div class="product-card-top">
                <img src="${p.imagen || 'assets/img/placeholder.svg'}" alt="${p.nombre || ''}" onerror="this.src='logo.jpeg'">
                <div class="product-card-info">
                    <h4>${p.nombre || 'Sin nombre'}</h4>
                    <div class="meta">${p.categoria || ''} ${p.tag ? '• ' + p.tag : ''} • <strong>$${(p.precio || 0).toLocaleString('es-CL')}</strong></div>
                    <span class="badge ${isActivo ? 'badge-active' : 'badge-inactive'}">
                        ${isActivo ? '✅ Vigente' : '⛔ No Vigente'}
                    </span>
                </div>
            </div>
            <div class="product-card-actions">
                <button class="btn btn-sm" onclick="editProduct('${p.id}')">✏️ Editar</button>
                <button class="btn btn-sm outline btn-danger" onclick="deleteProduct('${p.id}')">🗑️ Eliminar</button>
            </div>
        `;
        list.appendChild(row);
    });
}

// Búsqueda en tiempo real
document.getElementById('admin-search-input')?.addEventListener('input', renderAdminList);

function showAddModal() {
    document.getElementById('modalTitle').innerText = 'Nuevo Producto';
    document.getElementById('productForm').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('edit-precio').value = '';
    document.getElementById('edit-activo').value = 'true';
    document.getElementById('edit-imagen-preview').style.display = 'none';
    document.getElementById('editModal').style.display = 'flex';
}

function editProduct(id) {
    const p = products.find(prod => String(prod.id) === String(id));
    if (!p) return;

    document.getElementById('modalTitle').innerText = 'Editar Producto';
    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-activo').value = (p.activo !== false && p.disponible !== false) ? 'true' : 'false';
    document.getElementById('edit-nombre').value = p.nombre || '';
    document.getElementById('edit-precio').value = p.precio || '';
    document.getElementById('edit-categoria').value = p.categoria || 'panaderia';
    document.getElementById('edit-descripcion').value = p.descripcion || '';
    document.getElementById('edit-tag').value = p.tag || '';
    document.getElementById('edit-imagen').value = p.imagen || '';

    const preview = document.getElementById('edit-imagen-preview');
    if (p.imagen) {
        preview.src = p.imagen;
        preview.style.display = 'inline-block';
    } else {
        preview.style.display = 'none';
    }

    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

document.getElementById('productForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Cambiar texto del botón
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.innerText = 'Guardando...';
    submitBtn.disabled = true;
    
    try {
        const idStr = document.getElementById('edit-id').value;
        const id = idStr ? idStr : Date.now().toString();
        
        let imageUrl = document.getElementById('edit-imagen').value;
        
        // Verificar si se seleccionó un archivo nuevo
        const fileInput = document.getElementById('edit-imagen-file');
        if (fileInput.files.length > 0) {
            let file = fileInput.files[0];
            
            submitBtn.innerText = 'Comprimiendo imagen...';
            try {
                file = await compressImage(file, 800);
            } catch (err) {
                console.error("Error al comprimir la imagen:", err);
            }
            
            submitBtn.innerText = 'Subiendo foto...';
            const formData = new FormData();
            formData.append('image', file);
            
            const imgbbResponse = await fetch('https://api.imgbb.com/1/upload?key=78c34fd809aeb30c1323e36b8dd9bde0', {
                method: 'POST',
                body: formData
            });
            
            const imgbbData = await imgbbResponse.json();
            
            if (imgbbData.success) {
                imageUrl = imgbbData.data.url;
            } else {
                throw new Error("Error al subir la imagen: " + (imgbbData.error ? imgbbData.error.message : "Desconocido"));
            }
        }

        const isActivo = document.getElementById('edit-activo').value === 'true';

        const newProduct = {
            id: id,
            activo: isActivo,
            disponible: isActivo,
            nombre: document.getElementById('edit-nombre').value.trim(),
            precio: parseInt(document.getElementById('edit-precio').value, 10) || 0,
            categoria: document.getElementById('edit-categoria').value,
            descripcion: document.getElementById('edit-descripcion').value.trim(),
            tag: document.getElementById('edit-tag').value.trim(),
            imagen: imageUrl
        };

        submitBtn.innerText = 'Guardando en la nube...';
        // Guardar en Firestore usando el ID como nombre de documento
        await setDoc(doc(db, "productos", id.toString()), newProduct, { merge: true });
        
        alert('¡Producto guardado exitosamente!');
        closeModal();
        fetchProducts(); // Recargar la lista
    } catch (error) {
        console.error("Error al guardar:", error);
        alert('Ocurrió un error al guardar: ' + error.message);
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
        // Limpiar el input de archivo
        document.getElementById('edit-imagen-file').value = '';
    }
});

async function deleteProduct(id) {
    if (confirm('¿Estás seguro de eliminar este producto de la base de datos?')) {
        try {
            await deleteDoc(doc(db, "productos", id.toString()));
            alert('Producto eliminado exitosamente');
            fetchProducts();
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert('Error al eliminar el producto');
        }
    }
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('admin-container').style.display = 'block';
        fetchProducts(); // Cargar productos solo si está logueado
    } else {
        // User is signed out
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('admin-container').style.display = 'none';
        document.getElementById('loginForm').reset();
    }
});

// Manejo del formulario de Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');
    const submitBtn = e.target.querySelector('button');
    const originalText = submitBtn.innerText;
    
    submitBtn.innerText = 'Ingresando...';
    submitBtn.disabled = true;
    errorMsg.style.display = 'none';

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged se encargará de actualizar la UI
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        errorMsg.style.display = 'block';
        errorMsg.innerText = 'Credenciales incorrectas o usuario no válido.';
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
});

// Función para cerrar sesión
async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
}

// Manejo del explorador de archivos para imagen
document.getElementById('edit-imagen-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Colocar el nombre del archivo en el campo de texto (temporalmente hasta que se suba)
        document.getElementById('edit-imagen').value = file.name;
        
        // Crear previsualización temporal
        const previewUrl = URL.createObjectURL(file);
        const preview = document.getElementById('edit-imagen-preview');
        preview.src = previewUrl;
        preview.style.display = 'inline-block';
    }
});

// Actualizar previsualización si el usuario escribe en el input de texto (en caso de que ponga una URL de internet)
document.getElementById('edit-imagen').addEventListener('input', function(e) {
    const preview = document.getElementById('edit-imagen-preview');
    if (e.target.value && e.target.value.startsWith('http')) {
        preview.src = e.target.value;
        preview.style.display = 'inline-block';
    } else if (!e.target.value) {
        preview.style.display = 'none';
    }
});

// --- Función para comprimir imágenes en el cliente ---
async function compressImage(file, maxWidth = 800) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                }, 'image/jpeg', 0.8);
            };
            img.onerror = function(error) {
                reject(error);
            };
        };
        reader.onerror = function(error) {
            reject(error);
        };
    });
}
