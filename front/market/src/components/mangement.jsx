import React from "react";
import { Outlet, Link } from "react-router-dom";
import "../components/static/css/home.css"

const Mangement = () => {
  return (
    <>
      <div className="d-flex flex-row justify-content-center align-items-center my-4">
        <Link className="mx-3 mangement-link" to="sellermanagement">شکایت مشتری</Link>
        <Link className="mx-3 mangement-link" to="orders">سفارش ها</Link>
        <Link className="mx-3 mangement-link" to="upload">محصول جدید</Link>
        <Link className="mx-3 mangement-link" to="myproducts">محصولات</Link>
      </div>
      <Outlet />
    </>
  );
};

export default Mangement;
