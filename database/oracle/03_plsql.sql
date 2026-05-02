-- Adds a product and validates seller and category
CREATE OR REPLACE PROCEDURE add_new_product (
    p_seller_id     IN products.seller_id%TYPE,
    p_name          IN products.product_name%TYPE,
    p_category      IN products.category%TYPE,
    p_price         IN products.price%TYPE,
    p_stock         IN products.stock_quantity%TYPE,
    p_description   IN products.description%TYPE,
    p_product_id    OUT products.product_id%TYPE
) AS
    v_seller_exists NUMBER;
    v_seller_verified CHAR(1);
    e_invalid_seller  EXCEPTION;
    e_not_verified    EXCEPTION;
BEGIN
    -- Check if seller exists
    SELECT COUNT(*), MAX(verified) INTO v_seller_exists, v_seller_verified
    FROM sellers WHERE seller_id = p_seller_id;

    IF v_seller_exists = 0 THEN RAISE e_invalid_seller; END IF;
    IF v_seller_verified = 'N' THEN RAISE e_not_verified; END IF;

    SELECT products_seq.NEXTVAL INTO p_product_id FROM DUAL;

    INSERT INTO products (product_id, seller_id, product_name, category, price, stock_quantity, description)
    VALUES (p_product_id, p_seller_id, p_name, p_category, p_price, p_stock, p_description);

    COMMIT;
    DBMS_OUTPUT.PUT_LINE(' Product added: ' || p_name || ' (ID: ' || p_product_id || ')');

EXCEPTION
    WHEN e_invalid_seller THEN
        DBMS_OUTPUT.PUT_LINE(' ERROR: Seller ID ' || p_seller_id || ' does not exist.');
        RAISE;
    WHEN e_not_verified THEN
        DBMS_OUTPUT.PUT_LINE(' ERROR: Seller not verified. Cannot add products.');
        RAISE;
    WHEN VALUE_ERROR THEN
        DBMS_OUTPUT.PUT_LINE(' ERROR: Invalid data type provided.');
        RAISE;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(' ERROR: ' || SQLERRM);
        ROLLBACK;
        RAISE;
END add_new_product;
/

-- Processes payment for an order
CREATE OR REPLACE PROCEDURE process_payment (
    p_order_id       IN  payments.order_id%TYPE,
    p_method         IN  payments.payment_method%TYPE,
    p_status         OUT VARCHAR2,
    p_payment_id     OUT payments.payment_id%TYPE
) AS
    v_order_exists  NUMBER;
    v_amount        orders.total_amount%TYPE;
    e_order_missing EXCEPTION;
BEGIN
    SELECT COUNT(*), MAX(total_amount) INTO v_order_exists, v_amount
    FROM orders WHERE order_id = p_order_id;

    IF v_order_exists = 0 THEN RAISE e_order_missing; END IF;

    SELECT payments_seq.NEXTVAL INTO p_payment_id FROM DUAL;

    -- process payment
    INSERT INTO payments (payment_id, order_id, payment_method, payment_status, amount)
    VALUES (p_payment_id, p_order_id, p_method, 'Completed', v_amount);

    UPDATE orders SET status = 'Processing' WHERE order_id = p_order_id;

    p_status := 'Completed';
    COMMIT;
    DBMS_OUTPUT.PUT_LINE(' Payment processed: Rs. ' || v_amount || ' via ' || p_method);

EXCEPTION
    WHEN e_order_missing THEN
        p_status := 'Failed';
        DBMS_OUTPUT.PUT_LINE(' Order ' || p_order_id || ' not found.');
        RAISE;
    WHEN OTHERS THEN
        p_status := 'Failed';
        DBMS_OUTPUT.PUT_LINE(' Payment error: ' || SQLERRM);
        ROLLBACK;
        RAISE;
END process_payment;
/

-- Places an order with items, handles stock check
CREATE OR REPLACE PROCEDURE place_order (
    p_customer_id  IN  orders.customer_id%TYPE,
    p_product_id   IN  products.product_id%TYPE,
    p_quantity     IN  NUMBER,
    p_method       IN  VARCHAR2,
    p_order_id     OUT orders.order_id%TYPE
) AS
    v_price       products.price%TYPE;
    v_stock       products.stock_quantity%TYPE;
    v_total       NUMBER;
    v_item_id     NUMBER;
    v_delivery_id NUMBER;
    e_out_of_stock EXCEPTION;
BEGIN
    SELECT price, stock_quantity INTO v_price, v_stock
    FROM products WHERE product_id = p_product_id;

    -- Out of stock
    IF v_stock < p_quantity THEN RAISE e_out_of_stock; END IF;

    v_total := v_price * p_quantity;

    SELECT orders_seq.NEXTVAL INTO p_order_id FROM DUAL;
    INSERT INTO orders (order_id, customer_id, total_amount, status)
    VALUES (p_order_id, p_customer_id, v_total, 'Processing');

    SELECT order_items_seq.NEXTVAL INTO v_item_id FROM DUAL;
    INSERT INTO order_items (item_id, order_id, product_id, quantity, subtotal)
    VALUES (v_item_id, p_order_id, p_product_id, p_quantity, v_total);

    -- update stock
    UPDATE products SET stock_quantity = stock_quantity - p_quantity, sold = sold + p_quantity
    WHERE product_id = p_product_id;

    SELECT deliveries_seq.NEXTVAL INTO v_delivery_id FROM DUAL;
    INSERT INTO deliveries (delivery_id, order_id, delivery_status)
    VALUES (v_delivery_id, p_order_id, 'Pending');

    COMMIT;
    DBMS_OUTPUT.PUT_LINE(' Order #' || p_order_id || ' placed. Total: Rs. ' || v_total);

EXCEPTION
    WHEN e_out_of_stock THEN
        DBMS_OUTPUT.PUT_LINE(' Product ' || p_product_id || ' is out of stock! Available: ' || v_stock);
        RAISE;
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE(' Product not found.');
        RAISE;
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE(' Order error: ' || SQLERRM);
        ROLLBACK;
        RAISE;
END place_order;
/

-- Returns total revenue from completed payments
CREATE OR REPLACE FUNCTION calculate_total_revenue (
    p_from_date IN DATE DEFAULT NULL,
    p_to_date   IN DATE DEFAULT NULL
) RETURN NUMBER AS
    v_revenue NUMBER := 0;
BEGIN
    IF p_from_date IS NULL THEN
        SELECT NVL(SUM(amount), 0) INTO v_revenue
        FROM payments WHERE payment_status = 'Completed';
    ELSE
        SELECT NVL(SUM(amount), 0) INTO v_revenue
        FROM payments
        WHERE payment_status = 'Completed'
          AND payment_date BETWEEN p_from_date AND NVL(p_to_date, SYSDATE);
    END IF;
    RETURN v_revenue;
EXCEPTION
    WHEN OTHERS THEN RETURN 0;
END calculate_total_revenue;
/

-- Returns the product_name of the best-selling product
CREATE OR REPLACE FUNCTION get_top_selling_product RETURN VARCHAR2 AS
    v_product_name products.product_name%TYPE;
BEGIN
    SELECT product_name INTO v_product_name
    FROM (
        SELECT p.product_name, SUM(oi.quantity) AS total_sold
        FROM order_items oi JOIN products p ON oi.product_id = p.product_id
        GROUP BY p.product_name
        ORDER BY total_sold DESC
    )
    WHERE ROWNUM = 1;
    RETURN v_product_name;
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN 'No sales yet';
    WHEN OTHERS THEN RETURN 'Error: ' || SQLERRM;
END get_top_selling_product;
/

CREATE OR REPLACE FUNCTION get_customer_order_count (p_customer_id IN NUMBER) RETURN NUMBER AS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM orders WHERE customer_id = p_customer_id;
    RETURN v_count;
EXCEPTION
    WHEN OTHERS THEN RETURN 0;
END;
/

-- After an order item is inserted, auto-update product stock
CREATE OR REPLACE TRIGGER trg_auto_update_stock
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - :NEW.quantity,
        sold = sold + :NEW.quantity
    WHERE product_id = :NEW.product_id;

    DBMS_OUTPUT.PUT_LINE(' Stock updated for product ' || :NEW.product_id);
END;
/

-- After a failed payment is inserted, mark order back to Pending
CREATE OR REPLACE TRIGGER trg_failed_payment
AFTER INSERT ON payments
FOR EACH ROW
WHEN (NEW.payment_status = 'Failed')
BEGIN
    -- Revert order to Pending if payment failed
    UPDATE orders SET status = 'Pending' WHERE order_id = :NEW.order_id;
    DBMS_OUTPUT.PUT_LINE(' TRIGGER: Payment failed for order ' || :NEW.order_id || '. Order reset to Pending.');
END;
/

-- Before inserting a seller, check for duplicate email
CREATE OR REPLACE TRIGGER trg_prevent_duplicate_seller
BEFORE INSERT ON sellers
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM sellers WHERE email = :NEW.email;
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Duplicate seller email: ' || :NEW.email);
    END IF;
END;
/

DECLARE
    CURSOR c_top_products IS
        SELECT p.product_name, p.category, SUM(oi.quantity) AS qty_sold,
               SUM(oi.subtotal) AS revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        GROUP BY p.product_name, p.category
        ORDER BY revenue DESC;

    v_product c_top_products%ROWTYPE;
    v_rank    NUMBER := 0;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== TOP SELLING PRODUCTS ===');
    OPEN c_top_products;
    LOOP
        FETCH c_top_products INTO v_product;
        EXIT WHEN c_top_products%NOTFOUND OR v_rank >= 10;
        v_rank := v_rank + 1;
        DBMS_OUTPUT.PUT_LINE(
            v_rank || '. ' || v_product.product_name ||
            ' | Sold: ' || v_product.qty_sold ||
            ' | Revenue: Rs. ' || v_product.revenue
        );
    END LOOP;
    CLOSE c_top_products;
END;
/

DECLARE
    CURSOR c_monthly_revenue IS
        SELECT TO_CHAR(payment_date, 'YYYY-MM') AS month,
               COUNT(*) AS transactions,
               SUM(amount) AS total_revenue
        FROM payments
        WHERE payment_status = 'Completed'
        GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
        ORDER BY month;

    v_row c_monthly_revenue%ROWTYPE;
BEGIN
    DBMS_OUTPUT.PUT_LINE('=== MONTHLY REVENUE REPORT ===');
    FOR v_row IN c_monthly_revenue LOOP
        DBMS_OUTPUT.PUT_LINE(
            v_row.month || ' | Transactions: ' || v_row.transactions ||
            ' | Revenue: Rs. ' || v_row.total_revenue
        );
    END LOOP;
END;
/

-- Test: Product out of stock exception
DECLARE
    v_order_id NUMBER;
BEGIN
    -- Try to order 1000 units of a low-stock product
    place_order(1, 15, 1000, 'Card', v_order_id);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Caught exception: ' || SQLERRM);
END;
/

-- Test: Duplicate seller exception
BEGIN
    INSERT INTO sellers VALUES (99,'Duplicate Store','Test','techzone@example.com','0000000','Addr','N',0,'hash',SYSDATE);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('Caught: ' || SQLERRM);
END;
/

-- Test: Function demos
BEGIN
    DBMS_OUTPUT.PUT_LINE('Total Revenue: Rs. ' || calculate_total_revenue());
    DBMS_OUTPUT.PUT_LINE('Jan-Mar Revenue: Rs. ' ||
        calculate_total_revenue(TO_DATE('2026-01-01','YYYY-MM-DD'), TO_DATE('2026-03-31','YYYY-MM-DD')));
    DBMS_OUTPUT.PUT_LINE('Top Product: ' || get_top_selling_product());
    DBMS_OUTPUT.PUT_LINE('Kasun Orders: ' || get_customer_order_count(1));
END;
/

-- 
SELECT p.product_name, p.category, SUM(oi.quantity) AS qty_sold,
       SUM(oi.subtotal) AS revenue_generated
FROM order_items oi
JOIN products p ON oi.product_id = p.product_id
GROUP BY p.product_name, p.category
ORDER BY revenue_generated DESC;

-- 
SELECT payment_method, COUNT(*) AS transactions, SUM(amount) AS total
FROM payments WHERE payment_status = 'Completed'
GROUP BY payment_method ORDER BY total DESC;

-- low stock alert
SELECT product_id, product_name, category, stock_quantity
FROM products WHERE stock_quantity <= 5
ORDER BY stock_quantity;

-- Delivery status summary
SELECT delivery_status, COUNT(*) AS count FROM deliveries GROUP BY delivery_status;

-- Customer order history
SELECT c.name, COUNT(o.order_id) AS orders, SUM(o.total_amount) AS spent
FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.name ORDER BY spent DESC NULLS LAST;

PROMPT All PL/SQL objects created and tested successfully!
