import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../axiosinstance/axios';

const SaveIcon = (props) => {
  const [isActive, setIsActive] = useState(false);
  const [save, setSave] = useState([]);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axiosInstance.get("users/saved/");
        setSave(response.data);

        // پیدا کردن امتیاز کاربر برای محصول مورد نظر
        const userSave = response.data.find(
          (save) => save.product === props.productId && save.user === props.userId
        );

        if (userSave) {
          setIsActive(true);
        }
      } catch (error) {
        setErrors("Something went wrong. Please try again later.");
      }
    };

    fetchRatings();
  }, [props.productId, props.userId]);

  const handleClick = async () => {
    const productId = props.productId;
    const userId = props.userId;

    try {
      const userSave = save.find(
        (save) => save.product === productId && save.user === userId
      );

      if (userSave) {
        await axiosInstance.delete(`users/saved/${userSave.id}/`);
        setSave((prevSave) => prevSave.filter((save) => save.id !== userSave.id));
        setIsActive(false);
      } else {
        const response = await axiosInstance.post("users/saved/", {
          user: userId,
          product: productId,
        });


        setSave((prevSave) => [...prevSave, response.data]);
        setIsActive(true);
      }
    } catch (error) {
      setErrors("Something went wrong. Please try again later.");
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer' }}>
      <FontAwesomeIcon
        icon={faBookmark}
        size="2x"
        color={isActive ? 'red' : 'gray'}
      />
      {errors && <p>{errors}</p>}
    </div>
  );
};

export default SaveIcon;
