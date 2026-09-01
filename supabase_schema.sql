-- =============================================
-- Wanderly Travel & Tours - Supabase Schema
-- =============================================
-- Run this in Supabase SQL Editor:
--   1. Go to your Supabase Dashboard
--   2. Click "SQL Editor" in the left sidebar
--   3. Click "+ New query"
--   4. Paste this entire file and click "Run"
-- =============================================

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "Email" TEXT,
  email TEXT,
  "Password" TEXT,
  password TEXT,
  "Username" TEXT,
  name TEXT,
  phone TEXT,
  address TEXT,
  gender TEXT,
  "dateOfBirth" TEXT,
  role INTEGER DEFAULT 1,  -- 1 = CLIENT, 2 = ADMIN
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. TOURS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  "startDate" TEXT NOT NULL,
  "endDate" TEXT NOT NULL,
  "availabilityUntil" TEXT NOT NULL,
  "imageUrl" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "maxParticipants" INTEGER,
  highlights TEXT[],
  included TEXT[],
  itinerary TEXT[],
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bookingId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "tourTitle" TEXT NOT NULL,
  participants INTEGER NOT NULL,
  "totalPrice" NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, confirmed, ongoing, cancelled, completed, failed
  "bookingDate" TEXT NOT NULL,
  "travelDate" TEXT NOT NULL,
  "departureDate" TEXT,
  "specialRequests" TEXT,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "hasRescheduled" BOOLEAN DEFAULT FALSE,
  "paymentType" TEXT DEFAULT 'full',  -- full, partial
  "paymentStatus" TEXT DEFAULT 'pending',  -- pending, paid, failed, refunded
  "paymentMethod" TEXT,
  "paymentIntentId" TEXT,
  "transactionId" TEXT,
  "amountPaid" NUMERIC DEFAULT 0,
  "amountRemaining" NUMERIC DEFAULT 0,
  "dueDate" TEXT,
  "paymentDate" TEXT,
  "daysUntilDue" INTEGER,
  "refundAmount" NUMERIC,
  "refundDate" TEXT,
  "isVoided" BOOLEAN DEFAULT FALSE,
  "voidReason" TEXT,
  "voidDate" TEXT,
  "rebookCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. DESTINATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  description TEXT NOT NULL,
  "imageUrl" TEXT,
  "popularAttractions" TEXT[],
  "bestTimeToVisit" TEXT,
  climate TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. RECENT ACTIVITIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS recent_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,  -- booking, package_created, package_updated, user_registered
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ DEFAULT NOW(),
  "userId" TEXT,
  "relatedId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 6. PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "paymentIntentId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PHP',
  "paymentMethod" TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, processing, succeeded, failed, cancelled
  "paymongoPaymentId" TEXT,
  "customerEmail" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "transactionId" TEXT,
  "gatewayResponse" JSONB,
  "failureReason" TEXT,
  "processedAt" TEXT,
  "paymentType" TEXT,  -- initial, remaining, full
  "paymentNumber" INTEGER,
  "isPartialPayment" BOOLEAN DEFAULT FALSE,
  "originalAmount" NUMERIC,
  "amountPaid" NUMERIC,
  "amountRemaining" NUMERIC,
  "totalPaid" NUMERIC,
  "dueDate" TEXT,
  "isOverdue" BOOLEAN DEFAULT FALSE,
  "daysUntilDue" INTEGER,
  "paymentStatus" TEXT,
  "isVoided" BOOLEAN DEFAULT FALSE,
  "voidReason" TEXT,
  "voidDate" TEXT,
  "refundRequested" BOOLEAN DEFAULT FALSE,
  "refundAmount" NUMERIC,
  "refundReason" TEXT,
  "refundStatus" TEXT,  -- pending, approved, rejected, processed
  "refundDate" TEXT,
  "adminNotes" TEXT,
  "processedBy" TEXT,
  commission NUMERIC,
  "netAmount" NUMERIC,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. SALES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bookingId" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "tourTitle" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PHP',
  "paymentMethod" TEXT NOT NULL,
  "paymentStatus" TEXT DEFAULT 'paid',  -- paid, refunded
  "bookingDate" TEXT NOT NULL,
  "paymentDate" TEXT NOT NULL,
  commission NUMERIC,
  "netAmount" NUMERIC NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 8. DATE AVAILABILITY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS date_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "tourId" TEXT NOT NULL,
  date TEXT NOT NULL,
  "isAvailable" BOOLEAN DEFAULT TRUE,
  "bookingId" TEXT,
  "userId" TEXT,
  status TEXT DEFAULT 'available',  -- available, booked, blocked
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. RATINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "bookingId" TEXT NOT NULL,
  "tourId" TEXT NOT NULL,
  "tourTitle" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "travelDate" TEXT NOT NULL
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Disable RLS on all tables for now (enable and configure as needed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Allow full access via the service_role key (which your app uses via supabase-js)
-- These policies allow all operations when using the anon/public key too.
-- Adjust these policies for production security.

CREATE POLICY "Allow all access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON tours FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON destinations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON recent_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON date_availability FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON ratings FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- 10. DEFAULT ACCOUNTS (Admin & Client)
-- =============================================
-- Admin:  admin@gmail.com  / admin123  (Role 2 = ADMIN)
-- Client: client@gmail.com / client123 (Role 1 = CLIENT)
INSERT INTO users (email, "Email", password, "Password", name, "Username", role)
VALUES 
  ('admin@gmail.com', 'admin@gmail.com', 'YWRtaW4xMjNzYWx0', 'YWRtaW4xMjNzYWx0', 'Admin User', 'admin', 2),
  ('client@gmail.com', 'client@gmail.com', 'Y2xpZW50MTIzc2FsdA==', 'Y2xpZW50MTIzc2FsdA==', 'Client User', 'client', 1);
