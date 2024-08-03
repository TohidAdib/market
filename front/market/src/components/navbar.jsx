import React, { useState, useEffect } from "react";
import {
  Navbar,
  Nav,
  NavDropdown,
  Form,
  FormControl,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../axiosinstance/axios";
import "../components/static/css/home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";

const MyNavbar = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [searchTerm, setSearchTerm] = useState("");
  const [seller, setSeller] = useState({});
  const [userInfo, setUserInfo] = useState({});
  const [error, setError] = useState("");
  const [notifManager, setNotifManager] = useState(null);
  const [notifCart, setNotifCart] = useState(null);
  const [notifSaved, setNotifSaved] = useState(null);
  const [notifOrdered, setNotifOrdered] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    const fetch = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        setNotifManager(response.data.failed.length);
        setNotifCart(response.data.cart_user.length);
        setNotifSaved(response.data.saved_products.length);
        setNotifOrdered(response.data.paid.length);
        setSeller(response.data.seller);
        setSeller(response.data.user);
      } catch (error) {
        setError("مجددا تلاش کنید");
      }
    };
    fetch();
  }, [token]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.get(
        `products/search/?q=${searchTerm}`
      );
      navigate("/search-results", { state: { results: response.data } });
    } catch (error) {
      console.error("Error searching products:", error);
      setError("مشکلی در جستجو پیش آمده است.");
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Form
        style={{marginRight:"1.2rem"}}
        className="d-flex flex-row align-items-center search-form"
        onSubmit={handleSearch}
      >
        <FormControl
          type="text"
          placeholder="Search"
          className="mr-sm-2"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button className="mx-1" variant="outline-success" type="submit">
          جستوجو
        </Button>
      </Form>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mx-auto">
          <Nav.Link className="nav" as={Link} to="/">
            صفحه اصلی
          </Nav.Link>
          <Nav.Link className="nav" as={Link} to="/userinfo">
            {userInfo ? "اپدیت اطلاعات کاربری" : "تکمیل اطلاعات کاربری"}
          </Nav.Link>
          <NavDropdown className="nav" title="..." id="basic-nav-dropdown">
            <NavDropdown.Item className="show-n" as={Link} to="/cart">
              <div className="show-n">
                <span>سبد خرید</span>
                {notifCart ? (
                  <span className="notif-badge">
                    <FontAwesomeIcon className="mx-2" size="x" icon={faBell} />
                    {notifCart}
                  </span>
                ) : null}
              </div>
            </NavDropdown.Item>
            <NavDropdown.Item className="show-n" as={Link} to="payment/">
              <div className="show-n">
                <span>سفارشات</span>
                {notifOrdered ? (
                  <span className="notif-badge">
                    <FontAwesomeIcon className="mx-2" size="x" icon={faBell} />
                    {notifOrdered}
                  </span>
                ) : null}
              </div>
            </NavDropdown.Item>
            <NavDropdown.Item className="show-n" as={Link} to="/saved">
              <div className="show-n">
                <span>ذخیره ها</span>
                {notifSaved ? (
                  <span className="notif-badge">
                    <FontAwesomeIcon className="mx-2" size="x" icon={faBell} />
                    {notifSaved}
                  </span>
                ) : null}
              </div>
            </NavDropdown.Item>
            <NavDropdown.Item className="show-n" as={Link} to="/action/3.3">
              <div>
                <span>Something</span>
              </div>
            </NavDropdown.Item>
            {seller && (
              <>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="manager/">
                  <div className="show-n">
                    <span>مدیریت</span>
                    {notifManager ? (
                      <span className="notif-badge">
                        <FontAwesomeIcon
                          className="mx-2"
                          size="x"
                          icon={faBell}
                        />
                        {notifManager}
                      </span>
                    ) : null}
                  </div>
                </NavDropdown.Item>
              </>
            )}
          </NavDropdown>
          {token ? (
            <Nav.Link
              className="text-light bg-danger rounded-2 nav"
              as={Link}
              to="/logout"
            >
              خروج
            </Nav.Link>
          ) : (
            <Nav.Link
              className="text-light bg-success rounded-2 nav"
              as={Link}
              to="/loginsignin"
            >
              ورود/ثبت نام
            </Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default MyNavbar;
