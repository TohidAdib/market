import React, { Component } from "react";
import Items from "./listitems";
import "../components/static/css/home.css";
import axiosInstance from "../axiosinstance/axios";
import Offer from "./offer";

class Home extends Component {
  state = {
    products: [],
  };

  async componentDidMount() {
    try {
      const response = await axiosInstance.get("products/create/");
      this.setState({ products: response.data });
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  render() {

    return (
      <>
        <Offer/>
        <Items products={this.state.products} category="موبایل"/>
        <Items products={this.state.products} category="آرایشی بهداشتی"/>
      </>
        
    );
  }
}

export default Home;
