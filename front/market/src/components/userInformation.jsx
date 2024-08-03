import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosinstance/axios";
import "../components/static/css/home.css";
import moment from "moment-jalaali";

const UserInfo = () => {
  const [info, setInfo] = useState({});
  const [user, setUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [massage, setMassage] = useState("");
  const [userCity, setUserCity] = useState(null);
  const [userstate, setUserState] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isRequired, setIsRequired] = useState(false); // اضافه کردن این حالت
  const [put, setPut] = useState({
    national_code: "",
    phone: "",
    postal_code: "",
    address: "",
    city: "",
    user: user,
  });
  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        const states = await axiosInstance.get("state/");
        setInfo(response.data.user);
        setUser(response.data.id);
        setUserCity(
          response.data.user ? response.data.user.city.name : "----------"
        );
        setUserState(
          response.data.user ? response.data.user.city.state.name : "----------"
        );
        setStates(states.data);
        setIsRequired(!response.data.user ? true : false);
      } catch (error) {
        console.log(error);
      }
    };
    fetch();
  }, [user,isRequired]);

  const inputHandelChange = (e) => {
    const { name, value } = e.target;
    const updatedPut = { ...put };

    if (name === "state") {
      const selectedState = states.find((f) => f.name === value);
      setCities(selectedState ? selectedState.cities : []);
    }
    updatedPut[name] = value;
    setPut(updatedPut);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);

    // ایجاد یک فرم دیتا جدید
    const formData = new FormData();

    // پر کردن فرم دیتا با مقادیر موجود یا مقادیر جدید از put
    formData.append("address", put.address || info.address);
    formData.append("city", put.city || info.city.id);
    formData.append("national_code", put.national_code || info.national_code);
    formData.append("phone", put.phone || info.phone);
    formData.append("postal_code", put.postal_code || info.postal_code);
    formData.append("user", user); // شناسه‌ی کاربر

    if (info) {
      try {
        const response = await axiosInstance.put(
          `users/information/put/${info.id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response);
        const response2 = await axiosInstance.get("users/information/");
        setInfo(response2.data.user);
        setUserCity(
          response2.data.user ? response2.data.user.city.name : "----------"
        );
        setUserState(
          response2.data.user
            ? response2.data.user.city.state.name
            : "----------"
        );
        setSending(false);
      } catch (error) {
        setSending(false);
        setMassage("مشکلی رخ داده است");
      }
    } else {
      try {
        const response = await axiosInstance.post(
          "users/information/post/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(response);
        const response2 = await axiosInstance.get("users/information/");
        setInfo(response2.data.user);
        setUserCity(
          response2.data.user ? response2.data.user.city.name : "----------"
        );
        setUserState(
          response2.data.user
            ? response2.data.user.city.state.name
            : "----------"
        );
        setSending(false);
      } catch (error) {
        setSending(false);
        setMassage("مشکلی رخ داده است");
        console.log(error);
      }
    }
  };

  return (
    <section className="container">
      <div className="row">
        <div
          style={{ borderLeft: "2px solid #ccc" }}
          className="col-lg-4 col-md-6 col-12 my-4 title"
        >
          <span className="my-2">کد ملی:</span>
          <span className="mx-2">
            {info ? info.national_code : "---------"}
          </span>
        </div>
        <div
          style={{ borderLeft: "2px solid #ccc" }}
          className="col-lg-4 col-md-6 col-12 my-4 title"
        >
          <span className="my-2">شماره تلفن:</span>
          <span className="mx-2">{info ? info.phone : "---------"}</span>
        </div>
        <div
          style={{ borderLeft: "2px solid #ccc" }}
          className="col-lg-4 col-md-6 col-12 my-4 title"
        >
          <span className="my-2">کد پستی:</span>
          <span className="mx-2">
            {info ? info.postal_code : "-----------"}
          </span>
        </div>
        <div
          style={{ borderLeft: "2px solid #ccc" }}
          className="col-lg-4 col-md-6 col-12 my-4 title"
        >
          <span className="my-2">استان:</span>
          <span className="mx-2">{userstate ? userstate : "----------"}</span>
        </div>
        <div
          style={{ borderLeft: "2px solid #ccc" }}
          className="col-lg-4 col-md-6 col-12 my-4 title"
        >
          <span className="my-2">شهر:</span>
          <span className="mx-2">{userCity ? userCity : "----------"}</span>
        </div>
        <div style={{ borderBottom: "2px solid #ccc" }} className="col-12 my-5">
          <span className="my-2">ادرس:</span>
          <div className="my-2">{info ? info.address : "-----------"}</div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="row">
        <div className="col-lg-4 col-md-6 col-12 my-4">
          <label className="my-2" htmlFor="state">
            استان:
          </label>
          <select
            onChange={inputHandelChange}
            id="state"
            name="state"
            className="form-control"
            required={isRequired}
          >
            <option value="">استان خود را انتخاب کنید</option>
            {states.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-4">
          <label className="my-2" htmlFor="state">
            شهر:
          </label>
          <select
            onChange={inputHandelChange}
            id="city"
            name="city"
            className="form-control"
            required={isRequired}
          >
            <option value="">شهر خود را انتخاب کنید</option>
            {cities.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-4">
          <label className="my-2" htmlFor="national_code">
            کد ملی:
          </label>
          <input
            value={put.national_code}
            id="national_code"
            name="national_code"
            type="number"
            className="form-control"
            onChange={inputHandelChange}
            required={isRequired}
          />
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-4">
          <label className="my-2" htmlFor="phone">
            تلفن:
          </label>
          <input
            value={put.phone}
            id="phone"
            name="phone"
            type="number"
            className="form-control"
            onChange={inputHandelChange}
            required={isRequired}
          />
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-4">
          <label className="my-2" htmlFor="postal_code">
            کد پستی:
          </label>
          <input
            value={put.postal_code}
            id="postal_code"
            name="postal_code"
            type="number"
            className="form-control"
            onChange={inputHandelChange}
            required={isRequired}
          />
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-4">
          <label className="my-2" htmlFor="address">
            ادرس:
          </label>
          <textarea
            value={put.address}
            id="address"
            name="address"
            className="form-control"
            onChange={inputHandelChange}
            required={isRequired}
          />
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-4">
          <button disabled={sending} type="submit" className="btn btn-lg btn-info">
            {sending ? "در حال ارسال" : "ارسال"}
          </button>
        </div>
        <div className="col-12">{massage && <div className="alert alert-danger">{massage}</div>}</div>
      </form>
    </section>
  );
};

export default UserInfo;
