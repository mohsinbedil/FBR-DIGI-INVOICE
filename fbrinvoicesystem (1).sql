-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 13, 2025 at 06:58 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fbrinvoicesystem`
--

-- --------------------------------------------------------

--
-- Table structure for table `blacklisted_tokens`
--

DROP TABLE IF EXISTS `blacklisted_tokens`;
CREATE TABLE IF NOT EXISTS `blacklisted_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `token` text NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `blacklisted_tokens`
--

INSERT INTO `blacklisted_tokens` (`id`, `token`, `expires_at`, `created_at`) VALUES
(4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZW1wQGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOiJ0ZW1wbyIsImxhc3RfbmFtZSI6IlRlbXAiLCJpYXQiOjE3NjAzNzI1NjQsImV4cCI6MTc2MDM3NjE2NH0.0d9g03d422F2lT1Z8PeZ8OY6X4Uh3aA3BvK-TnTc1Ts', '2025-10-13 22:22:44', '2025-10-13 16:22:58'),
(3, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZW1wQGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOiJ0ZW1wbyIsImxhc3RfbmFtZSI6IlRlbXAiLCJpYXQiOjE3NjAzNzIxOTMsImV4cCI6MTc2MDQ1ODU5M30.OAvopno9kFHiO7lbX34eA7kUx9qJaTsYiPdry9_NkYY', '2025-10-14 21:16:33', '2025-10-13 16:16:33'),
(5, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZW1wQGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOiJ0ZW1wbyIsImxhc3RfbmFtZSI6IlRlbXAiLCJpYXQiOjE3NjAzNzI4ODMsImV4cCI6MTc2MDM3NjQ4M30.P7BvVP69FOUT8uVcgMDFVp1jL3Phq680_ZUx6OQb-zA', '2025-10-13 22:28:03', '2025-10-13 16:28:13'),
(6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwiZW1haWwiOiJUZW1wQGdtYWlsLmNvbSIsImZpcnN0X25hbWUiOiJzYW1wbGUiLCJsYXN0X25hbWUiOiJzYW1wbGUiLCJpYXQiOjE3NjAzODAyODMsImV4cCI6MTc2MDM4Mzg4M30.LTuYCxnmcByfD9KCvedvfXDsJIBKM0bnNS-8ev5EqWc', '2025-10-14 00:31:23', '2025-10-13 18:33:44');

-- --------------------------------------------------------

--
-- Table structure for table `buyer_info`
--

DROP TABLE IF EXISTS `buyer_info`;
CREATE TABLE IF NOT EXISTS `buyer_info` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `NTN` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerBusinessName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerProvince` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerAddress` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyerRegistrationType` enum('Registered','Unregistered') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_buyer_ntn` (`NTN`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `buyer_info`
--

INSERT INTO `buyer_info` (`id`, `NTN`, `buyerBusinessName`, `buyerProvince`, `buyerAddress`, `buyerRegistrationType`, `created_at`, `updated_at`, `uuid`) VALUES
(2, '12345-6', 'ABC Traders  ', 'Punjab', 'Shop #12, Liberty Market, Lahore', 'Registered', '2025-10-12 15:04:00', '2025-10-13 16:37:48', '27cc5316-82ed-4e2b-87c2-600c368418f5'),
(4, '12345-6', 'ABC Traders', 'Punjab', 'Shop #12, Liberty Market, Lahore', 'Registered', '2025-10-13 18:52:40', '2025-10-13 18:52:40', '5d17642f-8968-4186-bb8c-8d498f1c68d4');

-- --------------------------------------------------------

--
-- Table structure for table `company_info`
--

DROP TABLE IF EXISTS `company_info`;
CREATE TABLE IF NOT EXISTS `company_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyName` varchar(255) NOT NULL,
  `business_Email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `NTN` varchar(50) NOT NULL,
  `province` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `uuid` char(36) NOT NULL,
  `STRN` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `company_info`
--

INSERT INTO `company_info` (`id`, `companyName`, `business_Email`, `NTN`, `province`, `address`, `created_at`, `updated_at`, `uuid`, `STRN`) VALUES
(3, 'TechNova Pvt Ltd', 'info@technova.com', '1234567-8', 'Sindh', 'Plot 46, I.I. Chundrigar Road, Karachi', '2025-10-13 16:35:57', '2025-10-13 18:37:49', '28790d63-7865-4fd3-ac9c-0b3da54dbcbc', 'STRN-998877');

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_type` enum('Sale Invoice','Debit Note') COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_date` date NOT NULL,
  `seller_ntn_cnic` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_business_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `seller_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_ntn_cnic` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `buyer_business_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_province` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `buyer_registration_type` enum('Registered','Unregistered') COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_ref_no` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scenario_id` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_value` decimal(18,2) DEFAULT '0.00',
  `total_tax` decimal(18,2) DEFAULT '0.00',
  `status` enum('pending','submitted','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_by` bigint DEFAULT NULL,
  `updated_by` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_invoice_date` (`invoice_date`),
  KEY `idx_seller_ntn` (`seller_ntn_cnic`),
  KEY `idx_buyer_ntn` (`buyer_ntn_cnic`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `uuid`, `invoice_type`, `invoice_date`, `seller_ntn_cnic`, `seller_business_name`, `seller_province`, `seller_address`, `buyer_ntn_cnic`, `buyer_business_name`, `buyer_province`, `buyer_address`, `buyer_registration_type`, `invoice_ref_no`, `scenario_id`, `total_value`, `total_tax`, `status`, `created_by`, `updated_by`, `created_at`, `updated_at`) VALUES
(26, 'bd16699d-b13c-4fc4-9a14-94cef2307b72', '', '2025-10-13', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', 'INV-001', 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 17:46:00', '2025-10-13 17:46:00'),
(27, 'c81ebc69-3243-4afb-84f6-d3ad13921507', '', '2025-10-13', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', 'INV-001', 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 17:46:56', '2025-10-13 17:46:56'),
(28, '8cfecef5-1cda-40d6-bca9-8f140f037fd6', '', '2025-10-13', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', 'INV-001', 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 18:07:19', '2025-10-13 18:07:19'),
(29, '5d3f58ce-5f1a-407c-ad93-f8931c4ccebd', '', '2025-10-13', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', NULL, 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 18:07:42', '2025-10-13 18:07:42'),
(30, '477868a8-c87f-4556-aac3-8d701dedea27', 'Sale Invoice', '2025-04-21', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', NULL, 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 18:08:12', '2025-10-13 18:08:12'),
(31, 'd47473b3-99be-499d-aaba-6e48a140de5c', 'Sale Invoice', '2025-04-21', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', NULL, 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 18:42:57', '2025-10-13 18:42:57'),
(32, '3ba8c1a0-8271-4fe1-81b5-88d727bfdb45', 'Sale Invoice', '2025-04-21', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', NULL, 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 18:43:19', '2025-10-13 18:43:19'),
(33, '3169b2a7-9809-4c64-a9a0-2d9b56f34c57', 'Sale Invoice', '2025-04-21', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', NULL, 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 18:43:52', '2025-10-13 18:43:52'),
(34, 'a2188d0d-76c8-43e2-8883-1792a4876494', 'Sale Invoice', '2025-04-21', '0786909', 'Company 8', 'Sindh', 'Karachi', '1000000000000', 'FERTILIZER MANUFAC IRS NEW', 'Sindh', 'Karachi', 'Unregistered', NULL, 'SN001', 0.00, 0.00, 'pending', NULL, NULL, '2025-10-13 18:54:28', '2025-10-13 18:54:28');

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `invoice_id` bigint NOT NULL,
  `uuid` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hs_code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate_desc` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rate_percent` decimal(5,2) NOT NULL DEFAULT '0.00',
  `uom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `total_values` decimal(18,2) NOT NULL DEFAULT '0.00',
  `value_sales_excl_st` decimal(18,2) NOT NULL DEFAULT '0.00',
  `fixed_notified_value_or_retail_price` decimal(18,2) DEFAULT '0.00',
  `sales_tax_applicable` decimal(18,2) NOT NULL DEFAULT '0.00',
  `sales_tax_withheld_at_source` decimal(18,2) DEFAULT '0.00',
  `extra_tax` decimal(18,2) DEFAULT '0.00',
  `further_tax` decimal(18,2) DEFAULT '0.00',
  `sro_schedule_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fed_payable` decimal(18,2) DEFAULT '0.00',
  `discount` decimal(18,2) DEFAULT '0.00',
  `sale_type` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Goods at standard rate (default)',
  `sro_item_serial_no` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `idx_invoice_id` (`invoice_id`),
  KEY `idx_hs_code` (`hs_code`)
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `uuid`, `hs_code`, `product_description`, `rate_desc`, `rate_percent`, `uom`, `quantity`, `total_values`, `value_sales_excl_st`, `fixed_notified_value_or_retail_price`, `sales_tax_applicable`, `sales_tax_withheld_at_source`, `extra_tax`, `further_tax`, `sro_schedule_no`, `fed_payable`, `discount`, `sale_type`, `sro_item_serial_no`, `created_at`, `updated_at`) VALUES
(42, 26, '', '0101.2100', 'Product 1 of Invoice 1', '', 0.00, 'Numbers', 2.0000, 1180.00, 0.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 17:46:00', '2025-10-13 17:46:00'),
(76, 31, '48d20a81-689d-4598-a87a-553a556a4963', '0101.2100', 'product Description', '15%', 15.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:42:58', '2025-10-13 18:42:58'),
(77, 31, 'e52dfdee-e535-4f84-9ccb-7898e10be78c', '0101.2100', 'product Description', '18%', 18.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:42:58', '2025-10-13 18:42:58'),
(78, 32, '1b9d5c8d-180b-4eb4-9800-9677a3b4012e', '0101.2100', 'product Description', '15%', 15.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:43:19', '2025-10-13 18:43:19'),
(79, 32, '13446f74-02c1-4122-8dd0-7ce53e2749db', '0101.2100', 'product Description', '18%', 18.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:43:19', '2025-10-13 18:43:19'),
(80, 33, 'ac499e5c-ca47-4959-b4d3-1c9090cd9bf8', '0101.2100', 'product Description', '15%', 15.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:43:52', '2025-10-13 18:43:52'),
(81, 33, 'd035ca36-c008-4305-9178-e6181030ed49', '0101.2100', 'product Description', '18%', 18.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:43:52', '2025-10-13 18:43:52'),
(82, 34, '2bfc035a-7470-4a2b-be53-c4e470ba56cd', '0101.2100', 'product Description', '15%', 15.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:54:28', '2025-10-13 18:54:28'),
(83, 34, 'a96046d0-cd26-4c36-8c5d-6d435842d2da', '0101.2100', 'product Description', '18%', 18.00, 'Numbers', 1.0000, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', NULL, '2025-10-13 18:54:28', '2025-10-13 18:54:28');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
CREATE TABLE IF NOT EXISTS `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `hsCode` varchar(20) NOT NULL,
  `productDescription` text,
  `rate` varchar(10) DEFAULT NULL,
  `uoM` varchar(50) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `totalValues` decimal(12,2) DEFAULT NULL,
  `valueSalesExcludingST` decimal(12,2) DEFAULT NULL,
  `fixedNotifiedValueOrRetailPrice` decimal(12,2) DEFAULT NULL,
  `salesTaxApplicable` decimal(12,2) DEFAULT NULL,
  `salesTaxWithheldAtSource` decimal(12,2) DEFAULT NULL,
  `extraTax` decimal(12,2) DEFAULT NULL,
  `furtherTax` decimal(12,2) DEFAULT NULL,
  `sroScheduleNo` varchar(50) DEFAULT NULL,
  `fedPayable` decimal(12,2) DEFAULT NULL,
  `discount` decimal(12,2) DEFAULT NULL,
  `saleType` varchar(100) DEFAULT NULL,
  `sroItemSerialNo` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `uuid`, `hsCode`, `productDescription`, `rate`, `uoM`, `quantity`, `totalValues`, `valueSalesExcludingST`, `fixedNotifiedValueOrRetailPrice`, `salesTaxApplicable`, `salesTaxWithheldAtSource`, `extraTax`, `furtherTax`, `sroScheduleNo`, `fedPayable`, `discount`, `saleType`, `sroItemSerialNo`, `created_at`, `updated_at`) VALUES
(5, 'd59f723b-03ce-4374-8e08-e1f88e9e117e', '2025.0056', 'product Description', '18%', 'Numbers', 1.00, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', '', '2025-10-13 16:53:40', '2025-10-13 17:08:55'),
(4, '4d1ebbc0-81c0-4749-ae88-d76e27a9934c', '2025.000', 'product Description', '18%', 'Numbers', 1.00, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', '', '2025-10-13 16:53:21', NULL),
(7, 'a50f2cb6-4a47-4c22-9b91-482cddf53c12', '2025.0057', 'product Description', '18%', 'Numbers', 1.00, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', '', '2025-10-13 17:19:56', NULL),
(9, 'ac3b89c9-676e-4ae8-86ba-6de8bb4ec566', '2025.0058', 'product Description', '18%', 'Numbers', 1.00, 1180.00, 1000.00, 0.00, 180.00, 0.00, 0.00, 120.00, 'SRO123', 0.00, 0.00, 'Goods at standard rate (default)', '', '2025-10-13 18:53:34', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uuid` char(36) NOT NULL,
  `last_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `first_name` varchar(100) NOT NULL,
  `phone` int NOT NULL,
  `created_by` bigint NOT NULL,
  `updated_by` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uuid`, `last_name`, `email`, `password`, `status`, `created_at`, `updated_at`, `first_name`, `phone`, `created_by`, `updated_by`) VALUES
(8, 'c7189fec-6ee9-4552-a381-158389947657', 'sample', 'Temp@gmail.com', '$2b$10$.fMl3Vu9Cvj1b2mUn37BR.CtsQU50B45cyBGdTcsS8VCeDisJjPvG', 'active', '2025-10-13 18:26:57', '2025-10-13 18:32:57', 'sample', 2147483647, 5, 5),
(6, '1b42856e-c2d6-488f-9a52-0b14887e0b8e', 'sample', 'samplse@gmail.com', '$2b$12$PQZa4ezA6CEVB.fsye1p1uXa4G6c3p8q5pSC1iy8h9uEhrUrI4zpC', 'active', '2025-10-13 16:17:00', '2025-10-13 16:17:00', 'sample', 2147483647, 1, 1),
(5, '52aaf638-1fc2-4087-a24e-4c3dba9d2f96', 'sample', 'sample@gmail.com', '$2b$10$89EamjcQNGCQMq1aTv3.buuasUPbU94wKJXwHtXHsT1sX0z9dNRiW', 'active', '2025-10-13 15:42:42', '2025-10-13 17:45:07', 'sample', 2147483647, 1, 1),
(7, 'b01e9f12-a5ee-4332-89de-f5ea4639c1db', 'sample', 'samplswe@gmail.com', '$2b$12$q87yPX0SdL8foL2MopvduuVA5yNeM/kZmVvYDwuoMDKtOij/cz.qW', 'active', '2025-10-13 16:23:40', '2025-10-13 16:23:40', 'sample', 2147483647, 1, 1),
(9, 'ab49f47f-50db-4a76-b20b-b3c0698c2be6', 'Testing', 'test@gmail.com', '$2b$12$LAgMmcD.3X.ieDrUi1WLfOQvUDEX0k5jHjVSS.RF20Dh5afw7iyrW', 'inactive', '2025-10-13 18:31:53', '2025-10-13 18:36:34', 'sample ', 2147483647, 8, 8);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `fk_invoice_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
