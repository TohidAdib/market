import React, { useState, useEffect } from "react";
import "../components/static/css/rating.css";
import axiosInstance from "../axiosinstance/axios";

const StarRating = (props) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [rates, setRates] = useState([]);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axiosInstance.get("users/rating/");
        setRates(response.data);

        // پیدا کردن امتیاز کاربر برای محصول مورد نظر
        const userRating = response.data.find(
          (rate) => rate.product === props.productId && rate.user === props.userId
        );

        if (userRating) {
          setRating(userRating.score);
        }
      } catch (error) {
        setErrors("Something went wrong. Please try again later.");
      }
    };

    fetchRatings();
  }, [props.productId, props.userId]);

  const handleClick = async (index) => {
    setRating(index);
    const productId = props.productId;
    const userId = props.userId;

    try {
      const userRating = rates.find(
        (rate) => rate.product === productId && rate.user === userId
      );

      if (userRating) {
        const response = await axiosInstance.put(`users/rating/${userRating.id}/`, {
          user: userId,
          product: productId,
          score: index,
        });
        console.log(response);

        // به‌روزرسانی امتیاز موجود در rates
        setRates((prevRates) =>
          prevRates.map((rate) =>
            rate.id === userRating.id ? { ...rate, score: index } : rate
          )
        );
      } else {
        const response = await axiosInstance.post("users/rating/", {
          user: userId,
          product: productId,
          score: index,
        });

        // افزودن امتیاز جدید به rates
        setRates((prevRates) => [...prevRates, response.data]);
      }
    } catch (error) {
      console.log(error);
      setErrors("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="star-rating">
      {errors && <div className="alert alert-danger">{errors}</div>}
      {[...Array(5)].map((star, index) => {
        index += 1;
        return (
          <button
            type="button"
            key={index}
            className={index <= (hover || rating) ? "on" : "off"}
            onClick={() => handleClick(index)}
            onMouseEnter={() => setHover(index)}
            onMouseLeave={() => setHover(rating)}
          >
            <span className="star">&#9733;</span>
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
