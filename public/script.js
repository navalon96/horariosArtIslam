// script.js - Versión para Supabase

// Configuración de Supabase
const supabaseUrl = 'https://iglsgcsbsyafxrhhyuxb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbHNnY3Nic3lhZnhyaGh5dXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTM2MzUsImV4cCI6MjA3MDIyOTYzNX0.R-zjBHDtI762fZh60mp15Kn-oB-q6z2BraY_84tCGDY';

// Inicializar Supabase
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Configuración de trabajos y horarios
const shiftsConfig = [
    { id: 1, task: "Barra", time: "10:00-14:00" },
    { id: 2, task: "Barra", time: "14:00-18:00" },
    { id: 3, task: "Cocina", time: "10:00-14:00" },
    { id: 4, task: "Cocina", time: "14:00-18:00" }
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
            // Obtener registros desde Supabase
            const { data: horarios, error } = await supabase
                .from('horarios')
                .select(`
                    id,
                    usuarios: id_usuario (nombre, apellido1, apellido2),
                    trabajos: id_trabajo (nombre)
                `)
                .eq('id_trabajo', shift.id);

            if (error) throw error;

            // Formatear nombres de usuarios
            const people = horarios.map(h => {
                const user = h.usuarios;
                return `${user.nombre} ${user.apellido1 || ''} ${user.apellido2 || ''}`.trim();
            });

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

    try {
        // Primero insertar el usuario
        const { data: newUser, error: userError } = await supabase
            .from('usuarios')
            .insert([
                { 
                    nombre: name,
                    apellido1: surname.split(' ')[0] || '',
                    apellido2: surname.split(' ')[1] || ''
                }
            ])
            .select()
            .single();

        if (userError) throw userError;

        // Luego insertar el horario
        const { error: shiftError } = await supabase
            .from('horarios')
            .insert([
                { 
                    id_usuario: newUser.id,
                    id_trabajo: currentShiftId,
                    id_festividad: 1, // Asumimos que hay una festividad con ID 1
                    horario: shiftsConfig.find(s => s.id == currentShiftId).time
                }
            ]);

        if (shiftError) throw shiftError;

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