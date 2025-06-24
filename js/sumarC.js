document.addEventListener('DOMContentLoaded', () => {
    // Funcionalidad para las pestañas de detalle
    const tabButtons = document.querySelectorAll('.detail-tabs .tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover 'active' de todos los botones y contenidos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Agregar 'active' al botón clickeado
            button.classList.add('active');

            // Mostrar el contenido correspondiente
            const targetTab = button.dataset.tab;
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Asegurarse de que la primera pestaña esté activa por defecto al cargar la página
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons[0].classList.add('active');
        tabContents[0].classList.add('active');
    }
});