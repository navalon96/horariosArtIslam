// script.js - Versión corregida

// Importaciones dinámicas
async function initializeApp() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        const { getFirestore, doc, getDoc, setDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        // Configuración de Firebase (usa la misma que en index.html)
        const firebaseConfig = {
            apiKey: "AIzaSyA0b9KeAEmp1dvm0bMHCFtMBTcXdldxaQo",
            authDomain: "horariosartislam.firebaseapp.com",
            projectId: "horariosartislam",
            storageBucket: "horariosartislam.firebasestorage.app",
            messagingSenderId: "15946492314",
            appId: "1:15946492314:web:7e5d8ed4bade5ba8373223"
        };

        // Inicializar Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // Configuración FIJA de trabajos y horarios
        const shiftsConfig = [
            { id: "barra-manana", task: "Barra", time: "10:00-14:00" },
            { id: "barra-tarde", task: "Barra", time: "14:00-18:00" },
            { id: "cocina-manana", task: "Cocina", time: "10:00-14:00" },
            { id: "cocina-tarde", task: "Cocina", time: "14:00-18:00" }
        ];

        // Variables globales
        let currentShiftId = null;

        // Cargar y mostrar turnos
        async function loadShifts() {
            const shiftsBody = document.getElementById("shifts-body");
            if (!shiftsBody) {
                console.error("No se encontró el elemento shifts-body");
                return;
            }
            
            shiftsBody.innerHTML = "";

            for (const shift of shiftsConfig) {
                try {
                    // Obtener registros desde Firestore
                    const shiftRef = doc(db, "turnos", shift.id);
                    const docSnap = await getDoc(shiftRef);
                    
                    // Verificar si el documento existe y tiene datos
                    const people = docSnap.exists() ? docSnap.data().people || [] : [];

                    // Crear fila en la tabla
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${shift.task}</td>
                        <td>${shift.time}</td>
                        <td class="${people.length === 0 ? 'empty' : ''}">
                            ${people.join(", ") || "Nadie apuntado"}
                        </td>
                        <td>
                            <button class="btn-signup" data-shift-id="${shift.id}">
                                Apuntarse
                            </button>
                        </td>
                    `;
                    shiftsBody.appendChild(row);
                } catch (error) {
                    console.error(`Error cargando turno ${shift.id}:`, error);
                    // Mostrar el turno aunque falle la carga de datos
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${shift.task}</td>
                        <td>${shift.time}</td>
                        <td class="empty">Error cargando datos</td>
                        <td>
                            <button class="btn-signup" data-shift-id="${shift.id}">
                                Apuntarse
                            </button>
                        </td>
                    `;
                    shiftsBody.appendChild(row);
                }
            }

            // Añadir event listeners a los botones después de crearlos
            document.querySelectorAll('.btn-signup').forEach(button => {
                button.addEventListener('click', (e) => {
                    currentShiftId = e.target.getAttribute('data-shift-id');
                    document.getElementById("signup-modal").style.display = "flex";
                });
            });
        }

        // Cerrar modal
        window.closeModal = () => {
            document.getElementById("signup-modal").style.display = "none";
        };

        // Registrar persona
        document.getElementById("signup-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.getElementById("name").value.trim();
            const surname = document.getElementById("surname").value.trim();
            
            if (!name || !surname) {
                alert("Por favor, completa todos los campos");
                return;
            }

            const fullName = `${name} ${surname}`;

            try {
                // Actualizar el documento en Firestore
                const shiftRef = doc(db, "turnos", currentShiftId);
                await setDoc(shiftRef, {
                    people: arrayUnion(fullName)
                }, { merge: true });

                alert("¡Te has apuntado correctamente!");
                closeModal();
                document.getElementById("signup-form").reset();
                await loadShifts(); // Actualizar la tabla
            } catch (error) {
                console.error("Error al apuntarse:", error);
                alert("Error al guardar. Inténtalo de nuevo.");
            }
        });

        // Cargar datos al iniciar
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM completamente cargado");
            loadShifts().catch(console.error);
        });

    } catch (error) {
        console.error("Error inicializando Firebase:", error);
        // Mostrar mensaje de error en la interfaz
        const shiftsBody = document.getElementById("shifts-body");
        if (shiftsBody) {
            shiftsBody.innerHTML = `
                <tr>
                    <td colspan="4" style="color: red; text-align: center;">
                        Error cargando los datos. Por favor, recarga la página.
                    </td>
                </tr>
            `;
        }
    }
}

// Iniciar la aplicación
initializeApp();