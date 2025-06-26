document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navList = document.querySelector('.nav-list');

    // Navegación hamburguesa (del header)
    // Asegúrate de que el botón hamburguesa tenga la clase 'nav-toggle' y la lista 'nav-list'
    // Y que el icono sea 'i' dentro de 'nav-toggle'
    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            const icon = navToggle.querySelector('i'); // Asumiendo que el icono está dentro del botón
            if (navList.classList.contains('active')) {
                // Si usas font-awesome, ajusta las clases de tu icono aquí
                icon.classList.remove('fa-bars'); // Clase de icono de hamburguesa
                icon.classList.add('fa-times'); // Clase de icono de cruz
                navToggle.setAttribute('aria-label', 'Cerrar menú');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                navToggle.setAttribute('aria-label', 'Abrir menú');
            }
        });


    }

/*
    // Cuadro del buscador (Tu función original)
    // Esta función `buscar` se llama desde el HTML con `onclick="buscar()"`
    window.buscar = function () { // Hacemos `buscar` global para que sea accesible desde onclick
        const origen = document.getElementById("origen").value;
        const destino = document.getElementById("destino").value;
        const entrada = document.getElementById("fecha-entrada").value;
        const salida = document.getElementById("fecha-salida").value;

        alert(`Buscando paquetes de ${origen} a ${destino} del ${entrada} al ${salida}`);
    }
        */


    // Ver más tarjetas
    // Asegúrate de que tu botón tenga el id 'verMasBtn' y las tarjetas ocultas la clase 'hidden'
    const verMasBtn = document.getElementById('verMasBtn');
    if (verMasBtn) { // Solo si el botón existe
        verMasBtn.addEventListener('click', function () {
            const hiddenCards = document.querySelectorAll('.package-card.hidden');
            hiddenCards.forEach(card => card.classList.remove('hidden'));
            this.style.display = 'none'; // Ocultar el botón después de mostrar
        });
    }
});
