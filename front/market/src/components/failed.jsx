import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../axiosinstance/axios";
import { useLocation,useNavigate } from "react-router-dom";

const Failed = (props) => {
  const location = useLocation();
  const { user: clientId, product: productId, seller: sellerId, paid: paidId } = location.state;
  
  const [product, setProduct] = useState({});
  const [send, setSend] = useState({
    clientId: clientId,
    user: sellerId,
    product: productId,
    paid: paidId,
    product_error: false,
    post: false,
    postId: false,
    product_false: false,
    description: "",
  });
  
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);
  const [failes, setFailes] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productResponse, userResponse] = await Promise.all([
          axiosInstance.get(`products/${productId}/`),
          axiosInstance.get("users/information/")
        ]);

        setFailes(userResponse.data.failed);
        setProduct(productResponse.data);
      } catch (error) {
        console.error("Error fetching product information:", error);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleChange = useCallback((e) => {
    const { name, type, value, checked } = e.target;
    setSend((prevSend) => ({
      ...prevSend,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const failedRecord = failes.find((f) => f.paid === paidId);

    try {
      setSending(true);
      setSuccess(null);
      setError(null);
      
      let response;
      if (failedRecord) {
        response = await axiosInstance.put(`failed/detail/${failedRecord.id}/`, send);
        setFailes((prevFailes) => prevFailes.map(f => f.id === failedRecord.id ? response.data : f));
      } else {
        response = await axiosInstance.post("failed/post/", send);
      }

      setSuccess(failedRecord ? "اطلاعات با موفقیت آپدیت شد." : "اطلاعات با موفقیت ارسال شد.");
      setSend((prevSend) => ({
        ...prevSend,
        product_error: false,
        post: false,
        postId: false,
        product_false: false,
        description: "",
      }));
    } catch (error) {
      setError("ارسال اطلاعات با خطا مواجه شد. لطفاً دوباره امتحان کنید.");
    } finally {
      setSending(false);
      const [productResponse, userResponse] = await Promise.all([
        axiosInstance.get(`products/${productId}/`),
        axiosInstance.get("users/information/")
      ]);

      setFailes(userResponse.data.failed);
      setProduct(productResponse.data);
    }
  }, [send, failes, paidId]);

  const defaultImage = "https://via.placeholder.com/150";

  return (
    <section className="container">
      <div className="row d-flex justify-content-center align-items-center">
        <div className="col-xl-3 col-lg-4 col-md-6 col-12">
          <img
            style={{ display: "block", maxWidth: "400px", maxHeight: "400px" }}
            src={product.image ? product.image : defaultImage}
            alt="try again"
          />
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6 col-12">
          <form onSubmit={handleSubmit}>
            <ul style={{ listStyle: "none" }}>
              <li className="p-1 my-2">
                <input
                  onChange={handleChange}
                  name="product_error"
                  type="checkbox"
                  checked={send.product_error}
                />
                <span className="mx-3">کالا معیوب بوده</span>
              </li>
              <li className="p-1 my-2">
                <input
                  onChange={handleChange}
                  name="post"
                  type="checkbox"
                  checked={send.post}
                />
                <span className="mx-3">کالا ارسال نشده است</span>
              </li>
              <li className="p-1 my-2">
                <input
                  onChange={handleChange}
                  name="postId"
                  type="checkbox"
                  checked={send.postId}
                />
                <span className="mx-3">بار کد نا معتبر است</span>
              </li>
              <li className="p-1 my-2">
                <input
                  onChange={handleChange}
                  name="product_false"
                  type="checkbox"
                  checked={send.product_false}
                />
                <span className="mx-3">کالا اشتباه ارسال شده است</span>
              </li>
            </ul>
            <div className="p-1 my-2 mx-5">
              <label className="mb-2" htmlFor="description">
                دیگر:
              </label>
              <textarea
                name="description"
                onChange={handleChange}
                value={send.description}
                className="form-control"
                placeholder="اختیاری"
              ></textarea>
            </div>
            <div className="p-1 my-2 mx-5">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sending}
              >
                {sending ? "در حال ارسال" : "ارسال"}
              </button>
            </div>
          </form>
          {success && <div className="alert alert-success mt-3">{success}</div>}
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6 col-12 my-auto"></div>
      </div>
    </section>
  );
};

export default Failed;
