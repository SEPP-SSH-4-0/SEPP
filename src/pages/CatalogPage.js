import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';

function CatalogPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Replace with your API or mock server endpoint
    fetch('http://localhost:5000/products')
      .then((response) => response.json())
      .then((data) => setProducts(data));
  }, []);

  const addToCart = (product) => {
    console.log(`${product.name} added to cart!`);
    // Logic to add to cart
  };

  return (
    <div className="catalog-page">
      <h1>Product Catalog</h1>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={addToCart} 
          />
        ))}
      </div>
    </div>
  );
}

export default CatalogPage;
