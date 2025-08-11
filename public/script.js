// script.js - Versión corregida para Supabase

// Configuración de Supabase
const supabaseUrl = 'https://iglsgcsbsyafxrhhyuxb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbHNnY3Nic3lhZnhyaGh5dXhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTM2MzUsImV4cCI6MjA3MDIyOTYzNX0.R-zjBHDtI762fZh60mp15Kn-oB-q6z2BraY_84tCGDY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Configuración de trabajos y horarios (AJUSTADO para coincidir con la BD)
const shiftsConfig = [
    { id: 1, task: "Barra", time: "10:00-14:00" },      // ID 1 en BD
    { id: 2, task: "Cocina", time: "10:00-14:00" },     // ID 2 en BD
    { id: 3, task: "Limpieza", time: "10:00-14:00" },   // ID 3 en BD
    { id: 4, task: "Seguridad", time: "10:00-14:00" },  // ID 4 en BD
    { id: 1, task: "Barra", time: "14:00-18:00" },      // Mismo trabajo, distinto horario
    { id: 2, task: "Cocina", time: "14:00-18:00" }
];

// Variables globales
let currentShiftId = null;
let currentShiftTime = null;

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
                    trabajos: id_trabajo (nombre),
                    horario
                `)
                .eq('id_trabajo', shift.id)
                .eq('id_festividad', 1) // Filtramos por la festividad 1 (Ramadán 2024)
                .ilike('horario', `${shift.time.split('-')[0]}%`); // Filtramos por horario

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
                    <button class="btn-signup" data-shift-id="${shift.id}" data-shift-time="${shift.time}">
                        Apuntarse
                    </button>
                </td>
            `;
            shiftsBody.appendChild(row);
        } catch (error) {
            console.error(`Error cargando turno ${shift.task} ${shift.time}:`, error);
            // Mostrar el turno aunque falle la carga de datos
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${shift.task}</td>
                <td>${shift.time}</td>
                <td class="empty">Error cargando datos</td>
                <td>
                    <button class="btn-signup" data-shift-id="${shift.id}" data-shift-time="${shift.time}">
                        Apuntarse
                    </button>
                </td>
            `;
            shiftsBody.appendChild(row);
        }
    }

    // Añadir event listeners a los botones
    document.querySelectorAll('.btn-signup').forEach(button => {
        button.addEventListener('click', (e) => {
            currentShiftId = e.target.getAttribute('data-shift-id');
            currentShiftTime = e.target.getAttribute('data-shift-time');
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
        // 1. Insertar el usuario
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

        // 2. Insertar el horario
        const { error: shiftError } = await supabase
            .from('horarios')
            .insert([
                { 
                    id_usuario: newUser.id,
                    id_trabajo: currentShiftId,
                    id_festividad: 1, // Ramadán 2024
                    horario: currentShiftTime.split('-')[0] // Tomamos la hora de inicio
                }
            ]);

        if (shiftError) throw shiftError;

        alert("¡Te has apuntado correctamente!");
        closeModal();
        document.getElementById("signup-form").reset();
        await loadShifts(); // Actualizar la tabla
    } catch (error) {
        console.error("Error al apuntarse:", error);
        alert(`Error al guardar: ${error.message}`);
    }
});

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado");
    loadShifts().catch(console.error);
});