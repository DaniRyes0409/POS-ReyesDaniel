const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Window controls
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),

  // Auth
  login: (username, password) => ipcRenderer.invoke('auth:login', username, password),

  // Users
  getUsers: () => ipcRenderer.invoke('users:getAll'),
  createUser: (username, password, role, name, permissions) => ipcRenderer.invoke('users:create', username, password, role, name, permissions),
  updateUser: (id, data) => ipcRenderer.invoke('users:update', id, data),

  // Categories
  getCategories: () => ipcRenderer.invoke('categories:getAll'),
  createCategory: (name, icon) => ipcRenderer.invoke('categories:create', name, icon),
  updateCategory: (id, name, icon) => ipcRenderer.invoke('categories:update', id, name, icon),
  deleteCategory: (id) => ipcRenderer.invoke('categories:delete', id),

  // Products
  getProducts: (includeInactive) => ipcRenderer.invoke('products:getAll', includeInactive),
  getProductsByCategory: (categoryId) => ipcRenderer.invoke('products:getByCategory', categoryId),
  createProduct: (name, desc, price, catId, img, options) => ipcRenderer.invoke('products:create', name, desc, price, catId, img, options),
  updateProduct: (id, data) => ipcRenderer.invoke('products:update', id, data),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),

  // Sales
  createSale: (items, userId, paymentMethod, notes) => ipcRenderer.invoke('sales:create', items, userId, paymentMethod, notes),
  getSaleById: (id) => ipcRenderer.invoke('sales:getById', id),
  getSaleByTicket: (ticket) => ipcRenderer.invoke('sales:getByTicket', ticket),
  getSalesToday: () => ipcRenderer.invoke('sales:getToday'),
  getSalesWeek: () => ipcRenderer.invoke('sales:getWeek'),
  getAllSales: (limit, offset) => ipcRenderer.invoke('sales:getAll', limit, offset),

  // Reports
  getDailySummary: () => ipcRenderer.invoke('reports:daily'),
  getWeeklySummary: () => ipcRenderer.invoke('reports:weekly'),

  // Expenses
  getExpenses: (limit) => ipcRenderer.invoke('expenses:getAll', limit),
  getExpensesToday: () => ipcRenderer.invoke('expenses:getToday'),
  createExpense: (desc, amount, category, userId) => ipcRenderer.invoke('expenses:create', desc, amount, category, userId),
  deleteExpense: (id) => ipcRenderer.invoke('expenses:delete', id)
});
