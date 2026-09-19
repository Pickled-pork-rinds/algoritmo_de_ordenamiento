/* ===========================================================================
   algoritmos.js
   ---------------------------------------------------------------------------
   Aquí viven los ocho algoritmos. La idea central del proyecto es ésta:

     cada algoritmo se escribe UNA sola vez y, mientras se ejecuta, le va
     avisando a una función `rec` (el grabador) todo lo que hace.

   Con eso obtenemos dos cosas del mismo código:
     · si `rec` guarda los avisos  → tenemos la animación y las métricas;
     · si `rec` no hace nada       → tenemos el tiempo de ejecución puro.

   Nunca hay dos versiones del mismo algoritmo, así que los números que se
   muestran en pantalla son exactamente los del algoritmo que se ejecutó.

   EVENTOS QUE SE REPORTAN
     {t:'cmp',   i, j}         comparó A[i] con A[j]   (j = -1 → sólo A[i])
     {t:'swap',  i, j}         intercambió A[i] y A[j]
     {t:'set',   i, v}         escribió el valor v en A[i]
     {t:'ok',    i}            A[i] ya quedó en su posición definitiva
     {t:'okr',   lo, hi}       A[lo..hi] ya quedó ordenado
     {t:'okall'}               todo el arreglo quedó ordenado
     {t:'pivot', i}            marcar pivote (i = -1 lo quita)
     {t:'marca', i}            marcar el índice de trabajo (i = -1 lo quita)
     {t:'clave', i, v}         elemento sostenido "en la mano" (i = -1 lo quita)
     {t:'rng',   lo, hi}       sub-arreglo activo (lo = -1 lo quita)
     {t:'aux',   lo, hi, vals} cargar el arreglo auxiliar de Merge
     {t:'ptr',   i, j}         punteros i y j dentro del auxiliar

   Todos los eventos llevan además `l`: el número de línea del pseudocódigo
   que se está ejecutando, para poder resaltarla.
   =========================================================================== */

/** Tope de eventos guardados. Protege la memoria con arreglos grandes. */
export const LIMITE_PASOS = 260000;

/** Intercambio con contabilidad y aviso al grabador. */
function permuta(a, i, j, m, rec, l){
  const tmp = a[i];
  a[i] = a[j];
  a[j] = tmp;
  m.swap += 1;
  m.wr   += 2;
  rec({ t: 'swap', i, j, l });
}

export const ALGOS = {

  /* ══════════════════ 1 · BURBUJA (fuerza bruta, como en clase) ══════════ */
  bubble: {
    nombre: 'Bubble Sort',
    es: 'Ordenamiento burbuja',
    fam: 'Fuerza bruta',
    idea: 'Compara vecinos y empuja el mayor hacia el final en cada pasada.',
    nota: 'Es la versión de fuerza bruta: hace siempre las n pasadas completas, aunque el arreglo ya esté ordenado. Por eso hasta su mejor caso es O(n²).',
    cx: { mejor: 'O(n²)', prom: 'O(n²)', peor: 'O(n²)', mem: 'O(1)', estable: 'Sí' },
    code: [
      'para i ← 0 hasta n-1',
      '  para j ← 0 hasta n-2',
      '    si A[j] > A[j+1]',
      '      intercambiar A[j], A[j+1]'
    ],
    run(a, m, rec){
      const n = a.length;
      for(let i = 0; i < n; i++){
        for(let j = 0; j < n - 1; j++){
          m.cmp++;
          rec({ t: 'cmp', i: j, j: j + 1, l: 2 });
          if(a[j] > a[j + 1]) permuta(a, j, j + 1, m, rec, 3);
        }
        // Tras la pasada i, el elemento de la posición n-1-i ya es definitivo.
        rec({ t: 'ok', i: n - 1 - i, l: 0 });
      }
      rec({ t: 'okall' });
    }
  },

  /* ══════════════════ 2 · SELECCIÓN ══════════════════════════════════════ */
  selection: {
    nombre: 'Selection Sort',
    es: 'Ordenamiento por selección',
    fam: 'Fuerza bruta',
    idea: 'Busca el mínimo de la parte no ordenada y lo coloca al inicio de esa parte.',
    nota: 'Hace siempre n(n-1)/2 comparaciones, pero a lo mucho n-1 intercambios: de los seis de fuerza bruta es el que menos mueve datos.',
    cx: { mejor: 'O(n²)', prom: 'O(n²)', peor: 'O(n²)', mem: 'O(1)', estable: 'No' },
    code: [
      'para i ← 0 hasta n-2',
      '  min ← i',
      '  para j ← i+1 hasta n-1',
      '    si A[j] < A[min] entonces min ← j',
      '  intercambiar A[i], A[min]'
    ],
    run(a, m, rec){
      const n = a.length;
      for(let i = 0; i < n - 1; i++){
        let min = i;
        rec({ t: 'marca', i: min, l: 1 });
        for(let j = i + 1; j < n; j++){
          m.cmp++;
          rec({ t: 'cmp', i: j, j: min, l: 3 });
          if(a[j] < a[min]){
            min = j;
            rec({ t: 'marca', i: min, l: 3 });
          }
        }
        permuta(a, i, min, m, rec, 4);   // el intercambio es incondicional
        rec({ t: 'marca', i: -1 });
        rec({ t: 'ok', i, l: 4 });
      }
      rec({ t: 'okall' });
    }
  },

  /* ══════════════════ 3 · INSERCIÓN ══════════════════════════════════════ */
  insertion: {
    nombre: 'Insertion Sort',
    es: 'Ordenamiento por inserción',
    fam: 'Fuerza bruta',
    idea: 'Toma un elemento, lo sostiene aparte y desplaza a los mayores hasta abrirle su hueco.',
    nota: 'Si los datos vienen casi ordenados casi no desplaza nada y baja a O(n). Pruébalo con la distribución «Casi ordenada».',
    cx: { mejor: 'O(n)', prom: 'O(n²)', peor: 'O(n²)', mem: 'O(1)', estable: 'Sí' },
    code: [
      'para i ← 1 hasta n-1',
      '  clave ← A[i];   j ← i-1',
      '  mientras j ≥ 0 y A[j] > clave',
      '    A[j+1] ← A[j]',
      '    j ← j-1',
      '  A[j+1] ← clave'
    ],
    run(a, m, rec){
      const n = a.length;
      rec({ t: 'ok', i: 0 });
      for(let i = 1; i < n; i++){
        const clave = a[i];
        rec({ t: 'clave', i, v: clave, l: 1 });
        let j = i - 1;
        while(j >= 0){
          m.cmp++;
          rec({ t: 'cmp', i: j, j: -1, l: 2 });   // se compara contra la clave
          if(a[j] <= clave) break;
          a[j + 1] = a[j];
          m.wr++;
          rec({ t: 'set', i: j + 1, v: a[j + 1], l: 3 });
          j--;
        }
        a[j + 1] = clave;
        m.wr++;
        rec({ t: 'set', i: j + 1, v: clave, l: 5 });
        rec({ t: 'clave', i: -1 });
        rec({ t: 'okr', lo: 0, hi: i, l: 5 });
      }
      rec({ t: 'okall' });
    }
  },

  /* ══════════════════ 4 · GNOMO ══════════════════════════════════════════ */
  gnome: {
    nombre: 'Gnome Sort',
    es: 'Ordenamiento del gnomo',
    fam: 'Fuerza bruta',
    idea: 'Avanza mientras el par esté en orden; si no lo está, intercambia y retrocede un paso.',
    nota: 'Es una inserción escrita con un solo ciclo: en lugar de desplazar, retrocede intercambiando.',
    cx: { mejor: 'O(n)', prom: 'O(n²)', peor: 'O(n²)', mem: 'O(1)', estable: 'Sí' },
    code: [
      'i ← 0',
      'mientras i < n',
      '  si i = 0 o A[i] ≥ A[i-1]',
      '    i ← i+1',
      '  si no',
      '    intercambiar A[i], A[i-1];   i ← i-1'
    ],
    run(a, m, rec){
      const n = a.length;
      let i = 0;
      while(i < n){
        rec({ t: 'marca', i, l: 1 });
        if(i === 0){ i++; continue; }
        m.cmp++;
        rec({ t: 'cmp', i, j: i - 1, l: 2 });
        if(a[i] >= a[i - 1]){
          i++;
        } else {
          permuta(a, i, i - 1, m, rec, 5);
          i--;
        }
      }
      rec({ t: 'marca', i: -1 });
      rec({ t: 'okall' });
    }
  },

  /* ══════════════════ 5 · INTERCAMBIO DIRECTO ════════════════════════════ */
  exchange: {
    nombre: 'Exchange Sort',
    es: 'Ordenamiento por intercambio directo',
    fam: 'Fuerza bruta',
    idea: 'Fija una posición y la compara contra todas las de su derecha, intercambiando en cuanto encuentra algo menor.',
    nota: 'Se parece a selección, pero intercambia en el momento en vez de recordar el mínimo: hace las mismas comparaciones y muchísimos más intercambios.',
    cx: { mejor: 'O(n²)', prom: 'O(n²)', peor: 'O(n²)', mem: 'O(1)', estable: 'No' },
    code: [
      'para i ← 0 hasta n-2',
      '  para j ← i+1 hasta n-1',
      '    si A[j] < A[i]',
      '      intercambiar A[i], A[j]'
    ],
    run(a, m, rec){
      const n = a.length;
      for(let i = 0; i < n - 1; i++){
        rec({ t: 'marca', i, l: 0 });
        for(let j = i + 1; j < n; j++){
          m.cmp++;
          rec({ t: 'cmp', i: j, j: i, l: 2 });
          if(a[j] < a[i]) permuta(a, i, j, m, rec, 3);
        }
        rec({ t: 'ok', i, l: 0 });
      }
      rec({ t: 'marca', i: -1 });
      rec({ t: 'okall' });
    }
  },

  /* ══════════════════ 6 · STOOGE ═════════════════════════════════════════ */
  stooge: {
    nombre: 'Stooge Sort',
    es: 'Ordenamiento stooge',
    fam: 'Fuerza bruta recursiva',
    idea: 'Ordena los primeros dos tercios, luego los últimos dos tercios y otra vez los primeros dos tercios.',
    nota: 'Su costo es O(n^2.71), peor que cualquier algoritmo cuadrático. Con más de 40 elementos genera cientos de miles de pasos.',
    cx: { mejor: 'O(n^2.71)', prom: 'O(n^2.71)', peor: 'O(n^2.71)', mem: 'O(log n)', estable: 'No' },
    code: [
      'stooge(A, l, h)',
      '  si A[l] > A[h] entonces intercambiar',
      '  si (h - l + 1) > 2',
      '    t ← ⌊(h - l + 1) / 3⌋',
      '    stooge(A, l,     h - t)',
      '    stooge(A, l + t, h    )',
      '    stooge(A, l,     h - t)'
    ],
    run(a, m, rec){
      const paso = (l, h) => {
        if(l >= h) return;
        rec({ t: 'rng', lo: l, hi: h, l: 0 });
        m.cmp++;
        rec({ t: 'cmp', i: l, j: h, l: 1 });
        if(a[l] > a[h]) permuta(a, l, h, m, rec, 1);
        if(h - l + 1 > 2){
          const t = Math.floor((h - l + 1) / 3);
          paso(l, h - t);
          paso(l + t, h);
          paso(l, h - t);
        }
      };
      paso(0, a.length - 1);
      rec({ t: 'rng', lo: -1, hi: -1 });
      rec({ t: 'okall' });
    }
  },

  /* ══════════════════ 7 · QUICK SORT (partición de Lomuto) ═══════════════ */
  quick: {
    nombre: 'Quick Sort',
    es: 'Ordenamiento rápido',
    fam: 'Divide y vencerás',
    idea: 'Elige un pivote, deja lo menor a su izquierda y lo mayor a su derecha, y repite en cada mitad.',
    nota: 'El pivote es el último elemento (partición de Lomuto). Con datos ya ordenados o invertidos ese pivote es pésimo y cae a O(n²): compruébalo con la distribución «Invertida».',
    cx: { mejor: 'O(n log n)', prom: 'O(n log n)', peor: 'O(n²)', mem: 'O(log n)', estable: 'No' },
    code: [
      'quickSort(A, lo, hi)',
      '  si lo ≥ hi entonces regresar',
      '  p ← particion(A, lo, hi)',
      '  quickSort(A, lo,  p-1)',
      '  quickSort(A, p+1, hi )',
      '',
      'particion(A, lo, hi)',
      '  pivote ← A[hi];   i ← lo - 1',
      '  para j ← lo hasta hi-1',
      '    si A[j] ≤ pivote entonces i ← i+1; intercambiar A[i], A[j]',
      '  intercambiar A[i+1], A[hi];   regresar i+1'
    ],
    run(a, m, rec){
      const particion = (lo, hi) => {
        const pivote = a[hi];
        rec({ t: 'pivot', i: hi, l: 7 });
        let i = lo - 1;
        for(let j = lo; j < hi; j++){
          m.cmp++;
          rec({ t: 'cmp', i: j, j: hi, l: 8 });
          if(a[j] <= pivote){
            i++;
            permuta(a, i, j, m, rec, 9);
          }
        }
        permuta(a, i + 1, hi, m, rec, 10);
        rec({ t: 'pivot', i: -1 });
        rec({ t: 'ok', i: i + 1, l: 10 });
        return i + 1;
      };
      const qs = (lo, hi) => {
        if(lo >= hi){
          if(lo === hi) rec({ t: 'ok', i: lo, l: 1 });
          return;
        }
        rec({ t: 'rng', lo, hi, l: 0 });
        const p = particion(lo, hi);
        qs(lo, p - 1);
        qs(p + 1, hi);
      };
      qs(0, a.length - 1);
      rec({ t: 'rng', lo: -1, hi: -1 });
      rec({ t: 'okall' });
    }
  },

  /* ══════════════════ 8 · MERGE SORT ═════════════════════════════════════ */
  merge: {
    nombre: 'Merge Sort',
    es: 'Ordenamiento por mezcla',
    fam: 'Divide y vencerás',
    idea: 'Parte el arreglo a la mitad, ordena cada mitad y después las mezcla comparando sus frentes.',
    nota: 'La pista de abajo es el arreglo auxiliar T: la mezcla lee de T y escribe en A. Por eso necesita O(n) de memoria extra, pero su tiempo es O(n log n) siempre.',
    cx: { mejor: 'O(n log n)', prom: 'O(n log n)', peor: 'O(n log n)', mem: 'O(n)', estable: 'Sí' },
    code: [
      'mergeSort(A, lo, hi)',
      '  si lo ≥ hi entonces regresar',
      '  mid ← ⌊(lo + hi) / 2⌋',
      '  mergeSort(A, lo,    mid)',
      '  mergeSort(A, mid+1, hi )',
      '  mezclar(A, lo, mid, hi)',
      '',
      'mezclar(A, lo, mid, hi)',
      '  copiar A[lo..hi] en T[lo..hi]',
      '  i ← lo;   j ← mid+1',
      '  para k ← lo hasta hi',
      '    si T[i] ≤ T[j] entonces A[k] ← T[i]; i ← i+1',
      '    si no              entonces A[k] ← T[j]; j ← j+1'
    ],
    run(a, m, rec){
      const T = new Array(a.length);

      const mezclar = (lo, mid, hi) => {
        for(let k = lo; k <= hi; k++) T[k] = a[k];
        rec({ t: 'aux', lo, hi, vals: a.slice(lo, hi + 1), l: 8 });

        let i = lo, j = mid + 1;
        for(let k = lo; k <= hi; k++){
          let tomaIzquierda;
          if(i > mid)      tomaIzquierda = false;      // se acabó la mitad izquierda
          else if(j > hi)  tomaIzquierda = true;       // se acabó la derecha
          else {
            m.cmp++;
            rec({ t: 'ptr', i, j, l: 11 });
            tomaIzquierda = (T[i] <= T[j]);
          }
          if(tomaIzquierda){ a[k] = T[i]; i++; }
          else             { a[k] = T[j]; j++; }
          m.wr++;
          rec({ t: 'set', i: k, v: a[k], l: tomaIzquierda ? 11 : 12 });
        }
        rec({ t: 'aux', lo: -1, hi: -1 });
        rec({ t: 'okr', lo, hi, l: 12 });
      };

      const ms = (lo, hi) => {
        if(lo >= hi) return;
        rec({ t: 'rng', lo, hi, l: 0 });
        const mid = (lo + hi) >> 1;
        ms(lo, mid);
        ms(mid + 1, hi);
        mezclar(lo, mid, hi);
      };

      ms(0, a.length - 1);
      rec({ t: 'rng', lo: -1, hi: -1 });
      rec({ t: 'okall' });
    }
  }
};

/** Orden en que aparecen en los menús. */
export const ORDEN = ['bubble','selection','insertion','gnome','exchange','stooge','quick','merge'];

/** Claves que NO son de fuerza bruta (para agrupar el menú). */
export const DIVIDE = ['quick','merge'];

/**
 * Ejecuta un algoritmo guardando cada evento.
 * @returns {{pasos:Array, m:{cmp:number,swap:number,wr:number}, cortado:boolean, final:number[]}}
 */
export function grabar(clave, datos){
  const a = datos.slice();
  const m = { cmp: 0, swap: 0, wr: 0 };
  const pasos = [];
  let cortado = false;

  const rec = ev => {
    if(pasos.length < LIMITE_PASOS) pasos.push(ev);
    else cortado = true;
  };

  ALGOS[clave].run(a, m, rec);
  return { pasos, m, cortado, final: a };
}

/** Grabador vacío: el algoritmo corre sin registrar nada. */
const SIN_GRABAR = () => {};

/**
 * Mide el tiempo del algoritmo puro, sin animación ni registro.
 * Repite la ejecución hasta acumular ~40 ms y promedia, para que el
 * resultado no dependa de la resolución del reloj.
 * @returns {number} milisegundos por ejecución
 */
export function cronometrar(clave, datos){
  ALGOS[clave].run(datos.slice(), { cmp:0, swap:0, wr:0 }, SIN_GRABAR); // calentamiento

  let reps = 0;
  const t0 = performance.now();
  let t1 = t0;
  while(reps < 80 && t1 - t0 < 40){
    ALGOS[clave].run(datos.slice(), { cmp:0, swap:0, wr:0 }, SIN_GRABAR);
    reps++;
    t1 = performance.now();
  }
  return (t1 - t0) / Math.max(1, reps);
}

/** Verificación independiente: ¿el arreglo quedó realmente ordenado? */
export function estaOrdenado(a){
  for(let i = 1; i < a.length; i++){
    if(a[i - 1] > a[i]) return false;
  }
  return true;
}
