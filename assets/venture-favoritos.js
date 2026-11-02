/*
 * Venture Studios: favoritos ("me gusta").
 * Guarda los identificadores (handle) de los productos en el navegador del cliente.
 * No necesita cuenta ni apps; la lista es de ese navegador y ese dispositivo.
 */
(function () {
  var KEY = 'venture:favoritos';

  function read() {
    try {
      var list = JSON.parse(window.localStorage.getItem(KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function write(list) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      /* Navegación privada o almacenamiento bloqueado: la lista no se guarda. */
    }
    document.dispatchEvent(new CustomEvent('venture:favoritos', { detail: list }));
  }

  function toggle(handle) {
    var list = read();
    var index = list.indexOf(handle);
    if (index === -1) {
      list.unshift(handle);
    } else {
      list.splice(index, 1);
    }
    write(list);
  }

  function remove(handle) {
    var list = read().filter(function (h) {
      return h !== handle;
    });
    write(list);
  }

  function paint() {
    var list = read();
    document.querySelectorAll('[data-venture-fav]').forEach(function (button) {
      var on = list.indexOf(button.getAttribute('data-venture-fav')) !== -1;
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = button.getAttribute(on ? 'data-label-on' : 'data-label-off');
      if (label) button.setAttribute('aria-label', label);
    });
    document.querySelectorAll('[data-venture-fav-count]').forEach(function (el) {
      el.textContent = list.length;
      el.hidden = list.length === 0;
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-venture-fav]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    toggle(button.getAttribute('data-venture-fav'));
  });

  document.addEventListener('venture:favoritos', paint);

  /* Otra pestaña cambió la lista. */
  window.addEventListener('storage', function (event) {
    if (event.key === KEY) paint();
  });

  /* Tarjetas que aparecen después (filtros, carruseles, editor de temas). */
  var scheduled = false;
  new MutationObserver(function () {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      paint();
    });
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.VentureFavoritos = { read: read, toggle: toggle, remove: remove, paint: paint };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', paint);
  } else {
    paint();
  }
})();
