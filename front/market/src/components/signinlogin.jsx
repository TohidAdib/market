import React, { Component } from "react";
import { Outlet, Link } from "react-router-dom";
import "../components/static/css/home.css";

class LogInSignIn extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12 show-n">
            <Link className="mangement-link" to="login">
              ورود
            </Link>
            <Link className="mangement-link" to="signin">
              ثبت نام
            </Link>
          </div>
          <Outlet />
        </div>
      </div>
    );
  }
}

export default LogInSignIn;
