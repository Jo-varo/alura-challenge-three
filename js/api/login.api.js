import { LOGIN_URL } from '../constants/config.js';

export const login = async (user) => {
  const res = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  const resData = await res.json();
  return resData;
};
