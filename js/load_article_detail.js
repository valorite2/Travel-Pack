// js/load_article_detail.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
// ¡Importamos nuestra función centralizada!
import { addToCart } from './cart.js'; 

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
    const articuloId = urlParams.get('id');

    if (!articuloId) {
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) {
            errorMessage.textContent = 'Error: No se ha especificado un artículo.';
            errorMessage.style.display = 'block';
        }
        return;
    }

    try {
        const { data: articulo, error } = await supabase
            .from('articulo')
            .select('id_articulo, tipo_articulo, descripcion, fecha, precio, imagen_url')
            .eq('id_articulo', articuloId)
            .single();

        if (loadingMessage) loadingMessage.style.display = 'none';
        if (error || !articulo) throw error || new Error('Artículo no encontrado.');

        articleDetailContainer.innerHTML = `
            <div class="detail-header">
                <h1>
                Últimos lugares. Reservá con el 40% y aboná el resto en cuotas antes de viajar!<button class="share-button"><i class="fas fa-share-alt"></i></button> <br><br>
                ${articulo.descripcion || 'Artículo sin título'}
                </h1>
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
                            <span class="value">$2.131.937</span>
                        </div>
                        <div class="price-item total-price">
                            <span>Precio total para 2 personas <i class="fas fa-info-circle"
                                    title="Basado en ocupación doble"></i></span>
                            <span class="value"> $${articulo.precio ? articulo.precio.toFixed(2) : 'N/A'}</span>
                        </div>
                        <div class="currency-conversion">
                            <span>USD $${articulo.precio ? articulo.precio.toFixed(2) : 'N/A'}</span>
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

        const addToCartBtn = articleDetailContainer.querySelector('.add-to-cart-detail');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async () => {
                const articuloId = addToCartBtn.dataset.articuloId;
                const articuloPrecio = parseFloat(addToCartBtn.dataset.articuloPrecio);
                alert(`Artículo ${articuloId} ($${articuloPrecio}) agregado al carrito desde la página de detalles.`);
                // Aquí deberías integrar la lógica real para agregar al carrito,
                // por ejemplo, llamando a una función global de carrito o importándola.
            });
        }

    } catch (err) {
        console.error('Error inesperado al cargar los detalles del artículo:', err);
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) {
            errorMessage.textContent = 'Ocurrió un error inesperado. Por favor, recargue la página.';
            errorMessage.style.display = 'block';
        }
    }
});
