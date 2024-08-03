import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../components/static/css/home.css";
import { useState } from "react";
import { useEffect } from "react";
import axiosInstance from "../axiosinstance/axios";
import StarRating from "./rating";
import SaveIcon from "./bookmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

function Items(props) {
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); // استفاده از useNavigate

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
  }, [props.products]);

  const handleAll = () => {
    const data = props.products.filter(
      (f) => f.subcategory.category.name == props.category
    );
    navigate("allitems/", { state: { fromItems: data } });
  };

  const handelOne = (e) => {
    const input = e.currentTarget;
    const id = input.getAttribute("pk");
    const item = props.products.find((f) => id == f.id);
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

      setError(null);
    } catch (error) {
      setError("Please log in");
    }
  };

  const defaultImage = "https://via.placeholder.com/150";

  return (
    <Container className="my-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <Row>
        <div className="title my-3">
          <span
            className="all"
            onClick={handleAll} // استفاده از تابع هدایت
          >
            مشاهده همه
          </span>
          <span>{props.category}</span>
        </div>
        <div className="box shadow p-5">
          {props.products.map((product) => {
            if (product.subcategory.category.name === props.category) {
              return (
                <Col key={product.id} xs={12} md={6} lg={5} xl={4}>
                  <Card
                    style={{
                      cursor: "pointer",
                      maxWidth: "18rem",
                      margin: "1rem",
                    }}
                  >
                    <Card.Img
                      variant="top"
                      src={product.image ? product.image : defaultImage}
                      className="card-img "
                      pk={product.id}
                      onClick={handelOne}
                    />
                    <Card.Body pk={product.id} onClick={handelOne}>
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
                              <span className="offer-text">
                                {product.price}
                              </span>
                            </>
                          ) : (
                            <>
                              قیمت:<span>{product.price}</span>
                            </>
                          )}
                        </Card.Text>
                        <Card.Text>موجود:{product.count}</Card.Text>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <div className="card_footer">
                        <button
                          style={{ backgroundColor: "purple", color: "#fff" }}
                          price={product.price}
                          offerPrice={
                            product.offer[0] && product.offer[0].changed_price
                          }
                          pk={product.id}
                          onClick={handleCart}
                          className="btn  button"
                        >
                          افزودن به سبد خرید
                        </button>
                        <StarRating userId={userId} productId={product.id} />
                        <SaveIcon userId={userId} productId={product.id} />
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            }
            return null;
          })}
        </div>
      </Row>
    </Container>
  );
}

export default Items;
