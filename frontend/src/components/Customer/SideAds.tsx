import React from "react";

const SideAds: React.FC = () => {
  return (
    <div className="side-ads">
      <div className="ad-box">
        <h4>🔥 Hot Deal</h4>
        <p>Giảm 20% Gundam</p>
      </div>

      <div className="ad-box">
        <h4>🚀 New</h4>
        <p>MG Strike Freedom</p>
      </div>

      <div className="ad-box">
        <h4>🎁 Combo</h4>
        <p>Mua 2 giảm 10%</p>
      </div>
    </div>
  );
};

export default SideAds;