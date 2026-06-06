import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Search.css";
import { productList } from "../../components/Caterogy/Categoy";

const ProductCard = ({ item, onProductClick }) => {
  return (
    <div
      className="product-card"
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
      <p>{item.desc}</p>

      <div className="price-box">
        <span className="new-price">{item.price}</span>
      </div>

      <button
        className="buy-btn"
        onClick={(e) => {
          e.stopPropagation();
          onProductClick(item.id);
        }}
      >
        View Product
      </button>
    </div>
  );
};

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState([]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Search local productList
  const searchLocalProducts = (searchQuery) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];
    return productList.filter((product) =>
      product.name.toLowerCase().includes(normalizedQuery) || product.category.toLowerCase().includes(normalizedQuery)
    );
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSearchParams({ q: value });
    setResults(searchLocalProducts(value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResults(searchLocalProducts(query));
  };

  // Load initial results from URL query
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    setQuery(urlQuery);
    if (urlQuery.trim()) {
      setResults(searchLocalProducts(urlQuery));
    } else {
      setResults([]);
    }
  }, [searchParams]);

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <h1>Search Products</h1>
          <p>Find the perfect product for you</p>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Search for products..."
            value={query}
            onChange={handleInputChange}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            Search
          </button>
        </form>

        <div className="search-results">
          {!results.length && query && (
            <p className="no-results">No products found for "{query}"</p>
          )}

          {results.length > 0 && (
            <>
              <p className="results-count">Found {results.length} product(s)</p>
              <div className="products-grid">
                {results.map((product) => (
                  <ProductCard
                    key={product.id}
                    item={{
                      id: product.id,
                      title: product.name,
                      desc: product.description || 'No description',
                      price: `${product.price.toLocaleString()}đ`,
                      thumb: product.thumbnail_url,
                    }}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}