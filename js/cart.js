// js/cart.js

// Importa el cliente Supabase. Este será el único lugar donde se necesita la lógica del carrito.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Tus credenciales de Supabase
const SUPABASE_URL = 'https://cywsonaxzsfixwtdazgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d3NvbmF4enNmaXh3dGRhemdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzE0MzksImV4cCI6MjA2NTUwNzQzOX0.yjYAW2Lvc_z3TdsGendoQXXu1Bj_3aZMGkJezCuY8Fo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para agregar al carrito. La exportamos para que otros archivos puedan usarla.
export async function addToCart(articuloId, articuloPrecio) {
    if (!articuloId) {
        alert('Error: ID de artículo no encontrado.');
        return;
    }

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Debes iniciar sesión para agregar artículos al carrito.');
            // Opcional: Redirigir a la página de login
            // window.location.href = 'login.html';
            return;
        }
        const userId = user.id;

        let idChanguito;
        const { data: existingChanguito, error: changuitoError } = await supabase
            .from('changuito')
            .select('id_changuito')
            .eq('id_cliente', userId)
            .single();

        if (changuitoError && changuitoError.code === 'PGRST116') {
            const { data: newChanguito, error: createChanguitoError } = await supabase
                .from('changuito')
                .insert([{ id_cliente: userId, total: 0 }])
                .select('id_changuito')
                .single();

            if (createChanguitoError) {
                console.error('Error al crear el changuito:', createChanguitoError);
                alert('Error al crear el carrito. Intenta de nuevo.');
                return;
            }
            idChanguito = newChanguito.id_changuito;
        } else if (changuitoError) {
            console.error('Error al buscar el changuito:', changuitoError);
            alert('Error al buscar tu carrito. Intenta de nuevo.');
            return;
        } else {
            idChanguito = existingChanguito.id_changuito;
        }

        const { data: existingItem, error: itemError } = await supabase
            .from('changuito_articulo')
            .select('cantidad')
            .eq('id_changuito', idChanguito)
            .eq('id_articulo', articuloId)
            .single();

        if (itemError && itemError.code === 'PGRST116') {
            const { error: insertItemError } = await supabase
                .from('changuito_articulo')
                .insert([{ id_changuito: idChanguito, id_articulo: articuloId, cantidad: 1 }]);

            if (insertItemError) throw insertItemError;
            alert('Artículo añadido al carrito!');
        } else if (itemError) {
            throw itemError;
        } else {
            const newQuantity = existingItem.cantidad + 1;
            const { error: updateItemError } = await supabase
                .from('changuito_articulo')
                .update({ cantidad: newQuantity })
                .eq('id_changuito', idChanguito)
                .eq('id_articulo', articuloId);

            if (updateItemError) throw updateItemError;
            alert(`Cantidad de artículo actualizada en el carrito a ${newQuantity}!`);
        }

        await updateCartTotal(idChanguito);

    } catch (err) {
        console.error('Error al agregar al carrito:', err);
        alert('Ocurrió un error inesperado al agregar al carrito.');
    }
}


// --- Lógica Interna del Carrito (no necesita ser exportada) ---

// Referencias del DOM para el carrito y el modal de pago
const cartModal = document.getElementById('cart-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const paymentModal = document.getElementById('payment-modal');
const closePaymentModalBtn = document.getElementById('close-payment-modal-btn');
const paymentForm = document.getElementById('payment-form');
const cartIcon = document.getElementById('cart-icon');
const modalMessage = document.getElementById('modal-message');

function showModalMessage(message, type = 'success') {
    if (modalMessage) {
        modalMessage.textContent = message;
        modalMessage.style.color = type === 'error' ? 'red' : (type === 'success' ? 'green' : 'black');
        modalMessage.style.display = 'block';
        setTimeout(() => {
            modalMessage.style.display = 'none';
        }, 5000);
    }
}

async function updateCartTotal(idChanguito) {
    // Agregamos un console.log para saber que la función se está ejecutando
    console.log('[Debug] Ejecutando updateCartTotal para el changuito:', idChanguito);

    try {
        const { data: newTotal, error: rpcError } = await supabase.rpc(
            'calcular_total_changuito', 
            { changuito_id_param: idChanguito }
        );

        // Si hay un error en la llamada RPC, lo veremos en la consola.
        if (rpcError) {
            console.error('[Debug] Error en la llamada RPC:', rpcError);
            throw rpcError;
        }

        // Vemos el total que nos devolvió la base de datos.
        console.log('[Debug] Total calculado por la BD:', newTotal);

        const { error: updateTotalError } = await supabase
            .from('changuito')
            .update({ total: newTotal })
            .eq('id_changuito', idChanguito);

        if (updateTotalError) {
            console.error('[Debug] Error al actualizar el total en la tabla changuito:', updateTotalError);
            throw updateTotalError;
        }
        
        console.log('[Debug] ¡Total actualizado en la BD exitosamente!');

        if (cartModal && cartModal.classList.contains('active')) {
            await displayCartItems();
        }

    } catch (err) {
        console.error('Error final en la función updateCartTotal:', err);
    }
}

async function displayCartItems() {
    if (!cartItemsContainer || !cartTotalElement) return;

    cartItemsContainer.innerHTML = '<p>Cargando carrito...</p>';
    cartTotalElement.textContent = '0.00';

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            cartItemsContainer.innerHTML = '<p>Debes <a href="login.html">iniciar sesión</a> para ver tu carrito.</p>';
            return;
        }

        const { data: changuito, error: changuitoError } = await supabase
            .from('changuito')
            .select('id_changuito, total')
            .eq('id_cliente', user.id)
            .single();

        if (changuitoError || !changuito) {
            cartItemsContainer.innerHTML = '<p>carrito cargado.</p>';
            return;
        }

        const idChanguito = changuito.id_changuito;
        cartTotalElement.textContent = changuito.total ? changuito.total.toFixed(2) : '0.00';

        const { data: cartItems, error: cartItemsError } = await supabase
            .from('changuito_articulo')
            .select('cantidad, articulo(id_articulo, descripcion, precio, imagen_url)')
            .eq('id_changuito', idChanguito);

        if (cartItemsError) throw cartItemsError;

        if (!cartItems || cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
            return;
        }

        cartItemsContainer.innerHTML = ''; // Limpiar para añadir los nuevos items
        cartItems.forEach(item => {
            const articulo = item.articulo;
            if (!articulo) return;

            const subtotal = item.cantidad * (articulo.precio || 0);
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <img src="${articulo.imagen_url || 'img/placeholder.webp'}" alt="${articulo.descripcion}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${articulo.descripcion}</h4>
                    <p>Precio: $${(articulo.precio || 0).toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="decrease-quantity-btn" data-id="${articulo.id_articulo}">-</button>
                        <span>${item.cantidad}</span>
                        <button class="increase-quantity-btn" data-id="${articulo.id_articulo}">+</button>
                    </div>
                    <p>Subtotal: $${subtotal.toFixed(2)}</p>
                </div>
                <button class="remove-item-btn" data-id="${articulo.id_articulo}">X</button>
            `;
            cartItemsContainer.appendChild(cartItemDiv);
        });

    } catch (err) {
        console.error('Error al mostrar el carrito:', err);
        cartItemsContainer.innerHTML = '<p style="color: red;">Error al cargar el carrito.</p>';
    }
}

async function updateCartItemQuantity(articuloId, change) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: changuito } = await supabase
            .from('changuito')
            .select('id_changuito')
            .eq('id_cliente', user.id)
            .single();

        if (!changuito) return;
        const idChanguito = changuito.id_changuito;

        const { data: item } = await supabase
            .from('changuito_articulo')
            .select('cantidad')
            .eq('id_changuito', idChanguito)
            .eq('id_articulo', articuloId)
            .single();

        if (!item) return;
        let newQuantity = item.cantidad + change;

        if (newQuantity <= 0) {
            await supabase
                .from('changuito_articulo')
                .delete()
                .eq('id_changuito', idChanguito)
                .eq('id_articulo', articuloId);
        } else {
            await supabase
                .from('changuito_articulo')
                .update({ cantidad: newQuantity })
                .eq('id_changuito', idChanguito)
                .eq('id_articulo', articuloId);
        }
        await updateCartTotal(idChanguito);
        await displayCartItems();

    } catch (err) {
        console.error('Error al actualizar cantidad del carrito:', err);
    }
}

async function processPayment(paymentDetails, idChanguito) {
    showModalMessage('Procesando pago...', 'black');
    try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulación de pago

        // Aquí deberías crear un registro en tu tabla `compra`
        const { data: { user } } = await supabase.auth.getUser();
        if(user) {
            await supabase.from('compra').insert([
                { id_cliente: user.id, id_changuito: idChanguito }
            ]);
        }

        // Vaciar el changuito_articulo
        await supabase.from('changuito_articulo').delete().eq('id_changuito', idChanguito);
        
        // Resetear el total del changuito a 0
        await supabase.from('changuito').update({ total: 0 }).eq('id_changuito', idChanguito);

        showModalMessage('¡Pago y compra exitosos! Tu pedido ha sido procesado.', 'success');
        
        // Espera un poco para que el usuario vea el mensaje y luego cierra los modales
        setTimeout(async () => {
            if (paymentModal) paymentModal.classList.remove('active');
            if (cartModal) cartModal.classList.remove('active');
            await displayCartItems(); // Actualizar para mostrar el carrito vacío
        }, 3000);


    } catch (err) {
        console.error('Error en el proceso de pago:', err);
        showModalMessage(`Error en el pago: ${err.message}`, 'error');
    }
}

// --- Event Listeners para toda la página ---
document.addEventListener('DOMContentLoaded', () => {
    // Asegurarse de que los elementos existan antes de añadir listeners
    if (cartIcon) {
        cartIcon.addEventListener('click', async () => {
            if (cartModal) {
                cartModal.classList.add('active');
                await displayCartItems();
            }
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (cartModal) cartModal.classList.remove('active');
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', async (event) => {
            const target = event.target;
            const articuloId = target.dataset.id;
            if (!articuloId) return;

            if (target.classList.contains('decrease-quantity-btn')) {
                await updateCartItemQuantity(articuloId, -1);
            } else if (target.classList.contains('increase-quantity-btn')) {
                await updateCartItemQuantity(articuloId, 1);
            } else if (target.classList.contains('remove-item-btn')) {
                await updateCartItemQuantity(articuloId, -Infinity);
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showModalMessage('Debes iniciar sesión para proceder al pago.', 'error');
                return;
            }

            const total = parseFloat(cartTotalElement.textContent);
            if(total <= 0) {
                 showModalMessage('Tu carrito está vacío.', 'error');
                 return;
            }

            if (cartModal) cartModal.classList.remove('active');
            if (paymentModal) paymentModal.classList.add('active');
        });
    }

    if (closePaymentModalBtn) {
        closePaymentModalBtn.addEventListener('click', () => {
            if (paymentModal) paymentModal.classList.remove('active');
        });
    }

    if (paymentForm) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showModalMessage('Error: No hay usuario logueado.', 'error');
                return;
            }

            const { data: changuito } = await supabase
                .from('changuito')
                .select('id_changuito')
                .eq('id_cliente', user.id)
                .single();

            if (!changuito) {
                showModalMessage('No se encontró tu carrito.', 'error');
                return;
            }
            
            // Simulación de detalles de pago
            const paymentDetails = {
                cardNumber: document.getElementById('card-number').value,
                expiryDate: document.getElementById('expiry-date').value,
                cvv: document.getElementById('cvv').value,
                cardName: document.getElementById('card-name').value
            };
            
            await processPayment(paymentDetails, changuito.id_changuito);
        });
    }
});