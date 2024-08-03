import React from "react";
import { useLocation } from "react-router-dom";
import { Row, Container, Card, Col } from "react-bootstrap";
import "./static/css/home.css";
import { useEffect } from "react";
import { useState } from "react";
import StarRating from "./rating";
import axiosInstance from "../axiosinstance/axios";
import SaveIcon from "./bookmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

const OneItem = () => {
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [offer, setOffer] = useState(null);
  const [rate, setRate] = useState(null);
  const location = useLocation();
  const data = location.state.fromItems;
  const defaultImage = "https://via.placeholder.com/150";

  useEffect(() => {
    const fetch = async () => {
      const input = document.querySelector(".button");
      const productId = input.getAttribute("pk");

      try {
        const response = await axiosInstance.get("users/information/");
        const user = response.data.id;
        setUserId(user);
        const isProductInCart = response.data.cart_user.some(
          (m) => m.product == productId
        );
        if (isProductInCart) {
          input.innerText = "اضافه شده است";
          input.classList.replace("btn-danger", "btn-primary");
          return;
        }

        setError(null);
      } catch (error) {
        setError("Please log in");
      }
    };

    const offer = data.offer[0];
    setOffer(offer);
    const rate = data.ratings[0];
    setRate(rate);

    fetch();
  }, []);

  const handleCart = async (e) => {
    const input = e.currentTarget;
    const productId = input.getAttribute("pk");
    const productPrice = input.getAttribute("price");
    const offerPrice = input.getAttribute("offerPrice");

    try {
      const response = await axiosInstance.get("users/information/");
      const userId = response.data.id;

      const isProductInCart = response.data.cart_user.some(
        (m) => m.product == productId
      );
      if (isProductInCart) {
        input.innerText = "اضافه شده است";
        input.classList.replace("btn-danger", "btn-primary");
        setError("Product already in cart");
        return;
      }

      await axiosInstance.post("users/cart/", {
        user: userId,
        product: productId,
        total_count: 1,
        total_price: offerPrice ? offerPrice : productPrice,
      });
      input.innerText = "اضافه شد";
      input.classList.replace("btn-danger", "btn-primary");

      setError(null);
    } catch (error) {
      setError("Please log in");
    }
  };

  return (
    <Container>
      {error && <div className="alert alert-danger">{error}</div>}
      <Row>
        <Col xs={12} md={12} lg={6}>
          <Card
            style={{ margin: "0 auto", width: "70%", marginBottom: "1rem" }}
          >
            <Card.Img
              variant="top"
              src={data.image ? data.image : defaultImage}
              className="card-img-one "
            />
            <Card.Body>
              <Card.Title className={offer && "mx-2"}>
                {offer && (
                  <FontAwesomeIcon
                    className="mx-2"
                    icon={faFire}
                    size="x"
                    color="red"
                  />
                )}
                {data.product_name}
              </Card.Title>
              <div>
                <Card.Text className={offer && "offer-text"}>
                  قیمت:{data.price}
                </Card.Text>
                <Card.Text>موجود:{data.count}</Card.Text>
                {offer && (
                  <>
                    <Card.Text className="text-danger">
                      {offer.percent}%
                    </Card.Text>
                    <Card.Text className="text-success">
                      قیمت:{offer.changed_price}
                    </Card.Text>
                  </>
                )}
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="card_footer">
                <button
                  style={{ backgroundColor: "purple", color: "#fff" }}
                  price={data.price}
                  offerPrice={offer && offer.changed_price}
                  pk={data.id}
                  onClick={handleCart}
                  className="btn button"
                >
                  افزودن به سبد خرید
                </button>
                <StarRating userId={userId} productId={data.id} />
                <SaveIcon userId={userId} productId={data.id} />
              </div>
            </Card.Footer>
          </Card>
        </Col>

        <Col xs={12} md={12} lg={6}>
          {rate ? (
            <div className="text my-3">
              <div className="text_div">
                <span>کمترین امتیاز داده شده توسط یک کاربر:</span>
                <span>{rate.min_score}</span>
              </div>
              <div className="text_div">
                <span>بیشترین امتیاز داده شده توسط یک کاربر:</span>
                <span>{rate.max_score}</span>
              </div>
              <div className="text_div">
                <span>تعداد کاربرانی که امتیاز داده اند:</span>
                <span>{rate.count_score}</span>
              </div>
              <div className="text_div">
                <span>مجموع امتیازات:</span>
                <span>{rate.total_score}</span>
              </div>
              <div className="text_div">
                <span>میانگین امتیازهای داده شده:</span>
                <span>{rate.average_score}</span>
              </div>
            </div>
          ) : (
            <div className="text my-3 mx-auto description">
              {data.description}
            </div>
          )}
        </Col>
        {data.ratings ? (
          <Col xs={12} md={12} lg={6}>
            <div className="text my-3 mx-auto description">
              {data.description}
            </div>
          </Col>
        ) : null}
      </Row>
    </Container>
  );
};

export default OneItem;
