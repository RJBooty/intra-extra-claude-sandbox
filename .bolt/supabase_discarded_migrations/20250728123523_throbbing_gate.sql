/*
  # Initial Database Schema Setup

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (text, default 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `company` (text)
      - `classification` (text, default 'Canopy')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `project_phases`
      - `id` (integer, primary key)
      - `name` (text)
      - `description` (text)
      - `order` (integer, unique)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text NOT NULL,
  classification text DEFAULT 'Canopy' NOT NULL CHECK (classification IN ('Canopy', 'Direct', 'Partner', 'Vendor')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project phases table
CREATE TABLE IF NOT EXISTS project_phases (
  id integer PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  "order" integer UNIQUE NOT NULL
);

-- Insert default project phases
INSERT INTO project_phases (id, name, description, "order") VALUES
  (1, 'Initial Contact', 'First client interaction and requirements gathering', 1),
  (2, 'Proposal Development', 'Creating and refining the project proposal', 2),
  (3, 'Contract Negotiation', 'Finalizing terms and conditions', 3),
  (4, 'Project Execution', 'Active project implementation', 4)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can read clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can read project phases" ON project_phases;

-- Create policies for users table
CREATE POLICY "Users can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for clients table
CREATE POLICY "Authenticated users can read clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (true);

-- Create policies for project phases table
CREATE POLICY "Authenticated users can read project phases"
  ON project_phases
  FOR SELECT
  TO authenticated
  USING (true);