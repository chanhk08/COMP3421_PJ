-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- 主機： localhost
-- 產生時間： 2025 年 11 月 18 日 18:32
-- 伺服器版本： 10.4.28-MariaDB
-- PHP 版本： 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `COMP3421_PJ`
--

-- --------------------------------------------------------

--
-- 資料表結構 `cart_items`
--

CREATE TABLE `cart_items` (
  `cart_item_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL CHECK (`quantity` > 0),
  `added_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `cart_items`
--

INSERT INTO `cart_items` (`cart_item_id`, `user_id`, `item_id`, `quantity`, `added_at`) VALUES
(58, 4, 1, 1, '2025-11-17 23:44:47'),
(59, 4, 7, 1, '2025-11-17 23:45:27'),
(60, 4, 3, 1, '2025-11-18 02:01:15');

-- --------------------------------------------------------

--
-- 資料表結構 `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `group_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `description`, `group_name`) VALUES
(1, 'Dog', NULL, 'Pet Type'),
(2, 'Cat', NULL, 'Pet Type'),
(3, 'Small Pet', NULL, 'Pet Type'),
(4, 'Food', NULL, 'Product Type'),
(5, 'Treats', NULL, 'Product Type'),
(6, 'Health', NULL, 'Product Type'),
(7, 'Grooming', NULL, 'Product Type'),
(8, 'Toys', NULL, 'Product Type'),
(9, 'Supplies', NULL, 'Product Type'),
(10, 'Puppy / Kitten', NULL, 'Life Stage'),
(11, 'Adult', NULL, 'Life Stage'),
(12, 'Senior', NULL, 'Life Stage');

-- --------------------------------------------------------

--
-- 資料表結構 `items`
--

CREATE TABLE `items` (
  `item_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `available` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `items`
--

INSERT INTO `items` (`item_id`, `name`, `description`, `price`, `stock_quantity`, `image_url`, `created_at`, `available`) VALUES
(1, 'Brand A Premium Dog Food', 'A balanced, all-natural dog food for adult dogs.', 550.00, 116, 'images/dog_food_1.jpg', '2025-11-15 00:51:55', 1),
(2, 'Durable Chew Toy for 22222', 'An extra-tough chew toy designed for aggressive chewers.', 121.00, 10, 'images/dog_toy_1.jpg', '2025-11-15 00:51:55', 1),
(3, 'Gentle Puppy Shampoo', 'A tear-free and gentle shampoo perfect for puppies.', 95.00, 107, 'images/puppy_shampoo_1.jpg', '2025-11-15 00:51:55', 1),
(4, 'Senior Dog Joint Support', 'Health supplement to support joint health in older dogs.', 250.00, 601, 'images/dog_health_1.jpg', '2025-11-15 00:51:55', 1),
(5, 'Natural Dental Chews for Dogs', 'Helps reduce plaque and tartar while freshening breath.', 85.00, 122, 'images/dog_treats_1.jpg', '2025-11-15 00:51:55', 1),
(6, 'Adjustable Dog Harness', 'A comfortable and secure harness for daily walks.', 220.00, 93, 'images/dog_supplies_1.jpg', '2025-11-15 00:51:55', 1),
(7, 'Grain-Free Puppy Food', 'Specially formulated for the nutritional needs of growing puppies.', 320.00, 70, 'images/dog_food_2.jpg', '2025-11-15 00:51:55', 1),
(8, 'Waterproof Dog Bed', 'An easy-to-clean, comfortable bed for dogs of all sizes.', 450.00, 43, 'images/dog_supplies_2.jpg', '2025-11-15 00:51:55', 1),
(9, 'Ocean Fish Cat Food1', 'Grain-free wet food made with real ocean fish for adult cats.', 25.00, 201, 'images/cat_food_1.jpg', '2025-11-15 00:51:55', 1),
(10, 'Interactive Feather Wand', 'An interactive toy to stimulate your cat\'s hunting instincts.', 70.00, 120, 'images/cat_toy_1.jpg', '2025-11-15 00:51:55', 1),
(11, 'Kitten Milk Replacer', 'A complete food source for orphaned or rejected kittens.', 180.00, 50, 'images/kitten_milk_1.jpg', '2025-11-15 00:51:55', 1),
(12, 'Catnip Spray', 'A potent, all-natural catnip spray to attract and entertain your cat.', 60.00, 180, 'images/cat_treats_1.jpg', '2025-11-15 00:51:55', 1),
(13, 'Self-Cleaning Litter Box', 'An automatic litter box that does the scooping for you.', 1200.00, 0, 'images/cat_supplies_1.jpg', '2025-11-15 00:51:55', 1),
(14, 'Hairball Control Cat Treats', 'Crunchy treats that help reduce hairball formation.', 75.00, 110, 'images/cat_health_1.jpg', '2025-11-15 00:51:55', 1),
(15, 'Timothy Hay for Small Pets', 'High-fiber, all-natural hay for rabbits and guinea pigs.', 110.00, 90, 'images/small_pet_hay_1.jpg', '2025-11-15 00:51:55', 1),
(16, 'Hamster Cage with Tunnels', 'A multi-level hamster cage with fun tubes and a running wheel.', 350.00, 30, 'images/small_pet_supplies_1.jpg', '2025-11-15 00:51:55', 1);

-- --------------------------------------------------------

--
-- 資料表結構 `item_categories`
--

CREATE TABLE `item_categories` (
  `item_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `item_categories`
--

INSERT INTO `item_categories` (`item_id`, `category_id`) VALUES
(2, 2),
(2, 3),
(2, 8),
(3, 1),
(3, 2),
(3, 3),
(3, 7),
(4, 1),
(5, 1),
(6, 1),
(9, 2),
(9, 3),
(9, 4),
(12, 2),
(12, 5),
(15, 3),
(15, 4);

-- --------------------------------------------------------

--
-- 資料表結構 `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `recipient_name` varchar(255) NOT NULL,
  `recipient_phone` varchar(50) NOT NULL,
  `shipping_address` varchar(255) NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_postal_code` varchar(20) NOT NULL,
  `remark` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `order_date`, `total_amount`, `status`, `recipient_name`, `recipient_phone`, `shipping_address`, `shipping_city`, `shipping_postal_code`, `remark`) VALUES
(7, 4, '2025-11-15 04:54:17', 4840.00, 'paid', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123', ''),
(8, 4, '2025-11-15 04:54:30', 4840.00, 'paid', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123we', ''),
(9, 4, '2025-11-15 04:54:32', 4840.00, 'delivered', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123we', ''),
(10, 4, '2025-11-15 04:55:52', 4840.00, 'cancelled', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123we', ''),
(11, 4, '2025-11-15 04:56:01', 4840.00, 'cancelled', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123', ''),
(12, 4, '2025-11-15 04:56:02', 4840.00, 'delivered', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123', ''),
(13, 4, '2025-11-15 04:58:16', 4840.00, 'delivered', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '12312', ''),
(14, 4, '2025-11-15 05:13:02', 4840.00, 'delivered', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '1231123', 'hhhhhhhhh'),
(15, 4, '2025-11-15 05:33:36', 4840.00, 'delivered', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123', ''),
(16, 4, '2025-11-15 05:35:54', 4840.00, 'shipped', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123', ''),
(17, 4, '2025-11-15 05:36:07', 4840.00, 'cancelled', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '213123', ''),
(18, 4, '2025-11-15 07:16:13', 695.00, 'cancelled', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123213', ''),
(19, 4, '2025-11-15 07:18:14', 380.00, 'delivered', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123', 'eeee'),
(20, 4, '2025-11-15 21:27:16', 1210.00, 'cancelled', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '231312', ''),
(21, 4, '2025-11-17 20:59:40', 150000.00, 'cancelled', 'Chan Yu Hin', '69762799', 'Hk', '九龍灣', '123123', '444');

-- --------------------------------------------------------

--
-- 資料表結構 `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price_per_item` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `item_id`, `quantity`, `price_per_item`) VALUES
(12, 7, 3, 9, 95.00),
(13, 7, 1, 5, 550.00),
(14, 7, 8, 1, 450.00),
(15, 7, 2, 4, 120.00),
(16, 7, 5, 1, 85.00),
(17, 7, 6, 1, 220.00),
(18, 8, 3, 9, 95.00),
(19, 8, 1, 5, 550.00),
(20, 8, 8, 1, 450.00),
(21, 8, 2, 4, 120.00),
(22, 8, 5, 1, 85.00),
(23, 8, 6, 1, 220.00),
(24, 9, 3, 9, 95.00),
(25, 9, 1, 5, 550.00),
(26, 9, 8, 1, 450.00),
(27, 9, 2, 4, 120.00),
(28, 9, 5, 1, 85.00),
(29, 9, 6, 1, 220.00),
(30, 10, 3, 9, 95.00),
(31, 10, 1, 5, 550.00),
(32, 10, 8, 1, 450.00),
(33, 10, 2, 4, 120.00),
(34, 10, 5, 1, 85.00),
(35, 10, 6, 1, 220.00),
(36, 11, 3, 9, 95.00),
(37, 11, 1, 5, 550.00),
(38, 11, 8, 1, 450.00),
(39, 11, 2, 4, 120.00),
(40, 11, 5, 1, 85.00),
(41, 11, 6, 1, 220.00),
(42, 12, 3, 9, 95.00),
(43, 12, 1, 5, 550.00),
(44, 12, 8, 1, 450.00),
(45, 12, 2, 4, 120.00),
(46, 12, 5, 1, 85.00),
(47, 12, 6, 1, 220.00),
(48, 13, 3, 9, 95.00),
(49, 13, 1, 5, 550.00),
(50, 13, 8, 1, 450.00),
(51, 13, 2, 4, 120.00),
(52, 13, 5, 1, 85.00),
(53, 13, 6, 1, 220.00),
(54, 14, 3, 9, 95.00),
(55, 14, 1, 5, 550.00),
(56, 14, 8, 1, 450.00),
(57, 14, 2, 4, 120.00),
(58, 14, 5, 1, 85.00),
(59, 14, 6, 1, 220.00),
(60, 15, 3, 9, 95.00),
(61, 15, 1, 5, 550.00),
(62, 15, 8, 1, 450.00),
(63, 15, 2, 4, 120.00),
(64, 15, 5, 1, 85.00),
(65, 15, 6, 1, 220.00),
(66, 16, 3, 9, 95.00),
(67, 16, 1, 5, 550.00),
(68, 16, 8, 1, 450.00),
(69, 16, 2, 4, 120.00),
(70, 16, 5, 1, 85.00),
(71, 16, 6, 1, 220.00),
(72, 17, 3, 9, 95.00),
(73, 17, 1, 5, 550.00),
(74, 17, 8, 1, 450.00),
(75, 17, 2, 4, 120.00),
(76, 17, 5, 1, 85.00),
(77, 17, 6, 1, 220.00),
(78, 18, 9, 1, 25.00),
(79, 18, 1, 1, 550.00),
(80, 18, 2, 1, 120.00),
(81, 19, 3, 4, 95.00),
(82, 20, 2, 10, 121.00),
(83, 21, 4, 600, 250.00);

-- --------------------------------------------------------

--
-- 資料表結構 `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('completed','pending','failed') NOT NULL DEFAULT 'pending',
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `payments`
--

INSERT INTO `payments` (`payment_id`, `order_id`, `payment_method`, `transaction_id`, `amount`, `status`, `payment_date`) VALUES
(9, 7, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 04:54:17'),
(10, 8, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 04:54:30'),
(11, 9, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 04:54:32'),
(12, 10, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 04:55:52'),
(13, 11, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 04:56:01'),
(14, 12, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 04:56:02'),
(15, 13, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 04:58:16'),
(16, 14, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 05:13:02'),
(17, 15, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 05:33:36'),
(18, 16, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 05:35:54'),
(19, 17, 'credit_card', NULL, 4840.00, 'completed', '2025-11-15 05:36:07'),
(20, 18, 'credit_card', NULL, 695.00, 'completed', '2025-11-15 07:16:13'),
(21, 19, 'credit_card', NULL, 380.00, 'completed', '2025-11-15 07:18:14'),
(22, 20, 'credit_card', NULL, 1210.00, 'completed', '2025-11-15 21:27:16'),
(23, 21, 'credit_card', NULL, 150000.00, 'completed', '2025-11-17 20:59:40');

-- --------------------------------------------------------

--
-- 資料表結構 `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `role` enum('customer','staff','admin') NOT NULL DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- 傾印資料表的資料 `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `email`, `full_name`, `address`, `phone_number`, `role`, `created_at`) VALUES
(1, 'john_doe', '$2y$10$K.A9ZJ.N2aJ5a/9j/9jK.u0l/3jL.o5i/3jK.u0l/3jL.o5i/3jK.', 'john@example.com', 'John Doe', '123 Main St, Kowloon, Hong Kong', '98765432', 'customer', '2025-10-28 01:29:40'),
(2, 'jane_smith', '$2y$10$K.A9ZJ.N2aJ5a/9j/9jK.u0l/3jL.o5i/3jK.u0l/3jL.o5i/3jK.', 'jane@example.com', 'Jane Smith', '456 Oak Ave, Central, Hong Kong', '65432109', 'customer', '2025-10-28 01:29:40'),
(3, 'admin_user', '$2y$10$K.A9ZJ.N2aJ5a/9j/9jK.u0l/3jL.o5i/3jK.u0l/3jL.o5i/3jK.', 'admin@yourstore.com', 'Super Admin', '1 Admin Road, Hong Kong', '55558888', 'admin', '2025-10-28 01:29:40'),
(4, 'chanhk08', '$2y$10$nVBEGhDcUVeOFDFxnynxL.2HoQTehuFomNGktkwSjS1agjRNWv3n.', 'chanhk08@yahoo.com.hk', 'HinC', '2312321321wqee888', '12345678', 'staff', '2025-10-28 02:26:06');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`cart_item_id`),
  ADD UNIQUE KEY `user_item_unique` (`user_id`,`item_id`),
  ADD KEY `item_id` (`item_id`);

--
-- 資料表索引 `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- 資料表索引 `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`);

--
-- 資料表索引 `item_categories`
--
ALTER TABLE `item_categories`
  ADD PRIMARY KEY (`item_id`,`category_id`),
  ADD KEY `category_id` (`category_id`);

--
-- 資料表索引 `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- 資料表索引 `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- 資料表索引 `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `order_id` (`order_id`);

--
-- 資料表索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `cart_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `items`
--
ALTER TABLE `items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `item_categories`
--
ALTER TABLE `item_categories`
  ADD CONSTRAINT `item_categories_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `item_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE;

--
-- 資料表的限制式 `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- 資料表的限制式 `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`);

--
-- 資料表的限制式 `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
