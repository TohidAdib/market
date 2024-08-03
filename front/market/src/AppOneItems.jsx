import React from "react";
import OneItem from "./components/oneitem";
import Failed from "./components/failed";
import { Routes, Route } from "react-router-dom";
import ClientPaid from "./components/clientpaid";
import UserInfo from "./components/userInformation";
const OneItems = () => {
  return (
    <Routes>
      <Route path="allitems/oneitem/" element={<OneItem />} />
      <Route path="cart/oneitem" element={<OneItem />} />
      <Route path="search-results/oneitem" element={<OneItem />} />
      <Route path="saved/oneitem/" element={<OneItem />} />
      <Route path="oneitem/" element={<OneItem />} />
      <Route path="payment/product" element={<Failed />} />
      <Route path="payment/product/payment" element={<ClientPaid />} />
      <Route path="/cart/userinfo" element={<UserInfo />} />
    </Routes>
  );
};

export default OneItems;
