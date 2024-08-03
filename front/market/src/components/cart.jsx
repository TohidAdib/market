import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Modal, Button } from "react-bootstrap";
import axiosInstance from "../axiosinstance/axios";
import { useNavigate } from "react-router-dom";
import StarRating from "./rating";
import SaveIcon from "./bookmark";
import "../components/static/css/home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";

const Cart = () => {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [show, setShow] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [put, setPut] = useState({
    user: null,
    product: null,
    total_price: null,
    total_count: 1,
  });
  const [updatedItems, setUpdatedItems] = useState({});
  const [address, setAddress] = useState({});
  const [sumPrice, setSumPrice] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        if (!response.data.user){
          navigate("userinfo")
          return
        }
        setCart(response.data.cart_user);
        setUserId(response.data.id);
        const state = response.data.user.city.state.name
        const city = response.data.user.city.name
        const adderss = response.data.user.address
        const fullAddress = `${state}_${city}_${adderss}`
        setAddress(fullAddress)

        const productIds = new Set();
        const productPromises = response.data.cart_user
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
        const sum = response.data.cart_user[0].sum_price;
        setSumPrice(sum);
      } catch (error) {
        setError("سبد خرید شما خالی است");
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (productId, cartItemId) => {
    try {
      const response = await axiosInstance.get(`users/cart/${cartItemId}/`);
      const sum = response.data.total_price;
      const currentSum = sumPrice;
      setSumPrice(currentSum - sum);
      await axiosInstance.delete(`users/cart/${cartItemId}/`);
      setCart(cart.filter((item) => item.id !== cartItemId));
      setProducts(products.filter((product) => product.id !== productId));
    } catch (error) {
      setError("Something went wrong");
    }
  };

  const handelOne = (e) => {
    const input = e.currentTarget;
    const id = input.getAttribute("pk");
    const item = products.find((f) => id == f.id);
    navigate("oneitem", { state: { fromItems: item } });
  };

  const handleClose = () => {
    setShow(false);
    setSelectedCartItem(null);
  };

  const handleShow = (cartItem, productCount, productPrice, offerPrice) => {
    const finalPrice = offerPrice || productPrice;
    setShow(true);
    setSelectedCartItem(cartItem);
    setSelectedProduct(productCount);
    setSelectedPrice(finalPrice);
    setPut({
      user: userId,
      product: cartItem.product,
      total_price: cartItem.total_price,
      total_count: cartItem.total_count,
    });
  };

  useEffect(() => {
    if (selectedCartItem) {
      setPut((prevPut) => ({
        ...prevPut,
        total_price: prevPut.total_count * selectedPrice,
      }));
    }
  }, [put.total_count, selectedPrice, selectedCartItem]);

  const handelUpdate = async () => {
    const id = selectedCartItem.id;

    try {
      const response = await axiosInstance.put(`users/cart/${id}/`, put);
      const sum = response.data.sum_price;
      setSumPrice(sum);
      setUpdatedItems((prevItems) => ({
        ...prevItems,
        [selectedCartItem.product]: {
          total_count: put.total_count,
          total_price: put.total_price,
        },
      }));
      const updatedCart = cart.map((item) =>
        item.id === selectedCartItem.id
          ? { ...item, total_price: put.total_price,total_count:put.total_count }
          : item
      );
      setCart(updatedCart);
      setShow(false);
      setSelectedCartItem(null);
      setError(null);
    } catch (error) {
      setError("خطا مجددا امتحان کنید");
    }
  };

  const handelIncrement = async () => {
    setPut((prevPut) => ({
      ...prevPut,
      total_count:
        prevPut.total_count < selectedProduct
          ? prevPut.total_count + 1
          : selectedProduct,
    }));
  };

  const handelDecrement = () => {
    setPut((prevPut) => ({
      ...prevPut,
      total_count: prevPut.total_count > 1 ? prevPut.total_count - 1 : 1,
    }));
  };

  const handelPaid = async () => {
    if (cart && Array.isArray(cart)) {
      try {
        for (let m of cart) {
          const response = await axiosInstance(`products/${m.product}/`)
          const seller = response.data.user

          // ارسال درخواست پرداخت
          await axiosInstance.post("paid/post/", {
            product: m.product,
            user: userId,
            seller: seller,
            paid: true,
            price: Number(m.total_price),
            total_count:m.total_count,
            address:address,
            state: "confirm",
            post_id: ""
          });
  
          // ارسال درخواست به‌روز‌رسانی سبد خرید
          await axiosInstance.post("users/cartpaid/", {
            product: m.product,
            user: userId,
            total_price: m.total_price,
            total_count: m.total_count
          });
  
          // حذف محصول از سبد خرید
          await axiosInstance.delete(`users/cart/${m.id}/`);
          setMessage("با موفقیت پرداخت شد")
        }
        const response = await axiosInstance.get("users/information/");
        setCart(response.data.cart_user);
        
      } catch (error) {
        console.error("Error processing payment or updating cart:", error);
      }
    }
  };

  const defaultImage = "https://via.placeholder.com/150";

  return (
    <>
      <Container>
        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
        <Row>
          {cart.map((cartItem) => {
            const product = products.find(
              (prod) => prod.id === cartItem.product
            );
            if (!product) return null;
            const offer = product.offer ? product.offer[0] : null;
            const finalPrice = offer ? offer.changed_price : product.price;
            const isUpdated = updatedItems[product.id];
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
                    <Card.Title className={offer && "mx-2"}>
                      {product.product_name}
                      {offer && (
                        <FontAwesomeIcon
                          className="mx-2"
                          icon={faFire}
                          size="x"
                          color="red"
                        />
                      )}
                    </Card.Title>
                    <div>
                      <Card.Text>قیمت: {product.price}</Card.Text>
                      {offer && (
                        <Card.Text className="text-success">
                          قیمت تخفیف: {offer.changed_price}
                        </Card.Text>
                      )}
                      <Card.Text>موجود: {product.count}</Card.Text>
                      {isUpdated ? (
                        <>
                          <Card.Text className="text-success">
                            تعداد انتخاب شده: {isUpdated.total_count}
                          </Card.Text>
                          <Card.Text className="text-success">
                            قیمت نهایی: {isUpdated.total_price}
                          </Card.Text>
                        </>
                      ) : (
                        <>
                          <Card.Text className="text-success">
                            تعداد انتخاب شده: {cartItem.total_count}
                          </Card.Text>
                          <Card.Text className="text-success">
                            قیمت نهایی: {cartItem.total_price}
                          </Card.Text>
                        </>
                      )}
                    </div>
                  </Card.Body>
                  <Card.Footer>
                    <div className="card_footer">
                      <button
                        onClick={() => handleDelete(product.id, cartItem.id)}
                        className="btn btn-danger"
                      >
                        حذف از سبد خرید
                      </button>
                      <Button
                        onClick={() =>
                          handleShow(
                            cartItem,
                            product.count,
                            product.price,
                            offer ? offer.changed_price : null
                          )
                        }
                        variant="primary"
                      >
                        تعداد محصول
                      </Button>
                      <StarRating userId={userId} productId={product.id} />
                      <SaveIcon userId={userId} productId={product.id} />
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
          <Col xs={12} md={12} lg={12}>
            <div className="d-flex justify-content-center align-items-center payment-tab my-4 p-4">
              <span className="mx-5 text-success">مجموع قیمت: {sumPrice}</span>
              <button onClick={handelPaid} className="btn btn-primary">پرداخت</button>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>تعداد کالا</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-center align-items-center">
            <button className="btn btn-warning mx-2" onClick={handelDecrement}>
              -
            </button>
            <span className="bg-light text-dark mx-2">{put.total_count}</span>
            <button className="btn btn-success mx-2" onClick={handelIncrement}>
              +
            </button>
            <span className="bg-light text-dark mx-2">{put.total_price}</span>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            نه
          </Button>
          <Button variant="primary" onClick={handelUpdate}>
            اره
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Cart;
