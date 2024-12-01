// src/pages/ProfilePage.js
import React from "react";

const ProfilePage = ({ user }) => {
  return (
    <div>
      <h1>{user.name}'s Profile</h1>
      <h2>Grocery Activity</h2>
      <ul>
        {user.orders.map((order, index) => (
          <li key={index}>
            Order ID: {order.orderId}, Total: ${order.totalCost.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfilePage;
