-- Initial Seed Data for Candy Cruffs
-- Run this to populate your inventory with the default products.

insert into products (sku, name, stock_qty) values
-- Prism Pops
('PRISM-POPS', 'Prism Pops (Bag)', 50),

-- Crystal Bear Bites
('CRYSTAL-BEAR-BITES-REG', 'Crystal Bear Bites (Regular)', 50),
('CRYSTAL-BEAR-BITES-LRG', 'Crystal Bear Bites (Large)', 30),

-- Neon Worm Crisps
('NEON-WORM-CRISPS-REG', 'Neon Worm Crisps (Regular)', 50),
('NEON-WORM-CRISPS-LRG', 'Neon Worm Crisps (Large)', 30),

-- Shark Bite Crunch
('SHARK-BITE-CRUNCH-REG', 'Shark Bite Crunch (Regular)', 50),
('SHARK-BITE-CRUNCH-LRG', 'Shark Bite Crunch (Large)', 30),

-- Cola Fizz Crunch
('COLA-FIZZ-CRUNCH-REG', 'Cola Fizz Crunch (Regular)', 50),
('COLA-FIZZ-CRUNCH-LRG', 'Cola Fizz Crunch (Large)', 30),

-- Caramelts
('CARAMELTS-REG', 'Caramelts (Regular)', 50),
('CARAMELTS-LRG', 'Caramelts (Large)', 30),

-- Sour Prism Pops
('SOUR-PRISM-POPS', 'Sour Prism Pops (Bag)', 50)

on conflict (sku) do update 
set stock_qty = EXCLUDED.stock_qty;
