const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

let db;
let dbPath;

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getDbPath() {
  const { app } = require('electron');
  return path.join(app.getPath('userData'), 'cafeteria.db');
}

function saveDatabase() {
  if (db && dbPath) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

async function initDatabase(customPath) {
  dbPath = customPath || getDbPath();
  
  const SQL = await initSqlJs();
  
  // Load existing database or create new
  try {
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  } catch (e) {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON;');

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'employee')),
      name TEXT NOT NULL,
      permissions TEXT DEFAULT '[]',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT '☕',
      active INTEGER DEFAULT 1
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price REAL NOT NULL CHECK(price >= 0),
      category_id INTEGER,
      image_path TEXT DEFAULT '',
      options TEXT DEFAULT '{}',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', 'localtime')),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_number TEXT UNIQUE NOT NULL,
      date TEXT DEFAULT (datetime('now', 'localtime')),
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT DEFAULT 'efectivo',
      user_id INTEGER,
      notes TEXT DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK(quantity > 0),
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      modifiers TEXT DEFAULT '{}',
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      category TEXT DEFAULT 'general',
      date TEXT DEFAULT (datetime('now', 'localtime')),
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Run migrations
  const userInfo = db.exec("PRAGMA table_info(users)");
  const hasPermissions = userInfo[0] && userInfo[0].values.some(col => col[1] === 'permissions');
  if (!hasPermissions) {
    db.run("ALTER TABLE users ADD COLUMN permissions TEXT DEFAULT '[]'");
  }

  const prodInfo = db.exec("PRAGMA table_info(products)");
  const hasOptions = prodInfo[0] && prodInfo[0].values.some(col => col[1] === 'options');
  if (!hasOptions) {
    db.run("ALTER TABLE products ADD COLUMN options TEXT DEFAULT '{}'");
  }

  const saleItemInfo = db.exec("PRAGMA table_info(sale_items)");
  const hasModifiers = saleItemInfo[0] && saleItemInfo[0].values.some(col => col[1] === 'modifiers');
  if (!hasModifiers) {
    db.run("ALTER TABLE sale_items ADD COLUMN modifiers TEXT DEFAULT '{}'");
  }

  // Seed default data if empty
  const userCount = db.exec('SELECT COUNT(*) as count FROM users');
  if (userCount.length === 0 || userCount[0].values[0][0] === 0) {
    db.run("INSERT INTO users (username, password_hash, role, name, permissions) VALUES (?, ?, ?, ?, '[]')",
      ['admin', hashPassword('admin123'), 'admin', 'Administrador']);
    db.run("INSERT INTO users (username, password_hash, role, name, permissions) VALUES (?, ?, ?, ?, '[]')",
      ['empleado', hashPassword('emp123'), 'employee', 'Empleado General']);
  }

  const catCount = db.exec('SELECT COUNT(*) as count FROM categories');
  if (catCount.length === 0 || catCount[0].values[0][0] === 0) {
    const cats = [
      ['Bebidas Calientes', '☕'], ['Bebidas Frías', '🥤'], ['Postres', '🍰'],
      ['Snacks', '🥪'], ['Desayunos', '🍳'], ['Almuerzos', '🍽️']
    ];
    for (const [name, icon] of cats) {
      db.run('INSERT INTO categories (name, icon) VALUES (?, ?)', [name, icon]);
    }
  }

  const prodCount = db.exec('SELECT COUNT(*) as count FROM products');
  if (prodCount.length === 0 || prodCount[0].values[0][0] === 0) {
    const prods = [
      ['Café Americano', 'Café negro clásico', 35.00, 1],
      ['Cappuccino', 'Espresso con leche espumada', 55.00, 1],
      ['Latte', 'Espresso con leche cremosa', 50.00, 1],
      ['Chocolate Caliente', 'Chocolate con leche y crema', 45.00, 1],
      ['Té Verde', 'Té verde orgánico', 30.00, 1],
      ['Frappé de Café', 'Café helado con crema batida', 65.00, 2],
      ['Smoothie de Fresa', 'Fresa natural con yogurt', 60.00, 2],
      ['Limonada Natural', 'Limón fresco con hierbabuena', 35.00, 2],
      ['Agua Mineral', 'Agua con gas', 20.00, 2],
      ['Cheesecake', 'Pastel de queso con frutos rojos', 70.00, 3],
      ['Brownie', 'Brownie de chocolate con nuez', 45.00, 3],
      ['Galletas (3 pzas)', 'Galletas de mantequilla artesanales', 35.00, 3],
      ['Sandwich Club', 'Jamón, queso, lechuga y tomate', 65.00, 4],
      ['Croissant', 'Croissant de mantequilla', 40.00, 4],
      ['Bagel con Queso Crema', 'Bagel tostado con queso crema', 50.00, 4],
      ['Huevos al Gusto', 'Huevos con frijoles y pan tostado', 75.00, 5],
      ['Hotcakes (3 pzas)', 'Con miel de maple y mantequilla', 65.00, 5],
      ['Chilaquiles', 'Chilaquiles verdes o rojos con crema', 80.00, 5],
      ['Ensalada César', 'Lechuga, pollo, crutones y aderezo', 85.00, 6],
      ['Pasta Alfredo', 'Fettuccine con salsa alfredo', 90.00, 6],
      ['Panini de Pollo', 'Pollo, pesto y mozzarella', 75.00, 6]
    ];
    for (const [name, desc, price, catId] of prods) {
      db.run('INSERT INTO products (name, description, price, category_id) VALUES (?, ?, ?, ?)',
        [name, desc, price, catId]);
    }
  }

  saveDatabase();
  return db;
}

// Helper to convert sql.js results to array of objects
function queryAll(sql, params = []) {
  const result = db.exec(sql, params);
  if (result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSql(sql, params = []) {
  db.run(sql, params);
  saveDatabase();
  const lastId = db.exec('SELECT last_insert_rowid() as id');
  return lastId.length > 0 ? lastId[0].values[0][0] : 0;
}

function getDb() { return db; }

function closeDb() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

module.exports = { initDatabase, getDb, closeDb, hashPassword, queryAll, queryOne, runSql, saveDatabase };
