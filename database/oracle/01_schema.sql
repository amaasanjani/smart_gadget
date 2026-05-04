-- drop tables
BEGIN
  FOR t IN (SELECT table_name FROM user_tables WHERE table_name IN
    ('DELIVERIES','PAYMENTS','ORDER_ITEMS','ORDERS','PRODUCTS','SELLERS','CUSTOMERS'))
  LOOP
    EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
  END LOOP;
END;
/

CREATE TABLE customers (
    customer_id   NUMBER PRIMARY KEY,
    name          VARCHAR2(100)  NOT NULL,
    email         VARCHAR2(150)  UNIQUE NOT NULL,
    phone         VARCHAR2(15),
    address       VARCHAR2(300),
    password_hash VARCHAR2(255)  NOT NULL,
    created_at    DATE           DEFAULT SYSDATE,
    CONSTRAINT chk_customer_email CHECK (email LIKE '%@%.%')
);

CREATE SEQUENCE customers_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE sellers (
    seller_id   NUMBER PRIMARY KEY,
    shop_name   VARCHAR2(150)  NOT NULL,
    owner_name  VARCHAR2(100)  NOT NULL,
    email       VARCHAR2(150)  UNIQUE NOT NULL,
    phone       VARCHAR2(15),
    address     VARCHAR2(300),
    verified    CHAR(1)        DEFAULT 'N' CHECK (verified IN ('Y','N')),
    rating      NUMBER(3,1)    DEFAULT 0   CHECK (rating BETWEEN 0 AND 5),
    password_hash VARCHAR2(255) NOT NULL,
    created_at  DATE           DEFAULT SYSDATE
);

CREATE SEQUENCE sellers_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE products (
    product_id      NUMBER PRIMARY KEY,
    seller_id       NUMBER        NOT NULL,
    product_name    VARCHAR2(200) NOT NULL,
    category        VARCHAR2(50)  NOT NULL
                    CHECK (category IN ('Smartphones','Laptops','Smart Watches','Headphones','Accessories')),
    price           NUMBER(12,2)  NOT NULL CHECK (price > 0),
    stock_quantity  NUMBER(8)     DEFAULT 0 CHECK (stock_quantity >= 0),
    description     VARCHAR2(1000),
    image_url       VARCHAR2(500),
    rating          NUMBER(3,1)   DEFAULT 0,
    sold            NUMBER(8)     DEFAULT 0,
    created_at      DATE          DEFAULT SYSDATE,
    CONSTRAINT fk_product_seller FOREIGN KEY (seller_id) REFERENCES sellers(seller_id)
);

CREATE SEQUENCE products_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE orders (
    order_id      NUMBER PRIMARY KEY,
    customer_id   NUMBER        NOT NULL,
    order_date    DATE          DEFAULT SYSDATE,
    total_amount  NUMBER(12,2)  NOT NULL CHECK (total_amount >= 0),
    status        VARCHAR2(20)  DEFAULT 'Pending'
                  CHECK (status IN ('Pending','Processing','Packed','Shipped','Out for Delivery','Delivered','Cancelled')),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE SEQUENCE orders_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE order_items (
    item_id     NUMBER PRIMARY KEY,
    order_id    NUMBER       NOT NULL,
    product_id  NUMBER       NOT NULL,
    quantity    NUMBER(5)    NOT NULL CHECK (quantity > 0),
    subtotal    NUMBER(12,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT fk_item_order   FOREIGN KEY (order_id)   REFERENCES orders(order_id),
    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE SEQUENCE order_items_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE payments (
    payment_id      NUMBER PRIMARY KEY,
    order_id        NUMBER       NOT NULL,
    payment_method  VARCHAR2(30) NOT NULL
                    CHECK (payment_method IN ('Card','Bank Transfer','Cash on Delivery')),
    payment_status  VARCHAR2(20) DEFAULT 'Pending'
                    CHECK (payment_status IN ('Pending','Completed','Failed')),
    amount          NUMBER(12,2) NOT NULL,
    payment_date    DATE         DEFAULT SYSDATE,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE SEQUENCE payments_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE deliveries (
    delivery_id      NUMBER PRIMARY KEY,
    order_id         NUMBER      NOT NULL,
    delivery_status  VARCHAR2(30) DEFAULT 'Pending'
                     CHECK (delivery_status IN ('Pending','Packed','Shipped','Out for Delivery','Delivered')),
    courier_name     VARCHAR2(100),
    tracking_number  VARCHAR2(50),
    delivery_date    DATE,
    CONSTRAINT fk_delivery_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE SEQUENCE deliveries_seq START WITH 1 INCREMENT BY 1;

-- indexes
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_seller    ON products(seller_id);
CREATE INDEX idx_orders_customer    ON orders(customer_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_order_items_order  ON order_items(order_id);
CREATE INDEX idx_payments_order     ON payments(order_id);
CREATE INDEX idx_payments_status    ON payments(payment_status);
CREATE INDEX idx_deliveries_order   ON deliveries(order_id);

-- views
CREATE OR REPLACE VIEW vw_order_details AS
    SELECT o.order_id, c.name AS customer_name, c.email,
           o.order_date, o.total_amount, o.status AS order_status,
           oi.item_id, p.product_name, p.category, oi.quantity, oi.subtotal,
           pay.payment_method, pay.payment_status,
           d.delivery_status, d.courier_name
    FROM orders o
    JOIN customers c  ON o.customer_id = c.customer_id
    JOIN order_items oi ON o.order_id = oi.order_id
    JOIN products p   ON oi.product_id = p.product_id
    LEFT JOIN payments pay ON o.order_id = pay.order_id
    LEFT JOIN deliveries d ON o.order_id = d.order_id;

COMMIT;
