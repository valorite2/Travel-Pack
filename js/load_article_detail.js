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
                <div class="package-sidebar">
                    <div class="hotel-price-block">
                        <p class="total-price-small">Precio por unidad</p>
                        <div class="new-price">$${articulo.precio ? articulo.precio.toFixed(2) : 'N/A'}</div>
                        <button class="btn-primary add-to-cart-detail" 
                                data-articulo-id="${articulo.id_articulo}"
                                data-articulo-precio="${articulo.precio}">
                                Agregar al Carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        const addToCartBtn = articleDetailContainer.querySelector('.add-to-cart-detail');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', async () => {
                const id = addToCartBtn.dataset.articuloId;
                const precio = parseFloat(addToCartBtn.dataset.articuloPrecio);
                // ¡Llamamos a la función centralizada!
                await addToCart(id, precio);
            });
        }

    } catch (err) {
        console.error('Error al cargar detalle del artículo:', err);
        if (loadingMessage) loadingMessage.style.display = 'none';
        if (errorMessage) {
            errorMessage.textContent = 'Error al cargar el artículo. Inténtelo de nuevo.';
            errorMessage.style.display = 'block';
        }
    }
});
