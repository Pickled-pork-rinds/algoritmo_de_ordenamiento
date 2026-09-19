/* ===========================================================================
   estado.js — el arreglo de trabajo vive aquí, no dentro de una vista.

   Así se cumple el requisito de que ambas vistas usen EXACTAMENTE los mismos
   datos: la vista «Visualizar» los genera, este módulo los guarda y avisa, y
   la vista «Comparar» los recoge tal cual.
   =========================================================================== */

export const estado = {
  datos:   [],
  tam:     40,
  dist:    'rand',
  semilla: 2026,
  origen:  'generado'   // 'generado' | 'propio'
};

const oyentes = [];

/** Registra una función que se llamará cada vez que cambien los datos. */
export function alCambiarDatos(fn){
  oyentes.push(fn);
}

/** Reemplaza el arreglo de trabajo y avisa a todas las vistas. */
export function fijarDatos(datos, meta = {}){
  estado.datos = datos.slice();
  estado.tam = datos.length;
  Object.assign(estado, meta);
  for(const fn of oyentes) fn(estado.datos);
}
