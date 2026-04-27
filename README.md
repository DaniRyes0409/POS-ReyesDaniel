# Aroma Café - Sistema de Gestión (POS-ReyesDaniel)

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
  <img width="1597" height="993" alt="image" src="https://github.com/user-attachments/assets/2346a541-85af-42cd-9178-451d4cf477e8" />

- **Punto de Venta (POS):**
<img width="1919" height="1014" alt="image" src="https://github.com/user-attachments/assets/a8de5ec3-9c26-42fa-b4d9-ca28b8bbf183" />
<img width="1919" height="1010" alt="image" src="https://github.com/user-attachments/assets/12daf10a-afc9-4875-8f12-186178007cb4" />
<img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/1912cb55-7643-49e8-b999-01d111d0b05f" />
<img width="1919" height="921" alt="image" src="https://github.com/user-attachments/assets/6b53ad31-c12f-407d-a218-af5ea9eeed0c" />

- **Panel de Administración (Dashboard):**
<img width="1919" height="1015" alt="image" src="https://github.com/user-attachments/assets/8806d08c-6f7c-48bc-ba74-af5cfb3dcb1b" />

Ventas

<img width="1911" height="995" alt="image" src="https://github.com/user-attachments/assets/dcd660df-ce47-47be-b04d-ecf385b2ecba" />

Productos

<img width="1915" height="1022" alt="image" src="https://github.com/user-attachments/assets/32326ad4-324f-4de9-877b-86f81ce7b14d" />

Gastos

<img width="1919" height="1019" alt="image" src="https://github.com/user-attachments/assets/d003ab81-2371-4f78-8638-e0fb709d13fc" />

Usuarios

<img width="1919" height="1016" alt="image" src="https://github.com/user-attachments/assets/5ef28310-c54c-4590-9d1c-2bb482147a9a" />

## Datos del autor
- **Nombre:** Daniel Reyes
- **Usuario de GitHub:** [DaniRyes0409](https://github.com/DaniRyes0409)

---

> **Nota para la Entrega:** Este repositorio refleja el desarrollo progresivo del proyecto mediante un historial de commits (Evidencia de trabajo) y es accesible públicamente.

- **Pantalla de Login:**
  <img width="1597" height="993" alt="image" src="https://github.com/user-attachments/assets/2346a541-85af-42cd-9178-451d4cf477e8" />

- **Punto de Venta (POS):**
<img width="1919" height="1014" alt="image" src="https://github.com/user-attachments/assets/a8de5ec3-9c26-42fa-b4d9-ca28b8bbf183" />
<img width="1919" height="1010" alt="image" src="https://github.com/user-attachments/assets/12daf10a-afc9-4875-8f12-186178007cb4" />
<img width="1919" height="987" alt="image" src="https://github.com/user-attachments/assets/1912cb55-7643-49e8-b999-01d111d0b05f" />
<img width="1919" height="921" alt="image" src="https://github.com/user-attachments/assets/6b53ad31-c12f-407d-a218-af5ea9eeed0c" />

- **Panel de Administración (Dashboard):**
<img width="1919" height="1015" alt="image" src="https://github.com/user-attachments/assets/8806d08c-6f7c-48bc-ba74-af5cfb3dcb1b" />

## Datos del autor
- **Nombre:** [Brayan Daniel Mateos Reyes y Gerardo Odiseo Reyes Leyva]
- **Matrícula / ID:** [S23120035 y s23120049]
- **Materia / Curso:** [Ingeniería de Software]

```bash
git add README.md
git commit -m "Se corrige conflicto y se mejora presentación del README"
git push

git add .
git commit -m "Se mejora documentación del sistema"
git push
