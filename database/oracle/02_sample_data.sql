-- database setup

-- CUSTOMERS (10+)
INSERT INTO customers VALUES (1, 'Kasun Perera',       'kasun@example.com',  '0771234567', '12 Main St, Colombo',       'hash_pw1', TO_DATE('2025-01-10','YYYY-MM-DD'));
INSERT INTO customers VALUES (2, 'Nuwan Silva',        'nuwan@example.com',  '0777654321', '45 Park Ave, Kandy',        'hash_pw2', TO_DATE('2025-02-14','YYYY-MM-DD'));
INSERT INTO customers VALUES (3, 'Chamari Fernando',   'chamari@example.com','0712345678', '78 Lake Rd, Galle',         'hash_pw3', TO_DATE('2025-03-01','YYYY-MM-DD'));
INSERT INTO customers VALUES (4, 'Dinesh Jayawardena', 'dinesh@example.com', '0751234567', '23 Hill St, Matara',        'hash_pw4', TO_DATE('2025-03-15','YYYY-MM-DD'));
INSERT INTO customers VALUES (5, 'Sanduni Rathnayake', 'sanduni@example.com','0761234567', '56 River Rd, Negombo',      'hash_pw5', TO_DATE('2025-04-01','YYYY-MM-DD'));
INSERT INTO customers VALUES (6, 'Amal Gunaratne',     'amal@example.com',   '0781234567', '34 Beach Rd, Hikkaduwa',    'hash_pw6', TO_DATE('2025-04-10','YYYY-MM-DD'));
INSERT INTO customers VALUES (7, 'Hiruni Dissanayake', 'hiruni@example.com', '0721234567', '89 Forest Ave, Nuwara Eliya','hash_pw7', TO_DATE('2025-04-20','YYYY-MM-DD'));
INSERT INTO customers VALUES (8, 'Lahiru Senanayake',  'lahiru@example.com', '0731234567', '11 Temple Rd, Anuradhapura','hash_pw8', TO_DATE('2025-05-05','YYYY-MM-DD'));
INSERT INTO customers VALUES (9, 'Nadeesha Rajapaksha','nadeesha@example.com','0741234567', '67 Lotus St, Polonnaruwa', 'hash_pw9', TO_DATE('2025-05-15','YYYY-MM-DD'));
INSERT INTO customers VALUES (10,'Ruwan Bandara',      'ruwan@example.com',  '0791234567', '90 Spice Rd, Trincomalee', 'hash_pw10',TO_DATE('2025-06-01','YYYY-MM-DD'));

-- SELLERS (5+)
INSERT INTO sellers VALUES (1,'TechZone LK',   'Nimal Perera',  'techzone@example.com',    '0112345678','100 Tech Park, Colombo 03','Y',4.8,'hash_s1',TO_DATE('2025-01-05','YYYY-MM-DD'));
INSERT INTO sellers VALUES (2,'GadgetHub',     'Kamal Silva',   'gadgethub@example.com',   '0113456789','200 IT Zone, Colombo 07',  'Y',4.5,'hash_s2',TO_DATE('2025-01-20','YYYY-MM-DD'));
INSERT INTO sellers VALUES (3,'Digital World', 'Sunil Fernando','digitalworld@example.com','0114567890','300 Mall Rd, Kandy',       'Y',4.7,'hash_s3',TO_DATE('2025-02-10','YYYY-MM-DD'));
INSERT INTO sellers VALUES (4,'SmartShop',     'Priya Wickrama','smartshop@example.com',   '0115678901','400 Market St, Galle',     'N',4.2,'hash_s4',TO_DATE('2025-03-01','YYYY-MM-DD'));
INSERT INTO sellers VALUES (5,'ElectroMax',    'Chamara Banda', 'electromax@example.com',  '0116789012','500 Electronic City, Negombo','Y',4.6,'hash_s5',TO_DATE('2025-03-20','YYYY-MM-DD'));

-- PRODUCTS (20+)
INSERT INTO products VALUES (1,1,'Samsung Galaxy S25 Ultra','Smartphones',189900,25,'200MP camera, 12GB RAM, 512GB storage','https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400',4.9,145,SYSDATE);
INSERT INTO products VALUES (2,1,'Apple iPhone 16 Pro','Smartphones',245000,18,'A18 Pro chip, 48MP camera, titanium design','https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',4.8,189,SYSDATE);
INSERT INTO products VALUES (3,2,'MacBook Pro 14" M4','Laptops',389000,12,'Apple M4 chip, 16GB unified memory, Liquid Retina XDR','https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',4.9,67,SYSDATE);
INSERT INTO products VALUES (4,2,'Dell XPS 15 OLED','Laptops',295000,8,'Intel Core Ultra 9, RTX 4060, 32GB RAM, 4K OLED','https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',4.7,43,SYSDATE);
INSERT INTO products VALUES (5,3,'Apple Watch Ultra 2','Smart Watches',125000,30,'49mm titanium case, GPS precision, 60hr battery','https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400',4.8,98,SYSDATE);
INSERT INTO products VALUES (6,3,'Samsung Galaxy Watch 7','Smart Watches',65000,40,'Advanced health sensors, 3nm chip, sleep coaching','https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',4.6,112,SYSDATE);
INSERT INTO products VALUES (7,4,'Sony WH-1000XM6','Headphones',55000,50,'Industry-leading ANC, 30hr battery, Hi-Res Audio','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',4.9,234,SYSDATE);
INSERT INTO products VALUES (8,4,'Apple AirPods Pro 3','Headphones',48000,60,'H3 chip, adaptive transparency, USB-C case','https://images.unsplash.com/photo-1588156979435-379b9d802b0a?w=400',4.7,178,SYSDATE);
INSERT INTO products VALUES (9,5,'iPad Pro 13" M4','Accessories',215000,15,'Ultra Retina XDR OLED, M4 chip, 2TB storage','https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',4.8,56,SYSDATE);
INSERT INTO products VALUES (10,5,'Logitech MX Master 3S','Accessories',18500,100,'Electromagnetic scroll, 8K DPI, silent clicks','https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',4.8,320,SYSDATE);
INSERT INTO products VALUES (11,1,'Google Pixel 9 Pro','Smartphones',165000,20,'Tensor G4, 50MP camera, 7yr updates','https://images.unsplash.com/photo-1598300056393-4aac492f4344?w=400',4.6,87,SYSDATE);
INSERT INTO products VALUES (12,2,'ASUS ROG Zephyrus G14','Laptops',285000,10,'AMD Ryzen 9, RTX 4070, 16GB, 165Hz QHD','https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',4.7,55,SYSDATE);
INSERT INTO products VALUES (13,3,'Garmin Fenix 7X','Smart Watches',95000,22,'Solar charging, multi-band GPS, 28-day battery','https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400',4.7,43,SYSDATE);
INSERT INTO products VALUES (14,4,'Bose QuietComfort 45','Headphones',42000,35,'World-class ANC, 24hr battery, balanced audio','https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400',4.6,156,SYSDATE);
INSERT INTO products VALUES (15,5,'Anker 200W Charging Station','Accessories',12500,5,'6-port fast charger, GaN technology, compact','https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',4.5,289,SYSDATE);
INSERT INTO products VALUES (16,1,'OnePlus 13','Smartphones',135000,28,'Snapdragon 8 Elite, 100W charging, Hasselblad cam','https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400',4.5,76,SYSDATE);
INSERT INTO products VALUES (17,2,'HP Spectre x360 14','Laptops',265000,14,'Intel Ultra 7, 2.8K OLED touch, 360° hinge','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',4.6,38,SYSDATE);
INSERT INTO products VALUES (18,3,'Xiaomi Smart Band 9 Pro','Smart Watches',8500,120,'1.74" AMOLED, 21-day battery, SpO2 monitoring','https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400',4.4,445,SYSDATE);
INSERT INTO products VALUES (19,4,'JBL Tune 770NC','Headphones',19500,70,'Adaptive ANC, 70hr battery, hands-free calls','https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',4.5,198,SYSDATE);
INSERT INTO products VALUES (20,5,'Samsung 65" QLED 4K TV','Accessories',325000,3,'Quantum Dot, 144Hz, 4K AI Upscaling, Smart TV','https://images.unsplash.com/photo-1593359677879-a4bb92f4834a?w=400',4.8,22,SYSDATE);

-- ORDERS (15+)
INSERT INTO orders VALUES (1, 1,TO_DATE('2026-01-15','YYYY-MM-DD'),245000,'Delivered');
INSERT INTO orders VALUES (2, 2,TO_DATE('2026-01-20','YYYY-MM-DD'),73500,'Delivered');
INSERT INTO orders VALUES (3, 3,TO_DATE('2026-02-05','YYYY-MM-DD'),389000,'Shipped');
INSERT INTO orders VALUES (4, 4,TO_DATE('2026-02-10','YYYY-MM-DD'),55000,'Delivered');
INSERT INTO orders VALUES (5, 5,TO_DATE('2026-02-18','YYYY-MM-DD'),125000,'Delivered');
INSERT INTO orders VALUES (6, 6,TO_DATE('2026-03-01','YYYY-MM-DD'),189900,'Processing');
INSERT INTO orders VALUES (7, 7,TO_DATE('2026-03-05','YYYY-MM-DD'),48000,'Shipped');
INSERT INTO orders VALUES (8, 8,TO_DATE('2026-03-10','YYYY-MM-DD'),215000,'Packed');
INSERT INTO orders VALUES (9, 9,TO_DATE('2026-03-15','YYYY-MM-DD'),18500,'Delivered');
INSERT INTO orders VALUES (10,10,TO_DATE('2026-03-20','YYYY-MM-DD'),95000,'Delivered');
INSERT INTO orders VALUES (11, 1,TO_DATE('2026-03-25','YYYY-MM-DD'),12500,'Delivered');
INSERT INTO orders VALUES (12, 2,TO_DATE('2026-04-01','YYYY-MM-DD'),65000,'Processing');
INSERT INTO orders VALUES (13, 3,TO_DATE('2026-04-05','YYYY-MM-DD'),285000,'Pending');
INSERT INTO orders VALUES (14, 4,TO_DATE('2026-04-10','YYYY-MM-DD'),42000,'Shipped');
INSERT INTO orders VALUES (15, 5,TO_DATE('2026-04-15','YYYY-MM-DD'),325000,'Pending');

-- ORDER_ITEMS
INSERT INTO order_items VALUES (1, 1, 2,1,245000);
INSERT INTO order_items VALUES (2, 2, 7,1,55000);
INSERT INTO order_items VALUES (3, 2,10,1,18500);
INSERT INTO order_items VALUES (4, 3, 3,1,389000);
INSERT INTO order_items VALUES (5, 4, 7,1,55000);
INSERT INTO order_items VALUES (6, 5, 5,1,125000);
INSERT INTO order_items VALUES (7, 6, 1,1,189900);
INSERT INTO order_items VALUES (8, 7, 8,1,48000);
INSERT INTO order_items VALUES (9, 8, 9,1,215000);
INSERT INTO order_items VALUES (10,9,10,1,18500);
INSERT INTO order_items VALUES (11,10,13,1,95000);
INSERT INTO order_items VALUES (12,11,15,1,12500);
INSERT INTO order_items VALUES (13,12, 6,1,65000);
INSERT INTO order_items VALUES (14,13,12,1,285000);
INSERT INTO order_items VALUES (15,14,14,1,42000);
INSERT INTO order_items VALUES (16,15,20,1,325000);

-- PAYMENTS
INSERT INTO payments VALUES (1, 1,'Card',         'Completed',245000,TO_DATE('2026-01-15','YYYY-MM-DD'));
INSERT INTO payments VALUES (2, 2,'Bank Transfer', 'Completed',73500, TO_DATE('2026-01-20','YYYY-MM-DD'));
INSERT INTO payments VALUES (3, 3,'Card',          'Completed',389000,TO_DATE('2026-02-05','YYYY-MM-DD'));
INSERT INTO payments VALUES (4, 4,'Cash on Delivery','Completed',55000,TO_DATE('2026-02-10','YYYY-MM-DD'));
INSERT INTO payments VALUES (5, 5,'Card',          'Completed',125000,TO_DATE('2026-02-18','YYYY-MM-DD'));
INSERT INTO payments VALUES (6, 6,'Card',          'Failed',  189900,TO_DATE('2026-03-01','YYYY-MM-DD'));
INSERT INTO payments VALUES (7, 6,'Bank Transfer', 'Pending', 189900,TO_DATE('2026-03-01','YYYY-MM-DD'));
INSERT INTO payments VALUES (8, 7,'Card',          'Completed',48000, TO_DATE('2026-03-05','YYYY-MM-DD'));
INSERT INTO payments VALUES (9, 8,'Cash on Delivery','Pending',215000,TO_DATE('2026-03-10','YYYY-MM-DD'));
INSERT INTO payments VALUES (10,9, 'Card',         'Completed',18500, TO_DATE('2026-03-15','YYYY-MM-DD'));
INSERT INTO payments VALUES (11,10,'Bank Transfer', 'Completed',95000, TO_DATE('2026-03-20','YYYY-MM-DD'));
INSERT INTO payments VALUES (12,11,'Card',          'Completed',12500, TO_DATE('2026-03-25','YYYY-MM-DD'));
INSERT INTO payments VALUES (13,12,'Card',          'Failed',   65000, TO_DATE('2026-04-01','YYYY-MM-DD'));
INSERT INTO payments VALUES (14,13,'Card',          'Failed',  285000, TO_DATE('2026-04-05','YYYY-MM-DD'));
INSERT INTO payments VALUES (15,14,'Cash on Delivery','Pending',42000, TO_DATE('2026-04-10','YYYY-MM-DD'));

-- DELIVERIES
INSERT INTO deliveries VALUES (1, 1,'Delivered',     'DHL Express',  'DHL001',TO_DATE('2026-01-17','YYYY-MM-DD'));
INSERT INTO deliveries VALUES (2, 2,'Delivered',     'FedEx',        'FDX002',TO_DATE('2026-01-22','YYYY-MM-DD'));
INSERT INTO deliveries VALUES (3, 3,'Shipped',       'Blue Dart',    'BLU003',NULL);
INSERT INTO deliveries VALUES (4, 4,'Delivered',     'Courier Lanka','CLK004',TO_DATE('2026-02-12','YYYY-MM-DD'));
INSERT INTO deliveries VALUES (5, 5,'Delivered',     'DHL Express',  'DHL005',TO_DATE('2026-02-20','YYYY-MM-DD'));
INSERT INTO deliveries VALUES (6, 6,'Pending',       NULL,           NULL,NULL);
INSERT INTO deliveries VALUES (7, 7,'Shipped',       'FedEx',        'FDX007',NULL);
INSERT INTO deliveries VALUES (8, 8,'Packed',        'Blue Dart',    'BLU008',NULL);
INSERT INTO deliveries VALUES (9, 9,'Delivered',     'Courier Lanka','CLK009',TO_DATE('2026-03-17','YYYY-MM-DD'));
INSERT INTO deliveries VALUES (10,10,'Delivered',    'DHL Express',  'DHL010',TO_DATE('2026-03-22','YYYY-MM-DD'));

COMMIT;
PROMPT Sample data inserted: 10 customers, 5 sellers, 20 products, 15 orders, 15 payments, 10 deliveries
