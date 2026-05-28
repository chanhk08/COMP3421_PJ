# Pet Shop E-Commerce Platform

This repository contains the source code for a full-stack e-commerce web application for a pet supply store. The project features distinct portals for customers and staff, each with a tailored set of functionalities. It is built using PHP for the backend, MySQL for the database, and vanilla JavaScript for a dynamic frontend experience.

## Key Features

The platform is divided into two main interfaces: a customer-facing storefront and a staff-only management dashboard.

### Customer-Facing Features
*   **Product Catalog:** Browse a wide range of pet products with a clean, grid-based layout.
*   **Advanced Filtering & Search:** Easily find products by name, description, or multi-select category filters for pet type, product type, and life stage.
*   **User Authentication:** Secure user registration and login system.
*   **Shopping Cart:** Add products to a persistent shopping cart, update quantities, or remove items.
*   **Checkout Process:** A simulated payment and checkout process to place orders.
*   **Order History:** View a history of all past orders and check their status.
*   **Order Details:** Access detailed information for each order, including items purchased and shipping information.
*   **Profile Management:** Customers can view and update their personal profile information.

### Staff-Facing Features
*   **Secure Staff Portal:** A separate, secure login for staff members.
*   **Order Management Dashboard:** A comprehensive dashboard to view, search, and filter all user orders by ID, user ID, or status (Pending, Paid, Shipped, Delivered, Cancelled).
*   **Order Status Updates:** Staff can update the status of an order as it progresses through the fulfillment lifecycle.
*   **Product Management:** A full CRUD (Create, Read, Update) interface for managing the product catalog.
*   **Add/Edit Products:** An intuitive form to add new products or edit existing ones, including details like name, price, stock, and category associations.
*   **Staff Profile Management:** Staff can update their own profile information.

## Technology Stack

*   **Backend:** PHP
*   **Database:** MySQL / MariaDB
*   **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules)
*   **Web Server:** Designed to run on an Apache server (e.g., via XAMPP or MAMP).

## Database Schema

The application uses a relational database to manage its data, with key tables including:

*   `users`: Stores user data, including roles (`customer`, `staff`).
*   `items`: The main product catalog.
*   `categories`: Defines product categories, grouped by `group_name` (e.g., 'Pet Type', 'Product Type').
*   `item_categories`: A many-to-many link between items and categories.
*   `cart_items`: Manages items in users' shopping carts.
*   `orders`, `order_items`: Store order history and the specific items within each order.
*   `payments`: Tracks payment information associated with orders.

## Getting Started

To run this project locally, follow these steps.

### Prerequisites
You will need a local web server environment that supports PHP and MySQL. We recommend using [XAMPP](https://www.apachefriends.org/) or [MAMP](https://www.mamp.info/).

### Installation

1.  **Clone the Repository**
    Clone this repository into your web server's root directory (e.g., `htdocs` in XAMPP).
    ```bash
    git clone https://github.com/chanhk08/COMP3421_PJ.git
    ```
    You may want to rename the cloned folder from `chanhk08-comp3421_pj` to something simpler like `petshop`.

2.  **Database Setup**
    *   Start the Apache and MySQL services from your XAMPP/MAMP control panel.
    *   Navigate to `phpMyAdmin` (usually at `http://localhost/phpmyadmin`).
    *   Create a new database named `COMP3421_PJ`.
    *   Select the newly created database and go to the "Import" tab.
    *   Click "Choose File" and select the `DB/COMP3421_PJ.sql` file from this repository.
    *   Click "Go" to execute the SQL script. This will create all the necessary tables and populate them with sample data.

3.  **Database Configuration**
    The database connection is configured in `config/database.php`. The default settings are configured for a standard XAMPP installation with no password for the `root` user. If your setup is different, please update this file accordingly.
    ```php
    $host = 'localhost';
    $db_name = 'COMP3421_PJ';
    $username = 'root';
    $password = ''; // Update if you have a DB password
    ```

4.  **Run the Application**
    *   Open your web browser and navigate to `http://localhost/<your_folder_name>/` (e.g., `http://localhost/petshop/`).
    *   You can register a new user or use the sample accounts included in the database dump.
    *   To access the staff portal, navigate to `http://localhost/<your_folder_name>/login_staff.html`. A sample staff account is provided in the database.
