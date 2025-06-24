// js/upload_script.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Tus credenciales de Supabase
const SUPABASE_URL = 'https://cywsonaxzsfixwtdazgm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5d3NvbmF4enNmaXh3dGRhemdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzE0MzksImV4cCI6MjA2NTUwNzQzOX0.yjYAW2Lvc_z3TdsGendoQXXu1Bj_3aZMGkJezCuY8Fo';

// Inicializa el cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Referencias a elementos del DOM
const uploadForm = document.getElementById('upload-form');
const articleTypeInput = document.getElementById('tipo-articulo');
const articleDescriptionInput = document.getElementById('descripcion-articulo');
const articlePriceInput = document.getElementById('article-price');
const articleDateInput = document.getElementById('fecha-articulo');
const imageUploadInput = document.getElementById('imagen-articulo');
const messageDiv = document.getElementById('upload-message');
const fileNameDisplay = document.getElementById('file-name-display');
const imagePreview = document.getElementById('image-preview');

// Función para mostrar mensajes al usuario
function showMessage(msg, type = 'success') {
    if (messageDiv) {
        messageDiv.textContent = msg;
        messageDiv.className = `upload-message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        console.log(`Mensaje (${type}): ${msg}`);
        alert(msg);
    }
}

// Event listener para la selección de archivo de imagen
imageUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        // Mostrar previsualización de la imagen
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        fileNameDisplay.textContent = 'Ningún archivo seleccionado';
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
    }
});


// Función para subir una imagen a Supabase Storage
async function uploadImage(file) {
    if (!file) return null;

    // --- INICIO DE LA MODIFICACIÓN ---
    // Eliminar acentos y caracteres especiales del nombre del archivo
    const sanitizedFileName = file.name
        .normalize("NFD") // Normaliza para separar los diacríticos (acentos)
        .replace(/[\u0300-\u036f]/g, "") // Elimina los diacríticos
        .replace(/[^a-zA-Z0-9.-]/g, "_"); // Reemplaza caracteres no alfanuméricos (excepto . y -) por _

    const fileName = `${Date.now()}-${sanitizedFileName}`;
    // --- FIN DE LA MODIFICACIÓN ---

    try {
        const { data, error } = await supabase.storage
            .from('articulos-imagenes')
            .upload(fileName, file);

        if (error) {
            throw error;
        }

        const { data: publicUrlData } = supabase.storage
            .from('articulos-imagenes')
            .getPublicUrl(fileName);
        
        if (publicUrlData && publicUrlData.publicUrl) {
            return publicUrlData.publicUrl;
        } else {
            throw new Error("No se pudo obtener la URL pública de la imagen.");
        }
        
    } catch (error) {
        console.error('Error al subir imagen a Supabase Storage:', error);
        showMessage(`Error al subir la imagen: ${error.message}`, 'error');
        return null;
    }
}

// Event listener para el envío del formulario
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const articleType = articleTypeInput.value.trim();
    const articleDescription = articleDescriptionInput.value.trim();
    const articlePrice = parseFloat(articlePriceInput.value);
    const articleDate = articleDateInput.value;
    const imageFile = imageUploadInput.files[0];

    if (!articleType || !articleDescription || isNaN(articlePrice) || articlePrice <= 0) {
        showMessage('Por favor, completa el tipo, la descripción y un precio válido (mayor que 0) para el artículo.', 'error');
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user ? user.id : null;


    let imageUrl = null;
    if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
            return;
        }
    }

    try {
        const { data, error } = await supabase
            .from('articulo')
            .insert([
                { 
                    tipo_articulo: articleType,
                    descripcion: articleDescription,
                    precio: articlePrice,
                    fecha: articleDate || null,
                    imagen_url: imageUrl || null,
                    // id_creador: userId 
                }
            ]);

        if (error) {
            console.error('Error al insertar artículo en Supabase:', error);
            showMessage(`Error al subir el artículo: ${error.message}`, 'error');
            return;
        }

        showMessage('Artículo subido exitosamente!', 'success');
        uploadForm.reset();
        fileNameDisplay.textContent = 'Ningún archivo seleccionado';
        imagePreview.src = '#';
        imagePreview.style.display = 'none';

    } catch (err) {
        console.error('Ocurrió un error inesperado al subir el artículo:', err);
        showMessage('Ocurrió un error inesperado al subir el artículo. Por favor, inténtalo de nuevo.', 'error');
    }
});

// La sección comentada sobre la redirección de usuario permanece comentada según la versión 2.
// document.addEventListener('DOMContentLoaded', async () => {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//         window.location.href = 'login.html';
//     }
// });
