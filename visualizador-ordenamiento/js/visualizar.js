/* ===========================================================================
   visualizar.js — la vista principal: un algoritmo, paso a paso.
   =========================================================================== */

import { ALGOS, grabar, estaOrdenado } from './algoritmos.js';
import { generar, leerLista } from './datos.js';
import { estado, fijarDatos, alCambiarDatos } from './estado.js';
import { crearEscenario } from './escenario.js';
import { $, fmt, esc, pasosPorSegundo, pintarSlider, llenarSelect } from './ui.js';

const ALTO_LINEA = 25;          // debe coincidir con --alto-linea-codigo del CSS
const TOPE_PASOS_ATRAS = 120000;

let escena;
let algo = 'bubble';
let info = null;                // resultado de grabar(): pasos, métricas, etc.
let reproduciendo = false;
let raf = null, acumulado = 0, ultimo = 0;

/* ══════════════════════════════ ARRANQUE ══════════════════════════════════ */

export function iniciarVisualizar(){
  llenarSelect($('sel-algo'), algo);

  escena = crearEscenario($('stage'), {
    aux:  $('stage-aux'),
    grid: $('grid'),
    ejeX: $('eje-x'),
    tip:  $('tip'),
    etiquetas: true
  });

  conectarControles();
  conectarTransporte();
  conectarTeclado();

  alCambiarDatos(() => cargarAlgoritmo());

  pintarSlider($('rng-tam'));
  pintarSlider($('rng-vel'));
  mostrarVelocidad();

  regenerar();                  // primer arreglo
}

/* ══════════════════════════════ CONTROLES ═════════════════════════════════ */

function regenerar(){
  const datos = generar(estado.tam, estado.dist, estado.semilla >>> 0);
  $('txt-propio').value = '';
  fijarDatos(datos, { origen: 'generado' });
}

function conectarControles(){
  $('sel-algo').addEventListener('change', e => {
    algo = e.target.value;
    cargarAlgoritmo();
  });

  const tam = $('rng-tam');
  tam.addEventListener('input', () => {
    $('ro-tam').textContent = tam.value;
    pintarSlider(tam);
  });
  tam.addEventListener('change', () => {
    estado.tam = +tam.value;
    regenerar();
  });

  $('seg-dist').addEventListener('click', e => {
    const b = e.target.closest('button');
    if(!b) return;
    estado.dist = b.dataset.d;
    for(const x of $('seg-dist').children){
      x.setAttribute('aria-pressed', String(x === b));
    }
    regenerar();
  });

  $('inp-semilla').addEventListener('change', e => {
    estado.semilla = Math.max(0, Math.floor(+e.target.value || 0));
    e.target.value = estado.semilla;
    regenerar();
  });

  $('btn-semilla').addEventListener('click', () => {
    estado.semilla = Math.floor(Math.random() * 99999);
    $('inp-semilla').value = estado.semilla;
    regenerar();
  });

  $('btn-generar').addEventListener('click', regenerar);

  $('btn-propio').addEventListener('click', () => {
    const nums = leerLista($('txt-propio').value);
    if(nums.length < 2){
      $('estado').innerHTML = '<span class="aviso">Escribe al menos dos números positivos separados por comas.</span>';
      return;
    }
    const tamRng = $('rng-tam');
    tamRng.value = Math.min(100, Math.max(8, nums.length));
    $('ro-tam').textContent = nums.length;
    pintarSlider(tamRng);
    fijarDatos(nums, { origen: 'propio' });
  });

  const vel = $('rng-vel');
  vel.addEventListener('input', () => { pintarSlider(vel); mostrarVelocidad(); });
}

function mostrarVelocidad(){
  $('ro-vel').textContent = fmt(Math.round(pasosPorSegundo(+$('rng-vel').value))) + ' pasos/s';
}

/* ══════════════════════════════ CARGA ═════════════════════════════════════ */

function cargarAlgoritmo(){
  detener();
  info = grabar(algo, estado.datos);
  escena.cargar(estado.datos, info.pasos);

  pintarCabecera();
  pintarCodigo();
  $('aux-caja').hidden = algo !== 'merge';
  $('btn-atras').disabled = info.pasos.length > TOPE_PASOS_ATRAS;

  refrescar();
}

function pintarCabecera(){
  const A = ALGOS[algo];
  $('algo-fam').textContent    = A.fam;
  $('algo-nombre').textContent = A.nombre;
  $('algo-es').textContent     = A.es;
  $('algo-idea').textContent   = A.idea;

  const duro = t => /n²|2\.71/.test(t) ? ' class="duro"' : '';
  $('algo-cx').innerHTML =
    `<div><dt>Mejor</dt><dd${duro(A.cx.mejor)}>${esc(A.cx.mejor)}</dd></div>` +
    `<div><dt>Promedio</dt><dd${duro(A.cx.prom)}>${esc(A.cx.prom)}</dd></div>` +
    `<div><dt>Peor</dt><dd${duro(A.cx.peor)}>${esc(A.cx.peor)}</dd></div>` +
    `<div><dt>Memoria</dt><dd>${esc(A.cx.mem)}</dd></div>` +
    `<div><dt>Estable</dt><dd>${esc(A.cx.estable)}</dd></div>`;
}

/* ══════════════════════════════ PSEUDOCÓDIGO ══════════════════════════════ */

function pintarCodigo(){
  const pre = $('codigo');
  if(pre.dataset.algo === algo) return;
  pre.dataset.algo = algo;
  pre.innerHTML = ALGOS[algo].code.map((linea, i) => {
    const vacia = linea.trim() === '';
    return `<span class="ln" data-n="${vacia ? '' : i + 1}">${vacia ? ' ' : esc(linea)}</span>`;
  }).join('');
}

function marcarLinea(n){
  const pre = $('codigo');
  const cursor = $('codigo-cursor');
  const lineas = pre.children;

  for(let i = 0; i < lineas.length; i++){
    lineas[i].classList.toggle('on', i === n);
  }
  if(n == null || n < 0){
    cursor.hidden = true;
  } else {
    cursor.hidden = false;
    cursor.style.transform = `translateY(${n * ALTO_LINEA}px)`;
  }
}

/* ══════════════════════════════ REFRESCO ══════════════════════════════════ */

function refrescar(){
  $('m-cmp').textContent  = fmt(escena.m.cmp);
  $('m-swap').textContent = fmt(escena.m.swap);
  $('m-wr').textContent   = fmt(escena.m.wr);
  $('m-paso').textContent = fmt(escena.cursor) + ' / ' + fmt(escena.pasos.length);

  const p = escena.avance() * 100;
  $('prog').style.width = p + '%';
  $('scrub').setAttribute('aria-valuenow', Math.round(p));

  const ev = escena.eventoActual();
  marcarLinea(ev && typeof ev.l === 'number' ? ev.l : -1);

  mensaje();
}

function mensaje(){
  const partes = [];

  if(escena.terminado() && escena.pasos.length){
    const ok = estaOrdenado(escena.arr);
    partes.push(
      (ok ? '<span class="ok">✓ Verificado: el arreglo quedó en orden ascendente.</span> ' : '<span class="aviso">El arreglo no quedó ordenado.</span> ') +
      `<b>${fmt(escena.pasos.length)}</b> pasos, <b>${fmt(escena.m.cmp)}</b> comparaciones y ` +
      `<b>${fmt(escena.m.swap)}</b> intercambios sobre <b>${escena.base.length}</b> elementos.`
    );
  } else {
    partes.push(esc(ALGOS[algo].nota));
  }

  if(escena.vis.clave >= 0 && escena.vis.claveVal != null){
    partes.push(`clave = <b>${escena.vis.claveVal}</b>`);
  }
  if(info && info.cortado){
    partes.push('<span class="aviso">La animación se recortó: hay demasiados pasos. Reduce la cantidad de elementos.</span>');
  }
  if(algo === 'stooge' && escena.base.length > 40 && !escena.terminado()){
    partes.push('<span class="aviso">Con más de 40 elementos Stooge genera cientos de miles de pasos.</span>');
  }

  $('estado').innerHTML = partes.join('<span class="sep">·</span>');
}

/* ══════════════════════════════ REPRODUCCIÓN ══════════════════════════════ */

function bucle(ts){
  if(!reproduciendo) return;
  const dt = Math.min(0.1, (ts - ultimo) / 1000);
  ultimo = ts;
  acumulado += pasosPorSegundo(+$('rng-vel').value) * dt;

  let n = Math.min(40000, Math.floor(acumulado));
  acumulado -= n;
  while(n-- > 0 && escena.avanzar()){ /* consume pasos */ }

  escena.pintar();
  refrescar();

  if(escena.terminado()){ detener(); return; }
  raf = requestAnimationFrame(bucle);
}

function reproducir(){
  if(escena.terminado()) escena.reiniciar();
  reproduciendo = true;
  acumulado = 0;
  ultimo = performance.now();
  $('txt-play').textContent = 'Pausar';
  $('ico-play').innerHTML =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>';
  raf = requestAnimationFrame(bucle);
}

function detener(){
  reproduciendo = false;
  if(raf) cancelAnimationFrame(raf);
  raf = null;
  $('txt-play').textContent = 'Reproducir';
  $('ico-play').innerHTML =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.2v13.6L19 12z"/></svg>';
}

function conectarTransporte(){
  $('btn-play').addEventListener('click', () => {
    reproduciendo ? (detener(), refrescar()) : reproducir();
  });
  $('btn-adelante').addEventListener('click', () => {
    detener(); escena.avanzar(); escena.pintar(); refrescar();
  });
  $('btn-atras').addEventListener('click', () => {
    detener(); escena.irA(escena.cursor - 1); refrescar();
  });
  $('btn-final').addEventListener('click', () => {
    detener(); escena.irA(escena.pasos.length); refrescar();
  });
  $('btn-reiniciar').addEventListener('click', () => {
    detener(); escena.reiniciar(); refrescar();
  });

  conectarScrub();
}

/** La barra de avance también es un control: se puede arrastrar. */
function conectarScrub(){
  const barra = $('scrub');
  let arrastrando = false;

  const irAPorcentaje = clientX => {
    const c = barra.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - c.left) / c.width));
    escena.irA(Math.round(p * escena.pasos.length));
    refrescar();
  };

  barra.addEventListener('pointerdown', e => {
    if($('btn-atras').disabled) return;     // demasiados pasos para rebobinar
    detener();
    arrastrando = true;
    barra.setPointerCapture(e.pointerId);
    irAPorcentaje(e.clientX);
  });
  barra.addEventListener('pointermove', e => { if(arrastrando) irAPorcentaje(e.clientX); });
  barra.addEventListener('pointerup',   () => { arrastrando = false; });
  barra.addEventListener('keydown', e => {
    const salto = Math.max(1, Math.round(escena.pasos.length / 50));
    if(e.key === 'ArrowRight'){ e.preventDefault(); detener(); escena.irA(escena.cursor + salto); refrescar(); }
    if(e.key === 'ArrowLeft'){  e.preventDefault(); detener(); escena.irA(escena.cursor - salto); refrescar(); }
  });
}

/* ══════════════════════════════ TECLADO ═══════════════════════════════════ */

function conectarTeclado(){
  document.addEventListener('keydown', e => {
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if($('vista-viz').hidden) return;
    if(e.target.id === 'scrub') return;     // la barra tiene sus propias teclas

    if(e.code === 'Space'){      e.preventDefault(); $('btn-play').click(); }
    else if(e.key === 'ArrowRight'){ e.preventDefault(); $('btn-adelante').click(); }
    else if(e.key === 'ArrowLeft'){  e.preventDefault(); $('btn-atras').click(); }
    else if(e.key === 'r' || e.key === 'R'){ $('btn-reiniciar').click(); }
  });
}
