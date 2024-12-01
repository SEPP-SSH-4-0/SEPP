// src/pages/Notification.js
import React from "react";

const Notification = ({ notifications, onAcknowledge }) => {
  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification, index) => (
          <li key={index}>
            {notification.message}
            <button onClick={() => onAcknowledge(index)}>Acknowledge</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;
