import {
  addProduct,
  deleteProduct,
  editProduct,
  getProduct,
  getProducts,
} from '../api/product.api.js';
import { URL_PROJECT_SUFFIX } from '../constants/config.js';
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
    return [];
  }
  return Object.keys(allProducts).length !== 0 ? allProducts : [];
};

export const managePageRoutes = async () => {
  const allProducts = await loadProducts();

  const url = new URL(window.location);
  const path = url.pathname.replace(URL_PROJECT_SUFFIX, '');

  enableSearchProductFeature(allProducts);

  if (path === '/') {
    showHomepageProducts(allProducts);
  }

  if (path === '/products.html') {
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
    const id = url.searchParams.get('id');
    const filteredProducts = allProducts.filter((product) => product.id !== id);
    const sortedProducts = sortProductsByCategory(filteredProducts);
    showSingleProductpage(id, sortedProducts);
  }
};

const sortProductsByCategory = (products = []) => {
  const result = { consoles: [], 'star-wars': [], diverses: [] };
  //There was no response from api
  if (products.length <= 0) return result;

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
  const renderProducts = (category, productsByCategory) => {
    const categoryRow = document.querySelector(
      `#${category} .products-row-product`
    );
    const productRowMessage = categoryRow.querySelector(
      '.products-row-product-message'
    );

    //There was no response from api or there aren't items
    if (productsByCategory.length === 0) {
      productRowMessage.innerText = 'No hay productos';
      return;
    }
    productRowMessage.remove();

    //Will render only 6 elements per category
    productsByCategory.map((product) => {
      const newProduct = createProductElement(product);
      categoryRow.appendChild(newProduct);
    });
  };

  const sortedProducts = sortProductsByCategory(products);
  renderProducts('star-wars', sortedProducts['star-wars']);
  renderProducts('consoles', sortedProducts['consoles']);
  renderProducts('diverses', sortedProducts['diverses']);
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

    const productRowMessage = productsRow.querySelector(
      '.products-row-body-message'
    );
    //There was no response from api or there aren't items
    if (products.length === 0) {
      productRowMessage.innerText = 'No hay productos';
      return;
    }
    productRowMessage.remove();

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
    alert('Algo salió mal, intentálo otra vez');
    window.location.replace('/');
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
    imageElement.src = image || '/';
    titleElement.innerText = name || 'Product not found';
    priceElement.innerText = `$${price || '0.00'}`;
    descriptionElement.innerText = description || 'Product not found';
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

// Search products on searching bar
const enableSearchProductFeature = (products) => {
  const searchInput = document.querySelector(
    '.header-form-container form input'
  );
  const searchResultsContainer = document.querySelector(
    'header .search-results-container'
  );

  searchInput.oninput = (e) => {
    const query = e.target.value.toLowerCase();
    const productResults = searchProduct(products, query, 6);
    renderResults(searchResultsContainer, productResults);
  };

  searchInput.onfocus = () => {
    searchResultsContainer.classList.remove('d-none');
  };
  searchInput.onblur = () => {
    setTimeout(() => {
      searchResultsContainer.classList.add('d-none');
    }, 100);
  };

  const createSearchResultElement = ({ id, name, image, price }) => {
    const searchResult = document.createElement('a');
    searchResult.classList.add('search-result');
    searchResult.href = `/product.html?id=${id}`;
    const content = `<div class="search-result-product">
                      <img src="${image}" alt="product-image" class="product-image" />
                      <p class="product-name">${name}</p>
                      <p class="product-price">$${price}</p>
                    </div>`;
    searchResult.innerHTML = content;
    return searchResult;
  };

  const renderResults = (container, results = []) => {
    container.innerHTML = '';
    container.style.borderRadius =
      results.length > 0 ? '25px 25px 10px 10px' : '25px';
    results?.map((product) => {
      container.appendChild(createSearchResultElement(product));
    });
  };
};

const searchProduct = (products, query, quantityResult) => {
  if (query.length < 3) return;
  const searchResult = products.filter((product) =>
    product.name.toLowerCase().includes(query)
  );
  return searchResult.slice(0, quantityResult);
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
