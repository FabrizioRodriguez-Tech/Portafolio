/* js/script_global.js
   Elegante, minimalista — búsqueda, orden y accesibilidad para index.
*/

document.addEventListener('DOMContentLoaded', () => {
  // Selectores
  const grid = document.querySelector('.grid');
  if (!grid) return;

  const cardsNodeList = Array.from(grid.querySelectorAll('.card'));
  // Mantener copia del orden original
  const originalOrder = cardsNodeList.slice();

  // Toolbar controls (se incluyen en el HTML recomendado)
  const inputBuscar = document.getElementById('buscar');
  const selectOrden = document.getElementById('orden');
  const btnReset = document.getElementById('reset');

  // Si toolbar no existe (por si usas el HTML anterior), lo generamos minimalmente
  if (!inputBuscar || !selectOrden || !btnReset) {
    createToolbarFallback();
  }

  // Refs (puede haberse creado en fallback)
  const searchEl = document.getElementById('buscar');
  const sortEl = document.getElementById('orden');
  const resetEl = document.getElementById('reset');

  // ---- helpers ----
  const debounce = (fn, wait=180) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  function textOf(card){
    // texto relevante: contenido + href (ayuda con nombres de archivos)
    const href = card.getAttribute('href') || '';
    return (card.textContent + ' ' + href).toLowerCase();
  }

  function applyFilterAndSort(){
    const q = (searchEl.value || '').trim().toLowerCase();
    const mode = sortEl.value || 'def';

    // Filtrar
    const filtered = originalOrder.filter(c => textOf(c).includes(q));

    // Ordenar
    let final = filtered.slice();
    if (mode === 'az') {
      final.sort((a,b)=> a.textContent.trim().localeCompare(b.textContent.trim(), 'es', {sensitivity:'base'}));
    } else if (mode === 'za') {
      final.sort((a,b)=> b.textContent.trim().localeCompare(a.textContent.trim(), 'es', {sensitivity:'base'}));
    } else {
      // mantener orden original (already filtered from originalOrder)
    }

    // Render: limpiar y reinsertar en nuevo orden
    // Usamos requestAnimationFrame para minimizar layout thrashing
    window.requestAnimationFrame(() => {
      grid.innerHTML = '';
      final.forEach(card => grid.appendChild(card));
    });
  }

  const debouncedApply = debounce(applyFilterAndSort, 160);

  // Eventos
  searchEl.addEventListener('input', () => debouncedApply());
  sortEl.addEventListener('change', () => applyFilterAndSort());
  resetEl.addEventListener('click', () => {
    searchEl.value = '';
    sortEl.value = 'def';
    applyFilterAndSort();
    searchEl.focus();
  });

  // Tecla "/" para foco en búsqueda (si no estamos escribiendo)
  document.addEventListener('keydown', (ev) => {
    const active = document.activeElement;
    const tag = active && active.tagName;
    if (ev.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
      ev.preventDefault();
      searchEl.focus();
    }
  });

  // Accesibilidad: permitir abrir tarjeta con Enter/Space cuando está focus
  grid.addEventListener('keydown', (ev) => {
    const el = ev.target;
    if (!el.classList || !el.classList.contains('card')) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      const href = el.getAttribute('href');
      if (href) window.location.href = href;
    }
  });

  // Asegurar que las tarjetas sean focusables
  originalOrder.forEach(c => {
    if (!c.hasAttribute('tabindex')) c.setAttribute('tabindex', '0');
  });

  // apply initial
  applyFilterAndSort();

  // ---- fallback toolbar creator ----
  function createToolbarFallback(){
    const header = document.querySelector('.site-header');
    if (!header) return;
    const toolbar = document.createElement('div');
    toolbar.className = 'index-toolbar';
    toolbar.innerHTML = `
      <input id="buscar" class="input" type="search" placeholder="Buscar actividad..." aria-label="Buscar actividad">
      <select id="orden" class="input" aria-label="Ordenar actividades">
        <option value="def">Orden predeterminado</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
      </select>
      <button id="reset" class="btn ghost">Reset</button>
    `;
    header.appendChild(toolbar);
  }
});
