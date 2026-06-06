import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductDetailPage.css";
import { getProductById } from "../../services/productService";
import { addToCart, CART_UPDATED_EVENT } from "../../services/cartService";
import toast from "react-hot-toast";

// Icon for categories
import laptopIcon from "../../assets/laptopIcon.png"
import pcIcon from "../../assets/PcIcon.png"
import mouseIcon from "../../assets/MouseIcon.png"
import keyboardIcon from "../../assets/KeyboardIcon.png"
import microIcon from "../../assets/MicroIcon.png"
import headphoneIcon from "../../assets/HeadphoneIcon.png"
import speakerIcon from "../../assets/SpeakerIcon.png"
import chairIcon from "../../assets/ChairIcon.png"
import monitorIcon from "../../assets/monitorIcon.png"

// Configuration PC/Laptop icon item
import cpuIcon from "../../assets/ConfigurationIcon/CPU.png";
import gpuIcon from "../../assets/ConfigurationIcon/GPU.png";
import ramIcon from "../../assets/ConfigurationIcon/RAM.png";
import ssdIcon from "../../assets/ConfigurationIcon/SSD.png";

// Configuration Mouse icon item
import BatteryMouse from "../../assets/ConfigurationIcon/BatteryMouse.png";
import DpiMouse from "../../assets/ConfigurationIcon/DpiMouse.png";
import LedMouse from "../../assets/ConfigurationIcon/LedMouse.png";
import WireLessMouse from "../../assets/ConfigurationIcon/WireLessMouse.png";

// Configuration Keyboard icon item
import keyboardConfiguration from "../../assets/ConfigurationIcon/KeycapKeyboard.png";
import layoutKeyBoard from "../../assets/ConfigurationIcon/LayoutKeyBoard.png";
import uSBKeyBoard from "../../assets/ConfigurationIcon/USBKeyBoard.png";
import KeycapKeyboard from "../../assets/ConfigurationIcon/KeycapKeyboard.png";

// Configuration Keyboard icon item
import monitorConfiguration from "../../assets/ConfigurationIcon/monitor.png";

import heroImage from "../../assets/hero.png";
import { productList } from "../../components/Caterogy/Categoy";

const formatPrice = (value) => value.toLocaleString("vi-VN") + "đ";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(heroImage);
  const [addToCartLoading, setAddToCartLoading] = useState(false);

  const [quantity, setQuantity] = useState(1); // số lượng sản phẩm chọn
  const handleAddToCart = async () => {
    if (addToCartLoading) return;

    let cartCount = Number(localStorage.getItem("cartCount")) || 0;

    try {
      setAddToCartLoading(true);

      // Thêm sản phẩm vào cart (API/backend)
      await addToCart(Number(productId), quantity);

      // Cập nhật cartCount localStorage
      cartCount += quantity;
      localStorage.setItem("cartCount", cartCount);

      // Trigger event để Header update
      window.dispatchEvent(
        new CustomEvent(CART_UPDATED_EVENT, { detail: { count: cartCount } })
      );

      toast.success("The product has been successfully added to your cart!");
    } catch (err) {
      toast.error(err.message || "Unable to add the product to the cart.");
    } finally {
      setAddToCartLoading(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedProduct = await getProductById(productId);
        setProduct(fetchedProduct);
        setSelectedImage(fetchedProduct.thumbnail_url || heroImage);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Không thể tải thông tin sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="not-found-box">
            <h2>Đang tải...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <div className="not-found-box">
            <h2>{error || 'Không tìm thấy sản phẩm'}</h2>
            <button onClick={() => navigate("/")}>Quay lại trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    { icon: "🚚", title: "Free Standard Shipping" },
    { icon: "🛡️", title: "Risk-Free Shopping" },
    { icon: "🎧", title: "Dedicated Customer Support" },
    { id: 4, title: "Shop & Earn Rewards", icon: "✨" },
    { id: 5, title: "Shop Now, Pay Later", icon: "💳" },
    { id: 6, title: "Protected by VTech Care", icon: "👑" },

  ];

  const productInParam = productList.find((products) => products.id == productId)
  const category = productInParam.category
  const productListInParam = productList.filter((producuts) => producuts.id == productId)

  const renderConfiguration = () => {
    if (!productInParam.configuration || productInParam.configuration.length === 0) return null;

    return (
      <div className="configuration-box">
        {productInParam.configuration.map((conf, index) => {
          let iconSrc = null;
          let label = conf; // default

          // Mapping category + index => icon + label
          if (["Mouse"].includes(category)) {
            switch (index) {
              case 0: iconSrc = BatteryMouse; label = `Battery Life: ${conf}`; break;
              case 1: iconSrc = WireLessMouse; label = `Connectivity: ${conf}`; break;
              case 2: iconSrc = DpiMouse; label = ` ${conf}`; break;
            }
          }
          if (["PC", "Laptop"].includes(category)) {
            switch (index) {
              case 0: iconSrc = monitorConfiguration; label = `Motherboard: ${conf}`; break;
              case 1: iconSrc = cpuIcon; label = `CPU: ${conf}`; break;
              case 2: iconSrc = gpuIcon; label = `GPU: ${conf}`; break;
              case 3: iconSrc = ramIcon; label = `RAM: ${conf}`; break;
              case 4: iconSrc = ssdIcon; label = `Storage: ${conf}`; break;
            }
          }
          if (["Monitor"].includes(category)) {
            switch (index) {
              case 0: iconSrc = monitorConfiguration; label = `Panel Type: ${conf}`; break;
              case 1: iconSrc = WireLessMouse; label = `Resolution: ${conf}`; break;
              case 2: iconSrc = layoutKeyBoard; label = `Size: ${conf}`; break;
            }
          }
          if (["Keyboard"].includes(category)) {
            switch (index) {
              case 0: iconSrc = uSBKeyBoard; label = `Connection: ${conf}`; break;
              case 1: iconSrc = layoutKeyBoard; label = `Layout: ${conf}`; break;
              case 2: iconSrc = KeycapKeyboard; label = `Keycap: ${conf}`; break;
              case 3: iconSrc = LedMouse; label = `Lighting: ${conf}`; break;
            }
          }
          if (["Headphones"].includes(category)) {
            switch (index) {
              case 0: iconSrc = BatteryMouse; label = `Design: ${conf}`; break;
              case 1: iconSrc = WireLessMouse; label = `Connectivity: ${conf}`; break;
              case 2: iconSrc = DpiMouse; label = `Mode: ${conf}`; break;
            }
          }

          return (
            <div className="configuration-item" key={index}>
              {iconSrc && <img src={iconSrc} alt="icon" className="conf-icon" />}
              <span className="conf-label">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="product-detail-page">

      <main className="home-container">

        {/* Catetgories Item */}
        <section className="category-bar">
          {/* Catetgories Item */}
          <div className="category-container" onClick={() => navigate(`/category/21`)}>
            <img src={laptopIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Laptop</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/32`)}>
            <img src={pcIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>PC</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/33`)}>
            <img src={mouseIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Mouse</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/30`)}>
            <img src={keyboardIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Keyboard</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/31`)}>
            <img src={monitorIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Monitor</p>
          </div>

          <div className="category-container" onClick={() => navigate(`/category/22`)}>
            <img src={headphoneIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Headphones</p>
          </div>
          <div className="category-container">
            <img src={speakerIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Speaker</p>
          </div>
          <div className="category-container">
            <img src={chairIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Chair</p>
          </div>
          <div className="category-container" >
            <img src={microIcon} alt="laptopIcon" className="category-iconProductDetail"></img>
            <p>Micro</p>
          </div>

        </section>

        <div className="product-detail-card">
          <div className="product-detail-left">

            <div className="product-title-block">
              <h2>{productInParam.name}</h2>
              <p>{productInParam.description || 'No description available'}</p>
            </div>

            <div className="product-gallery">
              {product.gallery && product.gallery.length > 0 && (
                <div className="thumbnail-list">
                  {product.gallery.map((img, index) => (
                    <button
                      key={index}
                      className={`thumbnail-item ${selectedImage === img ? "active" : ""
                        }`}
                      onClick={() => setSelectedImage(img)}
                      type="button"
                    >
                      <img src={img} alt={`thumb-${index}`} />
                    </button>
                  ))}
                </div>
              )}

              <div className="main-image-box">
                <img src={selectedImage} alt={product.name} />
              </div>
            </div>

            <div className="service-list">
              {features.map((item, index) => (
                <div className="service-card" key={index}>
                  <div className="service-icon">{item.icon}</div>
                  <div className="service-text">{item.title}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="product-detail-right">
            {/* <div className="product-title-block desktop-only">
            </div> */}

            <div className="product-subtitle">{productInParam.name}</div>

            <div className="product-price-main">{formatPrice(productInParam.price)}</div>

            <div className="detail-action-buttons">
              <button className="add-cart-main-btn" onClick={handleAddToCart} type="button" disabled={addToCartLoading}>
                {addToCartLoading ? "Adding..." : "Add to Cart"}
              </button>
              <button className="buy-now-btn" onClick={() => navigate(`/order/${productId}`)} type="button">
                Buy Now
              </button>
            </div>

            <div className="product-subtitle">Performance Status</div>
            <div>{renderConfiguration()}</div>

            <div className="expert-text">
              Need help choosing? <span>Talk to an expert</span>
            </div>


          </div>
        </div>
      </main>
    </div>
  );
}