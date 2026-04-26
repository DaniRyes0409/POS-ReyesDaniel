// ==================== Users Management View ====================
class UsersView {
  static users = [];
  
  static async render() {
    this.users = await window.api.getUsers();
    
    return `
      <div class="page">
        <div class="page-header">
          <div>
            <h1>👥 Usuarios</h1>
            <p>Administra el personal de la cafetería</p>
          </div>
          <button class="btn btn-primary" style="width:auto" id="btn-add-user">➕ Nuevo Usuario</button>
        </div>
        
        <div class="card">
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha de Alta</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody id="users-table-body">
                ${this.users.map(u => `
                  <tr>
                    <td style="font-weight:600">@${u.username}</td>
                    <td>${u.name}</td>
                    <td>${u.role === 'admin' 
                      ? '<span class="badge badge-warning">👑 Admin</span>' 
                      : '<span class="badge badge-info">👤 Empleado</span>'}</td>
                    <td>${u.active 
                      ? '<span class="badge badge-success">Activo</span>' 
                      : '<span class="badge badge-danger">Inactivo</span>'}</td>
                    <td>${new Date(u.created_at).toLocaleDateString('es-MX')}</td>
                    <td class="text-center">
                      <div class="flex gap-sm" style="justify-content:center">
                        <button class="btn-icon btn-sm" data-edit-user="${u.id}" title="Editar">✏️</button>
                        <button class="btn-icon btn-sm" data-toggle-user="${u.id}" data-user-active="${u.active}" title="${u.active ? 'Desactivar' : 'Activar'}">${u.active ? '🔒' : '🔓'}</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  static attachEvents() {
    document.getElementById('btn-add-user').addEventListener('click', () => this.showUserForm());
    
    document.querySelectorAll('[data-edit-user]').forEach(btn => {
      btn.addEventListener('click', () => this.showUserForm(parseInt(btn.dataset.editUser)));
    });
    
    document.querySelectorAll('[data-toggle-user]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.toggleUser);
        const isActive = btn.dataset.userActive === '1';
        
        Modal.confirm({
          title: isActive ? 'Desactivar Usuario' : 'Activar Usuario',
          message: isActive
            ? '¿Desactivar este usuario? No podrá iniciar sesión.'
            : '¿Reactivar este usuario?',
          confirmText: isActive ? 'Desactivar' : 'Activar',
          danger: isActive,
          onConfirm: async () => {
            await window.api.updateUser(id, { active: !isActive });
            Toast.success(isActive ? 'Usuario desactivado' : 'Usuario activado');
            const html = await this.render();
            document.querySelector('.main-content').innerHTML = html;
            this.attachEvents();
          }
        });
      });
    });
  }
  
  static showUserForm(editId) {
    const user = editId ? this.users.find(u => u.id === editId) : null;
    const isEdit = !!user;
    
    let permissions = [];
    if (isEdit) {
      try {
        permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || []);
      } catch {
        permissions = [];
      }
    }
    
    const content = `
      <form id="user-form">
        <div class="form-group">
          <label>Nombre Completo</label>
          <input type="text" class="form-input" id="user-name" value="${isEdit ? user.name : ''}" placeholder="Nombre del empleado" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Usuario</label>
            <input type="text" class="form-input" id="user-username" value="${isEdit ? user.username : ''}" placeholder="usuario123" ${isEdit ? 'disabled' : 'required'}>
          </div>
          <div class="form-group">
            <label>Rol</label>
            <select id="user-role" class="form-select">
              <option value="employee" ${isEdit && user.role === 'employee' ? 'selected' : ''}>👤 Empleado</option>
              <option value="admin" ${isEdit && user.role === 'admin' ? 'selected' : ''}>👑 Administrador</option>
            </select>
          </div>
        </div>
        <div class="form-group" id="permissions-group" style="${(!isEdit || user.role === 'employee') ? 'display:block;' : 'display:none;'}">
          <label>Permisos de Empleado (Punto de Venta está incluido por defecto)</label>
          <div class="flex gap-md" style="flex-wrap: wrap; margin-top: 0.5rem;">
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:normal;">
              <input type="checkbox" class="perm-checkbox" value="dashboard" ${permissions.includes('dashboard') ? 'checked' : ''}> Dashboard
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:normal;">
              <input type="checkbox" class="perm-checkbox" value="sales" ${permissions.includes('sales') ? 'checked' : ''}> Ventas
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:normal;">
              <input type="checkbox" class="perm-checkbox" value="products" ${permissions.includes('products') ? 'checked' : ''}> Productos
            </label>
            <label style="display:flex; align-items:center; gap:0.5rem; font-weight:normal;">
              <input type="checkbox" class="perm-checkbox" value="expenses" ${permissions.includes('expenses') ? 'checked' : ''}> Gastos
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>${isEdit ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label>
          <input type="password" class="form-input" id="user-password" placeholder="${isEdit ? '••••••••' : 'Contraseña segura'}" ${isEdit ? '' : 'required'}>
        </div>
      </form>
    `;
    
    Modal.show({
      title: isEdit ? '✏️ Editar Usuario' : '➕ Nuevo Usuario',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" style="width:auto" id="btn-save-user">${isEdit ? 'Guardar' : 'Crear'}</button>
      `
    });
    
    // Toggle permissions visibility
    document.getElementById('user-role').addEventListener('change', (e) => {
      document.getElementById('permissions-group').style.display = e.target.value === 'employee' ? 'block' : 'none';
    });
    
    document.getElementById('btn-save-user').addEventListener('click', async () => {
      const name = document.getElementById('user-name').value.trim();
      const username = document.getElementById('user-username').value.trim();
      const role = document.getElementById('user-role').value;
      const password = document.getElementById('user-password').value;
      
      const permCheckboxes = document.querySelectorAll('.perm-checkbox:checked');
      const selectedPermissions = Array.from(permCheckboxes).map(cb => cb.value);
      const permissionsJson = JSON.stringify(selectedPermissions);
      
      if (!name) { Toast.error('Ingresa el nombre'); return; }
      
      try {
        if (isEdit) {
          const data = { name, role, permissions: permissionsJson };
          if (password) data.password = password;
          await window.api.updateUser(editId, data);
          Toast.success('Usuario actualizado');
        } else {
          if (!username) { Toast.error('Ingresa un usuario'); return; }
          if (!password) { Toast.error('Ingresa una contraseña'); return; }
          const result = await window.api.createUser(username, password, role, name, permissionsJson);
          if (!result.success) { Toast.error(result.error); return; }
          Toast.success('Usuario creado');
        }
        Modal.close();
        const html = await this.render();
        document.querySelector('.main-content').innerHTML = html;
        this.attachEvents();
      } catch (err) {
        Toast.error('Error: ' + err.message);
      }
    });
  }
}
