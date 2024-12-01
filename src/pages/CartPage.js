// src/pages/CartPage.js
import React, { useState } from "react";
import CartSummary from "./CartSummary";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    { name: "Milk", quantity: 2, unitPrice: 1.5 },
    { name: "Eggs", quantity: 1, unitPrice: 2.0 },
    { name: "Bread", quantity: 1, unitPrice: 1.2 },
  ]);

  return (
    <div>
      <h1>Cart</h1>
      <CartSummary cartItems={cartItems} />
    </div>
  );
};

export default CartPage;
