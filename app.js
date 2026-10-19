(function () {
  'use strict';

  const FAVORITES_KEY = 'tuperfumecr_favorites_v1';
  const state = {
    products: [],
    category: 'Todos',
    query: '',
    sort: 'featured',
    favoritesOnly: false,
    favorites: new Set(readStorage(FAVORITES_KEY, [])),
    lastDialogFocus: null,
    toastTimer: 0
  };

  const elements = {
    grid: document.getElementById('productsGrid'),
    count: document.getElementById('productCount'),
    search: document.getElementById('productSearch'),
    sort: document.getElementById('productSort'),
    filters: document.getElementById('categoryFilters'),
    controls: document.getElementById('catalogControls'),
    favoritesToggle: document.getElementById('favoritesToggle'),
    productDialog: document.getElementById('productDialog'),
    dialogClose: document.getElementById('dialogClose'),
    dialogCloseAction: document.getElementById('dialogCloseAction'),
    dialogImage: document.getElementById('dialogImage'),
    dialogBrand: document.getElementById('dialogBrand'),
    dialogName: document.getElementById('dialogName'),
    dialogSpecs: document.getElementById('dialogSpecs'),
    dialogDescription: document.getElementById('dialogDescription'),
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
      showToast('No se pudo guardar esta selección en el navegador.');
    }
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

  function productCard(product) {
    const card = makeElement('article', 'product-card');
    const visual = makeElement('div', 'product-visual');
    const detailsButton = makeElement('button', 'product-image-button');
    detailsButton.type = 'button';
    detailsButton.setAttribute('aria-label', 'Ver detalles de ' + product.marca + ' ' + product.nombre);

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.foto;
    image.alt = product.nombre + ' de ' + product.marca;
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
    visual.append(favoriteButton(product));

    const body = makeElement('div', 'product-body');
    const meta = makeElement('div', 'product-meta');
    meta.append(makeElement('span', 'product-brand', product.marca));
    meta.append(makeElement('span', '', product.categoria));

    const heading = makeElement('h3');
    const nameButton = makeElement('button', 'product-name-button', product.nombre);
    nameButton.type = 'button';
    nameButton.addEventListener('click', function () { openDetails(product, nameButton); });
    heading.append(nameButton);

    const description = makeElement('p', 'product-description', product.descripcion);
    const actions = makeElement('div', 'card-actions');
    const detailsAction = makeElement('button', 'add-button', 'Ver fragancia');
    detailsAction.type = 'button';
    detailsAction.setAttribute('aria-label', 'Ver detalles de ' + product.nombre);
    detailsAction.addEventListener('click', function () { openDetails(product, detailsAction); });
    actions.append(detailsAction);
    body.append(meta, heading, description, actions);
    card.append(visual, body);
    return card;
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

  function productsForView() {
    const query = cleanText(state.query.trim());
    let products = state.products.filter(function (product) {
      const matchesCategory = state.category === 'Todos' || product.categoria === state.category;
      const matchesFavorites = !state.favoritesOnly || state.favorites.has(product.id);
      const searchable = cleanText(product.nombre + ' ' + product.marca + ' ' + product.categoria + ' ' + product.concentracion + ' ' + product.descripcion);
      return matchesCategory && matchesFavorites && (!query || searchable.indexOf(query) !== -1);
    });
    products = products.slice();
    if (state.sort === 'name') products.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); });
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

  function openDetails(product, trigger) {
    state.lastDialogFocus = trigger || document.activeElement;
    elements.dialogImage.src = product.foto;
    elements.dialogImage.alt = product.nombre + ' de ' + product.marca;
    elements.dialogBrand.textContent = product.marca + ' · ' + product.categoria;
    elements.dialogName.textContent = product.nombre;
    elements.dialogSpecs.textContent = product.tamano + ' · ' + product.concentracion;
    elements.dialogDescription.textContent = product.descripcion;
    if (!elements.productDialog.open) elements.productDialog.showModal();
    window.setTimeout(function () { elements.dialogClose.focus(); }, 0);
  }

  function showToast(message) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(function () { elements.toast.classList.remove('show'); }, 2800);
  }

  function showLoadError() {
    elements.grid.setAttribute('aria-busy', 'false');
    const fallbackCount = elements.grid.querySelectorAll('.product-card').length;
    if (fallbackCount) {
      elements.count.textContent = fallbackCount + (fallbackCount === 1 ? ' fragancia' : ' fragancias');
      return;
    }
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
    try {
      const response = await fetch('productos.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Product data request failed');
      const products = await response.json();
      if (!Array.isArray(products) || !products.length) throw new Error('Product data is empty');
      state.products = products.filter(function (product) {
        return product && product.id && product.nombre && product.foto;
      });
      state.favorites = new Set(Array.from(state.favorites).filter(function (id) {
        return state.products.some(function (product) { return product.id === id; });
      }));
      writeStorage(FAVORITES_KEY, Array.from(state.favorites));
      updateFavoritesToggle();
      elements.controls.hidden = false;
      elements.favoritesToggle.hidden = false;
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
      filter.setAttribute('aria-pressed', String(filter === button));
    });
    renderProducts();
  });
  elements.favoritesToggle.addEventListener('click', function () {
    state.favoritesOnly = !state.favoritesOnly;
    updateFavoritesToggle();
    renderProducts();
    document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  elements.dialogClose.addEventListener('click', function () { elements.productDialog.close(); });
  elements.dialogCloseAction.addEventListener('click', function () { elements.productDialog.close(); });
  elements.productDialog.addEventListener('click', function (event) {
    if (event.target === elements.productDialog) elements.productDialog.close();
  });
  elements.productDialog.addEventListener('close', function () {
    if (state.lastDialogFocus && state.lastDialogFocus.isConnected) state.lastDialogFocus.focus();
  });

  loadProducts();
}());
