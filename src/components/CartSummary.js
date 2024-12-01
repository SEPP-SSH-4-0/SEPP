// src/pages/CartSummary.js
import React from "react";

const CartSummary = ({ cartItems }) => {
  const calculateTotal = () =>
    cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  return (
    <div>
      <h2>Cart Summary</h2>
      <ul>
        {cartItems.map((item, index) => (
          <li key={index}>
            {item.name} - {item.quantity} x ${item.unitPrice.toFixed(2)}
          </li>
        ))}
      </ul>
      <h3>Total: ${calculateTotal().toFixed(2)}</h3>
    </div>
  );
};

export default CartSummary;
