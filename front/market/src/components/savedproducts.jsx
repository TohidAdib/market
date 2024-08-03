import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import axiosInstance from "../axiosinstance/axios";
import { useNavigate } from "react-router-dom";
import SaveIcon from "./bookmark";
import StarRating from "./rating";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import "../components/static/css/home.css";

const SavedProducts = () => {
  const [error, setError] = useState(null);
  const [save, setSave] = useState([]);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true); // مدیریت وضعیت بارگذاری
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        setSave(response.data.saved_products || []);
        setUserId(response.data.id);

        const productIds = new Set();
        const productPromises = (response.data.saved_products || [])
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
        setError("سبد خرید شما خالی است");
      } finally {
        setLoading(false); // پایان بارگذاری
      }
    };

    fetchData();
  }, []);

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
  }, [products]);

  const handelOne = (e) => {
    const input = e.currentTarget;
    const id = input.getAttribute("pk");
    const item = products.find((f) => id == f.id);
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

  if (loading) {
    return <div>در حال بارگذاری...</div>; // نمایش پیام بارگذاری
  }

  return (
    <Container>
      {error && <div className="alert alert-danger">{error}</div>}
      <Row>
        {save.map((cartItem) => {
          const product = products.find((prod) => prod.id === cartItem.product);
          if (!product) return null;
          return (
            <Col key={cartItem.id} xs={12} md={6} lg={4}>
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
                  onClick={handelOne}
                  style={{
                    cursor: "pointer",
                  }}
                />
                <Card.Body
                  pk={product.id}
                  onClick={handelOne}
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
                  <button
                    price={product.price}
                    offerPrice={
                      product.offer[0] && product.offer[0].changed_price
                    }
                    pk={product.id}
                    onClick={handleCart}
                    className="btn btn-danger button"
                  >
                    افزودن به سبد خرید
                  </button>
                  <div className="card_footer">
                    <StarRating userId={userId} productId={product.id} />
                    <SaveIcon userId={userId} productId={product.id} />
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default SavedProducts;
