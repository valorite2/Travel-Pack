    <script type="module">
        // Simulamos el módulo cart.js para que el ejemplo sea autocontenido.
        // En un entorno real, este archivo estaría separado.
        async function addToCart(id, price) {
            console.log(`Artículo ID: ${id}, Precio: ${price} agregado al carrito (simulado).`);
            // Aquí iría la lógica real para añadir al carrito, por ejemplo, a Supabase.
            alert(`Artículo '${id}' agregado al carrito!`); // Usamos alert para simular una notificación
        }

        // --- Código de load_article_detail.js ---
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

        // Tus credenciales de Supabase
        const SUPABASE_URL = 'https://cywsonaxzsfixwtdazgm.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d3NvbmF4enNmaXh3dGRhemdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzE0MzksImV4cCI6MjA2NTUwNzQzOX0.yjYAW2Lvc_z3TdsGendoQXXu1Bj_3aZMGkJezCuY8Fo';
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        document.addEventListener('DOMContentLoaded', async () => {
            const articleDetailContainer = document.getElementById('article-detail-container');
            const loadingMessage = document.getElementById('loading-message');
            const errorMessage = document.getElementById('error-message');

            if (!articleDetailContainer) return;

            if (loadingMessage) loadingMessage.style.display = 'block';

            const urlParams = new URLSearchParams(window.location.search);
            // Simula un ID de artículo para la demostración
            const articuloId = urlParams.get('id') || '1'; // Usamos '1' por defecto para la simulación
            const divisor = 2;

            if (!articuloId) {
                if (loadingMessage) loadingMessage.style.display = 'none';
                if (errorMessage) {
                    errorMessage.textContent = 'Error: No se ha especificado un artículo.';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            try {
                // Simulación de los datos que vendrían de Supabase
                // En un entorno real, esto sería la llamada a la base de datos
                let articulo;
                if (articuloId === '1') {
                    articulo = {
                        id_articulo: '1',
                        tipo_articulo: 'Paquete Turístico',
                        descripcion: 'Paquete de Aventura en la Patagonia: 7 Días de Trekking y Glaciares',
                        fecha: '2025-11-15',
                        precio: 2500000.00, // Precio total de ejemplo
                        imagen_url: 'https://placehold.co/800x350/4B5563/F3F4F6?text=Aventura+Patagonia'
                    };
                } else if (articuloId === '2') {
                     articulo = {
                        id_articulo: '2',
                        tipo_articulo: 'Vuelo',
                        descripcion: 'Vuelo Ida y Vuelta a Madrid',
                        fecha: '2025-10-01',
                        precio: 1500000.00,
                        imagen_url: 'https://placehold.co/800x350/3B82F6/DBEAFE?text=Vuelo+Madrid'
                    };
                } else {
                    articulo = null; // No se encontró el artículo
                }


                if (loadingMessage) loadingMessage.style.display = 'none';
                if (!articulo) { // Simplificado para simulación
                    if (errorMessage) {
                        errorMessage.textContent = 'Artículo no encontrado.';
                        errorMessage.style.display = 'block';
                    }
                    return;
                }

                articleDetailContainer.innerHTML = `
                    <div class="detail-header">
                        <h1>${articulo.descripcion || 'Artículo sin título'}</h1>
                    </div>
                    <div class="package-content-wrapper">
                        <div class="package-main-content">
                            <img src="${articulo.imagen_url || 'img/placeholder.webp'}" alt="${articulo.descripcion || 'Imagen'}" class="main-image">
                            <div class="detail-info">
                                <p><strong>Tipo:</strong> ${articulo.tipo_articulo ? articulo.tipo_articulo.toUpperCase() : 'N/A'}</p>
                                <p><strong>Fecha:</strong> ${articulo.fecha || 'N/A'}</p>
                                <div class="full-description">
                                    <h3>Descripción</h3>
                                    <p>${articulo.descripcion || 'No hay descripción disponible.'}</p>
                                </div>
                            </div>
                        </div>
                        
                        <aside class="package-sidebar">
                            <div class="sidebar-block date-selection">
                                <p><i class="fas fa-calendar-alt"></i> fecha: ${articulo.fecha || 'N/A'}</p>
                                <p><i class="fas fa-users"></i> 2 pasajeros, 1 habitación</p>
                                <p>${articulo.descripcion || 'No hay descripción completa disponible.'}</p>
                            </div>
                            <div class="sidebar-block price-summary">
                                <div class="price-item">
                                    <span>Precio por persona</span>
                                    <span class="value">$${articulo.precio && divisor !== 0 ? (articulo.precio / divisor).toFixed(2) : 'N/A'}</span>
                                </div>
                                <div class="price-item total-price">
                                    <span>Precio total para 2 personas <i class="fas fa-info-circle"
                                            title="Basado en ocupación doble"></i></span>
                                    <span class="value">$${articulo.precio ? (articulo.precio * 2).toFixed(2) : 'N/A'}</span>
                                </div>
                                <div class="currency-conversion">
                                    <span>USD $${articulo.precio ? (articulo.precio / 1000).toFixed(2) : 'N/A'}</span>
                                </div>
                            </div>
                            <div class="sidebar-block actions">
                            <div class="package-details">
                               <button class="btn-cart" data-articulo-id="${articulo.id_articulo}" data-articulo-precio="${articulo.precio}">Agregar al carrito</button>
                                </div>
                                <a href="#" class="contact-button">Contáctenos</a>
                            </div>
                            <div class="sidebar-block payment-methods">
                                <h4>Formas de pago</h4>
                                <ul class="payment-list">
                                    <li><i class="fas fa-check-circle"></i> Tarjeta de crédito</li>
                                    <li><i class="fas fa-check-circle"></i> Tarjeta de débito</li>
                                    <li><i class="fas fa-check-circle"></i> Dos tarjetas</li>
                                    <li><i class="fas fa-check-circle"></i> Transferencia / Depósito</li>
                                    <li><i class="fas fa-check-circle"></i> Múltiples medios (pago offline)</li>
                                    <li><i class="fas fa-check-circle"></i> Pago en dólares</li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                `;

                setTimeout(() => {
                    const addToCartBtn = document.querySelector('.btn-cart');

                    if (addToCartBtn) {
                        addToCartBtn.addEventListener('click', async () => {
                            const articuloId = addToCartBtn.dataset.articuloId;
                            const articuloPrecio = parseFloat(addToCartBtn.dataset.articuloPrecio);

                            // ¡Llamamos a la función centralizada para añadir al carrito!
                            await addToCart(articuloId, articuloPrecio);
                        });
                    } else {
                        console.error("Botón 'Agregar al carrito' no encontrado en la página de detalles.");
                    }
                }, 100); // Pequeño retraso para asegurar que el DOM se haya actualizado.

                
            } catch (err) {
                console.error('Error inesperado al cargar los detalles del artículo:', err);
                if (loadingMessage) loadingMessage.style.display = 'none';
                if (errorMessage) {
                    errorMessage.textContent = 'Ocurrió un error inesperado. Por favor, recargue la página.';
                    errorMessage.style.display = 'block';
                }
            }
        });
