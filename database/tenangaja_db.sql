-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 22, 2025 at 04:31 PM
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
-- Database: `tenangaja_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `image` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`, `image`, `description`) VALUES
('089322f6-ecfa-4987-b537-d44c6d2574af', 'Konstruksi', 'fas fa-hard-hat', 'Pembangunan dan renovasi rumah, gedung, dan infrastruktur dengan tenaga ahli profesional.'),
('6fd520b8-1969-4a16-8930-39ba14c55b45', 'Elektronik', 'fas fa-tv', 'Layanan instalasi, perbaikan, dan penjualan perangkat elektronik rumah tangga dan kantor.'),
('c9b02c4e-4d77-4dc0-be9a-7a4b9e16a2f8', 'Otomotif', 'fas fa-car', 'Servis dan perawatan kendaraan bermotor, termasuk modifikasi, sparepart, dan inspeksi berkala.'),
('e6a63cb8-e34a-4506-8103-94536cec6e81', 'Serba Bisa', 'fas fa-toolbox', 'Layanan umum seperti tukang, kebersihan, pengangkutan, hingga konsultasi solusi harian.');

-- --------------------------------------------------------

--
-- Table structure for table `favoriteworker`
--

CREATE TABLE `favoriteworker` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `workerId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) DEFAULT NULL,
  `workerId` varchar(191) DEFAULT NULL,
  `message` varchar(191) NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id`, `userId`, `workerId`, `message`, `read`, `createdAt`) VALUES
('00f06944-8c15-4cc6-9f0a-5ba944905aec', '634c4c59-1b77-406e-a8bb-58a672da8e43', NULL, 'Client from project #c909f943 give you 3 rating', 1, '2025-05-21 15:31:24.985'),
('04781b2e-7e2a-4901-b8c6-28d564e1380e', '58508ba1-f76a-4b86-b459-cc3db2caba0d', NULL, 'Your project status has been updated to completed', 0, '2025-05-20 15:56:49.195'),
('0af1a501-6811-4647-a82d-00d176b85f94', '58508ba1-f76a-4b86-b459-cc3db2caba0d', NULL, 'Your project status has been updated to accepted', 1, '2025-05-12 13:47:59.994'),
('25da3496-298b-4f1a-b5f6-4710c5f2abdb', '634c4c59-1b77-406e-a8bb-58a672da8e43', NULL, 'Client has confirmed completion of project #c909f943', 1, '2025-05-11 10:40:39.382'),
('347ec9de-cbb7-4813-ba1d-1105462b2348', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'e5b403d0-5a6b-4dfa-8795-95dea5a887d5', 'Anda memiliki order baru dari gemasajaa', 0, '2025-05-20 14:36:50.578'),
('45b2a8a7-f1e0-4960-87ad-0a6988c88b9b', '634c4c59-1b77-406e-a8bb-58a672da8e43', NULL, 'Client has confirmed completion of project #81bf2f1e', 1, '2025-05-21 14:45:06.708'),
('5551cfb9-1782-4e8f-a033-678833fe1fff', NULL, 'e5b403d0-5a6b-4dfa-8795-95dea5a887d5', 'Project #1dde8e9c has been cancelled by the client', 0, '2025-05-20 14:46:08.272'),
('5eedd812-4afe-4213-916c-f750364289bc', '58508ba1-f76a-4b86-b459-cc3db2caba0d', NULL, 'Your project status has been updated to accepted', 1, '2025-05-11 10:34:35.606'),
('627bd1dd-60c2-41b3-b2e6-4f28e65500bc', '58508ba1-f76a-4b86-b459-cc3db2caba0d', NULL, 'Your project status has been updated to completed', 1, '2025-05-11 10:40:18.715'),
('63074141-3e02-4e0c-98fb-8c4e3ec820a2', '58508ba1-f76a-4b86-b459-cc3db2caba0d', NULL, 'Your project status has been updated to accepted', 0, '2025-05-22 14:15:52.135'),
('82699955-1caa-42a1-b85a-3224e1ede2e6', '634c4c59-1b77-406e-a8bb-58a672da8e43', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'Anda memiliki order baru dari Husein Wibowo', 1, '2025-05-20 15:53:14.118'),
('8dd2e434-ed80-4416-adf3-8801fff01d38', NULL, 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'Anda memiliki order baru dari Husein Wibowo', 1, '2025-05-11 10:34:06.823'),
('94b1116c-0bab-40b5-a476-2e49c451bcc9', '58508ba1-f76a-4b86-b459-cc3db2caba0d', NULL, 'Your project status has been updated to accepted', 0, '2025-05-20 15:54:21.632'),
('9b1a5829-41c4-4612-b438-f8ff93370fbd', '634c4c59-1b77-406e-a8bb-58a672da8e43', NULL, 'Client has confirmed completion of project #4588d0a5', 0, '2025-05-22 14:19:02.458'),
('b8513e0b-5739-4b06-bcd2-85c1cf74e243', NULL, 'e5b403d0-5a6b-4dfa-8795-95dea5a887d5', 'Project #1dde8e9c has been cancelled by the client', 0, '2025-05-20 14:46:08.274'),
('c305f070-0822-4d89-9376-81e24217498a', '634c4c59-1b77-406e-a8bb-58a672da8e43', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'Anda memiliki order baru dari Husein Wibowo', 1, '2025-05-12 13:46:30.014'),
('db273417-af8c-45af-b5fb-06857dcedca7', NULL, 'e5b403d0-5a6b-4dfa-8795-95dea5a887d5', 'Project #1dde8e9c has been cancelled by the client', 0, '2025-05-20 14:50:14.783'),
('e11c4e0e-384f-42b6-91ed-e380067fdb22', '634c4c59-1b77-406e-a8bb-58a672da8e43', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'Anda memiliki order baru dari Husein Wibowo', 0, '2025-05-22 14:14:50.875'),
('e8def897-0db6-4e52-84b7-55cfc18969dd', NULL, 'e5b403d0-5a6b-4dfa-8795-95dea5a887d5', 'Project #1dde8e9c has been cancelled by the client', 0, '2025-05-20 14:49:46.307'),
('e9bbad67-1635-49a3-8d1a-feb88d696aa6', '634c4c59-1b77-406e-a8bb-58a672da8e43', NULL, 'Client from project #81bf2f1e give you 5 rating', 1, '2025-05-21 15:33:31.861'),
('eac697cc-5e4b-422c-a446-3e8ba6163f6e', '58508ba1-f76a-4b86-b459-cc3db2caba0d', NULL, 'Your project status has been updated to completed', 0, '2025-05-22 14:18:46.479'),
('f2789448-a5fb-4215-8a48-5685e8d0731d', '634c4c59-1b77-406e-a8bb-58a672da8e43', NULL, 'Client from project #4588d0a5 give you 5 rating', 0, '2025-05-22 14:19:34.354');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `workerId` varchar(191) NOT NULL,
  `status` enum('PENDING','ACCEPTED','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  `date` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `notes` varchar(191) DEFAULT NULL,
  `budget` double NOT NULL,
  `userConfirmed` tinyint(1) NOT NULL DEFAULT 0,
  `deadline` int(11) NOT NULL DEFAULT 7
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order`
--

INSERT INTO `order` (`id`, `userId`, `workerId`, `status`, `date`, `notes`, `budget`, `userConfirmed`, `deadline`) VALUES
('1dde8e9c-2b79-420d-aa4e-e0290f674eb4', '634c4c59-1b77-406e-a8bb-58a672da8e43', 'e5b403d0-5a6b-4dfa-8795-95dea5a887d5', 'CANCELLED', '2025-05-20 14:36:50.565', 'Saya mau order kak!', 20000, 0, 7),
('4588d0a5-b30a-4495-a190-a47e26f0ee07', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'COMPLETED', '2025-05-22 14:14:50.857', 'test', 200000, 1, 7),
('81bf2f1e-4927-44db-bfae-c02a10634a2e', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'COMPLETED', '2025-05-20 15:53:14.102', 'Saya mau order kak!', 200000, 1, 3),
('8b2e8152-d71a-4d8f-999f-97395d1756b6', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'IN_PROGRESS', '2025-05-12 13:46:29.996', 'detail project', 200000, 0, 7),
('c909f943-904a-4cee-ae21-fc7b7df0c0d8', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', 'COMPLETED', '2025-05-11 10:34:06.813', 'Saya mau buat web', 60, 1, 7);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `method` varchar(191) NOT NULL,
  `status` enum('PENDING','PAID','FAILED') NOT NULL DEFAULT 'PENDING',
  `paidAt` datetime(3) DEFAULT NULL,
  `amount` double NOT NULL,
  `paymentReference` varchar(191) NOT NULL,
  `redirectUrl` varchar(191) NOT NULL,
  `snapToken` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id`, `orderId`, `userId`, `method`, `status`, `paidAt`, `amount`, `paymentReference`, `redirectUrl`, `snapToken`) VALUES
('ac51f101-4e2d-45a0-b474-e9d5ff4f9ed4', '8b2e8152-d71a-4d8f-999f-97395d1756b6', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'MIDTRANS', 'PAID', '2025-05-22 21:16:46.000', 200000, 'PRJ-8b2e8152-1747057818903', 'https://app.midtrans.com/snap/v4/redirection/f3383aea-006e-42fd-9d9d-32a4d8d1bc23', 'f3383aea-006e-42fd-9d9d-32a4d8d1bc23'),
('ca904f89-4d94-48e4-8d5b-25e296678262', '81bf2f1e-4927-44db-bfae-c02a10634a2e', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'MIDTRANS', 'PAID', '2025-05-20 22:55:54.000', 200000, 'PRJ-81bf2f1e-1747756484962', 'https://app.midtrans.com/snap/v4/redirection/267f1ae8-dcef-45ae-a58e-edc9f728b6b7', '267f1ae8-dcef-45ae-a58e-edc9f728b6b7'),
('e36159d7-410a-4525-96f5-63ab3d6fad29', '4588d0a5-b30a-4495-a190-a47e26f0ee07', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'MIDTRANS', 'PAID', '2025-05-22 21:17:13.000', 200000, 'PRJ-4588d0a5-1747923383342', 'https://app.midtrans.com/snap/v4/redirection/c7f55ce1-7b67-431d-9a72-f5c38b19810b', 'c7f55ce1-7b67-431d-9a72-f5c38b19810b'),
('f9bdbd07-2d2c-43d5-a0ab-1ba7a6a79776', 'c909f943-904a-4cee-ae21-fc7b7df0c0d8', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'MIDTRANS', 'PAID', '2025-05-11 17:39:42.000', 60, 'PRJ-c909f943-1746959933263', 'https://app.midtrans.com/snap/v4/redirection/cd42b2b4-ec01-477c-9c7d-928f183aef4a', 'cd42b2b4-ec01-477c-9c7d-928f183aef4a');

-- --------------------------------------------------------

--
-- Table structure for table `rating`
--

CREATE TABLE `rating` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rating`
--

INSERT INTO `rating` (`id`, `orderId`, `rating`, `comment`, `createdAt`) VALUES
('3837f03c-fd0f-4038-a156-465bed449396', 'c909f943-904a-4cee-ae21-fc7b7df0c0d8', 3, 'pengerjaan ok', '2025-05-21 15:31:24.975'),
('79ab15f6-91e5-4274-abfb-0a7fcd6fc755', '4588d0a5-b30a-4495-a190-a47e26f0ee07', 5, 'test', '2025-05-22 14:19:34.345'),
('df7ecf24-a440-4d9e-8c28-12fbcaf43983', '81bf2f1e-4927-44db-bfae-c02a10634a2e', 5, 'oke banget', '2025-05-21 15:33:31.847');

-- --------------------------------------------------------

--
-- Table structure for table `subcategory`
--

CREATE TABLE `subcategory` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subcategory`
--

INSERT INTO `subcategory` (`id`, `name`, `categoryId`) VALUES
('0ce1c181-8b41-4a8c-95f2-4a61377191ba', 'Cat Rumah', '089322f6-ecfa-4987-b537-d44c6d2574af'),
('2ba8298f-4067-4b93-b979-97e8e0963417', 'Bangunan', '089322f6-ecfa-4987-b537-d44c6d2574af'),
('4adae7fc-9e09-4a7e-a8c9-d8e3bddfce74', 'Ac', '6fd520b8-1969-4a16-8930-39ba14c55b45'),
('5831490d-cdbf-4906-8472-9c20d23da7a2', 'Tv', '6fd520b8-1969-4a16-8930-39ba14c55b45'),
('5d6f238e-ae1b-4389-982c-60997e16158d', 'Ganti Ban', 'c9b02c4e-4d77-4dc0-be9a-7a4b9e16a2f8'),
('88e8788b-d35d-456e-8a77-bac5155736ca', 'Radio Klasik', '6fd520b8-1969-4a16-8930-39ba14c55b45');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `profile_pic` varchar(191) DEFAULT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `name`, `email`, `password`, `phone`, `address`, `profile_pic`, `gender`, `role`) VALUES
('01d46441-9c02-4e6a-afae-ac7f242e03c1', 'mahmood', 'mahmood@gmail.com', '$2b$10$gOa/E5VwyETtgHZcsadYOeT2Pk6V21zkN2oOTrDnyirxVi8ZyvUHu', '082280994738', 'arab', '/uploads/1747155814221_mahmood.jpg', 'male', 'user'),
('58508ba1-f76a-4b86-b459-cc3db2caba0d', 'Husein Wibowo', 'husein@gmail.com', '$2b$10$e2aLncxqRLLQ/Jpcc4wV6ea5VaKS9HneukQOji6InGpT4gCf8MTgW', '082280994738', 'Sindangbarang Kec. Bogor Bar. Kota Bogor Jawa Barat', '/uploads/1746930030068_avatar-1.png', 'perempuan', 'user'),
('634c4c59-1b77-406e-a8bb-58a672da8e43', 'gemasajaa', 'bocilpes523@gmail.com', '$2b$10$sw6u4kRHiKd/Gog4r9cefeEoVDIdH9sfX3dtH5.gktn9QXrFFwXxq', '08966988765', 'Jl Desa Wiradadi Rt 4 Rw 2 Kecamatan Sokaraja', '/uploads/1746670634785_WhatsApp_Image_2025-04-04_at_10.20.14-removebg-preview.png', 'laki-laki', 'user'),
('8949fbd8-8530-4dd3-99fb-2a2b3cdcfecc', 'RAHMAT AGEM PRATAMA', 'admin@gmail.com', '$2b$10$3x/Zv2eRYjtJncx4UAMFOOdqIrbmSWi7gTMSEDsgNuLlelEuz3xou', '08966988765', 'Jl. Kandang Mas 3 Rt 20 Rw 06', NULL, 'male', 'admin'),
('c20a1c11-eaee-448e-8e12-7e8f91922052', 'newaccount', 'newaccount@gmail.com', '$2b$10$mxa8sowTMeOOv7tlHXYZzOROiJA7CxGMTcCymCqAsiHxLeOUNCg4.', '082280994738', 'indonesia', NULL, 'male', 'user');

-- --------------------------------------------------------

--
-- Table structure for table `worker`
--

CREATE TABLE `worker` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
  `banner` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `worker`
--

INSERT INTO `worker` (`id`, `userId`, `description`, `status`, `banner`) VALUES
('08f69053-475c-4e16-af8f-5c2f839a0407', 'c20a1c11-eaee-448e-8e12-7e8f91922052', 'saya bisa bantu anda [Cat Rumah, Bangunan]', 'active', NULL),
('c64b6b68-9a1a-47c4-9e5b-a01fc4b8a176', '01d46441-9c02-4e6a-afae-ac7f242e03c1', 'Haloo, Nama Saya Mahmood', 'active', NULL),
('cad0002d-b5a8-483c-8ffe-5abf4c4e450e', '634c4c59-1b77-406e-a8bb-58a672da8e43', 'Helloworld, this is gema! [Ac, Tv, Radio Klasik]', 'active', '/uploads/1746937097233_Porto-Kemasan-8-scaled.jpg'),
('e5b403d0-5a6b-4dfa-8795-95dea5a887d5', '58508ba1-f76a-4b86-b459-cc3db2caba0d', 'Helloworld, Saya Husein', 'active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `workercategory`
--

CREATE TABLE `workercategory` (
  `id` varchar(191) NOT NULL,
  `workerId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `workercategory`
--

INSERT INTO `workercategory` (`id`, `workerId`, `categoryId`) VALUES
('21d360ab-3507-4bf9-a792-fbb9eade7f0a', 'c64b6b68-9a1a-47c4-9e5b-a01fc4b8a176', '089322f6-ecfa-4987-b537-d44c6d2574af'),
('68f3151b-8cdd-42f0-b670-b6fb49866231', 'e5b403d0-5a6b-4dfa-8795-95dea5a887d5', '089322f6-ecfa-4987-b537-d44c6d2574af'),
('c821c8b8-91ec-4cf6-ba5e-3bd280db8ce4', '08f69053-475c-4e16-af8f-5c2f839a0407', '089322f6-ecfa-4987-b537-d44c6d2574af'),
('df034235-fa0c-4bfa-aae5-31cddf5b6eb6', 'cad0002d-b5a8-483c-8ffe-5abf4c4e450e', '6fd520b8-1969-4a16-8930-39ba14c55b45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Admin_email_key` (`email`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `favoriteworker`
--
ALTER TABLE `favoriteworker`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `FavoriteWorker_userId_workerId_key` (`userId`,`workerId`),
  ADD KEY `FavoriteWorker_workerId_fkey` (`workerId`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Notification_userId_fkey` (`userId`),
  ADD KEY `Notification_workerId_fkey` (`workerId`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Order_userId_fkey` (`userId`),
  ADD KEY `Order_workerId_fkey` (`workerId`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Payment_orderId_key` (`orderId`),
  ADD KEY `Payment_userId_fkey` (`userId`);

--
-- Indexes for table `rating`
--
ALTER TABLE `rating`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Rating_orderId_key` (`orderId`);

--
-- Indexes for table `subcategory`
--
ALTER TABLE `subcategory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `SubCategory_categoryId_fkey` (`categoryId`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`);

--
-- Indexes for table `worker`
--
ALTER TABLE `worker`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Worker_userId_key` (`userId`);

--
-- Indexes for table `workercategory`
--
ALTER TABLE `workercategory`
  ADD PRIMARY KEY (`id`),
  ADD KEY `WorkerCategory_workerId_fkey` (`workerId`),
  ADD KEY `WorkerCategory_categoryId_fkey` (`categoryId`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `favoriteworker`
--
ALTER TABLE `favoriteworker`
  ADD CONSTRAINT `FavoriteWorker_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FavoriteWorker_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `worker` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Notification_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `worker` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Order_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `worker` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `rating`
--
ALTER TABLE `rating`
  ADD CONSTRAINT `Rating_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subcategory`
--
ALTER TABLE `subcategory`
  ADD CONSTRAINT `SubCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `worker`
--
ALTER TABLE `worker`
  ADD CONSTRAINT `Worker_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `workercategory`
--
ALTER TABLE `workercategory`
  ADD CONSTRAINT `WorkerCategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `WorkerCategory_workerId_fkey` FOREIGN KEY (`workerId`) REFERENCES `worker` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
