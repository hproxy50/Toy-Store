import React from "react";
import HeaderBar from "./HeaderBar";
import SideAds from "./SideAds";
import "./CustomerLayout.css";

const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout-container">

      <HeaderBar />

      <div className="layout-body">
        <SideAds />

        <div className="layout-content">
          {children}
        </div>

        <SideAds />
      </div>

    </div>
  );
};

export default CustomerLayout;