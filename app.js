(function () {
  'use strict';

  const CART_KEY = 'tuperfumecr_cart_v1';
  const FAVORITES_KEY = 'tuperfumecr_favorites_v1';
  const state = {
    products: [],
    category: 'Todos',
    query: '',
    sort: 'featured',
    favoritesOnly: false,
    cart: readStorage(CART_KEY, []),
    favorites: new Set(readStorage(FAVORITES_KEY, [])),
    lastCartFocus: null,
    lastDialogFocus: null,
    toastTimer: 0
  };

  const elements = {
    grid: document.getElementById('productsGrid'),
    count: document.getElementById('productCount'),
    search: document.getElementById('productSearch'),
    sort: document.getElementById('productSort'),
    filters: document.getElementById('categoryFilters'),
    favoritesToggle: document.getElementById('favoritesToggle'),
    cartToggle: document.getElementById('cartToggle'),
    cartDrawer: document.getElementById('cartDrawer'),
    cartBackdrop: document.getElementById('drawerBackdrop'),
    cartClose: document.getElementById('cartClose'),
    cartBody: document.getElementById('cartBody'),
    cartCount: document.getElementById('cartCount'),
    cartTotal: document.getElementById('cartTotal'),
    productDialog: document.getElementById('productDialog'),
    dialogClose: document.getElementById('dialogClose'),
    dialogImage: document.getElementById('dialogImage'),
    dialogBrand: document.getElementById('dialogBrand'),
    dialogName: document.getElementById('dialogName'),
    dialogSpecs: document.getElementById('dialogSpecs'),
    dialogDescription: document.getElementById('dialogDescription'),
    dialogPriceDate: document.getElementById('dialogPriceDate'),
    dialogPrice: document.getElementById('dialogPrice'),
    dialogPriceSource: document.getElementById('dialogPriceSource'),
    dialogPhotoSource: document.getElementById('dialogPhotoSource'),
    dialogAdd: document.getElementById('dialogAdd'),
    toast: document.getElementById('toast')
  };

  function readStorage(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      showToast('No se pudo guardar esta lista en este navegador.');
    }
  }

  function money(value) {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  function cleanText(value) {
    return String(value || '').toLocaleLowerCase('es-CR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function makeElement(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function createProductImage(product, className) {
    const wrap = makeElement('div', className || 'image-fallback');
    const image = document.createElement('img');
    image.className = className ? 'product-image' : '';
    image.src = product.foto;
    image.alt = product.nombre + ' de ' + product.marca + ', imagen de referencia';
    image.width = 680;
    image.height = 714;
    image.loading = 'lazy';
    image.decoding = 'async';
    const fallback = makeElement('span', 'image-fallback', product.marca + ' · ' + product.nombre);
    fallback.hidden = true;
    image.addEventListener('error', function () {
      image.hidden = true;
      fallback.hidden = false;
    }, { once: true });
    wrap.append(image, fallback);
    return wrap;
  }

  function favoriteButton(product) {
    const active = state.favorites.has(product.id);
    const button = makeElement('button', 'favorite-button');
    button.type = 'button';
    button.setAttribute('aria-label', (active ? 'Quitar ' : 'Guardar ') + product.nombre + ' ' + (active ? 'de' : 'en') + ' favoritos');
    button.setAttribute('aria-pressed', String(active));
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 8.7c0 5.1-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.7A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.7Z"/></svg>';
    button.addEventListener('click', function () { toggleFavorite(product.id); });
    return button;
  }

  function productCard(product) {
    const card = makeElement('article', 'product-card');
    const visual = makeElement('div', 'product-visual');
    const detailsButton = makeElement('button', 'product-image-button');
    detailsButton.type = 'button';
    detailsButton.setAttribute('aria-label', 'Ver detalles de ' + product.marca + ' ' + product.nombre);
    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.foto;
    image.alt = product.nombre + ' de ' + product.marca + ', imagen de referencia';
    image.width = 680;
    image.height = 714;
    image.loading = 'lazy';
    image.decoding = 'async';
    const fallback = makeElement('span', 'image-fallback', product.marca + ' · ' + product.nombre);
    fallback.hidden = true;
    image.addEventListener('error', function () {
      image.hidden = true;
      fallback.hidden = false;
    }, { once: true });
    detailsButton.append(image, fallback);
    detailsButton.addEventListener('click', function () { openDetails(product, detailsButton); });
    visual.append(detailsButton);

    if (product.tendenciaLocal) {
      visual.append(makeElement('span', 'product-badge', 'Tendencia local'));
    }
    visual.append(favoriteButton(product));

    const body = makeElement('div', 'product-body');
    const meta = makeElement('div', 'product-meta');
    meta.append(makeElement('span', 'product-brand', product.marca));
    meta.append(makeElement('span', '', product.categoria));
    const nameButton = makeElement('button', 'product-name-button', product.nombre);
    nameButton.type = 'button';
    nameButton.addEventListener('click', function () { openDetails(product, nameButton); });
    const heading = makeElement('h3');
    heading.append(nameButton);
    const description = makeElement('p', 'product-description', product.descripcion);
    const priceLabel = makeElement('div', 'price-label', 'Precio de referencia · ' + shortDate(product.fechaPrecio));
    const price = makeElement('div', 'product-price', money(product.precioReferencia));
    const source = makeElement('a', 'price-source', 'Fuente: ' + sourceShortName(product.fuentePrecio));
    source.href = product.urlPrecio;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.addEventListener('click', function (event) { event.stopPropagation(); });
    const actions = makeElement('div', 'card-actions');
    const add = makeElement('button', 'add-button', 'Añadir a mi lista de muestra');
    add.type = 'button';
    add.setAttribute('aria-label', 'Añadir ' + product.nombre + ' a mi lista de muestra');
    add.addEventListener('click', function () { addToCart(product.id); });
    actions.append(add);
    body.append(meta, heading, description, priceLabel, price, source, actions);
    card.append(visual, body);
    return card;
  }

  function shortDate(date) {
    const parts = String(date || '').split('-');
    if (parts.length !== 3) return 'fecha sin indicar';
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function sourceShortName(source) {
    if (String(source).toLowerCase().indexOf('ahorraya') !== -1) return 'AhorraYa';
    if (String(source).toLowerCase().indexOf('fragancias506') !== -1) return 'Fragancias506';
    return source || 'ver ficha';
  }

  function productsForView() {
    const query = cleanText(state.query.trim());
    let products = state.products.filter(function (product) {
      const matchesCategory = state.category === 'Todos' || product.categoria === state.category;
      const matchesFavorites = !state.favoritesOnly || state.favorites.has(product.id);
      const searchable = cleanText(product.nombre + ' ' + product.marca + ' ' + product.categoria + ' ' + product.concentracion);
      return matchesCategory && matchesFavorites && (!query || searchable.indexOf(query) !== -1);
    });
    products = products.slice();
    if (state.sort === 'price-asc') products.sort(function (a, b) { return a.precioReferencia - b.precioReferencia; });
    else if (state.sort === 'price-desc') products.sort(function (a, b) { return b.precioReferencia - a.precioReferencia; });
    else if (state.sort === 'name') products.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });
    else products.sort(function (a, b) {
      return Number(b.tendenciaLocal) - Number(a.tendenciaLocal) || a.nombre.localeCompare(b.nombre, 'es');
    });
    return products;
  }

  function renderProducts() {
    const list = productsForView();
    elements.grid.replaceChildren();
    elements.count.textContent = list.length + (list.length === 1 ? ' fragancia' : ' fragancias');
    if (state.favoritesOnly) elements.count.textContent += ' · favoritos';
    if (!list.length) {
      const empty = makeElement('div', 'empty-state');
      empty.append(makeElement('h3', '', state.favoritesOnly ? 'Aún no guardaste favoritos' : 'No encontramos resultados'));
      empty.append(makeElement('p', '', state.favoritesOnly ? 'Usá el corazón en una fragancia para guardarla en esta lista.' : 'Probá otra búsqueda o elegí una categoría distinta.'));
      elements.grid.append(empty);
    } else {
      list.forEach(function (product) { elements.grid.append(productCard(product)); });
    }
    elements.grid.setAttribute('aria-busy', 'false');
  }

  function toggleFavorite(id) {
    const product = state.products.find(function (item) { return item.id === id; });
    if (!product) return;
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
      showToast(product.nombre + ' se quitó de favoritos.');
    } else {
      state.favorites.add(id);
      showToast(product.nombre + ' se guardó en favoritos.');
    }
    writeStorage(FAVORITES_KEY, Array.from(state.favorites));
    updateFavoritesToggle();
    renderProducts();
  }

  function updateFavoritesToggle() {
    const label = state.favoritesOnly ? 'Mostrar todas las fragancias' : 'Mostrar favoritos';
    elements.favoritesToggle.setAttribute('aria-label', label);
    elements.favoritesToggle.setAttribute('aria-pressed', String(state.favoritesOnly));
    elements.favoritesToggle.title = label;
  }

  function addToCart(id) {
    const product = state.products.find(function (item) { return item.id === id; });
    if (!product) return;
    const line = state.cart.find(function (item) { return item.id === id; });
    if (line) line.qty = Math.min(99, line.qty + 1);
    else state.cart.push({ id: id, qty: 1 });
    saveCart();
    updateCartCount();
    renderCart();
    showToast(product.nombre + ' se añadió a la lista de muestra.');
  }

  function saveCart() {
    writeStorage(CART_KEY, state.cart);
  }

  function updateCartCount() {
    const count = state.cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    elements.cartCount.textContent = String(count);
    elements.cartToggle.setAttribute('aria-label', 'Abrir carrito de muestra; ' + count + (count === 1 ? ' producto' : ' productos'));
  }

  function renderCart() {
    const validLines = state.cart.filter(function (line) {
      return state.products.some(function (product) { return product.id === line.id; });
    });
    if (validLines.length !== state.cart.length) {
      state.cart = validLines;
      saveCart();
      updateCartCount();
    }
    elements.cartBody.replaceChildren();
    if (!state.cart.length) {
      const empty = makeElement('div', 'drawer-empty');
      empty.append(makeElement('strong', '', 'Tu lista está vacía'));
      empty.append(makeElement('span', '', 'Añadí fragancias para comparar sus precios de referencia.'));
      elements.cartBody.append(empty);
      elements.cartTotal.textContent = money(0);
      return;
    }
    let total = 0;
    state.cart.forEach(function (line) {
      const product = state.products.find(function (item) { return item.id === line.id; });
      if (!product) return;
      total += product.precioReferencia * line.qty;
      const row = makeElement('article', 'cart-line');
      const image = document.createElement('img');
      image.src = product.foto;
      image.alt = '';
      image.width = 72;
      image.height = 84;
      image.loading = 'lazy';
      const copy = makeElement('div');
      copy.append(makeElement('strong', 'cart-line-name', product.nombre));
      copy.append(makeElement('span', 'cart-line-meta', product.marca + ' · ' + product.tamano));
      copy.append(makeElement('span', 'cart-line-price', money(product.precioReferencia) + ' c/u'));
      const quantity = makeElement('div', 'qty-controls');
      const decrease = makeElement('button', '', '−');
      decrease.type = 'button';
      decrease.setAttribute('aria-label', 'Quitar una unidad de ' + product.nombre);
      decrease.addEventListener('click', function () { changeQuantity(product.id, -1); });
      const value = makeElement('span', 'qty-value', String(line.qty));
      value.setAttribute('aria-label', 'Cantidad');
      const increase = makeElement('button', '', '+');
      increase.type = 'button';
      increase.setAttribute('aria-label', 'Añadir una unidad de ' + product.nombre);
      increase.disabled = line.qty >= 99;
      increase.addEventListener('click', function () { changeQuantity(product.id, 1); });
      quantity.append(decrease, value, increase);
      copy.append(quantity);
      const remove = makeElement('button', 'remove-line', '×');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Quitar ' + product.nombre + ' de la lista');
      remove.addEventListener('click', function () { removeFromCart(product.id); });
      row.append(image, copy, remove);
      elements.cartBody.append(row);
    });
    elements.cartTotal.textContent = money(total);
  }

  function changeQuantity(id, difference) {
    const line = state.cart.find(function (item) { return item.id === id; });
    if (!line) return;
    line.qty += difference;
    if (line.qty <= 0) state.cart = state.cart.filter(function (item) { return item.id !== id; });
    else line.qty = Math.min(99, line.qty);
    saveCart();
    updateCartCount();
    renderCart();
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(function (item) { return item.id !== id; });
    saveCart();
    updateCartCount();
    renderCart();
    const target = elements.cartBody.querySelector('.qty-controls button') || elements.cartClose;
    target.focus();
  }

  function setCartOpen(open) {
    const drawer = elements.cartDrawer;
    if (open) {
      if (drawer.classList.contains('open')) return;
      state.lastCartFocus = document.activeElement;
      drawer.removeAttribute('inert');
      drawer.setAttribute('aria-hidden', 'false');
      elements.cartBackdrop.hidden = false;
      requestAnimationFrame(function () { elements.cartBackdrop.classList.add('visible'); });
      drawer.classList.add('open');
      elements.cartToggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('dialog-open');
      window.setTimeout(function () { elements.cartClose.focus(); }, 20);
      return;
    }
    if (!drawer.classList.contains('open')) return;
    drawer.classList.remove('open');
    elements.cartBackdrop.classList.remove('visible');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    elements.cartToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('dialog-open');
    window.setTimeout(function () { elements.cartBackdrop.hidden = true; }, 220);
    if (state.lastCartFocus && state.lastCartFocus.isConnected) state.lastCartFocus.focus();
  }

  function openDetails(product, trigger) {
    state.lastDialogFocus = trigger || document.activeElement;
    elements.dialogImage.src = product.foto;
    elements.dialogImage.alt = product.nombre + ' de ' + product.marca + ', imagen de referencia';
    elements.dialogBrand.textContent = product.marca + ' · ' + product.categoria;
    elements.dialogName.textContent = product.nombre;
    elements.dialogSpecs.textContent = product.tamano + ' · ' + product.concentracion;
    elements.dialogDescription.textContent = product.descripcion;
    elements.dialogPriceDate.textContent = shortDate(product.fechaPrecio);
    elements.dialogPrice.textContent = money(product.precioReferencia);
    elements.dialogPriceSource.href = product.urlPrecio;
    elements.dialogPhotoSource.href = product.fuenteFoto;
    elements.dialogAdd.onclick = function () { addToCart(product.id); };
    if (!elements.productDialog.open) elements.productDialog.showModal();
    window.setTimeout(function () { elements.dialogClose.focus(); }, 0);
  }

  function closeDetails() {
    if (elements.productDialog.open) elements.productDialog.close();
  }

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(function () { elements.toast.classList.remove('show'); }, 2800);
  }

  function showLoadError() {
    elements.grid.setAttribute('aria-busy', 'false');
    elements.count.textContent = 'No se pudo cargar el catálogo.';
    const message = makeElement('div', 'empty-state');
    message.append(makeElement('h3', '', 'El catálogo no está disponible ahora'));
    message.append(makeElement('p', '', 'Revisá tu conexión e intentá cargar de nuevo.'));
    const retry = makeElement('button', 'button-outline', 'Intentar de nuevo');
    retry.type = 'button';
    retry.addEventListener('click', loadProducts);
    message.append(retry);
    elements.grid.replaceChildren(message);
  }

  async function loadProducts() {
    elements.grid.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('productos.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Product data request failed');
      const products = await response.json();
      if (!Array.isArray(products) || !products.length) throw new Error('Product data is empty');
      state.products = products.filter(function (product) {
        return product && product.id && product.nombre && Number.isFinite(Number(product.precioReferencia));
      });
      state.cart = state.cart.filter(function (line) {
        return state.products.some(function (product) { return product.id === line.id; });
      }).map(function (line) {
        return { id: line.id, qty: Math.max(1, Math.min(99, Math.floor(Number(line.qty) || 1))) };
      });
      state.favorites = new Set(Array.from(state.favorites).filter(function (id) {
        return state.products.some(function (product) { return product.id === id; });
      }));
      saveCart();
      writeStorage(FAVORITES_KEY, Array.from(state.favorites));
      updateCartCount();
      updateFavoritesToggle();
      renderCart();
      renderProducts();
    } catch (error) {
      showLoadError();
    }
  }

  elements.search.addEventListener('input', function () {
    state.query = elements.search.value;
    renderProducts();
  });
  elements.sort.addEventListener('change', function () {
    state.sort = elements.sort.value;
    renderProducts();
  });
  elements.filters.addEventListener('click', function (event) {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    elements.filters.querySelectorAll('[data-category]').forEach(function (filter) {
      const active = filter === button;
      filter.setAttribute('aria-pressed', String(active));
    });
    renderProducts();
  });
  elements.favoritesToggle.addEventListener('click', function () {
    state.favoritesOnly = !state.favoritesOnly;
    updateFavoritesToggle();
    renderProducts();
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  elements.cartToggle.addEventListener('click', function () { setCartOpen(true); });
  elements.cartClose.addEventListener('click', function () { setCartOpen(false); });
  elements.cartBackdrop.addEventListener('click', function () { setCartOpen(false); });
  elements.dialogClose.addEventListener('click', closeDetails);
  elements.productDialog.addEventListener('click', function (event) {
    if (event.target === elements.productDialog) closeDetails();
  });
  elements.productDialog.addEventListener('close', function () {
    if (state.lastDialogFocus && state.lastDialogFocus.isConnected) state.lastDialogFocus.focus();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && elements.cartDrawer.classList.contains('open')) {
      event.preventDefault();
      setCartOpen(false);
      return;
    }
    if (event.key !== 'Tab' || !elements.cartDrawer.classList.contains('open')) return;
    const focusable = Array.from(elements.cartDrawer.querySelectorAll('button:not(:disabled), a[href], select, input'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  updateCartCount();
  loadProducts();
})();
