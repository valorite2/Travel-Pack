// js/load_main_articles.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
// ¡Importamos nuestra función centralizada para añadir al carrito!
import { addToCart } from './cart.js'; 

// Tus credenciales de Supabase
const SUPABASE_URL = 'https://cywsonaxzsfixwtdazgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d3NvbmF4enNmaXh3dGRhemdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzE0MzksImV4cCI6MjA2NTUwNzQzOX0.yjYAW2Lvc_z3TdsGendoQXXu1Bj_3aZMGkJezCuY8Fo';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Variables para la paginación
const ITEMS_PER_LOAD = 6;
let currentOffset = 0;

// Función para cargar artículos (esta se queda aquí)
async function loadArticles(offset, limit) {
    const articlesContainer = document.getElementById('dynamic-articles-container');
    const loadingMessage = document.getElementById('loading-articles-message');
    const verMasBtn = document.getElementById('verMasBtn');

    if (!articlesContainer) {
        console.error("Contenedor de artículos dinámicos no encontrado.");
        return;
    }

    if (loadingMessage) loadingMessage.style.display = 'block';
    if (verMasBtn) verMasBtn.style.display = 'none';

    try {
        const { data: articulos, error } = await supabase
            .from('articulo')
            .select('id_articulo, tipo_articulo, descripcion, fecha, imagen_url, precio')
            .order('id_articulo', { ascending: true })
            .range(offset, offset + limit - 1);

        if (loadingMessage) loadingMessage.style.display = 'none';

        if (error) {
            throw error;
        }

        if (!articulos || articulos.length === 0) {
            if (offset === 0) {
                articlesContainer.innerHTML = '<p class="message">No hay artículos para mostrar.</p>';
            }
            if (verMasBtn) verMasBtn.style.display = 'none';
            return;
        }

        articulos.forEach(articulo => {
            const articleCard = document.createElement('div');
            articleCard.classList.add('package-card');
            articleCard.dataset.articuloId = articulo.id_articulo;
            articleCard.style.cursor = 'pointer';

            articleCard.addEventListener('click', (e) => {
                // Solo redirigir si no se hizo clic en el botón del carrito
                if (!e.target.classList.contains('btn-cart')) {
                    window.location.href = `articulo.html?id=${articulo.id_articulo}`;
                }
            });
            
            const precioFormateado = articulo.precio ? articulo.precio.toFixed(2) : 'N/A';

            articleCard.innerHTML = `
                <div class="image-container">
                    <img src="${articulo.imagen_url || 'img/placeholder.webp'}" alt="${articulo.tipo_articulo || 'Artículo'}">
                    <div class="price-overlay">$${precioFormateado}</div>
                </div>
                <div class="package-details">
                    <div class="package-type">${articulo.tipo_articulo ? articulo.tipo_articulo.toUpperCase() : 'ARTÍCULO'}</div>
                    <h3 class="package-title">${articulo.descripcion || 'Artículo sin título'}</h3>
                    <p>Fecha: ${articulo.fecha || 'N/A'}</p>
                    <p class="price-details">Precio por unidad: $${precioFormateado}</p>
                    <button class="btn-cart" data-articulo-id="${articulo.id_articulo}" data-articulo-precio="${articulo.precio}">Agregar al carrito</button>
                </div>
            `;
            articlesContainer.appendChild(articleCard);
        });

        if (articulos.length === ITEMS_PER_LOAD && verMasBtn) {
            verMasBtn.style.display = 'block';
        } else if (verMasBtn) {
            verMasBtn.style.display = 'none';
        }

        currentOffset += articulos.length;

    } catch (err) {
        console.error('Error al cargar artículos:', err);
        if (loadingMessage) loadingMessage.style.display = 'none';
        articlesContainer.innerHTML = '<p class="message" style="color: red;">Error al cargar los artículos.</p>';
    }
}


// --- Event Listeners para la página principal ---
document.addEventListener('DOMContentLoaded', async () => {
    // Carga inicial de artículos
    await loadArticles(currentOffset, ITEMS_PER_LOAD);

    const verMasBtn = document.getElementById('verMasBtn');
    if (verMasBtn) {
        verMasBtn.addEventListener('click', () => loadArticles(currentOffset, ITEMS_PER_LOAD));
    }

    // Event listener para agregar al carrito (delegación de eventos)
    const articlesContainer = document.getElementById('dynamic-articles-container');
    if (articlesContainer) {
        articlesContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('btn-cart')) {
                event.stopPropagation(); // Prevenir la redirección de la tarjeta
                const button = event.target;
                const articuloId = button.dataset.articuloId;
                const articuloPrecio = parseFloat(button.dataset.articuloPrecio);
                
                // ¡Llamamos a la función centralizada!
                await addToCart(articuloId, articuloPrecio);
            }
        });
    }
});
