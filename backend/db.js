const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'shop.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    emoji TEXT DEFAULT '🛒',
    stock INTEGER DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
  );
`);

const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  const seed = db.prepare(
    'INSERT INTO products (name, description, price, category, emoji, stock) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const products = [
    ['Fresh Tomatoes', 'Farm fresh red tomatoes, picked daily', 40, 'Vegetables', '🍅', 50],
    ['Potatoes', 'Premium quality potatoes from local farms', 30, 'Vegetables', '🥔', 100],
    ['Onions', 'Fresh red onions, bulk packs available', 35, 'Vegetables', '🧅', 80],
    ['Green Spinach', 'Organic spinach leaves, freshly harvested', 25, 'Vegetables', '🥬', 30],
    ['Carrots', 'Crunchy orange carrots, rich in vitamins', 45, 'Vegetables', '🥕', 60],
    ['Fresh Milk', 'Pure cow milk, delivered fresh daily (1L)', 60, 'Dairy', '🥛', 40],
    ['Paneer', 'Homemade fresh paneer, 250g pack', 80, 'Dairy', '🧀', 25],
    ['Curd', 'Fresh homemade curd, creamy texture (500g)', 45, 'Dairy', '🫙', 20],
    ['Ghee', 'Pure desi ghee, traditionally made (200g)', 180, 'Dairy', '🧈', 15],
    ['Basmati Rice', 'Premium aged basmati rice (1kg)', 120, 'Grains', '🌾', 60],
    ['Whole Wheat Flour', 'Stone-ground whole wheat atta (1kg)', 55, 'Grains', '🌾', 70],
    ['Toor Dal', 'Fresh toor dal, protein rich (500g)', 75, 'Grains', '🫘', 50],
    ['Turmeric Powder', 'Pure organic turmeric (100g)', 50, 'Spices', '🟡', 45],
    ['Cumin Seeds', 'Aromatic cumin seeds (100g)', 35, 'Spices', '🌿', 55],
    ['Red Chili Powder', 'Hot red chili powder (100g)', 40, 'Spices', '🌶️', 60],
    ['Coriander Powder', 'Fresh ground coriander (100g)', 30, 'Spices', '🌿', 65],
  ];
  for (const p of products) seed.run(...p);
  console.log('✅ Seeded demo products');
}

module.exports = db;
