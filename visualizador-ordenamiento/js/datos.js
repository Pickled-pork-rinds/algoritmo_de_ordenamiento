/* ===========================================================================
   datos.js — generación de los arreglos de prueba.

   Usamos un generador pseudoaleatorio con semilla (mulberry32) en lugar de
   Math.random porque el proyecto necesita poder repetir EXACTAMENTE el mismo
   arreglo: es lo que permite comparar dos algoritmos sobre los mismos datos
   y volver a la misma prueba días después.
   =========================================================================== */

export const DISTRIBUCIONES = {
  rand: 'Aleatoria',
  near: 'Casi ordenada',
  rev:  'Invertida',
  few:  'Pocos valores distintos'
};

/** Generador pseudoaleatorio de 32 bits con semilla. */
export function mulberry32(semilla){
  let s = semilla >>> 0;
  return function(){
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Construye un arreglo de n valores entre 5 y 99.
 * @param {number} n        cantidad de elementos
 * @param {string} dist     rand | near | rev | few
 * @param {number} semilla  entero
 */
export function generar(n, dist, semilla){
  const azar = mulberry32(semilla);
  const entero = (lo, hi) => lo + Math.floor(azar() * (hi - lo + 1));
  const a = [];

  if(dist === 'few'){
    const valores = [14, 33, 52, 71, 95];
    for(let i = 0; i < n; i++) a.push(valores[entero(0, valores.length - 1)]);
    return a;
  }

  for(let i = 0; i < n; i++) a.push(entero(5, 99));

  if(dist === 'near'){
    a.sort((x, y) => x - y);
    // Desordenamos sólo un 8 % de las posiciones: queda "casi ordenado".
    // Con menos de dos elementos no hay nada que desordenar.
    if(n >= 2){
      const golpes = Math.max(1, Math.round(n * 0.08));
      for(let k = 0; k < golpes; k++){
        const i = entero(0, n - 2);
        const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t;
      }
    }
  } else if(dist === 'rev'){
    a.sort((x, y) => y - x);
  }

  return a;
}

/**
 * Convierte texto escrito por la persona en un arreglo de números válido.
 * Acepta comas, espacios o saltos de línea como separador.
 * @returns {number[]} arreglo saneado (puede quedar vacío)
 */
export function leerLista(texto){
  return texto
    .split(/[^0-9]+/)
    .filter(s => s !== '')
    .map(Number)
    .filter(v => Number.isFinite(v) && v > 0)
    .map(v => Math.min(999, Math.round(v)))
    .slice(0, 100);
}
