/* ===========================================================================
   ui.js — piezas de interfaz que usan las dos vistas.
   =========================================================================== */

import { ALGOS, ORDEN, DIVIDE } from './algoritmos.js';

/** Atajo para document.getElementById. */
export const $ = id => document.getElementById(id);

/** Números con separador de miles en español. */
export const fmt = n => Number(n).toLocaleString('es-MX');

/** Escapa texto antes de meterlo en innerHTML. */
export function esc(s){
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Velocidad: el deslizador (1–100) se convierte en pasos por segundo. */
export function pasosPorSegundo(v){
  return 1.4 * Math.pow(1.132, v);
}

/** Pinta la parte ya recorrida de un deslizador. */
export function pintarSlider(input){
  const min = +input.min, max = +input.max;
  const p = ((+input.value - min) / (max - min)) * 100;
  input.style.setProperty('--p', p + '%');
}

/** Llena un <select> con los ocho algoritmos, agrupados por familia. */
export function llenarSelect(sel, valorInicial){
  const bruta  = document.createElement('optgroup');
  bruta.label  = 'Fuerza bruta';
  const divide = document.createElement('optgroup');
  divide.label = 'Divide y vencerás';

  for(const k of ORDEN){
    const o = document.createElement('option');
    o.value = k;
    o.textContent = `${ALGOS[k].nombre} · ${ALGOS[k].es}`;
    (DIVIDE.includes(k) ? divide : bruta).appendChild(o);
  }
  sel.append(bruta, divide);
  sel.value = valorInicial;
}

/* ------------------------------------------------------------------- tema */

export function iniciarTema(){
  const raiz = document.documentElement;
  $('btn-tema').addEventListener('click', () => {
    const actual = raiz.getAttribute('data-tema');
    const oscuroAhora = actual
      ? actual === 'oscuro'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    raiz.setAttribute('data-tema', oscuroAhora ? 'claro' : 'oscuro');
  });
}

/* --------------------------------------------------------------- pestañas */

/**
 * Pestañas con un indicador que se desliza entre una y otra.
 * Avisa del cambio con un evento 'vista' para que cada módulo reaccione.
 */
export function iniciarPestanas(){
  const tabs = { viz: $('tab-viz'), cmp: $('tab-cmp') };
  const ind  = document.querySelector('.tabs-ind');

  function colocarIndicador(btn){
    ind.style.width = btn.offsetWidth + 'px';
    ind.style.transform = `translateX(${btn.offsetLeft - btn.parentElement.offsetLeft - 3}px)`;
  }

  function ir(cual){
    const esViz = cual === 'viz';
    $('vista-viz').hidden = !esViz;
    $('vista-cmp').hidden = esViz;
    tabs.viz.setAttribute('aria-selected', String(esViz));
    tabs.cmp.setAttribute('aria-selected', String(!esViz));
    colocarIndicador(esViz ? tabs.viz : tabs.cmp);
    document.dispatchEvent(new CustomEvent('vista', { detail: cual }));
  }

  tabs.viz.addEventListener('click', () => ir('viz'));
  tabs.cmp.addEventListener('click', () => ir('cmp'));
  addEventListener('resize', () => {
    colocarIndicador(tabs.viz.getAttribute('aria-selected') === 'true' ? tabs.viz : tabs.cmp);
  });

  // Posición inicial (tras la carga de las fuentes, para medir bien).
  colocarIndicador(tabs.viz);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(() => colocarIndicador(
      tabs.viz.getAttribute('aria-selected') === 'true' ? tabs.viz : tabs.cmp
    ));
  }
}

/** Rellena la tabla desplegable con la complejidad de los ocho. */
export function llenarFicha(){
  $('ficha-tbody').innerHTML = ORDEN.map(k => {
    const A = ALGOS[k];
    return `<tr>
      <td>${esc(A.nombre)}</td>
      <td>${esc(A.cx.mejor)}</td>
      <td>${esc(A.cx.prom)}</td>
      <td>${esc(A.cx.peor)}</td>
      <td>${esc(A.cx.mem)}</td>
      <td>${esc(A.cx.estable)}</td>
    </tr>`;
  }).join('');
}
