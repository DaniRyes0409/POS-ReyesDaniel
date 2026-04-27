# Aroma Café - Sistema de Gestión

## Descripción general
Sistema de gestión integral para la cafetería **Aroma Café**, que incluye Punto de Venta (POS) y panel de administración. Desarrollado de forma nativa para escritorio. Permite gestionar ventas, productos (con modificadores de tamaño, sabor, y tipo de leche), categorías y usuarios con control de acceso basado en roles. Además, cuenta con la capacidad de generar tickets y visualizar reportes métricos de ingresos, egresos y preferencias de productos en el Dashboard.

## Tecnologías utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend / Escritorio**: Node.js, Electron
- **Base de Datos**: MySQL (y soporte de SQLite en transiciones)

## Instrucciones de instalación y ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/DaniRyes0409/POS-ReyesDaniel.git
   cd POS-ReyesDaniel
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configuración de Base de Datos:**
   - Asegúrate de tener una instancia de MySQL en ejecución localmente.
   - La aplicación creará automáticamente las tablas necesarias al iniciar, o puedes importar el esquema proporcionado.
   - Si se requiere, configura las credenciales de la base de datos en los archivos de conexión (por defecto `localhost`, `root`, sin contraseña, base de datos `cafeteria`).

4. **Ejecutar la aplicación:**
   ```bash
   npm start
   ```

## Capturas de pantalla del sistema

- **Pantalla de Login:**
  > *(Sustituir con imagen real)*
  ![Login](./assets/login.png)

- **Punto de Venta (POS):**
  > *(Sustituir con imagen real)*
  ![POS](./assets/pos.png)

- **Panel de Administración (Dashboard):**
  > *(Sustituir con imagen real)*
  ![Dashboard](./assets/dashboard.png)

## Datos del autor
- **Nombre:** Daniel Reyes
- **Usuario de GitHub:** [DaniRyes0409](https://github.com/DaniRyes0409)

---

> **Nota para la Entrega:** Este repositorio refleja el desarrollo progresivo del proyecto mediante un historial de commits (Evidencia de trabajo) y es accesible públicamente.
