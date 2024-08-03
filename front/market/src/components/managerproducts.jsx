import React, { useEffect, useState } from "react";
import axiosInstance from "../axiosinstance/axios";
import "../components/static/css/home.css";
import moment from "moment-jalaali";

const MyProducts = () => {
  const [products, setProduts] = useState([]);
  const [user, setUser] = useState(null);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [changedPrice, setchangedPrice] = useState(null);
  const [sending, setSending] = useState(false);
  const [OfferSending, setOfferSending] = useState(false);
  const [massage, setMassage] = useState(null);
  const [put, setPut] = useState({
    description: "",
    image: "",
    price: "",
    product_name: "",
    subcategory: "",
    count: "",
    user: user,
  });
  const [offPut, setOffPut] = useState({
    description: "",
    changed_price: "",
    product: "",
    user: user,
  });

  const defaultImage = "https://via.placeholder.com/150";

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        const categories = await axiosInstance.get("products/category/");
        setUser(response.data.id);
        setCategory(categories.data);
        setProduts(response.data.products_user.reverse());
      } catch (error) {
        setMassage("اتصال خود به اینترنت را برسی کنید");
      }
    };
    fetch();
  }, []);

  const formatDateJalili = (date) => {
    return moment(date, "YYYY-MM-DD").format("jYYYY/jM/jD");
  };

  const percent = () => {
    const offPrice = Number(currentPrice) - Number(changedPrice / 10);
    const offPercent = Math.round((offPrice * 100) / currentPrice);
    return offPercent;
  };

  const inputHandelChange = (e, productId) => {
    const { name, value, type } = e.target;
    const updatedPut = { ...put };

    if (type === "file") {
      updatedPut[name] = e.target.files[0];
    } else {
      updatedPut[name] = value;
    }

    if (name === "category") {
      const selectedCategory = category.find((f) => f.name === value);
      setSubCategory(selectedCategory ? selectedCategory.subcategories : []);
    }

    setPut(updatedPut);
    setCurrentPrice(put.price);
  };

  const offPutHandelChange = (e, productId) => {
    const { name, value } = e.target;
    setOffPut((prevOffPut) => ({
      ...prevOffPut,
      [name]: value,
    }));
    setchangedPrice(value);
  };

  const handleSubmit = async (e, productId) => {
    e.preventDefault();
    setSending(true);

    // پیدا کردن محصول مورد نظر بر اساس productId
    const currentProduct = products.find((product) => product.id === productId);

    // ایجاد یک فرم دیتا جدید
    const formData = new FormData();

    // پر کردن فرم دیتا با مقادیر موجود یا مقادیر جدید از put
    formData.append(
      "description",
      put.description || currentProduct.description
    );
    formData.append("price", put.price || currentProduct.price);
    formData.append(
      "product_name",
      put.product_name || currentProduct.product_name
    );
    formData.append(
      "subcategory",
      put.subcategory || currentProduct.subcategory.id
    );
    formData.append("count", put.count || currentProduct.count);
    formData.append("user", user); // شناسه‌ی کاربر

    // اگر تصویر جدیدی انتخاب شده بود، آن را اضافه کنید، در غیر این صورت، از تصویر قبلی استفاده نکنید
    if (put.image) {
      formData.append("image", put.image);
    }

    try {
      const response = await axiosInstance.put(
        `products/${productId}/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const response2 = await axiosInstance.get("users/information/");
      setProduts(response2.data.products_user);
      setSending(false);
    } catch (error) {
      setSending(false);
      setMassage("مشکلی رخ داده است");
    }
  };

  const handelOffer = async (e, productId) => {
    const formData = new FormData();
    const currentProduct = products.find((product) => product.id === productId);
    const offer = currentProduct.offer[0];

    formData.append(
      "changed_price",
      offPut.changed_price || (offer ? offer.changed_price : "nothing")
    );
    formData.append(
      "description",
      offPut.description || (offer ? offer.description : "nothing")
    );
    formData.append("product", productId);
    formData.append("user", user);

    try {
      if (offer) {
        setOfferSending(true);
        const response = await axiosInstance.put(
          `users/seller/create/offer/${offer.id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setOfferSending(false);
      } else {
        setOfferSending(true);
        const response = await axiosInstance.post(
          "users/seller/create/offer/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setOfferSending(false);
      }
      const response2 = await axiosInstance.get("users/information/");
      setProduts(response2.data.products_user);
      setSending(false);
    } catch (error) {
      setOfferSending(false);
      setMassage("مشکلی رخ داده است");
    }
  };

  return (
    <section className="container">
      {products.map((m) => (
        <form key={m.id} onSubmit={(e) => handleSubmit(e, m.id)}>
          <div
            style={{ border: "2px solid #444", borderRadius: "5px" }}
            className="row my-5 mx-1"
          >
            <div className="col-lg-4 col-md-6 col-12 my-4">
              <img
                style={{ maxWidth: "150px", maxHeight: "150px" }}
                src={m.image ? m.image : defaultImage}
                alt="Product"
              />
            </div>
            <div className="col-lg-4 col-md-6 col-12 my-4 show-c">
              <div>
                <span className="no-wrap">نام کالا:</span>
                <span className="mx-3">{m.product_name}</span>
              </div>
              <div>
                <span className="no-wrap">تعداد کالا:</span>
                <span className="mx-3">{m.count}</span>
              </div>
              <div>
                <span className="no-wrap">قیمت کالا:</span>
                <span className="mx-3">{m.price}</span>
              </div>
              <div>
                <span className="no-wrap">تاریخ:</span>
                <span className="mx-3">{formatDateJalili(m.created_at)}</span>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-12 my-4">
              <div className="no-wrap">توضیحات :</div>
              <span className="mx-3">{m.description}</span>
            </div>
            <div className="col-lg-6 col-md-6 col-12 my-4">
              <div className="my-3">
                <label className="my-2" htmlFor="category">
                  دسته:
                </label>
                <select
                  className="form-control"
                  name="category"
                  id="category"
                  onChange={(e) => inputHandelChange(e, m.id)}
                >
                  <option value="">انتخاب دسته</option>
                  {category.map((c, i) => (
                    <option key={i} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="my-3">
                <label className="my-2" htmlFor="subcategory">
                  زیر دسته:
                </label>
                <select
                  className="form-control"
                  name="subcategory"
                  id="subcategory"
                  onChange={(e) => inputHandelChange(e, m.id)}
                  value={put.subcategory}
                >
                  <option value="">انتخاب زیر دسته</option>
                  {subCategory.map((sub, i) => (
                    <option key={i} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="my-3">
                <label className="my-2" htmlFor="product_name">
                  نام محصول:
                </label>
                <input
                  name="product_name"
                  id="product_name"
                  type="text"
                  className="form-control"
                  value={put.product_name}
                  onChange={(e) => inputHandelChange(e, m.id)}
                />
              </div>
              <div className="my-3">
                <label className="my-2" htmlFor="image">
                  بار گزاری عکس:
                </label>
                <input
                  name="image"
                  id="image"
                  type="file"
                  className="form-control"
                  onChange={(e) => inputHandelChange(e, m.id)}
                />
              </div>
              <div className="my-3">
                <label className="my-2" htmlFor="count">
                  تعداد موجود:
                </label>
                <input
                  name="count"
                  id="count"
                  type="number"
                  className="form-control"
                  value={put.count}
                  onChange={(e) => inputHandelChange(e, m.id)}
                />
              </div>
              <div className="my-3">
                <label className="my-2" htmlFor="price">
                  قیمت محصول:
                </label>
                <input
                  name="price"
                  id="price"
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={put.price}
                  onChange={(e) => inputHandelChange(e, m.id)}
                />
              </div>
              <div className="my-3">
                <label className="my-2" htmlFor="description">
                  توضیحات:
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={put.description}
                  onChange={(e) => inputHandelChange(e, m.id)}
                ></textarea>
              </div>
              <button
                disabled={sending}
                type="submit"
                className="btn btn-lg btn-success"
              >
                {sending ? "در حال ارسال ..." : "ارسال"}
              </button>
            </div>
            <div className="col-lg-4 col-md-6 col-12 my-4">
              <div className="my-3">
                <label className="m-2" htmlFor="changed_price">
                  تخفیف:
                </label>
                <span>{percent()}%</span>
                <input
                  placeholder="قیمت تفیف خورده"
                  id="changed_price"
                  name="changed_price"
                  className="form-control"
                  type="text"
                  value={offPut.changed_price}
                  onChange={(e) => offPutHandelChange(e, m.id)}
                />
              </div>
              <div className="my-3">
                <label className="my-2" htmlFor="description">
                  توضیحات:
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={offPut.description}
                  onChange={(e) => offPutHandelChange(e, m.id)}
                  placeholder="این فیلد فقط به شما نمایش داده میشود"
                ></textarea>
              </div>
              <button
                onClick={(e) => handelOffer(e, m.id)}
                type="button"
                className="btn btn-lg btn-success"
                disabled={OfferSending}
              >
                {OfferSending ? "در حال ارسال ..." : "اعمال تخفیف"}
              </button>
              <div className="my-3">
                <span className="no-wrap">قیمت تخفیف خورده:</span>
                <span className="mx-3">
                  {m.offer[0]
                    ? m.offer[0].changed_price
                    : "این کالا تخفیف نخورده است"}
                </span>
              </div>
              <div className="my-3">
                <span className="no-wrap">توضیحات:</span>
                <span className="mx-3">
                  {m.offer[0]
                    ? m.offer[0].description
                    : "توضیحاتی ثبت نکرده اید"}
                </span>
              </div>
            </div>
          </div>
        </form>
      ))}
    </section>
  );
};

export default MyProducts;
