import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import StarRating from "./rating";
import axiosInstance from "../axiosinstance/axios";
import SaveIcon from "./bookmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchResults = () => {
    const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const defaultImage = "https://via.placeholder.com/150";
  const navigate = useNavigate();
  const location = useLocation();
  const { results } = location.state || { results: [] };

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
  }, [results]);

  const oneProduct = (e) => {
    const input = e.currentTarget;
    const id = input.getAttribute("pk");
    const item = results.find((f) => id == f.id);
    navigate("oneitem", { state: { fromItems: item } });
  };

  const handleCart = async (e) => {
    const input = e.currentTarget;
    const productId = input.getAttribute("pk");
    const productPrice = input.getAttribute("price");
    const offerPrice = input.getAttribute("offerPrice")

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
      <h2 className='text-center my-5'>نتایج جستجو</h2>
      <Row>
        {results.length > 0 ? (
          results.map((product) => (
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
                    price={product.price}
                    offerPrice={product.offer[0] && product.offer[0].changed_price}
                    pk={product.id}
                    onClick={handleCart}
                    className="btn btn-danger button"
                  >
                    افزودن به سبد خرید
                  </button>
                  <StarRating userId={userId} productId={product.id} />
                  <SaveIcon userId={userId} productId={product.id} />
                </div>
              </Card.Footer>
            </Card>
          </Col>
          ))
        ) : (
          <p className='text-center my-5'>نتیجه‌ای یافت نشد</p>
        )}
      </Row>
    </Container>
  );
};

export default SearchResults;
