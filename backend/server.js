const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const OWNER_TOKEN = 'owner-demo-token-localbiz';

const requireOwner = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token !== OWNER_TOKEN) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'owner' && password === 'demo123') {
    res.json({ token: OWNER_TOKEN, role: 'owner', name: 'Shop Owner' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const { category } = req.query;
  const products = category
    ? db.prepare('SELECT * FROM products WHERE category = ? ORDER BY name').all(category)
    : db.prepare('SELECT * FROM products ORDER BY category, name').all();
  res.json(products);
});

app.get('/api/products/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM products ORDER BY category').all();
  res.json(rows.map(r => r.category));
});

app.post('/api/products', requireOwner, (req, res) => {
  const { name, description, price, category, emoji, stock } = req.body;
  if (!name || !price || !category) return res.status(400).json({ error: 'Missing required fields' });
  const result = db.prepare(
    'INSERT INTO products (name, description, price, category, emoji, stock) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, description || '', parseFloat(price), category, emoji || '🛒', parseInt(stock) || 100);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid));
});

app.put('/api/products/:id', requireOwner, (req, res) => {
  const { name, description, price, category, emoji, stock } = req.body;
  db.prepare(
    'UPDATE products SET name=?, description=?, price=?, category=?, emoji=?, stock=? WHERE id=?'
  ).run(name, description, parseFloat(price), category, emoji, parseInt(stock), req.params.id);
  res.json(db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id));
});

app.delete('/api/products/:id', requireOwner, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── Orders ───────────────────────────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { customer_name, customer_phone, customer_address, items } = req.body;
  if (!customer_name || !customer_phone || !customer_address || !items?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { lastInsertRowid: orderId } = db.prepare(
    'INSERT INTO orders (customer_name, customer_phone, customer_address, total, status) VALUES (?, ?, ?, ?, ?)'
  ).run(customer_name, customer_phone, customer_address, total, 'pending');

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)'
  );
  for (const item of items) {
    insertItem.run(orderId, item.product_id, item.product_name, item.quantity, item.price);
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);
  io.emit('new_order', order);
  res.json(order);
});

app.get('/api/orders', requireOwner, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
  })));
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json(order);
});

app.put('/api/orders/:id/status', requireOwner, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  io.emit('order_status_update', { orderId: order.id, status: order.status });
  res.json(order);
});

// ─── Messages ─────────────────────────────────────────────────────────────────
app.get('/api/messages/:orderId', (req, res) => {
  const messages = db.prepare(
    'SELECT * FROM messages WHERE order_id = ? ORDER BY created_at ASC'
  ).all(req.params.orderId);
  res.json(messages);
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
app.get('/api/dashboard', requireOwner, (req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const pendingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status='pending'").get().c;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total),0) as s FROM orders WHERE status!='cancelled'").get().s;
  const totalProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const recentOrders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5').all();
  res.json({ totalOrders, pendingOrders, totalRevenue, totalProducts, recentOrders });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('send_message', ({ orderId, content, senderType }) => {
    const { lastInsertRowid } = db.prepare(
      'INSERT INTO messages (order_id, content, sender_type) VALUES (?, ?, ?)'
    ).run(orderId, content, senderType);
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(lastInsertRowid);
    io.to(`order_${orderId}`).emit('new_message', message);
    io.emit('owner_new_message', message);
  });
});

server.listen(3001, () => console.log('🚀 Server running on http://localhost:3001'));
