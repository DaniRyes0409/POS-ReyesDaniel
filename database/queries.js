
const { hashPassword, queryAll, queryOne, runSql, saveDatabase } = require('./db');

// ==================== USERS ====================

function authenticateUser(username, password) {
  const hash = hashPassword(password);
  return queryOne(
    'SELECT id, username, role, name, permissions FROM users WHERE username = ? AND password_hash = ? AND active = 1',
    [username, hash]
  );
}

function getUsers() {
  return queryAll('SELECT id, username, role, name, permissions, active, created_at FROM users ORDER BY created_at DESC');
}

function createUser(username, password, role, name, permissions = '[]') {
  const hash = hashPassword(password);
  try {
    const id = runSql('INSERT INTO users (username, password_hash, role, name, permissions) VALUES (?, ?, ?, ?, ?)',
      [username, hash, role, name, permissions]);
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateUser(id, data) {
  const fields = [];
  const values = [];
  if (data.name) { fields.push('name = ?'); values.push(data.name); }
  if (data.role) { fields.push('role = ?'); values.push(data.role); }
  if (data.permissions !== undefined) { fields.push('permissions = ?'); values.push(data.permissions); }
  if (data.password) { fields.push('password_hash = ?'); values.push(hashPassword(data.password)); }
  if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active ? 1 : 0); }
  values.push(id);
  runSql(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return { success: true };
}

// ==================== CATEGORIES ====================

function getCategories() {
  return queryAll('SELECT * FROM categories WHERE active = 1 ORDER BY name');
}

function createCategory(name, icon) {
  try {
    const id = runSql('INSERT INTO categories (name, icon) VALUES (?, ?)', [name, icon || '📦']);
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateCategory(id, name, icon) {
  runSql('UPDATE categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id]);
  return { success: true };
}

function deleteCategory(id) {
  runSql('UPDATE categories SET active = 0 WHERE id = ?', [id]);
  return { success: true };
}

// ==================== PRODUCTS ====================

function getProducts(includeInactive = false) {
  const where = includeInactive ? '' : 'WHERE p.active = 1';
  return queryAll(`
    SELECT p.*, c.name as category_name, c.icon as category_icon
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    ${where}
    ORDER BY c.name, p.name
  `);
}

function getProductsByCategory(categoryId) {
  return queryAll('SELECT * FROM products WHERE category_id = ? AND active = 1 ORDER BY name', [categoryId]);
}

function createProduct(name, description, price, categoryId, imagePath, options = '{}') {
  try {
    const id = runSql(
      'INSERT INTO products (name, description, price, category_id, image_path, options) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', price, categoryId, imagePath || '', options]
    );
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function updateProduct(id, data) {
  const fields = [];
  const values = [];
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
  if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
  if (data.price !== undefined) { fields.push('price = ?'); values.push(data.price); }
  if (data.category_id !== undefined) { fields.push('category_id = ?'); values.push(data.category_id); }
  if (data.image_path !== undefined) { fields.push('image_path = ?'); values.push(data.image_path); }
  if (data.options !== undefined) { fields.push('options = ?'); values.push(data.options); }
  if (data.active !== undefined) { fields.push('active = ?'); values.push(data.active ? 1 : 0); }
  if (fields.length === 0) return { success: false, error: 'No fields to update' };
  values.push(id);
  runSql(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
  return { success: true };
}

function deleteProduct(id) {
  runSql('UPDATE products SET active = 0 WHERE id = ?', [id]);
  return { success: true };
}

// ==================== SALES ====================

function generateTicketNumber() {
  const now = new Date();
  const datePart = now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const todayStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} 00:00:00`;
  const count = queryOne("SELECT COUNT(*) as count FROM sales WHERE date >= ?", [todayStart]);
  const seq = String(((count ? count.count : 0) || 0) + 1).padStart(4, '0');
  return `T${datePart}-${seq}`;
}

function createSale(items, userId, paymentMethod, notes) {
  const ticketNumber = generateTicketNumber();
  const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax = 0;
  const total = subtotal + tax;

  const { getDb } = require('./db');
  const db = getDb();

  db.run('INSERT INTO sales (ticket_number, subtotal, tax, total, payment_method, user_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [ticketNumber, subtotal, tax, total, paymentMethod || 'efectivo', userId, notes || '']);

  const saleIdResult = db.exec('SELECT last_insert_rowid() as id');
  const saleId = saleIdResult[0].values[0][0];

  for (const item of items) {
    db.run('INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal, modifiers) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [saleId, item.product_id, item.product_name, item.quantity, item.unit_price, item.unit_price * item.quantity, JSON.stringify(item.modifiers || {})]);
  }

  saveDatabase();

  return {
    success: true,
    sale_id: saleId,
    ticket_number: ticketNumber,
    total,
    subtotal,
    tax
  };
}

function getSaleById(saleId) {
  const sale = queryOne('SELECT s.*, u.name as user_name FROM sales s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?', [saleId]);
  if (!sale) return null;
  sale.items = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [saleId]);
  return sale;
}

function getSaleByTicket(ticketNumber) {
  const sale = queryOne('SELECT s.*, u.name as user_name FROM sales s LEFT JOIN users u ON s.user_id = u.id WHERE s.ticket_number = ?', [ticketNumber]);
  if (!sale) return null;
  sale.items = queryAll('SELECT * FROM sale_items WHERE sale_id = ?', [sale.id]);
  return sale;
}

function getSalesToday() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return queryAll(`
    SELECT s.*, u.name as user_name 
    FROM sales s LEFT JOIN users u ON s.user_id = u.id 
    WHERE date(s.date) = ? 
    ORDER BY s.date DESC
  `, [todayStr]);
}

function getSalesWeek() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
  return queryAll(`
    SELECT s.*, u.name as user_name 
    FROM sales s LEFT JOIN users u ON s.user_id = u.id 
    WHERE date(s.date) >= ? 
    ORDER BY s.date DESC
  `, [weekAgoStr]);
}

function computeTopModifiers(items) {
  const flavorsMap = {};
  const milksMap = {};
  for (const item of items) {
    if (!item.modifiers || item.modifiers === '{}') continue;
    let mods;
    try { mods = typeof item.modifiers === 'string' ? JSON.parse(item.modifiers) : item.modifiers; } catch (e) { continue; }
    if (mods && mods.flavors && mods.flavors.length) {
      for (const f of mods.flavors) {
        flavorsMap[f] = (flavorsMap[f] || 0) + item.quantity;
      }
    }
    if (mods && mods.milks && mods.milks.length) {
      for (const m of mods.milks) {
        milksMap[m] = (milksMap[m] || 0) + item.quantity;
      }
    }
  }
  const topFlavors = Object.entries(flavorsMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  const topMilks = Object.entries(milksMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  return { topFlavors, topMilks };
}

function getDailySummary() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const sales = queryOne(`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total_income FROM sales WHERE date(date) = ?`, [todayStr]);
  const expenses = queryOne(`SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE date(date) = ?`, [todayStr]);
  const topProducts = queryAll(`
    SELECT si.product_name, SUM(si.quantity) as total_qty, SUM(si.subtotal) as total_revenue
    FROM sale_items si JOIN sales s ON si.sale_id = s.id
    WHERE date(s.date) = ?
    GROUP BY si.product_name ORDER BY total_qty DESC LIMIT 5
  `, [todayStr]);

  const allItemsDaily = queryAll(`
    SELECT si.modifiers, si.quantity
    FROM sale_items si JOIN sales s ON si.sale_id = s.id
    WHERE date(s.date) = ?
  `, [todayStr]);
  const { topFlavors, topMilks } = computeTopModifiers(allItemsDaily);

  return {
    date: todayStr,
    sales_count: sales ? sales.count : 0,
    total_income: sales ? sales.total_income : 0,
    expenses_count: expenses ? expenses.count : 0,
    total_expenses: expenses ? expenses.total_expenses : 0,
    net_profit: (sales ? sales.total_income : 0) - (expenses ? expenses.total_expenses : 0),
    top_products: topProducts,
    top_flavors: topFlavors,
    top_milks: topMilks
  };
}

function getWeeklySummary() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;

  const sales = queryOne(`SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total_income FROM sales WHERE date(date) >= ?`, [weekAgoStr]);
  const expenses = queryOne(`SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total_expenses FROM expenses WHERE date(date) >= ?`, [weekAgoStr]);
  const dailyBreakdown = queryAll(`
    SELECT date(date) as day, COUNT(*) as count, SUM(total) as total
    FROM sales WHERE date(date) >= ? GROUP BY date(date) ORDER BY day
  `, [weekAgoStr]);
  const topProducts = queryAll(`
    SELECT si.product_name, SUM(si.quantity) as total_qty, SUM(si.subtotal) as total_revenue
    FROM sale_items si JOIN sales s ON si.sale_id = s.id
    WHERE date(s.date) >= ?
    GROUP BY si.product_name ORDER BY total_qty DESC LIMIT 10
  `, [weekAgoStr]);

  const allItemsWeekly = queryAll(`
    SELECT si.modifiers, si.quantity
    FROM sale_items si JOIN sales s ON si.sale_id = s.id
    WHERE date(s.date) >= ?
  `, [weekAgoStr]);
  const { topFlavors, topMilks } = computeTopModifiers(allItemsWeekly);

  return {
    start_date: weekAgoStr,
    sales_count: sales ? sales.count : 0,
    total_income: sales ? sales.total_income : 0,
    expenses_count: expenses ? expenses.count : 0,
    total_expenses: expenses ? expenses.total_expenses : 0,
    net_profit: (sales ? sales.total_income : 0) - (expenses ? expenses.total_expenses : 0),
    daily_breakdown: dailyBreakdown,
    top_products: topProducts,
    top_flavors: topFlavors,
    top_milks: topMilks
  };
}

function getAllSales(limit = 100, offset = 0) {
  return queryAll(`
    SELECT s.*, u.name as user_name 
    FROM sales s LEFT JOIN users u ON s.user_id = u.id 
    ORDER BY s.date DESC LIMIT ? OFFSET ?
  `, [limit, offset]);
}

// ==================== EXPENSES ====================

function getExpenses(limit = 100) {
  return queryAll(`
    SELECT e.*, u.name as user_name 
    FROM expenses e LEFT JOIN users u ON e.user_id = u.id 
    ORDER BY e.date DESC LIMIT ?
  `, [limit]);
}

function getExpensesToday() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return queryAll(`
    SELECT e.*, u.name as user_name 
    FROM expenses e LEFT JOIN users u ON e.user_id = u.id 
    WHERE date(e.date) = ? 
    ORDER BY e.date DESC
  `, [todayStr]);
}

function createExpense(description, amount, category, userId) {
  try {
    const id = runSql('INSERT INTO expenses (description, amount, category, user_id) VALUES (?, ?, ?, ?)',
      [description, amount, category || 'general', userId]);
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deleteExpense(id) {
  runSql('DELETE FROM expenses WHERE id = ?', [id]);
  return { success: true };
}

module.exports = {
  authenticateUser, getUsers, createUser, updateUser,
  getCategories, createCategory, updateCategory, deleteCategory,
  getProducts, getProductsByCategory, createProduct, updateProduct, deleteProduct,
  createSale, getSaleById, getSaleByTicket, getSalesToday, getSalesWeek, getAllSales,
  getDailySummary, getWeeklySummary,
  getExpenses, getExpensesToday, createExpense, deleteExpense,
  generateTicketNumber
};
