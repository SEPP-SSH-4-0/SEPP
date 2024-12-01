// src/pages/HistoryPage.js
import React from "react";

const HistoryPage = ({ orders }) => {
  return (
    <div>
      <h1>Order History</h1>
      {orders.map((order, index) => (
        <div key={index}>
          <h3>Order ID: {order.orderId}</h3>
          <p>Store: {order.storeName}</p>
          <p>Total: ${order.totalCost.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};

export default HistoryPage;
