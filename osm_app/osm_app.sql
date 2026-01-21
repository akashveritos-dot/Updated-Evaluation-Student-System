-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 07, 2025 at 09:37 AM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 7.4.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `osm_app`
--

-- --------------------------------------------------------

--
-- Table structure for table `annotator_pageannotation`
--

CREATE TABLE `annotator_pageannotation` (
  `id` bigint(20) NOT NULL,
  `page_number` int(11) NOT NULL,
  `actions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`actions`)),
  `saved_at` datetime(6) NOT NULL,
  `pdf_id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `annotator_uploadedpdf`
--

CREATE TABLE `annotator_uploadedpdf` (
  `id` bigint(20) NOT NULL,
  `file` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `original_name` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `uploaded_at` datetime(6) NOT NULL,
  `decrypted` tinyint(1) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `annotator_uploadedpdf`
--

INSERT INTO `annotator_uploadedpdf` (`id`, `file`, `original_name`, `uploaded_at`, `decrypted`, `user_id`) VALUES
(1, 'pdfs/103212-BTMC24O1101_signed (1).pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 12:59:05.488980', 0, 1),
(2, 'pdfs/103212-BTMC24O1101_signed (1)_uXBy9nz.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:22:43.686838', 0, 1),
(3, 'pdfs/103212-BTMC24O1101_signed (1)_08wbpy4.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:24:40.974640', 0, 1),
(4, 'pdfs/103212-BTMC24O1101_signed (1).pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:28:35.365916', 0, 1),
(5, 'pdfs/103212-BTMC24O1101_signed (1)_glLY1Gr.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:33:36.335203', 0, 1),
(6, 'pdfs/103212-BTMC24O1101_signed (1)_JUkutZN.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:38:47.402866', 1, 1),
(7, 'pdfs/103212-BTMC24O1101_signed (1)_j69y7qD.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:42:16.381310', 0, 1),
(8, 'pdfs/103212-BTMC24O1101_signed (1)_XgvnI4m.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:42:50.362191', 0, 1),
(9, 'pdfs/103212-BTMC24O1101_signed (1)_KXr9ow1.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:44:35.148656', 0, 1),
(10, 'pdfs/103212-BTMC24O1101_signed (1)_OFEAhx3.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:45:07.932842', 0, 1),
(11, 'pdfs/103212-BTMC24O1101_signed (1)_EmGdTya.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:46:07.599022', 0, 1),
(12, 'pdfs/103212-BTMC24O1101_signed (1)_T2I4kle.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:46:52.190832', 1, 1),
(13, 'pdfs/103212-BTMC24O1101_signed (1)_o3vux7N.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:48:28.744167', 1, 1),
(14, 'pdfs/103212-BTMC24O1101_signed (1)_yUteCXN.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-29 13:56:26.655946', 1, 1),
(15, 'pdfs/103212-BTMC24O1101_signed (1)_5YNH9j6.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-04-30 11:29:06.133188', 1, 2),
(16, 'pdfs/103212-BTMC24O1101_signed (1)_aS1IXFC.pdf', '103212-BTMC24O1101_signed (1).pdf', '2025-05-01 07:51:24.998617', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) COLLATE latin1_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `auth_group`
--

INSERT INTO `auth_group` (`id`, `name`) VALUES
(8, 'Approver'),
(2, 'ExamAdmin'),
(4, 'Faculty'),
(3, 'HOD'),
(5, 'Student'),
(1, 'SuperAdmin'),
(6, 'Uploader'),
(7, 'Verifier');

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) COLLATE latin1_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add user', 4, 'add_user'),
(14, 'Can change user', 4, 'change_user'),
(15, 'Can delete user', 4, 'delete_user'),
(16, 'Can view user', 4, 'view_user'),
(17, 'Can add content type', 5, 'add_contenttype'),
(18, 'Can change content type', 5, 'change_contenttype'),
(19, 'Can delete content type', 5, 'delete_contenttype'),
(20, 'Can view content type', 5, 'view_contenttype'),
(21, 'Can add session', 6, 'add_session'),
(22, 'Can change session', 6, 'change_session'),
(23, 'Can delete session', 6, 'delete_session'),
(24, 'Can view session', 6, 'view_session'),
(25, 'Can add m_user_profile', 7, 'add_m_user_profile'),
(26, 'Can change m_user_profile', 7, 'change_m_user_profile'),
(27, 'Can delete m_user_profile', 7, 'delete_m_user_profile'),
(28, 'Can view m_user_profile', 7, 'view_m_user_profile'),
(29, 'Can add profile', 8, 'add_profile'),
(30, 'Can change profile', 8, 'change_profile'),
(31, 'Can delete profile', 8, 'delete_profile'),
(32, 'Can view profile', 8, 'view_profile'),
(33, 'Can add uploaded pdf', 13, 'add_uploadedpdf'),
(34, 'Can change uploaded pdf', 13, 'change_uploadedpdf'),
(35, 'Can delete uploaded pdf', 13, 'delete_uploadedpdf'),
(36, 'Can view uploaded pdf', 13, 'view_uploadedpdf'),
(37, 'Can add page annotation', 14, 'add_pageannotation'),
(38, 'Can change page annotation', 14, 'change_pageannotation'),
(39, 'Can delete page annotation', 14, 'delete_pageannotation'),
(40, 'Can view page annotation', 14, 'view_pageannotation');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user`
--

CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL,
  `password` varchar(128) COLLATE latin1_general_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE latin1_general_ci NOT NULL,
  `first_name` varchar(150) COLLATE latin1_general_ci NOT NULL,
  `last_name` varchar(150) COLLATE latin1_general_ci NOT NULL,
  `email` varchar(254) COLLATE latin1_general_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `auth_user`
--

INSERT INTO `auth_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`) VALUES
(1, 'pbkdf2_sha256$260000$etKUdT4GnybJwkOX3aSGwf$DjD+mY6SPXpm9Jhlx6jTtZrzlttVssrZD6nzNAIu410=', '2025-06-16 09:51:09.245551', 0, 'kuldeep', 'Kuldeep', 'Srivastava', 'kuldeep@veritos.in', 0, 1, '2025-04-11 10:04:31.000000'),
(2, 'pbkdf2_sha256$260000$121S3eG3GaITt32a0FImk7$Wc4XX7qVrC5bsuF7QppImY7By5OAy3hS8BpydnbdJhQ=', '2025-06-25 10:17:09.141769', 0, 'Sandeep', 'Sandeep', 'Srivastava', 'sandeep@gmail.com', 0, 1, '2025-04-15 15:41:33.987785'),
(3, 'pbkdf2_sha256$260000$0DHrpTMmHhymouhYLJcKYj$QkMRLQhCHyfZCDR6w+HabEK/xzHE3v4Zb4qOl0hK3N8=', '2025-06-25 10:16:41.274419', 0, 'admin', 'Gourav', 'Mahipal', 'admin@veritos.in', 0, 1, '2025-06-16 09:08:00.272113'),
(4, 'pbkdf2_sha256$260000$fjfoyQcHwILqA0ZSsIQQWn$lrey2v1gwDS9+WuC6lxRvdOWmlo0qvLYU0Et7vdb6Cc=', NULL, 0, 'Atinder', 'Atinder', 'Singh', 'atinder@veritos.in', 0, 1, '2025-06-16 09:52:47.818011'),
(5, 'pbkdf2_sha256$260000$tffCBDIRxQse0XrzuuVtcu$H99yNUDB00Sxk9OCPil8PB+/LA9vMOEbiaLLznfTeWE=', NULL, 0, 'maninder', 'Maninder', 'Singh', 'maninder@veritos.in', 0, 1, '2025-06-16 09:57:45.928500'),
(6, 'pbkdf2_sha256$260000$YBen5hgwNd9NsUHUGp5ivk$nSiHjrG0CjMomyfWhqkYEHUTBIxoodhjv+28n1+6C9M=', NULL, 0, 'ashish', 'Ashish', 'Kumar', 'ashish@veritos.in', 1, 1, '2025-06-16 10:06:53.430780');

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_groups`
--

CREATE TABLE `auth_user_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `auth_user_groups`
--

INSERT INTO `auth_user_groups` (`id`, `user_id`, `group_id`) VALUES
(4, 1, 1),
(15, 2, 4),
(9, 3, 3),
(7, 4, 5),
(8, 5, 5),
(13, 6, 5);

-- --------------------------------------------------------

--
-- Table structure for table `auth_user_user_permissions`
--

CREATE TABLE `auth_user_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `auth_user_user_permissions`
--

INSERT INTO `auth_user_user_permissions` (`id`, `user_id`, `permission_id`) VALUES
(1, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext COLLATE latin1_general_ci DEFAULT NULL,
  `object_repr` varchar(200) COLLATE latin1_general_ci NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext COLLATE latin1_general_ci NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2025-04-14 05:51:49.622385', '1', 'kuldeep', 2, '[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"User permissions\"]}}]', 4, 1);

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `model` varchar(100) COLLATE latin1_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(14, 'annotator', 'pageannotation'),
(13, 'annotator', 'uploadedpdf'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(4, 'auth', 'user'),
(5, 'contenttypes', 'contenttype'),
(6, 'sessions', 'session'),
(10, 'users', 'course'),
(7, 'users', 'm_user_profile'),
(8, 'users', 'profile'),
(11, 'users', 'roles'),
(12, 'users', 'roles_menu'),
(9, 'users', 'year');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `name` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2025-04-11 10:02:39.676272'),
(2, 'auth', '0001_initial', '2025-04-11 10:02:40.730939'),
(3, 'admin', '0001_initial', '2025-04-11 10:02:40.955474'),
(4, 'admin', '0002_logentry_remove_auto_add', '2025-04-11 10:02:40.971570'),
(5, 'admin', '0003_logentry_add_action_flag_choices', '2025-04-11 10:02:41.000017'),
(6, 'contenttypes', '0002_remove_content_type_name', '2025-04-11 10:02:41.043228'),
(7, 'auth', '0002_alter_permission_name_max_length', '2025-04-11 10:02:41.077391'),
(8, 'auth', '0003_alter_user_email_max_length', '2025-04-11 10:02:41.100188'),
(9, 'auth', '0004_alter_user_username_opts', '2025-04-11 10:02:41.110576'),
(10, 'auth', '0005_alter_user_last_login_null', '2025-04-11 10:02:41.161776'),
(11, 'auth', '0006_require_contenttypes_0002', '2025-04-11 10:02:41.161776'),
(12, 'auth', '0007_alter_validators_add_error_messages', '2025-04-11 10:02:41.182103'),
(13, 'auth', '0008_alter_user_username_max_length', '2025-04-11 10:02:41.196343'),
(14, 'auth', '0009_alter_user_last_name_max_length', '2025-04-11 10:02:41.213590'),
(15, 'auth', '0010_alter_group_name_max_length', '2025-04-11 10:02:41.232449'),
(16, 'auth', '0011_update_proxy_permissions', '2025-04-11 10:02:41.243625'),
(17, 'auth', '0012_alter_user_first_name_max_length', '2025-04-11 10:02:41.260736'),
(18, 'sessions', '0001_initial', '2025-04-11 10:02:41.328486'),
(19, 'users', '0001_initial', '2025-04-14 10:20:22.177164'),
(20, 'users', '0002_auto_20250414_1552', '2025-04-14 10:22:34.752849'),
(21, 'annotator', '0001_initial', '2025-04-29 12:32:50.905846');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) COLLATE latin1_general_ci NOT NULL,
  `session_data` longtext COLLATE latin1_general_ci NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('4cungy9cy9s41wut5mfkja76iq4kkak5', '.eJxVjDsOwjAQBe_iGlnx36akzxms9e6GBJAtxUmFuDuKlALaNzPvLTLs25z3zmteSFyFFpffrQA-uR6AHlDvTWKr27oUeSjypF2Ojfh1O92_gxn6fNQYFAI71NZ7MkEP2vmI5FJE5ZkMTV6Fop1JmqcAhYdolFVsU4I4DeLzBeM8N6w:1uR6vV:T_H1hlnuYFREcakVovNQx0qZWAQHehflAGnnsUEXMzs', '2025-06-30 10:18:53.336216'),
('5b7xz7nvu1t49u1h7ssxxmfo4zoo4g1a', '.eJxVjDsOwjAQBe_iGlnx36akzxms9e6GBJAtxUmFuDuKlALaNzPvLTLs25z3zmteSFyFFpffrQA-uR6AHlDvTWKr27oUeSjypF2Ojfh1O92_gxn6fNQYFAI71NZ7MkEP2vmI5FJE5ZkMTV6Fop1JmqcAhYdolFVsU4I4DeLzBeM8N6w:1uUNBl:7A4jx5GH_sRMULy6GkmIizieT40bq6xNsACMsxWkbxY', '2025-07-09 10:17:09.156970'),
('abalb032rtkmawjir7wejaiwusanf67c', '.eJxVjEEOwiAQRe_C2hCmHQp16d4zNMMMSNVAUtqV8e7apAvd_vfef6mJtjVPW4vLNIs6K1Cn3y0QP2LZgdyp3KrmWtZlDnpX9EGbvlaJz8vh_h1kavlbI4TeUO8ImcREGHkQRx12gREYjWdnLXhOMIzGJgMOvRBFBzalgEG9P9zON-U:1u3XTo:52v1ro68c0GgR_SS-scDW3SEK6rSI6A6FuYlyLRSeNU', '2025-04-26 09:48:52.602141'),
('arttee36atlufvxp1pdzdpkua42n2z78', '.eJxVjMEOwiAQRP-FsyFAEcSj934D2e0uUjWQlPZk_Hdp0oPObWbezFtE2NYct8ZLnElchRan3wxhenLZC3pAuVc51bIuM8odkUfb5FiJX7eD_TvI0HJfA2kG32UHZY1JoRtDZ08Q2CbF6JGYiBkxoQpu0NYob7lTzg0XLz5f9os4Dw:1u4g2t:av529QOZXRx0eSoclUmiR7sEQnKoH_b3IzeG7Nxg_IY', '2025-04-29 13:09:47.893215'),
('os3l2e8rpfdxgi67wvxdeynjz23czx9a', '.eJxVjMsOwiAQRf-FtSEMz8Gle7-BAANSNTQp7cr479qkC93ec859sRC3tYVtlCVMxM4M2Ol3SzE_St8B3WO_zTzPfV2mxHeFH3Tw60zleTncv4MWR_vWLioPQmZK3lTyqDJ64xJCLaQVknXeSa2tBG8FCjCAApUlbU3NriJ7fwDAJzZ-:1u4b7c:bIzF7CvSPz0gRhMapERDaTn06nc3ZguZwa7YGNg_-AQ', '2025-04-29 07:54:20.477547'),
('smwfj1zu0ulwo1hz80ldy76c556sa18y', '.eJxVjEEOwiAQRe_C2hAGB6Qu3XuGZoYBqRpISrsy3l2bdKHb_977LzXSupRx7WkeJ1FnZdXhd2OKj1Q3IHeqt6Zjq8s8sd4UvdOur03S87K7fweFevnWeGTPA0AOMiAxxoAgzrOgkWghobXeIARjjfgU2JkcToIOMQXykNX7A9CtNzg:1uAOgv:7KLteYkRkja0i-3EBg7BKgni3XhJ6GWzc0zFytn1LHg', '2025-05-15 07:50:45.433028'),
('twkhtvqiv68ygl4sz3dk4vrqg0xlhnxv', '.eJxVjDsOwjAQBe_iGllZf0hMSc8ZrN31GgeQI8VJhbg7spQC2jcz760i7luJe5M1zkldFKjT70bIT6kdpAfW-6J5qds6k-6KPmjTtyXJ63q4fwcFW-k1WwpuMJ58hpAg5IlzQOcm443nnDI49CJoEVgyktjhzEjEaEYYrfp8AQCzOQ4:1u4g6W:Ea36SfA55hW-HaQ3gokiFAHcFQbXhPGnMvo68NswM28', '2025-04-29 13:13:32.103956'),
('x9w2y3ph53gp6c6buf4af30mjb2bl1kw', '.eJxVjMsOwiAQRf-FtSEFhpdL934DYWCQqoGktCvjv2uTLnR7zzn3xULc1hq2QUuYMzszwU6_G8b0oLaDfI_t1nnqbV1m5LvCDzr4tWd6Xg7376DGUb-1zkoARKnzNGksgGScjUL5opMG60xBtEZJWcCTVoTCOJ8tpIJUjEX2_gDSQjfm:1u7CYT:4GQ7oowkJ5deTp1vfxdFCck9fpad3EP60zX3Y4wOPLY', '2025-05-06 12:16:49.112658'),
('xhmyjhtwtm4kaqr8f804tfwv5d6ak8v6', '.eJxVjD0OwyAUg-_CXCHgAYGO3XMGxOOnpK1ACslU9e4lUoZ2suXP9ps4v2_F7T2tbonkSji5_GbowzPVA8SHr_dGQ6vbuiA9KvSknc4tptft7P4dFN_LWAseeVDApE0wZBg_4aQ1asWYBJkUIBorEuPZgMnRaBMziKyztAEs-XwBqes2uQ:1u4fza:Ij0dlcOVEg_ztp3AHQgKOkycp1YqQWXxvegEupEzA1I', '2025-04-29 13:06:22.728507'),
('zcr0jt5h5zwbrq4wncazqd5yrbypgyc9', '.eJxVjEEOwiAQRe_C2hCGjrS4dO8ZyMAMUjU0Ke3KeHdD0oVu_3vvv1WgfSthb7KGmdVFgTr9bpHSU2oH_KB6X3Ra6rbOUXdFH7Tp28Lyuh7u30GhVnodBTxHzA7BoiEPKTrMkyC4kdiKYKaYBmvO4phcEjNkEG-txcnJqD5f_gs4Vw:1u4g8C:EDa3F0usbpGZK6tbhIEjG8HAEYYqadugJgoUG8waH8c', '2025-04-29 13:15:16.817672');

-- --------------------------------------------------------

--
-- Table structure for table `m_course`
--

CREATE TABLE `m_course` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE latin1_general_ci NOT NULL,
  `code` varchar(10) COLLATE latin1_general_ci DEFAULT NULL,
  `status` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT 'I',
  `added_on` timestamp NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `m_menu`
--

CREATE TABLE `m_menu` (
  `id` int(6) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `parent_id` int(6) DEFAULT NULL,
  `icons` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `urls` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `status` varchar(1) COLLATE latin1_general_ci DEFAULT 'I',
  `added_on` timestamp NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `m_roles`
--

CREATE TABLE `m_roles` (
  `id` int(3) UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `status` varchar(1) COLLATE latin1_general_ci DEFAULT 'Y' COMMENT 'Y=active,N=inactive',
  `added_on` timestamp NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `m_roles_menu`
--

CREATE TABLE `m_roles_menu` (
  `id` int(11) NOT NULL,
  `role_id` int(2) UNSIGNED NOT NULL,
  `menu_id` int(6) UNSIGNED NOT NULL,
  `add_allowed` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT 'Y',
  `updt_allowed` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT 'Y',
  `del_allowed` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT 'Y',
  `view_allowed` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `menu_order` int(11) DEFAULT NULL,
  `added_on` timestamp NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `m_subject`
--

CREATE TABLE `m_subject` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `name` varchar(55) COLLATE latin1_general_ci NOT NULL,
  `code` varchar(10) COLLATE latin1_general_ci DEFAULT NULL,
  `status` varchar(1) COLLATE latin1_general_ci NOT NULL,
  `added_on` timestamp NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `m_year`
--

CREATE TABLE `m_year` (
  `id` int(11) NOT NULL,
  `year` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `status` varchar(1) COLLATE latin1_general_ci NOT NULL DEFAULT 'I',
  `added_on` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_on` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_profile`
--

CREATE TABLE `users_profile` (
  `id` bigint(20) NOT NULL,
  `user_name` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `user_fathers_name` varchar(50) COLLATE latin1_general_ci NOT NULL,
  `user_dob` date NOT NULL,
  `user_pan_no` varchar(10) COLLATE latin1_general_ci DEFAULT NULL,
  `user_designation` varchar(50) COLLATE latin1_general_ci DEFAULT NULL,
  `user_college` varchar(250) COLLATE latin1_general_ci DEFAULT NULL,
  `user_experience` varchar(55) COLLATE latin1_general_ci DEFAULT NULL,
  `user_qualification` varchar(55) COLLATE latin1_general_ci DEFAULT NULL,
  `user_mobile_no` varchar(15) COLLATE latin1_general_ci DEFAULT NULL,
  `user_bank_name` varchar(100) COLLATE latin1_general_ci NOT NULL,
  `user_bank_acnt_no` varchar(18) COLLATE latin1_general_ci NOT NULL,
  `user_bank_ifsc_code` varchar(11) COLLATE latin1_general_ci NOT NULL,
  `user_bank_branch_name` varchar(155) COLLATE latin1_general_ci DEFAULT NULL,
  `created_on` datetime(6) NOT NULL,
  `updated_on` datetime(6) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

--
-- Dumping data for table `users_profile`
--

INSERT INTO `users_profile` (`id`, `user_name`, `user_fathers_name`, `user_dob`, `user_pan_no`, `user_designation`, `user_college`, `user_experience`, `user_qualification`, `user_mobile_no`, `user_bank_name`, `user_bank_acnt_no`, `user_bank_ifsc_code`, `user_bank_branch_name`, `created_on`, `updated_on`, `user_id`) VALUES
(1, 'Kuldeep Kumar Srivstava', 'Suresh Kumar Srivastava', '1987-09-27', 'CGOPS7813P', 'TEACHER', 'ABC COLLEGE', '14 Years', 'B.Tech', '7905682431', 'SBIN', '12345678989', 'SBIN0001236', 'SORAON', '2025-04-14 11:20:47.572078', '2025-04-15 17:01:13.922180', 1),
(2, 'Sandeep Kumar Srivastava', 'Suresh Kumar Srivastava', '1995-03-05', 'DFOPS7813P', 'TEACHER', 'ABC COLLEGE', '14 Years', 'B.Tech', '7905682431', 'SBIN', '12345678989', 'SBIN0001236', 'SORAON', '2025-06-16 08:20:23.822931', '2025-06-16 08:20:23.822931', 2);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `annotator_pageannotation`
--
ALTER TABLE `annotator_pageannotation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `annotator_pageannotation_user_id_pdf_id_page_numb_a221d059_uniq` (`user_id`,`pdf_id`,`page_number`),
  ADD KEY `annotator_pageannota_pdf_id_fe0f4f14_fk_annotator` (`pdf_id`);

--
-- Indexes for table `annotator_uploadedpdf`
--
ALTER TABLE `annotator_uploadedpdf`
  ADD PRIMARY KEY (`id`),
  ADD KEY `annotator_uploadedpdf_user_id_e013a165_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indexes for table `auth_user`
--
ALTER TABLE `auth_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  ADD KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`);

--
-- Indexes for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  ADD KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indexes for table `m_course`
--
ALTER TABLE `m_course`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `m_menu`
--
ALTER TABLE `m_menu`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `m_roles`
--
ALTER TABLE `m_roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `m_roles_menu`
--
ALTER TABLE `m_roles_menu`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_id` (`role_id`,`menu_id`),
  ADD KEY `menu_fk` (`menu_id`);

--
-- Indexes for table `m_subject`
--
ALTER TABLE `m_subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `m_year`
--
ALTER TABLE `m_year`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users_profile`
--
ALTER TABLE `users_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `pan_no` (`user_pan_no`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `annotator_pageannotation`
--
ALTER TABLE `annotator_pageannotation`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `annotator_uploadedpdf`
--
ALTER TABLE `annotator_uploadedpdf`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `auth_user`
--
ALTER TABLE `auth_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `m_course`
--
ALTER TABLE `m_course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `m_menu`
--
ALTER TABLE `m_menu`
  MODIFY `id` int(6) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `m_roles`
--
ALTER TABLE `m_roles`
  MODIFY `id` int(3) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `m_roles_menu`
--
ALTER TABLE `m_roles_menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `m_subject`
--
ALTER TABLE `m_subject`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `m_year`
--
ALTER TABLE `m_year`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_profile`
--
ALTER TABLE `users_profile`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `annotator_pageannotation`
--
ALTER TABLE `annotator_pageannotation`
  ADD CONSTRAINT `annotator_pageannota_pdf_id_fe0f4f14_fk_annotator` FOREIGN KEY (`pdf_id`) REFERENCES `annotator_uploadedpdf` (`id`),
  ADD CONSTRAINT `annotator_pageannotation_user_id_dd909fc4_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `annotator_uploadedpdf`
--
ALTER TABLE `annotator_uploadedpdf`
  ADD CONSTRAINT `annotator_uploadedpdf_user_id_e013a165_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `auth_user_groups`
--
ALTER TABLE `auth_user_groups`
  ADD CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `auth_user_user_permissions`
--
ALTER TABLE `auth_user_user_permissions`
  ADD CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);

--
-- Constraints for table `m_roles_menu`
--
ALTER TABLE `m_roles_menu`
  ADD CONSTRAINT `menu_fk` FOREIGN KEY (`menu_id`) REFERENCES `m_menu` (`id`),
  ADD CONSTRAINT `roles_fk` FOREIGN KEY (`role_id`) REFERENCES `m_roles` (`id`);

--
-- Constraints for table `m_subject`
--
ALTER TABLE `m_subject`
  ADD CONSTRAINT `m_subject_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `m_course` (`id`);

--
-- Constraints for table `users_profile`
--
ALTER TABLE `users_profile`
  ADD CONSTRAINT `users_profile_user_id_2112e78d_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
