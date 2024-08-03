import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosinstance/axios";
import "../components/static/css/payment.css";
import { useNavigate } from "react-router-dom";
import moment from "moment-jalaali";


const ClientPaid = () => {
  const [userId, setUserId] = useState(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
  const [paids, setPaids] = useState([]);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        const user = response.data.id;
        setInfo(response.data);
        setUserId(user);
        setPaids(response.data.paid.reverse());
        console.log(response.data.paid)

        const productIds = new Set();
        const productPromises = response.data.paid
          .map((m) => {
            if (!productIds.has(m.product)) {
              productIds.add(m.product);
              return axiosInstance.get(`products/${m.product}/`);
            }
            return null;
          })
          .filter((promise) => promise !== null);

        const productResponses = await Promise.all(productPromises);
        const productData = productResponses.map((res) => res.data);
        setProducts(productData);
      } catch (error) {
        console.error("Error fetching data or posting payment:", error);
        setError("خطا در دریافت اطلاعات یا پرداخت.");
      }
    };

    fetchData();
  }, []);

  const getTotalPrice = (productId) => {
    const item = info.cart_user_paid.find((f) => f.product === productId);
    return item ? item.total_price : "N/A";
  };

  const handelFailed = (sellerId, productId,paidId) => {
    navigate("product", {
      state: { seller: sellerId, user: userId, product: productId,paid:paidId },
    });
    console.log(paidId)
  };

  const formatDateJalili = (date) => {
    return moment(date, "YYYY-MM-DD").format("jYYYY/jM/jD");
  };

  const defaultImage = "https://via.placeholder.com/150";

  return (
    <>
      <div className="container-fluid large">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>نام محصول</th>
                  <th>تعداد محصول</th>
                  <th>قیمت پرداخت شده</th>
                  <th> بار کد پست</th>
                  <th>وضعیت</th>
                  <th>تاریخ سفارش</th>
                </tr>
              </thead>
              <tbody>
                {paids.map((cartItem) => {
                  const product = products.find(
                    (prod) => prod.id === cartItem.product
                  );
                  if (!product) return null;
                  return (
                    <tr
                      style={{ cursor: "pointer" }}
                      key={cartItem.id}
                      onClick={() => handelFailed(cartItem.seller, product.id,cartItem.id)}
                    >
                      <td scope="row">
                        <img
                          style={{
                            display: "block",
                            width: "50px",
                            height: "50px",
                          }}
                          src={product.image ? product.image : defaultImage}
                          alt="try again"
                        />
                      </td>
                      <td>{product.product_name}</td>
                      <td>{cartItem.total_count}</td>
                      <td>{getTotalPrice(product.id)}</td>
                      <td>
                        {cartItem.post_id
                          ? cartItem.post_id
                          : "فروشنده بارکدی قرار نداده است"}
                      </td>
                      <td>{cartItem.state_display}</td>
                      <td>{formatDateJalili(cartItem.paid_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* for phone */}
      <div className="container-fluid small">
        {paids.map((cartItem) => {
          const product = products.find((prod) => prod.id === cartItem.product);
          if (!product) return null;
          return (
            <div className="parent" key={cartItem.id}>
              <div>
                <img
                  style={{
                    display: "block",
                    width: "120px",
                    margin: "1.2rem auto",
                  }}
                  src={product.image ? product.image : defaultImage}
                  alt="try again"
                />
              </div>
              <div className="box">
                <span>نام محصول:</span>
                <span>{product.product_name}</span>
              </div>
              <div className="box">
                <span>تعداد:</span>
                <span>{cartItem.total_count}</span>
              </div>
              <div className="box">
                <span>قیمت پرداخت شده:</span>
                <span>{getTotalPrice(product.id)}</span>
              </div>
              <div className="box">
                <span> بار کد پست:</span>
                <span>
                  {cartItem.post_id
                    ? cartItem.post_id
                    : "فروشنده بارکدی قرار نداده است"}
                </span>
              </div>
              <div className="box">
                <span>وضعیت :</span>
                <span>{cartItem.state_display}</span>
              </div>
              <div className="box">
                <span>تاریخ سفارش:</span>
                <span>{formatDateJalili(cartItem.paid_at)}</span>
              </div>
              <div className="box">
                <button onClick={() => handelFailed(cartItem.seller, product.id,cartItem.id)} className="btn btn-secondary">گزارش</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ClientPaid;

