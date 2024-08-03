import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosinstance/axios";

const ProductUpload = () => {
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [user, setUser] = useState(null);
  const [sending, setSend] = useState(false);
  const [errors, setErrors] = useState(null);
  const [massage, setMassage] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axiosInstance.get("products/post/");
        const userId = (await axiosInstance.get("users/information/")).data.id;
        const categories = await axiosInstance.get("products/category/");
        setUser(userId);
        setCategory(categories.data);
        setErrors(null);
      } catch (error) {
        setErrors("اتصال اینترنت خود را برسی کنید");
      }
    };
    fetch();
  }, []);

  const handelChange = (e) => {
    const select = e.currentTarget;
    const selectedCategory = category.find((f) => select.value === f.name);
    setSubCategory(selectedCategory ? selectedCategory.subcategories : []);
  };

  const handelSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    formData.append("user", user);

    const subcategoryId = formData.get("subcategory");

    if (subcategoryId) {
      formData.set("subcategory", subcategoryId); // ID ساب‌کتگوری را تنظیم می‌کنیم
    }

    try {
      setSend(true);
      const response = await axiosInstance.post("products/post/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setErrors(null);
      setSend(false);
      setMassage("کالا با موفقیت اپلود شد");
    } catch (error) {
      setErrors("دوباره تلاش کنید");
      setSend(false);
    }
  };

  return (
    <form
      onSubmit={handelSubmit}
      className="container"
      encType="multipart/form-data"
    >
      <div className="row">
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <label className="my-2" htmlFor="category">
            دسته:
          </label>
          <select
            className="form-control"
            name="category"
            id="category"
            onChange={handelChange}
            required
          >
            <option value="">انتخاب دسته</option>
            {category.map((m, i) => (
              <option key={i} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <label className="my-2" htmlFor="subcategory">
            زیر دسته:
          </label>
          <select
            className="form-control"
            name="subcategory"
            id="subcategory"
            required
          >
            <option value="">انتخاب زیر دسته</option>
            {subCategory.map((m, i) => (
              <option key={i} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <label className="my-2" htmlFor="image">
            بار گزاری عکس:
          </label>
          <input
            name="image"
            id="image"
            type="file"
            className="form-control"
            required
          />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <label className="my-2" htmlFor="product_name">
            نام محصول:
          </label>
          <input
            name="product_name"
            id="product_name"
            type="text"
            className="form-control"
            required
          />
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <label className="my-2" htmlFor="count">
            تعداد موجود:
          </label>
          <input
            name="count"
            id="count"
            type="number"
            className="form-control"
            required
          />
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <label className="my-2" htmlFor="price">
            قیمت محصول:
          </label>
          <input
            name="price"
            id="price"
            type="number"
            step="0.01"
            className="form-control"
            required
          />
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <label className="my-2" htmlFor="description">
            توضیحات:
          </label>
          <textarea
            id="description"
            name="description"
            className="form-control"
            required
          ></textarea>
        </div>
        <div className="col-lg-4 col-md-6 col-12 my-3">
          <button disabled={sending} className="btn btn-lg btn-primary my-5">
            {sending ? "در حال ارسال ..." : "ارسال"}
          </button>
        </div>
      </div>
      <div className="col-12">
        {errors && <div className="alert alert-danger">{errors}</div>}
      </div>
      <div className="col-12">
        {massage && <div className="alert alert-success">{massage}</div>}
      </div>
    </form>
  );
};

export default ProductUpload;
