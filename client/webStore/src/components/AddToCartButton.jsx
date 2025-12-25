import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const AddToCartButton = ({ product, onAdd }) => {
  const { isProductInCart } = useCart();
  const navigate = useNavigate();

  const productId = product._id || product.id;
  const inCart = isProductInCart(productId);

  const handleClick = () => {
    if (inCart) {
      navigate('/cart'); 
    } else {
      onAdd(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`btn ${inCart ? 'btn-success' : 'btn-primary'} btn-sm` }
    >
      {inCart ? 'Go to Cart' : 'Add to Cart'}
    </button>
  );
};

export default AddToCartButton;
