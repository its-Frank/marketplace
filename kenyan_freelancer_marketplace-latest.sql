-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 18, 2024 at 10:43 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kenyan_freelancer_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `bids`
--

CREATE TABLE `bids` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `freelancer_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `proposal` text NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `delivery_time` int(11) NOT NULL,
  `proposal_file` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bids`
--

INSERT INTO `bids` (`id`, `job_id`, `freelancer_id`, `amount`, `proposal`, `status`, `created_at`, `delivery_time`, `proposal_file`) VALUES
(3, 4, 4, 80.00, 'I have 5 years of experience in doing annotation as I have done previous annotations in Stellar AI.', 'rejected', '2024-11-02 11:24:22', 3, NULL),
(4, 4, 4, 400.00, 'I have experience in data annotation.', 'accepted', '2024-11-22 08:09:08', 5, NULL),
(6, 3, 4, 450.00, 'I want to do for you your multimedia project.', 'accepted', '2024-11-22 09:24:09', 2, NULL),
(8, 7, 11, 15.00, 'I have experience with doing business questions.', 'accepted', '2024-11-27 07:54:13', 2, NULL),
(9, 8, 11, 50.00, 'I have worked with chatting for the last 4 years.', 'accepted', '2024-11-27 08:52:37', 2, NULL),
(10, 9, 15, 50.00, 'I have 10 years of experience in doing mathematics jobs.', 'accepted', '2024-12-11 09:46:41', 2, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bid_attachments`
--

CREATE TABLE `bid_attachments` (
  `id` int(11) NOT NULL,
  `bid_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bid_attachments`
--

INSERT INTO `bid_attachments` (`id`, `bid_id`, `file_path`, `created_at`) VALUES
(1, 3, '/uploads/bid_files/1730546662599-FRANK REX.pdf', '2024-11-02 11:24:22'),
(2, 8, '/uploads/bid_files/1732694053975-Ujjwal Mishra.pdf', '2024-11-27 07:54:13');

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `name`, `email`, `phone`, `subject`, `message`, `category`, `created_at`) VALUES
(1, 'Frankline Orina', 'orinafrankline123@gmail.com', '0795928330', 'Service account', 'I want a business account for outlier', 'General Inquiry', '2024-12-17 07:52:50'),
(2, 'Frankline Orina Nyangaresi', 'franklineorina6@gmail.com', '0718932518', 'Onboarding', 'Looking for a freelancer to do my business onboarding task.', 'Freelancer Help', '2024-12-17 07:53:57');

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `budget` decimal(10,2) NOT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('open','in_progress','pending_review','pending_payment','completed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `basic_price` decimal(10,2) DEFAULT NULL,
  `basic_description` text DEFAULT NULL,
  `basic_delivery` int(11) DEFAULT NULL,
  `basic_revisions` int(11) DEFAULT NULL,
  `standard_price` decimal(10,2) DEFAULT NULL,
  `standard_description` text DEFAULT NULL,
  `standard_delivery` int(11) DEFAULT NULL,
  `standard_revisions` int(11) DEFAULT NULL,
  `premium_price` decimal(10,2) DEFAULT NULL,
  `premium_description` text DEFAULT NULL,
  `premium_delivery` int(11) DEFAULT NULL,
  `premium_revisions` int(11) DEFAULT NULL,
  `completed_work` varchar(255) DEFAULT NULL,
  `completion_notes` text DEFAULT NULL,
  `review_feedback` text DEFAULT NULL,
  `paid` tinyint(1) DEFAULT 0,
  `payment_completed_at` timestamp NULL DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `client_id`, `title`, `description`, `budget`, `deadline`, `status`, `created_at`, `basic_price`, `basic_description`, `basic_delivery`, `basic_revisions`, `standard_price`, `standard_description`, `standard_delivery`, `standard_revisions`, `premium_price`, `premium_description`, `premium_delivery`, `premium_revisions`, `completed_work`, `completion_notes`, `review_feedback`, `paid`, `payment_completed_at`, `updated_at`) VALUES
(3, 5, 'Multimedia Project.', 'I want a multimedia project that follows all the typical stages of multimedia.', 450.00, '2024-10-31', '', '2024-10-31 17:27:43', 100.00, '', 5, 3, 250.00, '', 2, 2, 400.00, '', 1, 0, NULL, NULL, NULL, 0, NULL, '2024-12-18 12:11:21'),
(4, 6, 'Annotation', 'I want you to be doing annotations for me on Stellar ai.', 450.00, '2024-11-06', '', '2024-11-02 10:21:02', 200.00, '1 page', 2, 2, 300.00, '2 pages', 3, 1, 400.00, '3 pages', 5, 0, NULL, NULL, NULL, 0, NULL, '2024-12-18 12:11:21'),
(6, 10, 'Stellar AI', 'Annotation work', 60.00, '2024-12-05', 'open', '2024-11-27 06:35:18', 20.00, '', 3, 2, 40.00, '', 2, 1, 60.00, '', 1, 0, NULL, NULL, NULL, 0, NULL, '2024-12-18 12:11:21'),
(7, 2, 'Coursehero', 'Business questions ', 15.00, '2024-11-28', '', '2024-11-27 07:03:58', 0.00, '', 0, 0, 0.00, '', 0, 0, 10.00, '', 1, -1, NULL, NULL, NULL, 0, NULL, '2024-12-18 12:11:21'),
(8, 3, 'Cloudworker', 'Chatting with clients from home', 60.00, '2024-11-28', 'completed', '2024-11-27 07:43:20', 0.00, '', 0, 0, 0.00, '', 0, 0, 50.00, '', 1, 0, NULL, 'Payment processed successfully', NULL, 1, NULL, '2024-12-18 12:14:39'),
(9, 14, 'Operands', 'The job is about working with mathematical operands and operators to answer questions', 50.00, '2024-12-12', 'pending_review', '2024-12-11 09:34:45', 0.00, '', 0, 0, 0.00, '', 0, 0, 50.00, 'Correct answers for all the questions.', 1, 0, NULL, NULL, NULL, 0, NULL, '2024-12-18 12:11:21'),
(10, 2, 'Biology Screening', 'Onboarding of Biology test', 30.00, '2024-12-18', 'open', '2024-12-17 09:35:58', 0.00, '', 0, 0, 0.00, '', 0, 0, 30.00, 'Correct answers', 1, 0, NULL, NULL, NULL, 0, NULL, '2024-12-18 12:11:21');

-- --------------------------------------------------------

--
-- Table structure for table `job_images`
--

CREATE TABLE `job_images` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_images`
--

INSERT INTO `job_images` (`id`, `job_id`, `image_path`, `created_at`) VALUES
(1, 4, '/uploads/gig_images/1730542862648.jpg', '2024-11-02 10:21:02'),
(2, 6, '/uploads/gig_images/gig-1732689318412.PNG', '2024-11-27 06:35:18'),
(3, 9, '/uploads/gig_images/gig-1733909685536.jpg', '2024-12-11 09:34:45'),
(4, 10, '/uploads/gig_images/gig-1734428158233.PNG', '2024-12-17 09:35:58');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `job_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `job_id`, `content`, `is_read`, `created_at`) VALUES
(1, 3, 1, NULL, 'Hello Frank I am Interested in your skills.', 1, '2024-10-26 07:37:30'),
(3, 2, 1, NULL, 'Hello Frank are you available right now for a job.', 1, '2024-10-26 07:53:33'),
(6, 1, 2, NULL, 'Yes I am available.', 1, '2024-10-31 09:18:15'),
(8, 6, 4, 4, 'Your bid was not accepted. Reason: I can\'t be able to see your previous worked on annotations.', 0, '2024-11-02 12:18:24'),
(11, 6, 4, 4, 'Your bid has been accepted! Here are the job requirements:\n\nI have seen your bid and accepted, check your inbox for project details.', 1, '2024-11-22 08:29:45'),
(13, 5, 4, 3, 'Your bid has been accepted! Here are the job requirements:\n\nI want you to design for me a multimedia project about wildlife in Kenya.', 0, '2024-11-22 09:25:11'),
(15, 2, 11, 7, 'Your bid has been accepted! Here are the job requirements:\n\nHere are the logins for the account, email: frank@gmail.com: pass: frank6892', 1, '2024-11-27 07:56:58'),
(16, 3, 11, 8, 'Your bid has been accepted! Here are the job requirements:\n\nHere is the document for editing http.source2.com', 1, '2024-11-27 09:02:58'),
(17, 14, 11, 9, 'Are you free for my job', 1, '2024-12-11 09:36:15'),
(18, 11, 14, 9, 'yes I am available you can send the project details.', 0, '2024-12-11 09:37:24'),
(19, 14, 15, 9, 'Your bid has been accepted! Here are the job requirements:\n\nHere are sums I want done\r\n1+1\r\n2*3\r\n5+2-4*4', 1, '2024-12-11 09:49:03');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `freelancer_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `job_id`, `client_id`, `freelancer_id`, `amount`, `status`, `payment_method`, `transaction_id`, `created_at`) VALUES
(7, 8, 3, 11, 50.00, 'completed', 'credit_card', 'QWOEU123SUHR', '2024-11-27 11:51:52'),
(8, 9, 14, 15, 50.00, 'completed', 'credit_card', 'QWOEU123SURT', '2024-12-11 09:52:12'),
(9, 8, 3, 11, 50.00, 'completed', 'credit_card', 'QWOEU123SURT', '2024-12-17 08:28:34'),
(10, 8, 3, 11, 50.00, 'completed', 'credit_card', 'QWOEU123SURT', '2024-12-18 08:53:28'),
(11, 8, 3, 11, 50.00, 'completed', 'credit_card', 'QWOEU123SUHR', '2024-12-18 08:53:57'),
(12, 8, 3, 11, 50.00, 'completed', 'credit_card', 'QWOEU123SUHRr', '2024-12-18 09:14:39');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `reviewee_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `job_id`, `reviewer_id`, `reviewee_id`, `rating`, `comment`, `created_at`) VALUES
(1, 8, 3, 11, 5, 'Automatic 5-star review for successful job completion', '2024-12-18 09:14:39');

-- --------------------------------------------------------

--
-- Table structure for table `revision_requests`
--

CREATE TABLE `revision_requests` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `revision_notes` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `status` enum('available','pending','sold') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `seller_id`, `title`, `description`, `price`, `image_path`, `status`, `created_at`) VALUES
(2, 6, 'Coursehero', 'Deals with answering questions and getting paid.', 7500.00, '/uploads/services/service-1732256118788.png', 'sold', '2024-11-22 06:15:18'),
(5, 3, 'Engineering Task', 'Software engineering work', 16000.00, '/uploads/services/service-1734424436003.PNG', 'available', '2024-12-17 08:33:56'),
(6, 15, 'Annotation', 'Deals with stellar annotations', 15000.00, '/uploads/services/service-1734425502504.png', 'available', '2024-12-17 08:51:42');

-- --------------------------------------------------------

--
-- Table structure for table `service_transactions`
--

CREATE TABLE `service_transactions` (
  `id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `seller_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `mpesa_transaction_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_transactions`
--

INSERT INTO `service_transactions` (`id`, `service_id`, `buyer_id`, `seller_id`, `amount`, `mpesa_transaction_id`, `status`, `created_at`) VALUES
(4, 2, 15, 6, 7500.00, 'QKMD12W44', 'completed', '2024-12-12 07:57:53');

-- --------------------------------------------------------

--
-- Table structure for table `submission_files`
--

CREATE TABLE `submission_files` (
  `id` int(11) NOT NULL,
  `submission_id` int(11) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `submission_files`
--

INSERT INTO `submission_files` (`id`, `submission_id`, `file_path`, `created_at`) VALUES
(1, 2, '/uploads/work_submissions/1732264288040-Truman Capote.docx', '2024-11-22 08:31:28'),
(3, 4, '/uploads/work_submissions/1732267594352-MULTIMEDIA TUTORIAL NOTES (1).pdf', '2024-11-22 09:26:34'),
(4, 6, '/uploads/work_submissions/1732694328120-5.png', '2024-11-27 07:58:48');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `user_type` enum('freelancer','client','admin') NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `user_type`, `profile_picture`, `bio`, `skills`, `location`, `created_at`) VALUES
(1, 'frank', 'frank@gmail.com', '$2b$10$ymv84e6z/Eoteu2Y/z05TOyE8.7EsdRF5V0b/kpMZowqyw3r9RVva', 'freelancer', NULL, 'I am a dedicated Software Engineer with 5 years of Experience.', 'Web Development, Graphics Design', 'Eldoret, Kenya', '2024-10-17 09:27:47'),
(2, 'orina', 'orina@gmail.com', '$2b$10$N7NZmQr/ZB0XANU4nMQ10etxw0ENH86lvnJvfRDIfAwn7Lf8NgLA.', 'client', '/uploads/profiles/profile-1731394766139.jpg', 'I have been working in the field of freelancing for the past 5 years.', NULL, 'Nairobi, Kenya', '2024-10-17 09:52:36'),
(3, 'eliud', 'eliud@gmail.com', '$2b$10$iQNBj0wXD4RQBZYgOr3g9.jSjI8W0AmCNt.JldgaENQSCW1f.dGCi', 'client', NULL, NULL, NULL, NULL, '2024-10-17 11:29:36'),
(4, 'Kevin', 'kevin@gmail.com', '$2b$10$DiacDSjMGp4nysOrlQLIhOWVwYMVm/uWPQLgJ0tWn49KtHtw8wByq', 'freelancer', NULL, 'I am a dedicated Graphic designer with 5 years of experience.', 'Graphics Design', 'Nairobi, Kenya', '2024-10-26 17:19:52'),
(5, 'Manu', 'manu@gmail.com', '$2b$10$tht/GVCK7sw3oodbelo27eA3HZxjy.tQcey51nT/PCddSB0iGTIB6', 'client', '/uploads/profiles/profile-1731395084953.jpg', 'I am a computer science professional, and my business is about annotation industry.', NULL, 'Eldoret, Kenya', '2024-10-31 17:18:45'),
(6, 'Naph', 'naph@gmail.com', '$2b$10$OcViuHueNw888vZcpYxKPeYO8TQ6QiRwQbRxYWzj7/VUs.oswMc1W', 'client', '/uploads/profiles/profile-1731395488762.jpg', 'I have been working with google for the past 3 years.', NULL, 'Mombasa,Kenya', '2024-11-02 10:18:09'),
(7, 'Verah', 'vera@gmail.com', '$2b$10$zjQFGyMfEBuInK/z/PDNBO5p4qjUnoNBghDSX.hspCxaouloRFJXS', 'client', NULL, NULL, NULL, NULL, '2024-11-14 10:18:15'),
(9, 'Clin', 'clin@gmail.com', '$2b$10$K7wGupAh3v6XtLi2Wy1dhuDotDi1y6mLUisHB3A4G1oX2UckpoQ5e', 'client', NULL, NULL, NULL, NULL, '2024-11-27 06:12:00'),
(10, 'John', 'john@gmail.com', '$2b$10$qvhmAD4NKRytxyn1MYL09uh8Lhc.9Ufw6qCznPKk4zsGkQj.86sTy', 'client', NULL, NULL, NULL, NULL, '2024-11-27 06:14:47'),
(11, 'Paul', 'paul@gmail.com', '$2b$10$WYgKIwywcffbLvffrjK8t.fHy8iolX8spGP09l0SEQm8hn0xM2ffG', 'freelancer', NULL, 'I have experience with annotation  and have worked with chatting projects for the last 3 years', 'Annotation, Translation', 'Eldoret, Kenya', '2024-11-27 07:47:14'),
(13, 'Admin', 'admin@marketplace.com', '$2b$10$sgIvGk.58ZgfU6MB1eyWze5S684h2qh21rBooxOYRLFAjSNse0UD2', 'admin', NULL, NULL, NULL, NULL, '2024-11-30 07:33:01'),
(14, 'Manuel Pantone', 'manuel@gmail.com', '$2b$10$eNFLbKOecuD0TOCpoywx..faOEruPEj9P/D5.tLtYFMEGQPqbz01y', 'client', '/uploads/profiles/1733909502238.jpg', 'I am a dedicated Mathematician expert with 5 years of experience in Math projects.', NULL, 'Kisii, Kenya', '2024-12-11 09:10:59'),
(15, 'Alvin Obara', 'alvin@gmail.com', '$2b$10$ub4KgOegaJhD2cAkPUFNKefkA4G9CeOfEj7kMrWqS79ifN58f8GVO', 'freelancer', NULL, 'I am a Mathematician expert with 10 years of experience in the industry.', 'Mathematics', 'Nairobi, Kenya', '2024-12-11 09:44:18');

-- --------------------------------------------------------

--
-- Table structure for table `work_submissions`
--

CREATE TABLE `work_submissions` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `freelancer_id` int(11) NOT NULL,
  `submission_text` text NOT NULL,
  `status` enum('pending','approved','revision_requested') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `rating` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `work_submissions`
--

INSERT INTO `work_submissions` (`id`, `job_id`, `freelancer_id`, `submission_text`, `status`, `created_at`, `rating`) VALUES
(2, 4, 4, 'Here is the work done which you sent via the messages.', 'pending', '2024-11-22 08:31:28', NULL),
(4, 3, 4, 'Here is the project', 'pending', '2024-11-22 09:26:34', NULL),
(6, 7, 11, 'The work is done check on the account.', 'pending', '2024-11-27 07:58:48', NULL),
(7, 8, 11, 'The work is done you can check your account for assurance.', 'approved', '2024-11-27 09:04:10', 100),
(8, 9, 15, 'here are the answers \r\n1. 4\r\n2. 6\r\n3. 8', 'pending', '2024-12-11 09:50:38', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bids`
--
ALTER TABLE `bids`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `freelancer_id` (`freelancer_id`);

--
-- Indexes for table `bid_attachments`
--
ALTER TABLE `bid_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bid_id` (`bid_id`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `job_images`
--
ALTER TABLE `job_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `job_id` (`job_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `freelancer_id` (`freelancer_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `reviewer_id` (`reviewer_id`),
  ADD KEY `reviewee_id` (`reviewee_id`);

--
-- Indexes for table `revision_requests`
--
ALTER TABLE `revision_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `seller_id` (`seller_id`);

--
-- Indexes for table `service_transactions`
--
ALTER TABLE `service_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `service_id` (`service_id`),
  ADD KEY `buyer_id` (`buyer_id`),
  ADD KEY `seller_id` (`seller_id`);

--
-- Indexes for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `work_submissions`
--
ALTER TABLE `work_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `job_id` (`job_id`),
  ADD KEY `freelancer_id` (`freelancer_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bids`
--
ALTER TABLE `bids`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bid_attachments`
--
ALTER TABLE `bid_attachments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contacts`
--
ALTER TABLE `contacts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `job_images`
--
ALTER TABLE `job_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `revision_requests`
--
ALTER TABLE `revision_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `service_transactions`
--
ALTER TABLE `service_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `submission_files`
--
ALTER TABLE `submission_files`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `work_submissions`
--
ALTER TABLE `work_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bids`
--
ALTER TABLE `bids`
  ADD CONSTRAINT `bids_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  ADD CONSTRAINT `bids_ibfk_2` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `bid_attachments`
--
ALTER TABLE `bid_attachments`
  ADD CONSTRAINT `bid_attachments_ibfk_1` FOREIGN KEY (`bid_id`) REFERENCES `bids` (`id`);

--
-- Constraints for table `jobs`
--
ALTER TABLE `jobs`
  ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `job_images`
--
ALTER TABLE `job_images`
  ADD CONSTRAINT `job_images_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`);

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `revision_requests`
--
ALTER TABLE `revision_requests`
  ADD CONSTRAINT `revision_requests_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  ADD CONSTRAINT `revision_requests_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `service_transactions`
--
ALTER TABLE `service_transactions`
  ADD CONSTRAINT `service_transactions_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`),
  ADD CONSTRAINT `service_transactions_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `service_transactions_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `submission_files`
--
ALTER TABLE `submission_files`
  ADD CONSTRAINT `submission_files_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `work_submissions` (`id`);

--
-- Constraints for table `work_submissions`
--
ALTER TABLE `work_submissions`
  ADD CONSTRAINT `work_submissions_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`),
  ADD CONSTRAINT `work_submissions_ibfk_2` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
