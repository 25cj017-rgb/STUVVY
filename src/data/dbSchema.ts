export const POSTGRES_SCHEMA_SQL = `-- PostgreSQL Database Schema for Stuvvy Food Delivery Platform
-- Optimized for UUID PKs, foreign key constraints, temporal queries & indexing

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    beneficiary_status VARCHAR(20) DEFAULT 'Standard' CHECK (beneficiary_status IN ('Standard', 'Subsidized', 'Needy')),
    dietary_preferences TEXT[],
    allergy_info TEXT[],
    delivery_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_mobile ON users(mobile_number);
CREATE INDEX idx_users_beneficiary ON users(beneficiary_status);

-- 2. CATEGORIES TABLE
CREATE TABLE categories (
    category_id VARCHAR(50) PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_emoji VARCHAR(10)
);

INSERT INTO categories (category_id, category_name, description, icon_emoji) VALUES
('south', 'South Indian', 'Dosa, Idli, Sambar & Chutney Specials', '🍚'),
('north', 'North Indian', 'Curries, Naan, Paneer & Rice Thalis', '🥘'),
('healthy', 'Healthy (Gym/Diet)', 'High-protein grain bowls, low-GI meals & salads', '🥗');

-- 3. MENU_ITEMS TABLE
CREATE TABLE menu_items (
    item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id VARCHAR(50) NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    days_of_week VARCHAR(10)[] NOT NULL, -- e.g. ARRAY['Mon', 'Tue', 'Wed']
    name VARCHAR(150) NOT NULL,
    description TEXT,
    portion_size VARCHAR(100),
    rating NUMERIC(3,2) DEFAULT 4.5,
    standard_price NUMERIC(10,2) NOT NULL,
    subsidized_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_subsidized_eligible BOOLEAN DEFAULT TRUE,
    nutritional_info JSONB NOT NULL DEFAULT '{}'::jsonb, -- { calories, protein, carbs, fats, fiber }
    image_url TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_menu_category ON menu_items(category_id);
CREATE INDEX idx_menu_days ON menu_items USING GIN(days_of_week);
CREATE INDEX idx_menu_nutrition ON menu_items USING GIN(nutritional_info);

-- 4. ORDERS AND SUBSCRIPTIONS TABLE
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('Single', 'Weekly')),
    pricing_tier VARCHAR(20) NOT NULL CHECK (pricing_tier IN ('Standard', 'Subsidized', 'Donation/Free')),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Subsidized_Waived', 'Failed')),
    delivery_status VARCHAR(30) DEFAULT 'Placed' CHECK (delivery_status IN ('Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    assigned_volunteer_name VARCHAR(100),
    assigned_volunteer_phone VARCHAR(20),
    delivery_address TEXT NOT NULL,
    scheduled_days VARCHAR(10)[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(delivery_status);
`;

export const ARCHITECTURE_OVERVIEW = {
  stack: {
    frontend: 'Next.js 15 (App Router, Server-Side Rendering, React 19, Tailwind CSS)',
    backend: 'Node.js (Express / NestJS) or Python (FastAPI)',
    database: 'PostgreSQL 16 with JSONB & GIN indexing for low-latency queries',
    auth: 'Firebase Auth / AWS Cognito SMS OTP (Passwordless phone verification)',
    payments: 'Stripe / Razorpay + Subsidized Community Care Fund Ledger',
    infrastructure: 'AWS / Vercel Edge Functions + Cloudflare CDN with SSL/TLS 1.3'
  },
  lowBandwidthOptimization: [
    'Compressed JSON payloads with HTTP Brotli/Gzip gzip compression',
    'Responsive dynamic WEBP/SVG fallback images for 2G/3G low data networks',
    'Offline service worker caching for daily menu snapshots',
    'Edge API responses under 150ms total load time'
  ]
};
