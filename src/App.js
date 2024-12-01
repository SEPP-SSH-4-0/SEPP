import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage";
import CartPage from "./pages/CartPage";
import HistoryPage from "./pages/HistoryPAge";
import ProfilePage from "./pages/ProfilePage";
import Notification from "./pages/Notification";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<Notification />} />
      </Routes>
    </Router>
  );
};

export default App;
