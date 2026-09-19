/* ===========================================================================
   escenario.js — el "reproductor" de la animación.

   No sabe nada de algoritmos: recibe un arreglo inicial y la lista de eventos
   que produjo `grabar()`, y se encarga de:
     · construir las barras y los ejes;
     · aplicar los eventos uno por uno (adelante y atrás);
     · llevar las métricas en vivo;
     · dibujar el estado actual.

   Las métricas se deducen de los propios eventos, así que lo que se ve en
   pantalla y lo que dicen los números nunca se pueden desincronizar.
   =========================================================================== */

/** Estado visual limpio (lo que está resaltado en este instante). */
function estadoLimpio(){
  return {
    resaltado: [],   // índices resaltados ahora mismo
    tipo: null,      // 'cmp' | 'swap' | 'set'
    listos: new Set(),
    rango: null,     // {lo, hi} sub-arreglo activo
    pivote: -1,
    marca: -1,
    clave: -1,
    claveVal: null,
    aux: null,       // {lo, hi, vals} arreglo auxiliar de Merge
    pi: -1,
    pj: -1
  };
}

/**
 * @param {HTMLElement} el      contenedor de las barras
 * @param {object} op
 *   op.aux        contenedor de la pista auxiliar (o null)
 *   op.grid       contenedor de las líneas guía (o null)
 *   op.ejeX       contenedor del eje de índices (o null)
 *   op.tip        globo de valor al pasar el cursor (o null)
 *   op.etiquetas  true para escribir el valor encima de cada barra
 */
export function crearEscenario(el, op = {}){

  const S = {
    el,
    base: [],
    arr: [],
    max: 1,
    pasos: [],
    cursor: 0,
    m: { cmp: 0, swap: 0, wr: 0 },
    vis: estadoLimpio(),
    slots: [],
    slotsAux: [],
    etiquetas: false
  };

  /* ---------------------------------------------------------- construcción */

  function construir(){
    S.etiquetas = !!op.etiquetas && S.base.length <= 32;

    el.innerHTML = '';
    S.slots = [];
    for(let i = 0; i < S.base.length; i++){
      const slot = document.createElement('div');
      slot.className = 'slot';
      slot.style.setProperty('--i', i);

      const bar = document.createElement('div');
      bar.className = 'bar';
      slot.appendChild(bar);

      if(S.etiquetas){
        const v = document.createElement('span');
        v.className = 'val';
        bar.appendChild(v);
      }
      el.appendChild(slot);
      S.slots.push(slot);
    }

    if(op.aux){
      op.aux.innerHTML = '';
      S.slotsAux = [];
      for(let i = 0; i < S.base.length; i++){
        const slot = document.createElement('div');
        slot.className = 'slot';
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = '0%';
        slot.appendChild(bar);
        op.aux.appendChild(slot);
        S.slotsAux.push(slot);
      }
    }

    dibujarGuias();
    dibujarEjeX();

    // Una sola entrada orquestada, al generar el arreglo.
    el.classList.add('entra');
    clearTimeout(S.tEntra);
    S.tEntra = setTimeout(() => el.classList.remove('entra'), 700 + S.base.length * 6);
  }

  function dibujarGuias(){
    if(!op.grid) return;
    const niveles = [0.25, 0.5, 0.75, 1];
    op.grid.innerHTML = niveles.map(p => {
      const valor = Math.round(S.max * p);
      const base = p === 1 ? ' base' : '';
      return `<div class="g${base}" style="bottom:${p * 100}%"><span>${valor}</span></div>`;
    }).join('');
  }

  function dibujarEjeX(){
    if(!op.ejeX) return;
    const n = S.base.length;
    if(!n){ op.ejeX.innerHTML = ''; return; }
    const salto = n <= 20 ? 5 : n <= 50 ? 10 : 20;
    let html = '';
    for(let i = 0; i < n; i += salto){
      const x = ((i + 0.5) / n) * 100;
      html += `<span class="t" style="left:${x}%">${i}</span>`;
    }
    const ultimo = n - 1;
    if(ultimo % salto !== 0){
      html += `<span class="t" style="left:${((ultimo + 0.5) / n) * 100}%">${ultimo}</span>`;
    }
    op.ejeX.innerHTML = html;
  }

  /* -------------------------------------------------------------- eventos */

  function aplicar(ev){
    const v = S.vis;
    v.resaltado = [];
    v.tipo = null;

    switch(ev.t){
      case 'cmp':
        S.m.cmp++;
        v.resaltado = ev.j >= 0 ? [ev.i, ev.j] : [ev.i];
        v.tipo = 'cmp';
        break;

      case 'swap': {
        S.m.swap++;
        S.m.wr += 2;
        const t = S.arr[ev.i];
        S.arr[ev.i] = S.arr[ev.j];
        S.arr[ev.j] = t;
        v.listos.delete(ev.i);
        v.listos.delete(ev.j);
        v.resaltado = [ev.i, ev.j];
        v.tipo = 'swap';
        break;
      }

      case 'set':
        S.m.wr++;
        S.arr[ev.i] = ev.v;
        v.listos.delete(ev.i);
        v.resaltado = [ev.i];
        v.tipo = 'set';
        break;

      case 'ok':
        if(ev.i >= 0) v.listos.add(ev.i);
        break;

      case 'okr':
        for(let k = ev.lo; k <= ev.hi; k++) v.listos.add(k);
        break;

      case 'okall':
        for(let k = 0; k < S.arr.length; k++) v.listos.add(k);
        v.rango = null; v.pivote = -1; v.marca = -1; v.clave = -1; v.aux = null;
        break;

      case 'pivot': v.pivote = ev.i; break;
      case 'marca': v.marca  = ev.i; break;

      case 'clave':
        v.clave = ev.i;
        v.claveVal = ev.i >= 0 ? ev.v : null;
        break;

      case 'rng':
        v.rango = ev.lo >= 0 ? { lo: ev.lo, hi: ev.hi } : null;
        break;

      case 'aux':
        v.aux = ev.lo >= 0 ? { lo: ev.lo, hi: ev.hi, vals: ev.vals } : null;
        v.pi = -1; v.pj = -1;
        break;

      case 'ptr':
        S.m.cmp++;            // en Merge la comparación ocurre sobre el auxiliar
        v.pi = ev.i;
        v.pj = ev.j;
        break;
    }
  }

  /* -------------------------------------------------------------- dibujo  */

  function pintar(){
    const v = S.vis;
    const max = S.max;

    for(let i = 0; i < S.slots.length; i++){
      const slot = S.slots[i];
      let cls = 'slot';
      if(v.listos.has(i))                                 cls += ' ok';
      if(v.rango && i >= v.rango.lo && i <= v.rango.hi)   cls += ' banda';
      if(v.pivote === i)                                  cls += ' piv';
      if(v.tipo && v.resaltado.indexOf(i) !== -1)         cls += ' ' + v.tipo;
      if(v.marca === i)                                   cls += ' marca';
      if(v.clave === i)                                   cls += ' clave';
      if(slot.className !== cls) slot.className = cls;

      const bar = slot.firstChild;
      bar.style.height = Math.max(1.5, (S.arr[i] / max) * 100) + '%';
      if(S.etiquetas) bar.firstChild.textContent = S.arr[i];
    }

    if(op.aux){
      const encendido = !!v.aux;
      for(let i = 0; i < S.slotsAux.length; i++){
        const slot = S.slotsAux[i];
        const dentro = encendido && i >= v.aux.lo && i <= v.aux.hi;
        let cls = 'slot';
        if(dentro && i === v.pi){ cls += ' pi'; slot.dataset.p = 'i'; }
        else if(dentro && i === v.pj){ cls += ' pj'; slot.dataset.p = 'j'; }
        slot.className = cls;
        slot.firstChild.style.height = dentro
          ? Math.max(1.5, (v.aux.vals[i - v.aux.lo] / max) * 100) + '%'
          : '0%';
      }
    }
  }

  /* ---------------------------------------------------- globo informativo */

  if(op.tip){
    const tip = op.tip;
    el.addEventListener('pointermove', e => {
      const slot = e.target.closest('.slot');
      if(!slot){ tip.hidden = true; return; }
      const i = S.slots.indexOf(slot);
      if(i < 0){ tip.hidden = true; return; }
      const caja = el.getBoundingClientRect();
      const s = slot.getBoundingClientRect();
      tip.textContent = `A[${i}] = ${S.arr[i]}`;
      tip.style.left = (s.left - caja.left + s.width / 2) + 'px';
      tip.style.top  = (s.bottom - caja.top - (S.arr[i] / S.max) * caja.height - 10) + 'px';
      tip.hidden = false;
    });
    el.addEventListener('pointerleave', () => { tip.hidden = true; });
  }

  /* ------------------------------------------------------------ interfaz  */

  S.cargar = function(datos, pasos){
    S.base = datos.slice();
    S.pasos = pasos;
    S.max = Math.max(1, ...datos);
    construir();
    S.reiniciar();
  };

  S.reiniciar = function(){
    S.arr = S.base.slice();
    S.vis = estadoLimpio();
    S.cursor = 0;
    S.m = { cmp: 0, swap: 0, wr: 0 };
    pintar();
  };

  /** Aplica el siguiente evento. Devuelve false si ya no hay más. */
  S.avanzar = function(){
    if(S.cursor >= S.pasos.length) return false;
    aplicar(S.pasos[S.cursor]);
    S.cursor++;
    return true;
  };

  /** Salta a un paso concreto. Para ir hacia atrás, rebobina y reproduce. */
  S.irA = function(destino){
    destino = Math.max(0, Math.min(S.pasos.length, destino));
    if(destino < S.cursor){
      S.arr = S.base.slice();
      S.vis = estadoLimpio();
      S.cursor = 0;
      S.m = { cmp: 0, swap: 0, wr: 0 };
    }
    while(S.cursor < destino) S.avanzar();
    pintar();
  };

  S.pintar    = pintar;
  S.terminado = () => S.cursor >= S.pasos.length;
  S.eventoActual = () => S.pasos[Math.max(0, S.cursor - 1)] || null;
  S.avance    = () => (S.pasos.length ? S.cursor / S.pasos.length : 0);

  return S;
}
