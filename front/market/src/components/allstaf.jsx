import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import axiosInstance from "../axiosinstance/axios";
import StarRating from "./rating";
import SaveIcon from "./bookmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

function AllItems() {
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const location = useLocation();
  const data = location.state?.fromItems || [];
  const defaultImage = "https://via.placeholder.com/150";
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const buttons = document.querySelectorAll(".button");

      try {
        const response = await axiosInstance.get("users/information/");
        const user = response.data.id;
        setUserId(user);

        buttons.forEach((button) => {
          const productId = button.getAttribute("pk");
          response.data.cart_user.forEach((m) => {
            if (m.product == productId) {
              button.innerText = "اضافه شده است";
              button.classList.replace("btn-danger", "btn-primary");
            }
          });
        });

        setError(null);
      } catch (error) {
        setError("Please log in");
      }
    };

    fetchData();
  }, [data]); // اضافه کردن 'data' به آرایه وابستگی‌ها

  const oneProduct = (e) => {
    const input = e.currentTarget;
    const id = input.getAttribute("pk");
    const item = data.find((f) => id == f.id);
    navigate("oneitem", { state: { fromItems: item } });
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
    <Container>
      {error && <div className="alert alert-danger">{error}</div>}
      <Row>
        {data.map((product) => (
          <Col key={product.id} xs={12} md={6} lg={4}>
            <Card
              style={{
                maxWidth: "18rem",
                margin: "1rem auto",
              }}
            >
              <Card.Img
                variant="top"
                src={product.image ? product.image : defaultImage}
                className="card-img"
                pk={product.id}
                onClick={oneProduct}
                style={{
                  cursor: "pointer",
                }}
              />
              <Card.Body
                pk={product.id}
                onClick={oneProduct}
                style={{
                  cursor: "pointer",
                }}
              >
                <Card.Title className={product.offer[0] && "mx-2"}>
                  {product.offer[0] && (
                    <FontAwesomeIcon
                      className="mx-2"
                      icon={faFire}
                      size="x"
                      color="red"
                    />
                  )}
                  {product.product_name}
                </Card.Title>
                <div>
                  <Card.Text>
                    {product.offer[0] ? (
                      <>
                        قیمت:
                        <span className="text-success mx-4">
                          {product.offer[0].changed_price}
                        </span>
                        <span className="offer-text">{product.price}</span>
                      </>
                    ) : (
                      <>
                        قیمت:<span>{product.price}</span>
                      </>
                    )}
                  </Card.Text>
                  <Card.Text>موجود: {product.count}</Card.Text>
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="card_footer">
                  <button
                    style={{ backgroundColor: "#9c88ff", color: "#fff" }}
                    price={product.price}
                    offerPrice={
                      product.offer[0] && product.offer[0].changed_price
                    }
                    pk={product.id}
                    onClick={handleCart}
                    className="btn button"
                  >
                    افزودن به سبد خرید
                  </button>
                  <StarRating userId={userId} productId={product.id} />
                  <SaveIcon userId={userId} productId={product.id} />
                </div>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default AllItems;
