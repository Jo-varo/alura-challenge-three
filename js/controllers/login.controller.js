import { login } from "../api/login.api.js";

const submitLogin = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const userData = Object.fromEntries(formData.entries());

  try {
    const { token } = await login(userData);
    localStorage.setItem('loginToken', token);
    window.location.replace('/');
  } catch (err) {
    console.log(err);
  }
};

export const handleLoginForm = () => {
  const loginForm = document.querySelector('form.login-form');
  if (loginForm) {
    loginForm.onsubmit = submitLogin;
  }
};
