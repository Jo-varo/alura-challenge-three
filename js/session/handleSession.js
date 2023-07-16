export const isAvailableToken = () => localStorage.getItem('loginToken');

export const handleSession = () => {
  const loginButton = document.querySelector(
    'header .header-btn-container a.btn'
  );

  if (loginButton) {
    const handleLoginButton = (e) => {
      e.preventDefault();
      localStorage.removeItem('loginToken');
      window.location.replace('/');
    };

    if (isAvailableToken()) {
      loginButton.onclick = handleLoginButton;
      loginButton.text = 'Logout';
    }
  }

  checkRenderManageProductButtons();
};

export const checkRenderManageProductButtons = () => {
  const addProductButton = document.querySelector(
    '.all-products .products-button .btn'
  );
  if (addProductButton) {
    if (isAvailableToken()) {
      addProductButton.classList.remove('d-none');
    }
  }

  const manageProductButtons = document.querySelectorAll(
    '.all-products .product .product-buttons'
  );
  if (manageProductButtons) {
    if (isAvailableToken()) {
      manageProductButtons.forEach((e) => e.classList.remove('d-none'));
    }
  }
};
