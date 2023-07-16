import { PRODUCTS_URL } from '../constants/config.js';

export const getProducts = async () => {
  const res = await fetch(PRODUCTS_URL);
  return await res.json();
};

export const getProduct = async (id) => {
  const res = await fetch(`${PRODUCTS_URL}/${id}`);
  return await res.json();
};

export const addProduct = async (product) => {
  const res = await fetch(PRODUCTS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  return await res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' });
  return await res.json();
};

export const editProduct = async (id, product) => {
  const res = await fetch(`${PRODUCTS_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(product),
  });
  return await res.json();
};
