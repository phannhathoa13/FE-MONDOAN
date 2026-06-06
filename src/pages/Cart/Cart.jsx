import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./Cart.css";
import { getCart, updateCartItemQty, removeCartItem, CART_UPDATED_EVENT } from "../../services/cartService";

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const cartData = await getCart();
      setCart(cartData.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const changeQty = async (id, amount) => {
    const item = cart.find((item) => item.id === id);
    if (!item) return;

    const nextQuantity = Math.max(1, item.quantity + amount);

    if (amount > 0 && item.stock != null && nextQuantity > item.stock) {
      toast.error(`"${item.name}" chỉ còn ${item.stock} sản phẩm trong kho!`);
      return;
    }

    try {
      await updateCartItemQty(id, nextQuantity);
      setCart((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: nextQuantity } : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };


  const removeItem = async (id) => {
    try {
      const itemToRemove = cart.find(item => item.id === id);
      const quantityToRemove = itemToRemove?.quantity || 1; // lấy đúng số lượng của sản phẩm

      await removeCartItem(id);

      // Cập nhật state cart
      setCart(prev => prev.filter(item => item.id !== id));

      // Cập nhật cartCount trong localStorage
      let cartCount = Number(localStorage.getItem("cartCount")) || 0;
      cartCount = Math.max(0, cartCount - quantityToRemove);
      localStorage.setItem("cartCount", cartCount);

      // Thông báo cập nhật cart toàn cục (nếu bạn dùng event)
      window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { count: cartCount } }));

    } catch (err) {
      setError(err.message);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const formatPrice = (number) => {
    return "$" + number.toLocaleString("en-US");
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setError("Giỏ hàng đang trống, không thể checkout.");
      return;
    }

    const firstProductId = cart[0]?.product_id;

    if (!firstProductId) {
      setError("Không tìm thấy sản phẩm hợp lệ để checkout.");
      return;
    }

    navigate(`/order/${firstProductId}`, {
      state: {
        checkoutItems: cart.map((item) => ({
          productId: Number(item.product_id || item.id),
          name: item.name,
          description: item.description || item.desc || "",
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: item.thumbnail_url || item.image || "",
        })),
      },
    });
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-head">
          <button className="back-btn" onClick={() => window.history.back()}>
            Back
          </button>
          <h1>Your Cart</h1>
        </div>

        <div className="cart-layout">
          <section className="cart-left card">
            {loading ? (
              <div className="empty-cart">
                <h2>Loading cart...</h2>
              </div>
            ) : error ? (
              <div className="empty-cart">
                <h2>Lỗi tải giỏ hàng</h2>
                <p>{error}</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Add products to your cart to continue shopping.</p>
                <button
                  className="shop-btn"
                  onClick={() => (window.location.href = "/")}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.thumbnail_url || item.image} alt={item.name} />

                  <div className="item-info">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-desc">{item.description || item.desc || ""}</p>
                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>

                  <div className="item-actions">
                    <div className="qty-box">
                      <button onClick={() => changeQty(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => changeQty(item.id, 1)}>+</button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <aside className="cart-right card">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <strong className="free-ship">Free</strong>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span className="total-price">{formatPrice(subtotal)}</span>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={loading || cart.length === 0}
            >
              Proceed to Checkout
            </button>
            <button
              className="continue-btn"
              onClick={() => (window.location.href = "/")}
            >
              Continue Shopping
            </button>

            <div className="benefits">
              <div className="benefit-item">Free Standard Shipping</div>
              <div className="benefit-item">Risk-Free Shopping</div>
              <div className="benefit-item">Dedicated Customer Support</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;