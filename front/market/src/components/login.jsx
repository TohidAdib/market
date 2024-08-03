import React, { Component } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";
import key from "../REACAPCH/reacpcha";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      recaptchaToken: "",
      sending: false,
      errorMessage: "",
    };
    this.recaptchaRef = React.createRef();  // اضافه کردن رفرنس برای ReCAPTCHA
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({ sending: true, errorMessage: "" });

    try {
      const response = await axios.post("http://127.0.0.1:8080/users/login/", {
        username: this.state.username,
        password: this.state.password,
        recaptcha_response: this.state.recaptchaToken,
      });

      // ذخیره توکن و ریدایرکت به صفحه اصلی
      localStorage.setItem("token", response.data.token);
      this.setState({ sending: false });
      window.location = "/";
    } catch (error) {
      this.setState({
        sending: false,
        errorMessage: "یوزر وجود ندارد",
      });
      this.resetRecaptcha();  // ریست کردن ReCAPTCHA در صورت وقوع خطا
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
    }
  };

  handleRecaptcha = (token) => {
    this.setState({ recaptchaToken: token });
  };

  resetRecaptcha = () => {
    this.recaptchaRef.current.reset();  // ریست کردن ReCAPTCHA
    this.setState({ recaptchaToken: "" });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { username, password, sending, errorMessage } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="container mt-5">
        <div className="row">
          <div className="form-group col-lg-6 col-12 my-2">
            <label>نام کاربری:</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={this.handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group col-lg-6 col-12 my-2">
            <label>رمز:</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="form-group my-4 col-lg-3 col-md-6 col-12 mx-auto">
            <ReCAPTCHA
              sitekey={key}
              onChange={this.handleRecaptcha}
              ref={this.recaptchaRef}
            />
          </div>
          <div className='col-12 my-2"'>
            <button disabled={sending} type="submit" className="btn btn-primary">
              {sending ? "در حال ارسال..." : "ورود"}
            </button>
          </div>
        </div>
        {errorMessage && (
          <div className="col-12">
            <div className="alert alert-danger">{errorMessage}</div>
          </div>
        )}
      </form>
    );
  }
}

export default LoginForm;
