import React from "react";
import axiosInstance from "../axiosinstance/axios";
import { useEffect, useState } from "react";
import moment from "moment-jalaali";
import { Container, Row, Col, Card, Modal, Button } from "react-bootstrap";


const SellerManager = () => {
  const [failed, setFalied] = useState([]);
  const [clients, setClients] = useState([]);
  const [paids, setPaids] = useState([]);
  const [products, setProducts] = useState([]);
  const defaultImage = "https://via.placeholder.com/150";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        setFalied(response.data.failed.reverse());

        const productIds = new Set();
        const productPromises = response.data.failed
          .map((m) => {
            if (!productIds.has(m.product)) {
              productIds.add(m.product);
              return axiosInstance.get(`products/${m.product}/`);
            }
            return null;
          })
          .filter((promis) => promis !== null);

        const productResponses = await Promise.all(productPromises);
        const productData = productResponses.map((m) => m.data);
        setProducts(productData);

        const clientIds = new Set();
        const clientPromises = response.data.failed
          .map((m) => {
            if (!clientIds.has(m.clientId)) {
              clientIds.add(m.clientIds);
              return axiosInstance.get(`users/information/${m.clientId}/`);
            }
            return null;
          })
          .filter((promise) => promise !== null);
        const clientResponses = await Promise.all(clientPromises);
        const clientData = clientResponses.map((res) => res.data);
        setClients(clientData);

        const paidIds = new Set();
        const paidPromises = response.data.failed.map((m) => {
          if (!paidIds.has(m.paid)) {
            paidIds.add(m.paid);
            return axiosInstance.get(`paid/detail/${m.paid}/`);
          }
          return null;
        });

        const paidResponses = await Promise.all(paidPromises);
        const paidData = paidResponses.map((m) => m.data);
        console.log(paidData)
        setPaids(paidData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, []);

  const formatDateJalili = (date) => {
    return moment(date, "YYYY-MM-DD").format("jYYYY/jM/jD");
  };

  return (
    <>
      {failed.map((m) => {
        const client = clients.find((f) => f.id == m.clientId);
        const product = products.find((f) => f.id == m.product);
        const paid = paids.find((f) => f.id == m.paid);
        if (!client || !product || !paid) return null;
        return (
          <section style={{borderBottom:"2px solid #999",padding:"10px"}} className="container">
            <div className="row">
              <div className="my-5 col-12">
                کاربر{" "}
                {client.user.first_name ? (
                  <span>
                    {client.user.first_name} {client.user.last_name}
                  </span>
                ) : client.user.last_name ? (
                  <span>
                    {client.user.first_name} {client.user.last_name}
                  </span>
                ) : (
                  client.username
                )}{" "}
                با اطلاعات زیر به کالای درج شده شکایتی ثبت کرده است.
              </div>

              <div className="col-12 my-2">
                <span>شماره تماس کاربر:</span>
                <span className="mx-3">{client.user.phone}</span>
              </div>
              <div className="col-12 my-2">
                <span>ایمیل کاربر:</span>
                <span className="mx-3">{client.email}</span>
              </div>
              <div className="col-12 my-2">
                <span>ادرس کاربر:</span>
                <span className="mx-3">
                  استان {client.user.city.state.name} شهر{" "}
                  {client.user.city.name} {client.user.address}
                </span>
              </div>
              <div className="col-12 my-2">
                <span>تاریخ ثبت:</span>
                <span className="mx-3">{formatDateJalili(m.created_at)}</span>
              </div>
              <div className="col-12 my-2">
                <span>شکایت ها :</span>
                <ul>
                  <li className="my-1">{m.post && m.post_help_text}</li>
                  <li className="my-1">{m.postId && m.postId_help_text}</li>
                  <li className="my-1">
                    {m.product_error && m.product_error_help_text}
                  </li>
                  <li className="my-1">
                    {m.product_false && m.product_false_help_text}
                  </li>
                  <li className="my-1">{m.description && m.description}</li>
                </ul>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6  col-12 mx-auto">
                <img
                  style={{ maxWidth: "150px", maxHeight: "150px" }}
                  src={product.image ? product.image : defaultImage}
                  alt="try again"
                />
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6  col-12 mx-auto">
                <div className="my-3">
                  <span>نام کالا:</span>
                  <span className="mx-3">{product.product_name}</span>
                </div>
                <div className="my-3">
                  <span>قیمت کالا:</span>
                  <span className="mx-3">
                    {product.offer[0]
                      ? product.offer[0].changed_price
                      : product.price}
                  </span>
                </div>
                <div className="my-3">
                  <span>تاریخ خرید:</span>
                  <span className="mx-3">{formatDateJalili(paid.paid_at)}</span>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4 col-md-6  col-12 mx-auto">
                <div className="my-3">
                  <span>تعداد کالا:</span>
                  <span className="mx-3">{paid.total_count}</span>
                </div>
                <div className="my-3">
                  <span>قیمت کل:</span>
                  <span className="mx-3">{paid.price}</span>
                </div>
                <div className="my-3">
                  <span>وضعیت کالا:</span>
                  <span className="mx-3">{paid.state_display}</span>
                </div>
                <div className="my-3">
                  <span>بار کد پستی:</span>
                  <span className="mx-3">{paid.post_id ? paid.post_id : "بار کدی قرار نداده اید"}</span>
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
};

export default SellerManager;
