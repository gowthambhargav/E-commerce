import { hashSync } from 'bcrypt';
import type { PoolConnection } from 'mysql2/promise';

type SqlStatement = string | { sql: string; params?: unknown[] };

const schemaStatements: SqlStatement[] = [
  `CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL DEFAULT (UUID()),

    full_name VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',
    avatar_url VARCHAR(500) NULL,

    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role ENUM('user','admin') DEFAULT 'user',

    refresh_token TEXT NULL,
    refresh_token_expires_at TIMESTAMP NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id)
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_name (name),
    UNIQUE KEY uq_categories_slug (slug)
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NULL,

    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    compare_price DECIMAL(10,2) NULL,

    image_url VARCHAR(500) NULL,
    category_id CHAR(36) NULL,

    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    stock INT DEFAULT 0,
    featured TINYINT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_products_slug (slug),
    INDEX idx_products_category (category_id),
    INDEX idx_products_featured (featured),

    CONSTRAINT fk_products_category
      FOREIGN KEY (category_id) REFERENCES categories(id)
      ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cart_items (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_cart_items_user (user_id),

    CONSTRAINT fk_cart_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_cart_product
      FOREIGN KEY (product_id) REFERENCES products(id)
      ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS wishlist_items (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlist_user_product (user_id, product_id),
    INDEX idx_wishlist_user (user_id),

    CONSTRAINT fk_wishlist_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_wishlist_product
      FOREIGN KEY (product_id) REFERENCES products(id)
      ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS addresses (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,

    full_name VARCHAR(255) DEFAULT '',
    phone VARCHAR(50) DEFAULT '',

    address_line1 TEXT NULL,
    address_line2 TEXT NULL,

    city VARCHAR(100) DEFAULT '',
    state VARCHAR(100) DEFAULT '',
    postal_code VARCHAR(20) DEFAULT '',
    country VARCHAR(100) DEFAULT 'India',

    is_default TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_addresses_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,

    order_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) DEFAULT 0.00,

    shipping_address JSON NULL,
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_orders_order_number (order_number),
    INDEX idx_orders_user (user_id),

    CONSTRAINT fk_orders_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id CHAR(36) NOT NULL DEFAULT (UUID()),
    order_id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,

    product_name VARCHAR(255) DEFAULT '',
    product_image VARCHAR(500) NULL,

    price DECIMAL(10,2) DEFAULT 0.00,
    quantity INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    INDEX idx_order_items_order (order_id),

    CONSTRAINT fk_order_items_order
      FOREIGN KEY (order_id) REFERENCES orders(id)
      ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
      FOREIGN KEY (product_id) REFERENCES products(id)
      ON DELETE CASCADE
  )`,
  `DROP TRIGGER IF EXISTS before_order_items_insert_reduce_stock`,
  `CREATE TRIGGER before_order_items_insert_reduce_stock
   BEFORE INSERT ON order_items
   FOR EACH ROW
   BEGIN
     DECLARE available_stock INT;

     SELECT stock INTO available_stock
     FROM products
     WHERE id = NEW.product_id
     FOR UPDATE;

     IF available_stock IS NULL THEN
       SIGNAL SQLSTATE '45000'
         SET MESSAGE_TEXT = 'Product not found';
     END IF;

     IF available_stock < NEW.quantity THEN
       SIGNAL SQLSTATE '45000'
         SET MESSAGE_TEXT = 'Insufficient stock';
     END IF;

     UPDATE products
     SET stock = stock - NEW.quantity
     WHERE id = NEW.product_id;
   END`,
];

const seedUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    fullName: 'Admin User',
    phone: '9999999999',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    fullName: 'Sarah Khan',
    phone: '9876543210',
    email: 'sarah@example.com',
    password: 'Password@123',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    fullName: 'Michael Lee',
    phone: '9123456780',
    email: 'michael@example.com',
    password: 'Password@123',
    role: 'user',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  },
];

const seedCategories = [
  {
    id: 'aaaa1111-1111-1111-1111-111111111111',
    name: 'Electronics',
    slug: 'electronics',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    description: 'Phones, headphones, laptops, and everyday gadgets.',
  },
  {
    id: 'aaaa2222-2222-2222-2222-222222222222',
    name: 'Fashion',
    slug: 'fashion',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
    description: 'Wardrobe essentials and seasonal style picks.',
  },
  {
    id: 'aaaa3333-3333-3333-3333-333333333333',
    name: 'Home',
    slug: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    description: 'Useful picks for a better living space.',
  },
  {
    id: 'aaaa4444-4444-4444-4444-444444444444',
    name: 'Beauty',
    slug: 'beauty',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
    description: 'Skincare and self-care favorites.',
  },
];

const seedProducts = [
  {
    id: 'bbbb1111-1111-1111-1111-111111111111',
    name: 'Noise Cancelling Headphones',
    slug: 'noise-cancelling-headphones',
    description: 'Wireless headphones with immersive sound and active noise cancellation.',
    price: 129.99,
    comparePrice: 159.99,
    imageUrl: 'https://images.unsplash.com/photo-1518441902117-f0b8c3d8f33d?auto=format&fit=crop&w=900&q=80',
    categoryId: 'aaaa1111-1111-1111-1111-111111111111',
    rating: 4.8,
    reviewCount: 124,
    stock: 25,
    featured: 1,
  },
  {
    id: 'bbbb2222-2222-2222-2222-222222222222',
    name: 'Everyday Smartwatch',
    slug: 'everyday-smartwatch',
    description: 'Track your activity, notifications, and health in one clean display.',
    price: 89.99,
    comparePrice: 109.99,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    categoryId: 'aaaa1111-1111-1111-1111-111111111111',
    rating: 4.6,
    reviewCount: 89,
    stock: 40,
    featured: 1,
  },
  {
    id: 'bbbb3333-3333-3333-3333-333333333333',
    name: 'Cotton Hoodie',
    slug: 'cotton-hoodie',
    description: 'Soft heavyweight hoodie built for daily comfort.',
    price: 39.99,
    comparePrice: 49.99,
    imageUrl: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
    categoryId: 'aaaa2222-2222-2222-2222-222222222222',
    rating: 4.7,
    reviewCount: 64,
    stock: 30,
    featured: 0,
  },
  {
    id: 'bbbb4444-4444-4444-4444-444444444444',
    name: 'Ceramic Mug Set',
    slug: 'ceramic-mug-set',
    description: 'Two durable mugs for coffee, tea, or desk styling.',
    price: 24.99,
    comparePrice: 29.99,
    imageUrl: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80',
    categoryId: 'aaaa3333-3333-3333-3333-333333333333',
    rating: 4.5,
    reviewCount: 41,
    stock: 50,
    featured: 0,
  },
];

const seedAddresses = [
  {
    id: 'cccc1111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    fullName: 'Sarah Khan',
    phone: '9876543210',
    addressLine1: '42 Lake View Road',
    addressLine2: 'Apartment 12B',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    country: 'India',
    isDefault: 1,
  },
];

const seedOrders = [
  {
    id: 'dddd1111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    orderNumber: 'ORD-10001',
    status: 'pending',
    totalAmount: 79.98,
    shippingAddress: {
      full_name: 'Sarah Khan',
      phone: '9876543210',
      address_line1: '42 Lake View Road',
      address_line2: 'Apartment 12B',
      city: 'Bengaluru',
      state: 'Karnataka',
      postal_code: '560001',
      country: 'India',
    },
    paymentMethod: 'cod',
    paymentStatus: 'pending',
  },
];

const seedOrderItems = [
  {
    id: 'eeee1111-1111-1111-1111-111111111111',
    orderId: 'dddd1111-1111-1111-1111-111111111111',
    productId: 'bbbb3333-3333-3333-3333-333333333333',
    productName: 'Cotton Hoodie',
    productImage: 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80',
    price: 39.99,
    quantity: 2,
  },
];

const seedCartItems = [
  {
    id: 'ffff1111-1111-1111-1111-111111111111',
    userId: '22222222-2222-2222-2222-222222222222',
    productId: 'bbbb1111-1111-1111-1111-111111111111',
    quantity: 1,
  },
];

const seedWishlistItems = [
  {
    id: 'ffff2222-2222-2222-2222-222222222222',
    userId: '22222222-2222-2222-2222-222222222222',
    productId: 'bbbb2222-2222-2222-2222-222222222222',
  },
];

async function runStatements(connection: PoolConnection, statements: SqlStatement[]) {
  for (const statement of statements) {
    if (typeof statement === 'string') {
      await connection.query(statement);
      continue;
    }

    await connection.query(statement.sql, statement.params ?? []);
  }
}

export async function seedSqlDatabase(connection: PoolConnection) {
  await runStatements(connection, schemaStatements);

  const [rows] = await connection.query<any[]>('SELECT COUNT(*) AS count FROM users');
  const userCount = Number(rows?.[0]?.count ?? 0);

  if (userCount > 0) {
    return false;
  }

  const hashedPassword = (value: string) => hashSync(value, 10);

  await runStatements(connection, [
    ...seedUsers.map((user) => ({
      sql: `INSERT INTO users (id, full_name, phone, avatar_url, email, password_hash, role)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [
        user.id,
        user.fullName,
        user.phone,
        user.avatarUrl,
        user.email,
        hashedPassword(user.password),
        user.role,
      ],
    })),
    ...seedCategories.map((category) => ({
      sql: `INSERT INTO categories (id, name, slug, image_url, description)
            VALUES (?, ?, ?, ?, ?)`,
      params: [category.id, category.name, category.slug, category.imageUrl, category.description],
    })),
    ...seedProducts.map((product) => ({
      sql: `INSERT INTO products (id, name, slug, description, price, compare_price, image_url, category_id, rating, review_count, stock, featured)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        product.id,
        product.name,
        product.slug,
        product.description,
        product.price,
        product.comparePrice,
        product.imageUrl,
        product.categoryId,
        product.rating,
        product.reviewCount,
        product.stock,
        product.featured,
      ],
    })),
    ...seedAddresses.map((address) => ({
      sql: `INSERT INTO addresses (id, user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        address.id,
        address.userId,
        address.fullName,
        address.phone,
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.postalCode,
        address.country,
        address.isDefault,
      ],
    })),
    ...seedOrders.map((order) => ({
      sql: `INSERT INTO orders (id, user_id, order_number, status, total_amount, shipping_address, payment_method, payment_status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [
        order.id,
        order.userId,
        order.orderNumber,
        order.status,
        order.totalAmount,
        JSON.stringify(order.shippingAddress),
        order.paymentMethod,
        order.paymentStatus,
      ],
    })),
    ...seedOrderItems.map((item) => ({
      sql: `INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      params: [item.id, item.orderId, item.productId, item.productName, item.productImage, item.price, item.quantity],
    })),
    ...seedCartItems.map((item) => ({
      sql: `INSERT INTO cart_items (id, user_id, product_id, quantity)
            VALUES (?, ?, ?, ?)`,
      params: [item.id, item.userId, item.productId, item.quantity],
    })),
    ...seedWishlistItems.map((item) => ({
      sql: `INSERT INTO wishlist_items (id, user_id, product_id)
            VALUES (?, ?, ?)`,
      params: [item.id, item.userId, item.productId],
    })),
  ]);

  return true;
}