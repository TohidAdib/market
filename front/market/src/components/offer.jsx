import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../axiosinstance/axios";
import StarRating from "./rating";
import SaveIcon from "./bookmark";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

const Offer = () => {
  const [offer, setOffer] = useState([]);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await axiosInstance.get("users/information/");
        const user = response1.data.id;
        setUserId(user);

        const response = await axiosInstance.get("users/seller/get/");
        setOffer(response.data);
        console.log(response.data);
      } catch (error) {
        setError("somthings went wrong");
        console.log(error);
      }
    };

    fetchData();
  }, []);
  const defaultImage = "https://via.placeholder.com/150";

  const oneProduct = (e) => {
    const input = e.currentTarget;
    const id = input.getAttribute("pk");
    const item = offer.find((f) => id == f.product.id);
    navigate("oneitem", { state: { fromItems: item.product } });
  };

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

      setError(null); // Clear any previous error
    } catch (error) {
      setError("Please log in");
    }
  };
  return (
    <>
      <Container>
        {error && <div className="alert alert-danger">{error}</div>}
        <Row>
          {offer.map((product) => (
            <Col key={product.id} xs={12} md={6} lg={4}>
              <Card
                style={{
                  maxWidth: "15rem",
                  margin: "1rem auto",
                }}
              >
                <Card.Img
                  variant="top"
                  src={
                    product.product.image ? product.product.image : defaultImage
                  }
                  className="card-img"
                  pk={product.product.id}
                  onClick={oneProduct}
                  style={{
                    cursor: "pointer",
                  }}
                />
                <Card.Body
                  pk={product.product.id}
                  onClick={oneProduct}
                  style={{
                    cursor: "pointer",
                  }}
                >
                  <Card.Title>
                    <FontAwesomeIcon
                      className="mx-2"
                      icon={faFire}
                      size="x"
                      color="red"
                    />
                    {product.product.product_name}
                  </Card.Title>
                  <div>
                    <Card.Text className="offer-text">
                      قیمت: {product.product.price}
                    </Card.Text>
                    <Card.Text>موجود: {product.product.count}</Card.Text>
                    <Card.Text className="text-danger">
                      {product.percent}%
                    </Card.Text>
                    <Card.Text className="text-success">
                      قیمت: {product.changed_price}
                    </Card.Text>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="card_footer">
                    <button
                      style={{ backgroundColor: "purple", color: "#fff" }}
                      price={product.product.price}
                      pk={product.product.id}
                      offerPrice={
                        product.product.offer[0] && product.product.offer[0].changed_price
                      }
                      onClick={handleCart}
                      className="btn button"
                    >
                      افزودن به سبد خرید
                    </button>
                    <StarRating
                      userId={userId}
                      productId={product.product.id}
                    />
                    <SaveIcon userId={userId} productId={product.product.id} />
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default Offer;
