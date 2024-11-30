import React from 'react';

function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>Price: ${product.price}</p>
      <p>{product.available ? 'In Stock' : 'Out of Stock'}</p>
      <button 
        onClick={() => onAddToCart(product)} 
        disabled={!product.available}
      >
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
