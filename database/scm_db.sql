show databases;
create database scm_db;
use scm_db;
CREATE TABLE Users (
          user_id INT PRIMARY KEY NOT NULL,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('Admin', 'Supplier', 'Manufacturer', 'Warehouse', 'Customer') NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

CREATE TABLE Supplier (
          supplier_id INT PRIMARY KEY NOT NULL,
          supplier_name VARCHAR(100) NOT NULL,
          phone_number VARCHAR(15),
          contact_person VARCHAR(100),
          city VARCHAR(100),
          postal_code VARCHAR(10),
          rating DECIMAL(3,2) CHECK (rating BETWEEN 0 AND 5)
      );

CREATE TABLE Manufacturer (
          manufacturer_id INT PRIMARY KEY NOT NULL,
          manufacturer_name VARCHAR(100) NOT NULL,
          phone_number VARCHAR(15),
          city VARCHAR(100),
          postal_code VARCHAR(10),
          production_capacity INT,
          license_number VARCHAR(50)
      );

CREATE TABLE Warehouse (
          warehouse_id INT PRIMARY KEY NOT NULL,
          warehouse_name VARCHAR(100) NOT NULL,
          city VARCHAR(100),
          postal_code VARCHAR(10),
          capacity INT,
          current_utilization INT
      );

CREATE TABLE Customer (
          customer_id INT PRIMARY KEY NOT NULL,
          customer_name VARCHAR(100) NOT NULL,
          phone_number VARCHAR(15),
          customer_type ENUM('Retail', 'Wholesale', 'Distributor', 'Online', 'Export') NOT NULL,
          city VARCHAR(100),
          postal_code VARCHAR(10)
      ); 

CREATE TABLE Product (
          product_id INT PRIMARY KEY NOT NULL,
          product_name VARCHAR(100) NOT NULL,
          product_desc VARCHAR(255),
          unit_price DECIMAL(10,2) NOT NULL,
          quantity_available INT NOT NULL,
          category VARCHAR(100),
          supplier_id INT,            -- reference to Supplier
          manufacturer_id INT         -- reference to Manufacturer
      );  

CREATE TABLE Shipment (
          shipment_id INT PRIMARY KEY NOT NULL,
          carrier_name VARCHAR(100),
          transport_mode VARCHAR(50),
          shipping_cost DECIMAL(10,2),
          status VARCHAR(50),
          warehouse_id INT
      ); 

CREATE TABLE Payment (
          payment_id INT PRIMARY KEY NOT NULL,
          payment_mode VARCHAR(50) NOT NULL,
          status VARCHAR(50) NOT NULL
      );

CREATE TABLE Orders (
          order_id INT PRIMARY KEY NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          ordered_item VARCHAR(150) NOT NULL,
          customer_id INT,
          shipment_id INT,
          payment_id INT
      );   

CREATE TABLE Role_Permissions (
          role ENUM('Admin', 'Supplier', 'Manufacturer', 'Warehouse', 'Customer'),
          entity_name VARCHAR(50),
          can_view BOOLEAN DEFAULT TRUE,
          can_edit BOOLEAN DEFAULT FALSE,
          can_delete BOOLEAN DEFAULT FALSE,
          PRIMARY KEY (role, entity_name)
      );    

ALTER TABLE Product
      ADD CONSTRAINT fk_product_supplier
          FOREIGN KEY (supplier_id) REFERENCES Supplier(supplier_id)
          ON UPDATE CASCADE ON DELETE SET NULL,
      ADD CONSTRAINT fk_product_manufacturer
          FOREIGN KEY (manufacturer_id) REFERENCES Manufacturer(manufacturer_id)
          ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE Shipment
      ADD CONSTRAINT fk_shipment_warehouse
          FOREIGN KEY (warehouse_id) REFERENCES Warehouse(warehouse_id)
          ON UPDATE CASCADE ON DELETE SET NULL;   

ALTER TABLE Orders
      ADD CONSTRAINT fk_orders_customer
          FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
          ON UPDATE CASCADE ON DELETE SET NULL,
      ADD CONSTRAINT fk_orders_shipment
          FOREIGN KEY (shipment_id) REFERENCES Shipment(shipment_id)
          ON UPDATE CASCADE ON DELETE SET NULL,
      ADD CONSTRAINT fk_orders_payment
          FOREIGN KEY (payment_id) REFERENCES Payment(payment_id)
          ON UPDATE CASCADE ON DELETE SET NULL;    

-- Populating the Supplier Table
INSERT INTO `Supplier` (`supplier_id`, `supplier_name`, `phone_number`, `contact_person`, `city`, `postal_code`, `rating`) VALUES
(101, 'Quantum Chips Inc.', '9876543210', 'Rohan Sharma', 'Bengaluru', '560001', 4.50),
(102, 'DisplayTech Solutions', '9876543211', 'Priya Singh', 'Chennai', '600001', 4.80),
(103, 'Apex Batteries Ltd.', '9876543212', 'Ankit Verma', 'Pune', '411001', 4.20),
(104, 'Connectors & Co.', '9876543213', 'Sneha Reddy', 'Hyderabad', '500001', 4.00),
(105, 'Silicon Wafer Co.', '9876543214', 'Vikram Rao', 'Bengaluru', '560002', 4.90),
(106, 'Optics Innovations', '9876543215', 'Meera Iyer', 'Chennai', '600002', 4.60),
(107, 'SoundWave Audio', '9876543216', 'Arjun Mehta', 'Mumbai', '400001', 4.30),
(108, 'CaseCrafters', '9876543217', 'Diya Patel', 'Ahmedabad', '380001', 3.90),
(109, 'PowerCore Chargers', '9876543218', 'Karan Gupta', 'Delhi', '110001', 4.70),
(110, 'Memory Lane Storage', '9876543219', 'Nisha Desai', 'Pune', '411002', 4.40);

-- Populating the Manufacturer Table
INSERT INTO `Manufacturer` (`manufacturer_id`, `manufacturer_name`, `phone_number`, `city`, `postal_code`, `production_capacity`, `license_number`) VALUES
(201, 'Stellar Mobiles', '8765432109', 'Noida', '201301', 50000, 'MFG-STLR-9871'),
(202, 'Orion Devices', '8765432108', 'Sriperumbudur', '602105', 75000, 'MFG-ORIN-6542'),
(203, 'Nexus Gadgets', '8765432107', 'Gurugram', '122001', 60000, 'MFG-NEXS-3421'),
(204, 'Aether Electronics', '8765432106', 'Pune', '411014', 45000, 'MFG-AETH-7893'),
(205, 'Nova Technologies', '8765432105', 'Hyderabad', '500081', 80000, 'MFG-NOVA-4564'),
(206, 'Pinnacle Electronics', '8765432104', 'Mumbai', '400072', 30000, 'MFG-PNCL-1235'),
(207, 'Horizon Mobile', '8765432103', 'Bengaluru', '560100', 90000, 'MFG-HRZN-9086'),
(208, 'Evolve Tech', '8765432102', 'Chennai', '600096', 55000, 'MFG-EVLV-5437'),
(209, 'Quantum Works', '8765432101', 'Delhi', '110044', 25000, 'MFG-QWKS-2108'),
(210, 'Vertex Assembly', '8765432100', 'Pune', '411057', 100000, 'MFG-VRTX-8769');

-- Populating the Warehouse Table
INSERT INTO `Warehouse` (`warehouse_id`, `warehouse_name`, `city`, `postal_code`, `capacity`, `current_utilization`) VALUES
(301, 'North Delhi Logistics Hub', 'Delhi', '110085', 100000, 75000),
(302, 'Mumbai West Cargo Center', 'Mumbai', '400093', 150000, 120000),
(303, 'Bengaluru Tech Park Storage', 'Bengaluru', '560066', 200000, 180000),
(304, 'Chennai Portside Warehouse', 'Chennai', '600013', 120000, 90000),
(305, 'Hyderabad Hi-Tech City Vault', 'Hyderabad', '500081', 180000, 150000),
(306, 'Pune Central Distribution', 'Pune', '411037', 90000, 60000),
(307, 'Kolkata East Depot', 'Kolkata', '700156', 80000, 50000),
(308, 'Ahmedabad Industrial Storage', 'Ahmedabad', '382445', 70000, 65000),
(309, 'Gurugram Express Hub', 'Gurugram', '122017', 110000, 95000),
(310, 'Noida Electronics Warehouse', 'Noida', '201309', 130000, 115000);

-- Populating the Customer Table
INSERT INTO `Customer` (`customer_id`, `customer_name`, `phone_number`, `customer_type`, `city`, `postal_code`) VALUES
(401, 'Gadget Galaxy Retail', '7654321098', 'Retail', 'Mumbai', '400050'),
(402, 'E-Mart Wholesale', '7654321097', 'Wholesale', 'Delhi', '110005'),
(403, 'TechTree Online', '7654321096', 'Online', 'Bengaluru', '560034'),
(404, 'Global Exports Inc.', '7654321095', 'Export', 'Mumbai', '400021'),
(405, 'City Electronics Chain', '7654321094', 'Retail', 'Pune', '411004'),
(406, 'Mega Distributors Ltd.', '7654321093', 'Distributor', 'Hyderabad', '500034'),
(407, 'QuickMobile Store', '7654321092', 'Online', 'Chennai', '600017'),
(408, 'Pioneer Wholesale', '7654321091', 'Wholesale', 'Ahmedabad', '380009'),
(409, 'The Mobile Hub', '7654321090', 'Retail', 'Kolkata', '700016'),
(410, 'NetCart Ecommerce', '7654321089', 'Online', 'Bengaluru', '560076');

-- Populating the Product Table
-- Products are linked to suppliers (for components) and manufacturers (for assembly)
INSERT INTO `Product` (`product_id`, `product_name`, `product_desc`, `unit_price`, `quantity_available`, `category`, `supplier_id`, `manufacturer_id`) VALUES
(601, 'Stellar X1 Phone', 'Flagship model with AI camera', 49999.00, 15000, 'Smartphone', 101, 201),
(602, 'Orion Tab Pro', '12-inch tablet for professionals', 79999.00, 8000, 'Tablet', 102, 202),
(603, 'Nexus Sound Buds', 'True wireless earbuds with noise cancellation', 7999.00, 25000, 'Accessory', 107, 203),
(604, 'Aether Smartwatch 2', 'Smartwatch with ECG and SpO2 monitoring', 22500.00, 12000, 'Wearable', 105, 204),
(605, 'Nova FastCharge Power Bank', '20000mAh PD Power Bank', 3499.00, 50000, 'Accessory', 103, 205),
(606, 'Pinnacle Vision AR Glasses', 'Augmented Reality glasses for enterprise', 149999.00, 2000, 'AR/VR', 106, 206),
(607, 'Horizon Fold 3', 'Third generation foldable smartphone', 129999.00, 5000, 'Smartphone', 101, 207),
(608, 'Evolve Gaming Phone', 'Smartphone with shoulder triggers and high refresh rate screen', 65000.00, 7000, 'Smartphone', 102, 208),
(609, 'Quantum Wireless Charger', '15W Qi-certified wireless charging pad', 1999.00, 40000, 'Accessory', 109, 209),
(610, 'Vertex Laptop Lite', 'Ultralight laptop with 16GB RAM', 85000.00, 9000, 'Laptop', 110, 210);


-- Populating the Payment Table
INSERT INTO `Payment` (`payment_id`, `payment_mode`, `status`) VALUES
(701, 'Credit Card', 'Completed'),
(702, 'UPI', 'Completed'),
(703, 'Bank Transfer', 'Pending'),
(704, 'Credit Card', 'Completed'),
(705, 'Net Banking', 'Completed'),
(706, 'UPI', 'Failed'),
(707, 'Credit Card', 'Completed'),
(708, 'Bank Transfer', 'Completed'),
(709, 'UPI', 'Pending'),
(710, 'Net Banking', 'Completed');

-- Populating the Shipment Table
-- Shipments are linked to the warehouses they originate from
INSERT INTO `Shipment` (`shipment_id`, `carrier_name`, `transport_mode`, `shipping_cost`, `status`, `warehouse_id`) VALUES
(801, 'Blue Dart', 'Air', 5000.00, 'Delivered', 303),
(802, 'Delhivery', 'Road', 12000.00, 'In Transit', 301),
(803, 'FedEx', 'Air', 25000.00, 'Delivered', 302),
(804, 'DTDC', 'Road', 8000.00, 'Shipped', 306),
(805, 'Gati', 'Road', 15000.00, 'Pending Pickup', 305),
(806, 'DHL', 'Air', 35000.00, 'Delivered', 304),
(807, 'XpressBees', 'Road', 9500.00, 'In Transit', 309),
(808, 'SafeXpress', 'Road', 18000.00, 'Delivered', 310),
(809, 'FedEx', 'Air', 22000.00, 'Shipped', 303),
(810, 'Delhivery', 'Road', 13500.00, 'Delivered', 301);

-- Populating the Orders Table
-- Orders link customers, shipments, and payments together
INSERT INTO `Orders` (`order_id`, `total_amount`, `ordered_item`, `customer_id`, `shipment_id`, `payment_id`) VALUES
(901, 2499950.00, 'Stellar X1 Phone (50 units)', 401, 801, 701),
(902, 7999900.00, 'Orion Tab Pro (100 units)', 402, 802, 702),
(903, 399950.00, 'Nexus Sound Buds (50 units)', 403, 803, 704),
(904, 2250000.00, 'Aether Smartwatch 2 (100 units)', 406, 804, 705),
(905, 174950.00, 'Nova FastCharge Power Bank (50 units)', 407, 805, 703),
(906, 2999980.00, 'Pinnacle Vision AR Glasses (20 units)', 404, 806, 708),
(907, 6499950.00, 'Horizon Fold 3 (50 units)', 402, 807, 707),
(908, 1300000.00, 'Evolve Gaming Phone (20 units)', 410, 808, 710),
(909, 99950.00, 'Quantum Wireless Charger (50 units)', 405, 809, 709),
(910, 4250000.00, 'Vertex Laptop Lite (50 units)', 406, 810, 701);

-- Populating the Role_Permissions Table
INSERT INTO `Role_Permissions` (`role`, `entity_name`, `can_view`, `can_edit`, `can_delete`) VALUES
('Admin', 'Users', 1, 1, 1),
('Admin', 'Product', 1, 1, 1),
('Admin', 'Orders', 1, 1, 1),
('Admin', 'Supplier', 1, 1, 1),
('Supplier', 'Product', 1, 1, 0),
('Supplier', 'Orders', 1, 0, 0),
('Supplier', 'Shipment', 1, 0, 0),
('Manufacturer', 'Product', 1, 1, 0),
('Manufacturer', 'Orders', 1, 0, 0),
('Warehouse', 'Shipment', 1, 1, 0),
('Warehouse', 'Product', 1, 0, 0),
('Customer', 'Orders', 1, 0, 0),
('Customer', 'Product', 1, 0, 0);

CREATE TABLE Product_Price_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    old_price DECIMAL(10,2),
    new_price DECIMAL(10,2),
    change_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(50) DEFAULT 'DB_TRIGGER'
);

CREATE TABLE Shipment_Status_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    shipment_id INT,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    change_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

--TRIGGERS
--Check Warehouse Capacity
DELIMITER $$
CREATE TRIGGER trg_before_warehouse_update_check_utilization
BEFORE UPDATE ON Warehouse
FOR EACH ROW
BEGIN
    IF NEW.current_utilization > NEW.capacity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Update failed: Current utilization cannot exceed warehouse capacity.';
    END IF;
END$$
DELIMITER ;

-- Log Product Price Changes
DELIMITER $$
CREATE TRIGGER trg_after_product_update_log_price_change
AFTER UPDATE ON Product
FOR EACH ROW
BEGIN
    IF OLD.unit_price <> NEW.unit_price THEN
        INSERT INTO Product_Price_Log (product_id, old_price, new_price)
        VALUES (NEW.product_id, OLD.unit_price, NEW.unit_price);
    END IF;
END$$
DELIMITER ;

--Log Shipment Status Changes
DELIMITER $$
CREATE TRIGGER trg_after_shipment_status_update
AFTER UPDATE ON Shipment
FOR EACH ROW
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO Shipment_Status_Log (shipment_id, old_status, new_status)
        VALUES (NEW.shipment_id, OLD.status, NEW.status);
    END IF;
END$$
DELIMITER ;

-- Set Default Product Description
DELIMITER $$
CREATE TRIGGER trg_before_product_insert_default_desc
BEFORE INSERT ON Product
FOR EACH ROW
BEGIN
    IF NEW.product_desc IS NULL OR NEW.product_desc = '' THEN
        SET NEW.product_desc = 'No description available.';
    END IF;
END$$
DELIMITER ;

--FUNCTIONS
--Get Warehouse Utilization Percentage
DELIMITER $$
CREATE FUNCTION fn_get_warehouse_utilization_percent(
    w_id INT
)
RETURNS DECIMAL(5,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE util DECIMAL(5,2) DEFAULT 0.00;
    
    SELECT (current_utilization / capacity) * 100
    INTO util
    FROM Warehouse
    WHERE warehouse_id = w_id;
    
    RETURN util;
END$$
DELIMITER ;

--Get Customer Order Count
DELIMITER $$
CREATE FUNCTION fn_get_customer_total_orders(
    c_id INT
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE order_count INT DEFAULT 0;
    
    SELECT COUNT(*)
    INTO order_count
    FROM Orders
    WHERE customer_id = c_id;
    
    RETURN order_count;
END$$
DELIMITER ;

--Get Product Availability Status
DELIMITER $$
CREATE FUNCTION fn_get_product_availability(
    p_id INT
)
RETURNS VARCHAR(20)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE qty INT;
    DECLARE status_text VARCHAR(20);
    
    SELECT quantity_available INTO qty FROM Product WHERE product_id = p_id;
    
    CASE
        WHEN qty <= 0 THEN SET status_text = 'Out of Stock';
        WHEN qty <= 50 THEN SET status_text = 'Low Stock';
        ELSE SET status_text = 'In Stock';
    END CASE;
    
    RETURN status_text;
END$$
DELIMITER ;

--Calculate Order Tax
DELIMITER $$
CREATE FUNCTION fn_calculate_order_tax(
    amount DECIMAL(10,2)
)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    -- Assuming a flat tax rate of 18%
    DECLARE tax_rate DECIMAL(4,2) DEFAULT 0.18;
    RETURN amount * tax_rate;
END$$
DELIMITER ;

--Get Manufacturer's Product Count
DELIMITER $$
CREATE FUNCTION fn_get_manufacturer_product_count(
    m_id INT
)
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE product_count INT DEFAULT 0;
    
    SELECT COUNT(*)
    INTO product_count
    FROM Product
    WHERE manufacturer_id = m_id;
    
    RETURN product_count;
END$$
DELIMITER ;

--PROCEDURES
--Get All Orders for a Customer
DELIMITER $$
CREATE PROCEDURE sp_get_orders_by_customer(
    IN c_id INT
)
BEGIN
    SELECT 
        o.order_id, 
        o.ordered_item, 
        o.total_amount, 
        s.status AS shipment_status,
        p.status AS payment_status
    FROM Orders o
    LEFT JOIN Shipment s ON o.shipment_id = s.shipment_id
    LEFT JOIN Payment p ON o.payment_id = p.payment_id
    WHERE o.customer_id = c_id;
END$$
DELIMITER ;

--Update Shipment Status
DELIMITER $$
CREATE PROCEDURE sp_update_shipment_status(
    IN s_id INT,
    IN new_status VARCHAR(50)
)
BEGIN
    UPDATE Shipment
    SET status = new_status
    WHERE shipment_id = s_id;
END$$
DELIMITER ;

--Add Stock to Warehouse
DELIMITER $$
CREATE PROCEDURE sp_add_stock_to_warehouse(
    IN w_id INT,
    IN amount_added INT
)
BEGIN
    UPDATE Warehouse
    SET current_utilization = current_utilization + amount_added
    WHERE warehouse_id = w_id;
END$$
DELIMITER ;

--Get Products Below a Certain Stock Level
DELIMITER $$
CREATE PROCEDURE sp_get_low_stock_products(
    IN stock_threshold INT
)
BEGIN
    SELECT 
        product_id, 
        product_name, 
        quantity_available,
        s.supplier_name,
        s.phone_number AS supplier_phone
    FROM Product p
    JOIN Supplier s ON p.supplier_id = s.supplier_id
    WHERE quantity_available < stock_threshold;
END$$
DELIMITER ;

