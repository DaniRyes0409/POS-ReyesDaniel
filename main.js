const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupIpcHandlers(queries) {
  // Window controls
  ipcMain.handle('window:minimize', () => mainWindow.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.handle('window:close', () => mainWindow.close());

  // Auth
  ipcMain.handle('auth:login', (_, username, password) => queries.authenticateUser(username, password));

  // Users
  ipcMain.handle('users:getAll', () => queries.getUsers());
  ipcMain.handle('users:create', (_, username, password, role, name, permissions) => queries.createUser(username, password, role, name, permissions));
  ipcMain.handle('users:update', (_, id, data) => queries.updateUser(id, data));

  // Categories
  ipcMain.handle('categories:getAll', () => queries.getCategories());
  ipcMain.handle('categories:create', (_, name, icon) => queries.createCategory(name, icon));
  ipcMain.handle('categories:update', (_, id, name, icon) => queries.updateCategory(id, name, icon));
  ipcMain.handle('categories:delete', (_, id) => queries.deleteCategory(id));

  // Products
  ipcMain.handle('products:getAll', (_, includeInactive) => queries.getProducts(includeInactive));
  ipcMain.handle('products:getByCategory', (_, categoryId) => queries.getProductsByCategory(categoryId));
  ipcMain.handle('products:create', (_, name, desc, price, catId, img, options) => queries.createProduct(name, desc, price, catId, img, options));
  ipcMain.handle('products:update', (_, id, data) => queries.updateProduct(id, data));
  ipcMain.handle('products:delete', (_, id) => queries.deleteProduct(id));

  // Sales
  ipcMain.handle('sales:create', (_, items, userId, paymentMethod, notes) => queries.createSale(items, userId, paymentMethod, notes));
  ipcMain.handle('sales:getById', (_, id) => queries.getSaleById(id));
  ipcMain.handle('sales:getByTicket', (_, ticket) => queries.getSaleByTicket(ticket));
  ipcMain.handle('sales:getToday', () => queries.getSalesToday());
  ipcMain.handle('sales:getWeek', () => queries.getSalesWeek());
  ipcMain.handle('sales:getAll', (_, limit, offset) => queries.getAllSales(limit, offset));

  // Reports
  ipcMain.handle('reports:daily', () => queries.getDailySummary());
  ipcMain.handle('reports:weekly', () => queries.getWeeklySummary());

  // Expenses
  ipcMain.handle('expenses:getAll', (_, limit) => queries.getExpenses(limit));
  ipcMain.handle('expenses:getToday', () => queries.getExpensesToday());
  ipcMain.handle('expenses:create', (_, desc, amount, category, userId) => queries.createExpense(desc, amount, category, userId));
  ipcMain.handle('expenses:delete', (_, id) => queries.deleteExpense(id));
}

// ========== App Lifecycle ==========

app.whenReady().then(async () => {
  const { initDatabase } = require('./database/db');
  await initDatabase();
  
  const queries = require('./database/queries');
  setupIpcHandlers(queries);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  const { closeDb } = require('./database/db');
  closeDb();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
