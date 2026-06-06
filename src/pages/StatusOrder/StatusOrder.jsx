import { useEffect, useMemo, useState } from "react";
import "./StatusOrder.css";
import { getMyProfile } from "../../services/authService";
import { getMyOrders, getOrderById } from "../../services/orderService";
import { useLocation, useNavigate } from "react-router-dom";

const sidebarItems = [
  { name: "Account Details", negative: "/edit-user" },
  { name: "My Orders", negative: "/status-order" },
  { name: "Favorite Item", negative: "" },
  { name: "Payment Methods", negative: "" },
];

const formatCurrency = (value) => {
  const safeValue = Number(value) || 0;
  return `${new Intl.NumberFormat("vi-VN").format(safeValue)}đ`;
};

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
};

const mapStatusToBadge = (status) => {
  const normalized = String(status || "pending").toLowerCase();

  if (["delivered", "completed", "success"].includes(normalized)) {
    return { className: "completed", label: "Completed" };
  }

  if (["cancelled", "canceled", "failed"].includes(normalized)) {
    return { className: "cancelled", label: "Cancelled" };
  }

  if (["shipping", "shipped", "in_transit"].includes(normalized)) {
    return { className: "shipping", label: "Shipping" };
  }

  return { className: "pending", label: "Pending" };
};

const formatOrderId = (order) => {
  if (order.id) return `#${order.id}`;
  if (order.order_code) {
    const compactCode = String(order.order_code).slice(-8);
    return `#${compactCode}`;
  }
  return "-";
};

const getInitials = (name = "") => {
  return name
    .trim()
    .split(" ")
    .slice(-2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
};

function StatusOrder() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("Account Details"); // default active

  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profile, rawOrders] = await Promise.all([
          getMyProfile(),
          getMyOrders(),
        ]);

        setUser({
          name: profile?.fullName || profile?.username || "Unknown User",
          email: profile?.email || "No email",
        });

        const normalizedOrders = await Promise.all(
          (rawOrders || []).map(async (order) => {
            let productName = order.product_name || order.name || "";
            let quantity = Number(order.quantity || order.total_quantity) || 0;
            let thumbnail = order.thumbnail_url || order.thumbnail || "";

            // Fetch order detail to get product info and images since /my-orders does not include item details
            if (order.id) {
              try {
                const detail = await getOrderById(order.id);
                const items = detail?.items || [];

                if (items.length > 0) {
                  const firstItem = items[0];
                  const totalQuantity = items.reduce(
                    (sum, item) => sum + (Number(item.quantity) || 0),
                    0
                  );

                  productName =
                    firstItem?.product_name || firstItem?.name || "Sản phẩm";

                  if (items.length > 1) {
                    productName = `${productName} +${items.length - 1} sản phẩm khác`;
                  }

                  quantity = totalQuantity || Number(firstItem?.quantity) || 0;
                  // Prioritize thumbnail from product data (newly joined in BE)
                  thumbnail = firstItem?.thumbnail_url || thumbnail;
                }
              } catch {
                // Keep base order data if detail endpoint fails.
              }
            }

            return {
              id: formatOrderId(order),
              productName: productName || "Sản phẩm trong đơn hàng",
              quantity: quantity || 1,
              status: order.status || order.order_status || "pending",
              total: order.total_amount || order.total || 0,
              dateAdded: order.created_at || order.dateAdded || null,
              thumbnail,
            };
          })
        );

        setOrders(normalizedOrders);
      } catch (err) {
        setError(err.message || "Không thể tải dữ liệu đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  const isEmpty = useMemo(() => !loading && !error && orders.length === 0, [
    loading,
    error,
    orders,
  ]);

  return (
    <section className="order-status-page">
      <div className="order-status-container">
        <h1 className="order-status-title">My Orders</h1>

        <div className="order-status-layout">
          <aside className="order-sidebar">
            <div className="order-user-card">
              <div className="order-user-top">
                <div className="order-avatar">{getInitials(user.name)}</div>

                <div className="order-user-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <div className="order-sidebar-menu">
                {sidebarItems.map((item) => {
                  const isActive = location.pathname === item.negative; // kiểm tra active
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`sidebar-menu-item ${isActive ? "active" : ""}`}
                      onClick={() => navigate(item.negative)}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>

              <button type="button" className="signout-btn">
                Sign Out
              </button>
            </div>
          </aside>

          <div className="order-history-card">
            <div className="order-history-header">
              <h2>Order History</h2>
            </div>

            <div className="order-table">
              <div className="order-table-head order-grid">
                <div>Order ID</div>
                <div>Product Info</div>
                <div>Status</div>
                <div>Total</div>
                <div>Date Added</div>
                <div></div>
              </div>

              <div className="order-table-body">
                {loading && (
                  <div className="order-feedback">Loading your orders...</div>
                )}

                {!loading && error && <div className="order-feedback">{error}</div>}

                {isEmpty && (
                  <div className="order-feedback">Bạn chưa có đơn hàng nào.</div>
                )}

                {!loading &&
                  !error &&
                  orders.map((order) => {
                    console.log(order);

                    const statusBadge = mapStatusToBadge(order.status);

                    return (
                      <article key={order.id} className="order-row order-grid">
                        <div className="order-cell order-id" data-label="Order ID">
                          {order.id}
                        </div>

                        <div
                          className="order-cell order-product"
                          data-label="Product Info"
                        >
                          <div className="order-thumb">
                            {order.thumbnail ? (
                              <img src={order.thumbnail} alt={order.productName} />
                            ) : (
                              <span>IMG</span>
                            )}
                          </div>

                          <div className="order-product-info">
                            <h3>{order.productName}</h3>
                            <p>Qty: {order.quantity}</p>
                          </div>
                        </div>

                        <div
                          className={`order-cell order-status-badge ${statusBadge.className}`}
                          data-label="Status"
                        >
                          {statusBadge.label}
                        </div>

                        <div className="order-cell order-total" data-label="Total">
                          {formatCurrency(order.total)}
                        </div>

                        <div className="order-cell order-date" data-label="Date Added">
                          {formatDate(order.dateAdded)}
                        </div>

                        <div className="order-cell order-actions" data-label="Action">
                          {statusBadge.className === "completed" && (
                            <button type="button" className="action-btn buy-again-btn">
                              Buy Again
                            </button>
                          )}

                          <button type="button" className="action-btn contact-btn">
                            Contact
                          </button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatusOrder;