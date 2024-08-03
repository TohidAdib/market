import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosinstance/axios";
import moment from "moment-jalaali";

const Order = () => {
  const [orderedPaids, setOrderedPaids] = useState([]);
  const [errors, setErrors] = useState(null);
  const [sending,seSending] = useState(false);
  const [massage, setMassage] = useState("");

  const defaultImage = "https://via.placeholder.com/150";

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await axiosInstance.get("users/information/");
        const response2 = await axiosInstance.get("paid/get/");
        const orderPaids = response2.data.filter(
          (f) => f.seller == response.data.id
        ).reverse()
        setOrderedPaids(orderPaids);
      } catch (error) {
        setErrors("مشکلی در بارگیری اطلاعات وجود دارد.");
      }
    };
    fetch();
  }, []);

  const formatDateJalili = (date) => {
    return moment(date, "YYYY-MM-DD").format("jYYYY/jM/jD");
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      product: formData.get("product"),
      user: formData.get("user"),
      seller: formData.get("seller"),
      paid: formData.get("paid") === "true", // تبدیل به بولین
      price: formData.get("price"),
      total_count: formData.get("total_count"),
      state: formData.get("state"),
      post_id: formData.get("post_id"),
      address: formData.get("address"),
      paid_at: formData.get("paid_at"),
    };

    try {
      seSending(true)
      const response = await axiosInstance.put(
        `paid/detail/${id}/`,
        updatedData
      );
      setErrors(null);
      const response2 = await axiosInstance.get("users/information/");
      const response3 = await axiosInstance.get("paid/get/");
      const orderPaids = response3.data.filter(
        (f) => f.seller == response2.data.id
      );
      setOrderedPaids(orderPaids);
      seSending(false)
      setMassage("با موفقیت ثبت شد")
    } catch (error) {
      setErrors("مشکلی در ثبت اطلاعات وجود دارد.");
      seSending(false)
    }
  };

  return (
    <div className="container">
      {orderedPaids.map((m) => (
        <div
          key={m.id}
          style={{ border: "2px solid #ccc", borderRadius: "5px" }}
          className="row my-5 mx-3"
        >
          <div className="col-md-12 col-lg-4">
            <div className="my-2">
              <span>یوزر:</span>
              <span className="mx-2">{m.user.username}</span>
            </div>
            <div className="my-2">
              <span>ادرس:</span>
              <span className="mx-2">{m.address}</span>
            </div>
            <div className="my-2">
              <span>کد پستی:</span>
              <span className="mx-2">{m.user.user.postal_code}</span>
            </div>
            <div className="my-2">
              <span>وضعیت پرداخت:</span>
              <span className="mx-2">
                {m.paid ? "پرداخت شده" : "در انتظار پرداخت"}
              </span>
            </div>
            <div className="my-2">
              <span>تاریخ پرداخت:</span>
              <span className="mx-2">{formatDateJalili(m.paid_at)}</span>
            </div>
            <div className="my-2">
              <span>تعداد کالا:</span>
              <span className="mx-2">{m.total_count}</span>
            </div>
            <div className="my-2">
              <span>قیمت پرداختی:</span>
              <span className="mx-2">{m.price}</span>
            </div>
            <div className="my-2">
              <span>کد رهگیری پستی:</span>
              <span className="mx-2">
                {m.post_id ? m.post_id : "کد رهگیری قرار نداده اید"}
              </span>
            </div>
            <div className="my-2">
              <span>وضعیت:</span>
              <span className="mx-2">{m.state_display}</span>
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <div className="my-2">
              <span>
                <img
                style={{maxWidth:"150px",maxHeight:"150px"}}
                  src={m.product.image ? m.product.image : defaultImage}
                  alt="try again"
                />
              </span>
              <span className="my-2">{m.product.product_name}</span>
            </div>
          </div>
          <div className="col-md-12 col-lg-4">
            <form onSubmit={(e) => handleSubmit(e, m.id)} className="my-3">
              <input type="hidden" name="product" value={m.product.id} />
              <input type="hidden" name="user" value={m.user.id} />
              <input type="hidden" name="seller" value={m.seller} />
              <input type="hidden" name="paid" value={m.paid} />
              <input type="hidden" name="price" value={m.price} />
              <input type="hidden" name="total_count" value={m.total_count} />
              <input type="hidden" name="address" value={m.address} />
              <input type="hidden" name="paid_at" value={m.paid_at} />

              <div className="form-group">
                <label className="my-2" htmlFor="postId">
                  کد رهگیری پست برای کالا:
                </label>
                <input
                  name="post_id"
                  id="postId"
                  className="form-control"
                  type="text"
                  defaultValue={m.post_id || ""}
                />
              </div>
              <div className="form-group">
                <label className="my-2" htmlFor="state">
                  انتخاب وضعیت کالا:
                </label>
                <select
                  name="state"
                  id="state"
                  className="form-control"
                  defaultValue={m.state}
                >
                  <option value="confirm">در انتظار تایید فروشنده</option>
                  <option value="confirmed">تایید شد</option>
                  <option value="post">تحویل پست داده شد</option>
                  <option value="recived">تحویل داده شد</option>
                </select>
              </div>
              <div className="my-3 mx-auto">
                <button disabled={sending} className="btn btn-lg btn-primary">{sending ? "در حال ارسال ..." : "ثبت"}</button>
              </div>
            </form>
            {errors && <div className="alert alert-danger mt-3">{errors}</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Order;
