// src/pages/ReceiptView.js
import React from "react";

const ReceiptView = ({ receipt }) => {
  return (
    <div>
      <h2>Receipt</h2>
      <p>Order ID: {receipt.orderId}</p>
      <p>Store: {receipt.storeName}</p>
      <ul>
        {receipt.items.map((item, index) => (
          <li key={index}>
            {item.name} - {item.quantity} x ${item.unitPrice.toFixed(2)}
          </li>
        ))}
      </ul>
      <h3>Total: ${receipt.totalCost.toFixed(2)}</h3>
      <h4>Delivery Split: ${receipt.deliverySplit.toFixed(2)}</h4>
    </div>
  );
};

export default ReceiptView;
