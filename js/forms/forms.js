import { validate, checkValidForm } from './validations.js';

export default function validateForms() {
  const contactForm = document.querySelector('form.contact-form');
  if (contactForm) {
    validateForm('contact', contactForm);
  }

  const productManagerForm = document.querySelector('form.product-manager-form');
  if (productManagerForm) {
    validateForm('product-manager', productManagerForm);
  }

  const loginForm = document.querySelector('form.login-form');
  if (loginForm) {
    validateForm('login', loginForm);
  }
}

const validateForm = (formName, formElement) => {
  formElement.onsubmit = (e) => {
    const isValidForm = checkValidForm(formName);
    if (!isValidForm) {
      e.preventDefault();
    }
  };
  const inputs = formElement.querySelectorAll('.input-form');
  inputs.forEach((input) => {
    input.onblur = () => validate(input, formName);
  });
};
