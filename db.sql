-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS kenyan_freelancer_marketplace;

USE kenyan_freelancer_marketplace;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('freelancer', 'client') NOT NULL,
    profile_picture VARCHAR(255),
    bio TEXT,
    skills TEXT,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    deadline DATE,
    status ENUM('open', 'in_progress', 'completed', 'cancelled') DEFAULT 'open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id)
);

-- Bids table
CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    proposal TEXT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    reviewee_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
);

-- Messages table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    job_id INT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    client_id INT NOT NULL,
    freelancer_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'completed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id),
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (freelancer_id) REFERENCES users(id)
);

-- job-images
CREATE TABLE job_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id)
);

-- bid-attachments
CREATE TABLE bid_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bid_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bid_id) REFERENCES bids(id)
);

-- Services table
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image_path VARCHAR(255),
    status ENUM('available', 'pending', 'sold') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Service messages table for negotiations
CREATE TABLE service_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- Service transactions table
CREATE TABLE service_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    mpesa_transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- work submissions
CREATE TABLE work_submissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  freelancer_id INT NOT NULL,
  submission_text TEXT NOT NULL,
  status ENUM('pending', 'approved', 'revision_requested') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (freelancer_id) REFERENCES users(id)
);

-- submission files
CREATE TABLE submission_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  submission_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES work_submissions(id)
);

-- revision-requests
CREATE TABLE revision_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  job_id INT NOT NULL,
  client_id INT NOT NULL,
  revision_notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id),
  FOREIGN KEY (client_id) REFERENCES users(id)
);
-- contacts
CREATE TABLE contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- updates
ALTER TABLE jobs 
    ADD COLUMN basic_price DECIMAL(10,2),
    ADD COLUMN basic_description TEXT,
    ADD COLUMN basic_delivery INT,
    ADD COLUMN basic_revisions INT,
    ADD COLUMN standard_price DECIMAL(10,2),
    ADD COLUMN standard_description TEXT,
    ADD COLUMN standard_delivery INT,
    ADD COLUMN standard_revisions INT,
    ADD COLUMN premium_price DECIMAL(10,2),
    ADD COLUMN premium_description TEXT,
    ADD COLUMN premium_delivery INT,
    ADD COLUMN premium_revisions INT;


ALTER TABLE bids
    ADD COLUMN delivery_time INT NOT NULL,
    ADD COLUMN proposal_file VARCHAR(255);

    -- Added new columns to jobs table
ALTER TABLE jobs
ADD COLUMN completed_work VARCHAR(255),
ADD COLUMN completion_notes TEXT,
ADD COLUMN review_feedback TEXT;
-- Updated jobs table status enum
ALTER TABLE jobs 
MODIFY COLUMN status ENUM('open', 'in_progress', 'pending_review', 'pending_payment', 'completed') DEFAULT 'open';
-- updated the jobs table
ALTER TABLE jobs ADD COLUMN paid BOOLEAN DEFAULT FALSE;
-- work submissions
ALTER TABLE work_submissions
ADD COLUMN rating INT;

-- added admin to users table
ALTER TABLE users 
MODIFY COLUMN user_type ENUM('freelancer', 'client', 'admin') NOT NULL;

-- admin details
INSERT INTO users (name, email, password, user_type) VALUES 
('Admin', 'admin@marketplace.com', '6892frank', 'admin');