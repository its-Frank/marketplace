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