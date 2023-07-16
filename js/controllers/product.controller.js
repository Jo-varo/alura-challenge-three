import {
  addProduct,
  deleteProduct,
  editProduct,
  getProduct,
  getProducts,
} from '../api/product.api.js';
import { validInputs } from '../forms/validInputs.js';
import {
  checkRenderManageProductButtons,
  isAvailableToken,
} from '../session/handleSession.js';

const loadProducts = async () => {
  let allProducts;
  try {
    allProducts = await getProducts();
  } catch (error) {
    console.log(error);
  }
  return allProducts;
};

export const managePageRoutes = async () => {
  const url = new URL(window.location);
  const path = url.pathname;

  if (path === '/') {
    const allProducts = await loadProducts();
    const sortedProducts = sortProductsByCategory(allProducts);
    showHomepageProducts(sortedProducts);
  }

  if (path === '/products.html') {
    const allProducts = await loadProducts();
    showProductspageProducts(allProducts);
  }

  if (path === '/product-manager.html') {
    if (!isAvailableToken()) {
      window.location.replace('/');
    }

    const id = url.searchParams.get('id');
    if (id) {
      handleEditProducts(id);
      return;
    }
    handleAddProducts();
  }

  if (path === '/product.html') {
    const allProducts = await loadProducts();
    const id = url.searchParams.get('id');
    const filteredProducts = allProducts.filter((product) => product.id !== id);
    const sortedProducts = sortProductsByCategory(filteredProducts);
    showSingleProductpage(id, sortedProducts);
  }
};

const sortProductsByCategory = (products = []) => {
  const result = { consoles: [], 'star-wars': [], diverses: [] };

  const addToResult = (product, category) => {
    if (product.category === category && result[category].length < 6)
      result[category].push(product);
  };

  products.map((product) => {
    addToResult(product, 'consoles');
    addToResult(product, 'star-wars');
    addToResult(product, 'diverses');
  });

  //Will return only 6 elements per category
  return result;
};

const showHomepageProducts = (products) => {
  const renderProducts = (category, sortedProducts) => {
    //Will render only 6 elements per category
    const categoryRow = document.querySelector(
      `#${category} .products-row-product`
    );
    sortedProducts[category].map((product) => {
      const newProduct = createProductElement(product);
      categoryRow.appendChild(newProduct);
    });
  };

  renderProducts('star-wars', products);
  renderProducts('consoles', products);
  renderProducts('diverses', products);
};

const showProductspageProducts = (products) => {
  const createProductsProduct = ({ id, name, price, image }) => {
    const ProductspageProduct = document.createElement('div');
    ProductspageProduct.classList.add('product');

    const formatID = (id = '') => id.substring(0, 8);
    const content = `
      <img class="product-image" src="${image}" alt="product image" />
      <h4 class="product-title">${name}</h4>
      <p class="product-price">$ ${price}</p>
      <p class="product-id" href="">#${formatID(id)}</p>
      <div class="product-buttons d-none">
        <div class="product-delete product-btn">
          <img src="assets/icons/delete.svg" alt="delete icon" />
        </div>
        <div class="product-edit product-btn">
          <img src="assets/icons/pen.svg" alt="edit icon" />
        </div>
      </div>`;
    ProductspageProduct.innerHTML = content;

    const handleDelete = async (id) => {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.log(error);
      }
    };

    const deleteButton = ProductspageProduct.querySelector(
      '.product-buttons .product-delete'
    );
    deleteButton.onclick = (e) => {
      if (isAvailableToken()) {
        handleDelete(id);
      }
    };

    const editButton = ProductspageProduct.querySelector(
      '.product-buttons .product-edit'
    );
    editButton.onclick = (e) => {
      window.location.replace(`/product-manager.html?id=${id}`);
    };

    return ProductspageProduct;
  };
  const renderProducts = (products) => {
    const productsRow = document.querySelector(
      '.all-products .products-row .products-row-body'
    );
    products?.map((product) => {
      const newProduct = createProductsProduct(product);
      productsRow.appendChild(newProduct);
    });
  };

  renderProducts(products);
  checkRenderManageProductButtons();
};

const handleAddProducts = () => {
  const submitProduct = async (e) => {
    e.preventDefault();
    if (!isAvailableToken()) return;
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    try {
      await addProduct(getProductForAPI(productData));
      window.location.replace('/products.html');
    } catch (error) {
      console.log(error);
    }
  };

  const addProductsForm = document.querySelector(
    '.product-manager .product-manager-form'
  );
  if (addProductsForm) {
    addProductsForm.onsubmit = submitProduct;
  }
};

const handleEditProducts = async (id) => {
  const editPageElementsText = () => {
    const formTitle = document.querySelector('.product-manager .form-title');
    const formButton = document.querySelector('.product-manager .form-button');
    formTitle.innerText = 'Editar producto';
    formButton.innerText = 'Editar producto';
  };

  const fillForm = ({ name, price, image, description, category }) => {
    manageProductForm.querySelector('#product-image').value = image;
    manageProductForm.querySelector('#product-category').value = category;
    manageProductForm.querySelector('#product-name').value = name;
    manageProductForm.querySelector('#product-price').value = price;
    manageProductForm.querySelector('#product-description').value = description;
  };

  const changeValidForm = () => {
    validInputs['product-manager'] = {
      'product-image': true,
      'product-category': true,
      'product-name': true,
      'product-price': true,
      'product-description': true,
    };
    const submitButton = document.querySelector(
      '.product-manager .product-manager-form .form-button'
    );
    submitButton.disabled = false;
  };

  //Get single product by ID
  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    console.log(error);
  }

  const handleEdit = async (productData, id) => {
    try {
      await editProduct(id, getProductForAPI(productData, id));
      window.location.replace('/products.html');
    } catch (error) {
      console.log(error);
    }
  };
  //Submit the edited product
  const manageProductForm = document.querySelector(
    '.product-manager .product-manager-form'
  );
  manageProductForm.onsubmit = (e) => {
    e.preventDefault();
    if (!isAvailableToken()) return;
    const formData = new FormData(e.target);
    const productData = Object.fromEntries(formData.entries());
    handleEdit(productData, id);
  };

  editPageElementsText();
  fillForm(product);
  changeValidForm();
};

const showSingleProductpage = async (id, products) => {
  let product;
  try {
    product = await getProduct(id);
  } catch (error) {
    console.log(error);
  }

  const renderDetailedProduct = ({ image, name, price, description }) => {
    const productContainer = document.querySelector(
      '.product-detail .single-product'
    );
    const imageElement = productContainer.querySelector('.product-image img');
    const titleElement = productContainer.querySelector(
      '.product-details .product-title'
    );
    const priceElement = productContainer.querySelector(
      '.product-details .product-price'
    );
    const descriptionElement = productContainer.querySelector(
      '.product-details .product-description'
    );
    imageElement.src = image;
    titleElement.innerText = name;
    priceElement.innerText = `$${price}`;
    descriptionElement.innerText = description;
  };

  const renderSimilarProducts = () => {
    const similarProductsContainer = document.querySelector(
      '.similar-products .products-row-product'
    );

    products[product.category].map((prod) => {
      similarProductsContainer.appendChild(createProductElement(prod));
    });
  };

  renderDetailedProduct(product);
  renderSimilarProducts();
};

const searchProduct = (products) => {
  const searchInput = document.querySelector(
    '.header-form-container form input'
  );
  searchInput.oninput = async (e) => {
    const query = searchInput.value.toLowerCase();
    const searchResult = [];
    products.map((product) => {
      if (product.name.toLowerCase().includes(query)) {
        searchResult.push(product);
      }
    });
    console.log(searchResult);
  };
};

const createProductElement = ({ id, name, price, image }) => {
  const product = document.createElement('div');
  product.classList.add('product');
  const content = `
    <img
      class="product-image"
      src="${image}"
      alt="product image"
    />
    <h4 class="product-title">${name}</h4>
    <p class="product-price">$ ${price}</p>
    <a class="product-details product-link link" href="/product.html?id=${id}"
      >Ver producto</a
    >`;
  product.innerHTML = content;
  return product;
};

const getProductForAPI = (formProductData, productID) => {
  return {
    id: productID || crypto.randomUUID(),
    name: formProductData['product-name'],
    price: formProductData['product-price'],
    image: formProductData['product-image'],
    description: formProductData['product-description'],
    category: formProductData['product-category'],
  };
};
