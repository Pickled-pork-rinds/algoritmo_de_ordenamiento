/* ===========================================================================
   main.js — punto de entrada. Lo único que hace es arrancar cada pieza.

   Orden importante: primero «Comparar», porque se suscribe a los cambios de
   datos; después «Visualizar», que es quien genera el primer arreglo y por
   tanto dispara ese aviso.
   =========================================================================== */

import { iniciarTema, iniciarPestanas, llenarFicha } from './ui.js';
import { iniciarComparar } from './comparar.js';
import { iniciarVisualizar } from './visualizar.js';

iniciarTema();
iniciarPestanas();
llenarFicha();

iniciarComparar();
iniciarVisualizar();
