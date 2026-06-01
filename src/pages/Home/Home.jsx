import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { getProductsByCategory } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";
import { perks } from "../../constants";
import ChatBotWidget from "../../components/ChatBot/ChatBot";
import laptopIcon from "../../assets/laptopIcon.png"
import pcIcon from "../../assets/PcIcon.png"
import mouseIcon from "../../assets/MouseIcon.png"
import keyboardIcon from "../../assets/KeyboardIcon.png"
import microIcon from "../../assets/MicroIcon.png"
import headphoneIcon from "../../assets/HeadphoneIcon.png"
import speakerIcon from "../../assets/SpeakerIcon.png"
import chairIcon from "../../assets/ChairIcon.png"
import monitorIcon from "../../assets/monitorIcon.png"
import { categoriesList, productList } from "../../components/Caterogy/Categoy";


const ProductCard = ({ item, category, onProductClick, onBuyNow }) => {

  const handleBuyNow = (e) => {
    e.stopPropagation();
    onBuyNow(item.id);
  };

  return (
    <div
      className={`product-card ${item.highlight ? "highlight-card" : ""}`}
      onClick={() => onProductClick(item.id)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-thumb">
        {item.thumb ? (
          <img src={item.thumb} alt={item.title} />
        ) : (
          <span>📦</span>
        )}
      </div>
      <h4>{item.title}</h4>
      <div className="product-thumb-configuration">
        {item.configuration.map((conf, index) => (
          <p key={index} className="configuration-text">{conf}</p>
        ))}
      </div>
      <div className="price-box">
        <span className="old-price">{item.oldPrice}</span>
        <span className="new-price">{item.price}</span>
      </div>

      <div className="product-actions">
        <button className="buy-btn buy-btn--now" onClick={handleBuyNow}>
          View Details
        </button>
      </div>
    </div>
  );
};

const ProductSection = ({ title, tag, products, onProductClick, onBuyNow }) => {
  return (
    <section className="home-section">
      <div className="section-top">
        <div className="section-left">
          <h3>{title}</h3>
          {tag && <span className="section-tag">{tag}</span>}
        </div>
        <button className="view-all-btn">View all</button>
      </div>

      <div className="products-grid">
        {products.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onProductClick={onProductClick}
            onBuyNow={onBuyNow}
          />
        ))}
      </div>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [topCategories, setTopCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState({});

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleBuyNow = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getRandomCategories = (allCategories) => {
    // Lọc ra các category không phải 2, 10, 15
    const filteredCategories = allCategories.filter(cat => ![2, 10, 15].includes(cat.id));

    // Lấy 3 category ngẫu nhiên
    const shuffled = [...filteredCategories].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map(cat => cat.id);
  };

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getAllCategories();
      setCategories(fetchedCategories);

      // Lấy 3 category random sau khi fetch categories
      const randomCategoryIds = getRandomCategories(fetchedCategories);
      setTopCategories(randomCategoryIds);

      // Khởi tạo products và loading state với random categories
      const initialProducts = {};
      const initialLoading = {};
      randomCategoryIds.forEach(id => {
        initialProducts[id] = [];
        initialLoading[id] = false;
      });

      setProducts(initialProducts);
      setLoading(initialLoading);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchProductsForTopCategories = async () => {
    for (const categoryId of topCategories) {
      setLoading((prev) => ({ ...prev, [categoryId]: true }));
      try {
        const fetchedProducts = await getProductsByCategory(categoryId);
        setProducts((prev) => ({ ...prev, [categoryId]: fetchedProducts }));
      } catch (error) {
        console.error(`Failed to fetch products for category ${categoryId}:`, error);
        setProducts((prev) => ({ ...prev, [categoryId]: [] }));
      } finally {
        setLoading((prev) => ({ ...prev, [categoryId]: false }));
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (topCategories.length > 0) {
      fetchProductsForTopCategories();
    }
  }, [topCategories]);

  return (
    <div className="home-page">
      {/* <Header /> */}

      <main className="home-container">
        <section className="store-heading">
          <h2>Store</h2>
          <div>
            <h2>The best you buy the </h2>
            <h2>product you love to.</h2>
          </div>
        </section>

        {/* Catetgory*/}
        <section className="category-bar">

          {/* Catetgories Item */}
          <div className="category-container" onClick={() => navigate(`/category/21`)}>
            <img src={laptopIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Laptop</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/32`)}>
            <img src={pcIcon} alt="laptopIcon" className="category-icon"></img>
            <p>PC</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/33`)}>
            <img src={mouseIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Mouse</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/30`)}>
            <img src={keyboardIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Keyboard</p>
          </div>
          <div className="category-container" onClick={() => navigate(`/category/31`)}>
            <img src={monitorIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Monitor</p>
          </div>

          <div className="category-container" onClick={() => navigate(`/category/22`)}>
            <img src={headphoneIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Headphones</p>
          </div>
          <div className="category-container">
            <img src={speakerIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Speaker</p>
          </div>
          <div className="category-container">
            <img src={chairIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Chair</p>
          </div>
          <div className="category-container" >
            <img src={microIcon} alt="laptopIcon" className="category-icon"></img>
            <p>Micro</p>
          </div>

        </section>


        {topCategories.map((categoryId) => {

          const categoryName = categoriesList.find((cat) => cat.categoryid === categoryId)?.name || 'Products';

          const categoryIcon = categories.find((cat) => cat.id === categoryId)?.icon || '📦';

          const categoryProducts = productList.filter(p => p.category_id === categoryId);

          const isLoading = loading[categoryId];

          return (
            <div key={categoryId}>

              {isLoading ? (
                <p>Loading products...</p>
              ) : (
                <ProductSection
                  title={<><span className="top-selling-text">Top Selling</span> {categoryName}</>}
                  tag="Recommended"
                  products={categoryProducts.map((product) => ({
                    id: product.id,
                    title: product.name,
                    configuration: product.configuration,
                    oldPrice: `${(product.price * 1.2).toLocaleString()}đ`,
                    price: `${product.price.toLocaleString()}đ`,
                    thumb: product.thumbnail_url,
                  }))}
                  onProductClick={handleProductClick}
                  onBuyNow={handleBuyNow}
                />
              )}
            </div>
          );
        })}

        <section className="perks-section">
          <h3>The Perks of VTech</h3>
          <div className="perks-grid">
            {perks.map((item) => (
              <div key={item.id} className="perk-card">
                <div className="perk-icon">{item.icon}</div>
                <p>{item.title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <ChatBotWidget onSuggestionClick={handleProductClick} />
    </div>
  );
};

export default Home;