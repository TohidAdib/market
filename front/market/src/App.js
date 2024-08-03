import React, { Component } from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/login";
import MyNavbar from "./components/navbar";
import SignInForm from "./components/signin";
import LogInSignIn from "./components/signinlogin";
import LogOut from "./components/logout";
import Home from "./components/home";
import AllItems from "./components/allstaf";
import Cart from "./components/cart";
import Savedproduts from "./components/savedproducts";
import OneItems from "./AppOneItems";
import SearchResults from "./components/search";
import ClientPaid from "./components/clientpaid";
import axiosInstance from "./axiosinstance/axios";
import SellerManager from "./components/sellermanager";
import Order from "./components/orders";
import Mangement from "./components/mangement";
import ProductUpload from "./components/productupload";
import MyProducts from "./components/managerproducts";
import UserInfo from "./components/userInformation";

class App extends Component {
  state = {
    token: localStorage.getItem("token"),
    seller: {},
    error: "",
  };

  async componentDidMount() {
    try {
      const response = await axiosInstance.get("users/information/");
      this.setState({ seller: response.data.seller });
    } catch (error) {
      this.setState({ error: "مججدا تلاش کنید" });
    }
  }

  render() {
    return (
      <div className="App">
        <MyNavbar />
        <OneItems />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="saved/" element={<Savedproduts />} />
          <Route path="allitems/" element={<AllItems />} />
          <Route path="payment/" element={<ClientPaid />} />
          <Route path="search-results" element={<SearchResults />} />
          <Route path="userinfo" element={<UserInfo />} />
          {this.state.seller && (
            <Route path="manager/" element={<Mangement />}>
              <Route path="sellermanagement" element={<SellerManager/>}/>
              <Route path="orders" element={<Order/>}/>
              <Route path="upload" element={<ProductUpload/>}/>
              <Route path="myproducts" element={<MyProducts/>}/>
            </Route>
          )}
          {this.state.token ? (
            <Route path="logout/" element={<LogOut />} />
          ) : (
            <Route path="loginsignin/" element={<LogInSignIn />}>
              <Route path="login" element={<LoginForm />} />
              <Route path="signin" element={<SignInForm />} />
            </Route>
          )}
        </Routes>
      </div>
    );
  }
}

export default App;
