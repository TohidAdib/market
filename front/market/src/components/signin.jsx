import React, { Component } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import axios from "axios";

class SignInForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      password2: "",
      first_name: "",
      last_name: "",
      email: "",
      recaptchaToken: "",
      errors: {}, 
      sending: false,
    };
    this.recaptchaRef = React.createRef();  // ایجاد یک رفرنس برای ReCAPTCHA
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    this.setState({ sending: true, errors: {} });  

    try {
      const response = await axios.post("http://127.0.0.1:8080/users/signin/", {
        username: this.state.username,
        password: this.state.password,
        password2: this.state.password2,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        email: this.state.email,
        recaptcha_response: this.state.recaptchaToken,
      });

      localStorage.setItem("token", response.data.token);
      this.setState({ sending: false });
      window.location = "/";
    } catch (error) {
      const errorData = error.response ? error.response.data : { non_field_errors: [error.message] };
      this.setState({ errors: errorData, sending: false });
      this.resetRecaptcha();  // ریست کردن ReCAPTCHA در صورت وقوع خطا
    }
  };

  handleRecaptcha = (token) => {
    this.setState({ recaptchaToken: token });
  };

  resetRecaptcha = () => {
    this.recaptchaRef.current.reset();  // ریست کردن ReCAPTCHA
    this.setState({ recaptchaToken: "" });  // خالی کردن توکن ReCAPTCHA
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  render() {
    const { errors, sending } = this.state;

    return (
      <form onSubmit={this.handleSubmit} className="container mt-5">
        <div className="row">
          <div className="form-group col-lg-6 col-12 my-2">
            <label>نام کاربری:</label>
            <input
              type="text"
              name="username"
              value={this.state.username}
              onChange={this.handleChange}
              className="form-control"
              required
            />
            {errors.username && (
              <div className="my-1 alert alert-danger">نام کاربر قبلا استفاده شده است</div>
            )}
          </div>
          <div className="form-group col-lg-6 col-12 my-2">
            <label>رمز:</label>
            <input
              type="password"
              name="password"
              value={this.state.password}
              onChange={this.handleChange}
              className="form-control"
              required
            />
            {errors.password && (
              <div className="my-1 alert alert-danger">پسوردها با متفاوت هستند</div>
            )}
          </div>
          <div className="form-group col-lg-6 col-12 my-2">
            <label>تایید رمز:</label>
            <input
              type="password"
              name="password2"
              value={this.state.password2}
              onChange={this.handleChange}
              className="form-control"
              required
            />
            {errors.password2 && (
              <div className="my-1 alert alert-danger">پسوردها با متفاوت هستند</div>
            )}
          </div>
          <div className="form-group col-lg-6 col-12 my-2">
            <label>نام:</label>
            <input
              type="text"
              name="first_name"
              value={this.state.first_name}
              onChange={this.handleChange}
              className="form-control"
              required
            />
            {errors.first_name && (
              <div className="my-1 alert alert-danger">نام نامعتبر است</div>
            )}
          </div>
          <div className="form-group col-lg-6 col-12 my-2">
            <label>نام خانوادگی:</label>
            <input
              type="text"
              name="last_name"
              value={this.state.last_name}
              onChange={this.handleChange}
              className="form-control"
              required
            />
            {errors.last_name && (
              <div className="my-1 alert alert-danger">نام خانوادگی نا معتبر است</div>
            )}
          </div>
          <div className="form-group col-lg-6 col-12 my-2">
            <label>ایمیل:</label>
            <input
              type="text"
              name="email"
              value={this.state.email}
              onChange={this.handleChange}
              className="form-control"
              required
            />
            {errors.email && (
              <div className="my-1 alert alert-danger">ایمیل قبلا استفاده شده است</div>
            )}
          </div>
          <div className="form-group my-4 col-lg-3 col-md-6 col-12 mx-auto">
            <ReCAPTCHA
              sitekey="6LdJjBUqAAAAAJI1gWog6N8c_jqqIMEhYzxP7Qyx"
              onChange={this.handleRecaptcha}
              ref={this.recaptchaRef}  // رفرنس دادن به ReCAPTCHA
            />
          </div>
          <div className='col-12 my-2"'>
            <button
              disabled={sending}
              type="submit"
              className="btn btn-primary"
            >
              {sending ? "در حال ارسال..." : "ثبت نام"}
            </button>
          </div>
          <div className='col-12 my-2"'>
            {errors.non_field_errors && (
              <div className="my-3 alert alert-danger">
                {errors.non_field_errors.map((error, index) => (
                  <div className="my-3" key={index}>پسورد ها یکسان نیستند</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    );
  }
}

export default SignInForm;
