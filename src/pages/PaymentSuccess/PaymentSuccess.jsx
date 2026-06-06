import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentSuccess.css";
import { CART_UPDATED_EVENT } from "../../services/cartService";

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    // Reset cart count sau khi thanh toán xong
    const resetCartEvent = new CustomEvent(CART_UPDATED_EVENT, { detail: { count: 0 } });
    window.dispatchEvent(resetCartEvent);

    // Nếu bạn lưu cart trong localStorage, xóa luôn:
    localStorage.removeItem("cartCount");
  }, []);
  return (
    <div className="payment-success-page">
      <div className="payment-success-card">
        <div className="success-icon">✅</div>
        <h1>Payment Successful</h1>
        <p>Thank you for your purchase! Your order has been placed successfully.</p>

        <div className="success-actions">
          <button className="success-btn primary" onClick={() => navigate("/")}>Continue Shopping</button>
          <button className="success-btn" onClick={() => navigate("/cart")}>View Cart</button>
        </div>
      </div>
    </div>
  );
}
