// ==================== Expenses View ====================
class ExpensesView {
  static async render() {
    const expenses = await window.api.getExpenses(100);
    const todayExpenses = await window.api.getExpensesToday();
    const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return `
      <div class="page">
        <div class="page-header">
          <div>
            <h1>📋 Gastos</h1>
            <p>Registra y administra los gastos de la cafetería</p>
          </div>
          <button class="btn btn-primary" style="width:auto" id="btn-add-expense">➕ Registrar Gasto</button>
        </div>
        
        <div class="stats-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="stat-card accent-pink">
            <div class="stat-icon">📅</div>
            <div class="stat-value">$${totalToday.toFixed(2)}</div>
            <div class="stat-label">Gastos de hoy</div>
          </div>
          <div class="stat-card accent-orange">
            <div class="stat-icon">📊</div>
            <div class="stat-value">${todayExpenses.length}</div>
            <div class="stat-label">Registros hoy</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2>Historial de Gastos</h2>
          </div>
          <div style="overflow-x:auto">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Registrado por</th>
                  <th class="text-right">Monto</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody id="expenses-table-body">
                ${expenses.length === 0 ? `
                  <tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">No hay gastos registrados</td></tr>
                ` : expenses.map(e => {
                  const date = new Date(e.date);
                  return `
                    <tr>
                      <td>${date.toLocaleDateString('es-MX')} ${date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>${e.description}</td>
                      <td><span class="badge badge-info">${e.category}</span></td>
                      <td>${e.user_name || 'N/A'}</td>
                      <td class="text-right" style="font-weight:600;color:var(--accent-warm)">$${e.amount.toFixed(2)}</td>
                      <td class="text-center">
                        <button class="btn-icon btn-sm" data-del-expense="${e.id}" title="Eliminar">🗑️</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }
  
  static attachEvents(user) {
    document.getElementById('btn-add-expense').addEventListener('click', () => {
      this.showExpenseForm(user);
    });
    
    document.querySelectorAll('[data-del-expense]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.delExpense);
        Modal.confirm({
          title: 'Eliminar Gasto',
          message: '¿Estás seguro de eliminar este registro de gasto?',
          confirmText: 'Eliminar',
          danger: true,
          onConfirm: async () => {
            await window.api.deleteExpense(id);
            Toast.success('Gasto eliminado');
            const html = await this.render();
            document.querySelector('.main-content').innerHTML = html;
            this.attachEvents(user);
          }
        });
      });
    });
  }
  
  static showExpenseForm(user) {
    const content = `
      <form id="expense-form">
        <div class="form-group">
          <label>Descripción del gasto</label>
          <textarea class="form-textarea" id="expense-desc" placeholder="Describe el gasto..." required></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Monto ($)</label>
            <input type="number" class="form-input" id="expense-amount" step="0.01" min="0.01" placeholder="0.00" required>
          </div>
          <div class="form-group">
            <label>Categoría</label>
            <select id="expense-category" class="form-select">
              <option value="general">General</option>
              <option value="insumos">Insumos</option>
              <option value="servicios">Servicios</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="nomina">Nómina</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>
      </form>
    `;
    
    Modal.show({
      title: '➕ Registrar Gasto',
      content,
      footer: `
        <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
        <button class="btn btn-primary" style="width:auto" id="btn-save-expense">Registrar</button>
      `
    });
    
    document.getElementById('btn-save-expense').addEventListener('click', async () => {
      const desc = document.getElementById('expense-desc').value.trim();
      const amount = parseFloat(document.getElementById('expense-amount').value);
      const category = document.getElementById('expense-category').value;
      
      if (!desc) { Toast.error('Ingresa una descripción'); return; }
      if (isNaN(amount) || amount <= 0) { Toast.error('Ingresa un monto válido'); return; }
      
      try {
        const result = await window.api.createExpense(desc, amount, category, user.id);
        if (result.success) {
          Toast.success('Gasto registrado');
          Modal.close();
          const html = await this.render();
          document.querySelector('.main-content').innerHTML = html;
          this.attachEvents(user);
        } else {
          Toast.error(result.error);
        }
      } catch (err) {
        Toast.error('Error: ' + err.message);
      }
    });
  }
}
