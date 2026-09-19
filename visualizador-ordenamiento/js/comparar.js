/* ===========================================================================
   comparar.js — dos algoritmos, exactamente el mismo arreglo.

   Los indicadores vienen de dos fuentes distintas y complementarias:
     · comparaciones, intercambios, escrituras y pasos los cuenta el propio
       algoritmo mientras se ejecuta;
     · el tiempo se mide aparte, corriendo el algoritmo sin animación y
       promediando varias repeticiones.
   =========================================================================== */

import { ALGOS, grabar, cronometrar } from './algoritmos.js';
import { estado, alCambiarDatos } from './estado.js';
import { crearEscenario } from './escenario.js';
import { $, fmt, esc, pasosPorSegundo, pintarSlider, llenarSelect } from './ui.js';

let escA, escB;
let resA = null, resB = null;     // resultados de grabar()
let tiempoA = 0, tiempoB = 0;
let corriendo = false, raf = null, acumulado = 0, ultimo = 0, puesto = 0;
let sucio = true;                 // hay datos nuevos sin preparar

export function iniciarComparar(){
  llenarSelect($('sel-a'), 'bubble');
  llenarSelect($('sel-b'), 'quick');

  escA = crearEscenario($('stage-a'), {});
  escB = crearEscenario($('stage-b'), {});

  $('sel-a').addEventListener('change', preparar);
  $('sel-b').addEventListener('change', preparar);

  const vel = $('rng-vel2');
  vel.addEventListener('input', () => {
    pintarSlider(vel);
    $('ro-vel2').textContent = fmt(Math.round(pasosPorSegundo(+vel.value))) + ' pasos/s';
  });
  pintarSlider(vel);
  $('ro-vel2').textContent = fmt(Math.round(pasosPorSegundo(+vel.value))) + ' pasos/s';

  $('btn-carrera').addEventListener('click', alternarCarrera);
  $('btn-carrera-reset').addEventListener('click', reiniciarCarrera);

  // Si cambian los datos mientras estamos en la otra pestaña, lo anotamos.
  alCambiarDatos(() => {
    sucio = true;
    if(!$('vista-cmp').hidden) preparar();
  });

  document.addEventListener('vista', e => {
    if(e.detail === 'cmp'){ if(sucio || !resA) preparar(); }
    else pararCarrera();
  });
}

/* ══════════════════════════════ PREPARACIÓN ═══════════════════════════════ */

function preparar(){
  pararCarrera();
  sucio = false;

  const kA = $('sel-a').value, kB = $('sel-b').value;

  resA = grabar(kA, estado.datos);
  resB = grabar(kB, estado.datos);
  escA.cargar(estado.datos, resA.pasos);
  escB.cargar(estado.datos, resB.pasos);

  tiempoA = cronometrar(kA, estado.datos);
  tiempoB = cronometrar(kB, estado.datos);

  $('cmp-nombre-a').textContent = ALGOS[kA].nombre;
  $('cmp-nombre-b').textContent = ALGOS[kB].nombre;
  $('cmp-meta-a').textContent = `${ALGOS[kA].cx.prom} promedio · ${ALGOS[kA].cx.peor} peor`;
  $('cmp-meta-b').textContent = `${ALGOS[kB].cx.prom} promedio · ${ALGOS[kB].cx.peor} peor`;
  $('th-a').textContent = ALGOS[kA].nombre;
  $('th-b').textContent = ALGOS[kB].nombre;

  const desc = estado.origen === 'propio'
    ? `tus propios ${estado.datos.length} números`
    : `${estado.datos.length} elementos, distribución generada con la semilla ${estado.semilla}`;
  $('cmp-nota').innerHTML =
    `Los dos arrancan con <b>exactamente el mismo arreglo</b>: ${esc(desc)}. ` +
    `Para cambiarlo, vuelve a la pestaña Visualizar.`;

  $('cmp-pie').textContent =
    'El tiempo se obtiene ejecutando cada algoritmo varias veces sin animación y promediando. ' +
    'Los demás indicadores los cuenta el algoritmo mientras se ejecuta.';

  limpiarBanderas();
  refrescarMini();
  pintarTabla();
}

function limpiarBanderas(){
  puesto = 0;
  $('bandera-a').textContent = '';
  $('bandera-b').textContent = '';
  $('bandera-a').className = 'bandera';
  $('bandera-b').className = 'bandera';
  $('lado-a').classList.remove('gana');
  $('lado-b').classList.remove('gana');
}

/* ══════════════════════════════ CARRERA ═══════════════════════════════════ */

function alternarCarrera(){
  if(corriendo){ pararCarrera(); return; }
  if(escA.terminado() && escB.terminado()) reiniciarCarrera();
  corriendo = true;
  acumulado = 0;
  ultimo = performance.now();
  $('btn-carrera').textContent = 'Pausar';
  raf = requestAnimationFrame(bucle);
}

function bucle(ts){
  if(!corriendo) return;
  const dt = Math.min(0.1, (ts - ultimo) / 1000);
  ultimo = ts;
  acumulado += pasosPorSegundo(+$('rng-vel2').value) * dt;

  let n = Math.min(40000, Math.floor(acumulado));
  acumulado -= n;
  for(let k = 0; k < n; k++){ escA.avanzar(); escB.avanzar(); }

  escA.pintar(); escB.pintar();
  refrescarMini();
  revisarMeta();

  if(escA.terminado() && escB.terminado()){ pararCarrera(); return; }
  raf = requestAnimationFrame(bucle);
}

function revisarMeta(){
  if(escA.terminado() && !$('bandera-a').textContent) marcarMeta('a');
  if(escB.terminado() && !$('bandera-b').textContent) marcarMeta('b');
}

function marcarMeta(lado){
  puesto++;
  const el = $('bandera-' + lado);
  if(puesto === 1){
    el.textContent = 'Terminó primero';
    $('lado-' + lado).classList.add('gana');
  } else {
    el.textContent = 'Terminó después';
    el.classList.add('lento');
  }
}

function pararCarrera(){
  corriendo = false;
  if(raf) cancelAnimationFrame(raf);
  raf = null;
  $('btn-carrera').textContent = 'Ejecutar los dos';
}

function reiniciarCarrera(){
  pararCarrera();
  escA.reiniciar();
  escB.reiniciar();
  limpiarBanderas();
  refrescarMini();
}

/* ══════════════════════════════ INDICADORES ═══════════════════════════════ */

function refrescarMini(){
  $('a-cmp').textContent  = fmt(escA.m.cmp);
  $('a-swap').textContent = fmt(escA.m.swap);
  $('a-wr').textContent   = fmt(escA.m.wr);
  $('a-paso').textContent = fmt(escA.cursor);
  $('b-cmp').textContent  = fmt(escB.m.cmp);
  $('b-swap').textContent = fmt(escB.m.swap);
  $('b-wr').textContent   = fmt(escB.m.wr);
  $('b-paso').textContent = fmt(escB.cursor);
}

function pintarTabla(){
  if(!resA || !resB) return;
  const kA = $('sel-a').value, kB = $('sel-b').value;

  const filas = [
    ['Comparaciones',            resA.m.cmp,         resB.m.cmp,         'n'],
    ['Intercambios',             resA.m.swap,        resB.m.swap,        'n'],
    ['Escrituras en el arreglo', resA.m.wr,          resB.m.wr,          'n'],
    ['Pasos registrados',        resA.pasos.length,  resB.pasos.length,  'n'],
    ['Tiempo de ejecución',      tiempoA,            tiempoB,            'ms'],
    ['Complejidad promedio',     ALGOS[kA].cx.prom,  ALGOS[kB].cx.prom,  'txt'],
    ['Memoria extra',            ALGOS[kA].cx.mem,   ALGOS[kB].cx.mem,   'txt'],
    ['Estable',                  ALGOS[kA].cx.estable, ALGOS[kB].cx.estable, 'txt']
  ];

  $('cmp-tbody').innerHTML = filas.map(([etiqueta, va, vb, tipo]) => {
    if(tipo === 'txt'){
      return `<tr><td>${esc(etiqueta)}</td><td>${esc(va)}</td><td>${esc(vb)}</td><td>—</td></tr>`;
    }

    const texto = x => tipo === 'ms' ? x.toFixed(3) + ' ms' : fmt(x);
    const tope = Math.max(va, vb) || 1;
    const anchoA = (va / tope) * 56;
    const anchoB = (vb / tope) * 56;

    let dif = '—';
    if(va > 0 && vb > 0){
      dif = va > vb ? `${(va / vb).toFixed(2)}× el izquierdo`
          : vb > va ? `${(vb / va).toFixed(2)}× el derecho`
          : 'iguales';
    } else if(va === 0 && vb === 0){
      dif = 'iguales';
    }

    return `<tr>
      <td>${esc(etiqueta)}</td>
      <td class="${va < vb ? 'mejor' : ''}"><div class="celda-medida"><i class="a" style="width:${anchoA}px"></i>${texto(va)}</div></td>
      <td class="${vb < va ? 'mejor' : ''}"><div class="celda-medida"><i class="b" style="width:${anchoB}px"></i>${texto(vb)}</div></td>
      <td>${dif}</td>
    </tr>`;
  }).join('');
}
