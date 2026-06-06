import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProductByCategory.css";
import { getProductsByCategory } from "../../services/productService";
import { getAllCategories } from "../../services/categoryService";

// Chỉ dùng ảnh có sẵn trong assets của bạn
import heroImage from "../../assets/hero.png";
import { CategoryBar, productList } from "../../components/Caterogy/Categoy";
import { ProductSection } from "../Home/Home";
import { perks } from "../../constants";


const formatPrice = (value) => {
  return value.toLocaleString("vi-VN") + "đ";
};

export default function ProductByCategory() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const numericCategoryId = Number(categoryId);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedCategories = await getAllCategories();
        setCategories(fetchedCategories);

        const category = fetchedCategories.find(cat => cat.id === numericCategoryId);
        if (category) {
          const fetchedProducts = await getProductsByCategory(category.id);
          setProducts(fetchedProducts);
        } else {
          setError('Category not found');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchData();
    }
  }, [categoryId, numericCategoryId]);
  const activeCategory = productList.find((item) => item.category_id === numericCategoryId) || {};
  const activeProductsList = productList.filter(p => p.category_id === numericCategoryId);

  console.log(activeProductsList);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (sortBy === "price-asc") {
      return [...result].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-desc") {
      return [...result].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name-asc") {
      return [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="home-page">
      {/* <Header /> */}

      <main className="home-headingProductCategory">
        <section className="store-headingProductCategory">
          <h1>Store</h1>
          <div>
            <h1>The best you buy the </h1>
            <h1>product you love to.</h1>
          </div>
        </section>
      </main>
      <div className="product-category-page">
        <div className="product-category-container">
          {loading ? (
            <div className="loading-box">
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-box">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try again</button>
            </div>
          ) : (
            <>
              <CategoryBar />

              <div className="category-heading">
                <div>
                  <h1>{activeCategory.category}</h1>
                  <p>
                    Designed for every setup, with hard, soft, and hybrid options to suit your playstyle.
                  </p>
                </div>

                <div className="category-tools">
                  <button className="filter-btn" type="button">
                    Filter
                  </button>

                  <select
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Sort by: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A-Z</option>
                  </select>
                </div>
              </div>

              <div className="product-block">

                {displayedProducts.length === 0 ? (
                  <div className="empty-box">Không có sản phẩm trong category này.</div>
                ) : (
                  <>
                    <div className="product-grid">
                      <ProductSection
                        products={activeProductsList.map(product => ({
                          id: product.id,
                          category: product.category,
                          title: product.name,
                          configuration: product.configuration,
                          oldPrice: `${(product.price * 1.2).toLocaleString()}đ`,
                          price: `${product.price.toLocaleString()}đ`,
                          thumb: product.thumbnail_url,

                        }))}
                        onProductClick={(id) => navigate(`/product/${id}`)}
                        onBuyNow={(id) => navigate(`/product/${id}`)}
                      />
                    </div>

                    {visibleCount < filteredProducts.length && (
                      <div className="load-more-wrap">
                        <button
                          className="load-more-btn"
                          type="button"
                          onClick={() => setVisibleCount((prev) => prev + 6)}
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <section className="perks-sectionProductCategory">
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
    </div>

  );
}