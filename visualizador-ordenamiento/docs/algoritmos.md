# Descripción de los algoritmos

Los ocho están en [`../js/algoritmos.js`](../js/algoritmos.js), dentro del objeto
`ALGOS`. Cada entrada contiene su pseudocódigo (`code`), su ficha de complejidad (`cx`)
y la implementación (`run`).

Todas las implementaciones reciben los mismos tres argumentos:

```js
run(a, m, rec)
```

* `a` — el arreglo que se va a ordenar (una copia; el original nunca se toca).
* `m` — el contador: `m.cmp` comparaciones, `m.swap` intercambios, `m.wr` escrituras.
* `rec` — el grabador, que recibe un aviso por cada operación.

---

## 1. Bubble Sort (burbuja)

```
para i ← 0 hasta n-1
  para j ← 0 hasta n-2
    si A[j] > A[j+1]
      intercambiar A[j], A[j+1]
```

Recorre el arreglo comparando cada elemento con su vecino de la derecha. Al terminar
una pasada, el mayor de los que quedaban queda al final.

Se implementó la **versión de fuerza bruta vista en clase**: el ciclo externo corre
siempre n veces y el interno siempre llega hasta `n-2`, sin corte anticipado ni
reducción del rango. Por eso su mejor caso también es O(n²) y por eso en la animación
se ve seguir comparando elementos que ya están en verde.

* Comparaciones: siempre `n × (n-1)`.
* Intercambios: tantos como inversiones haya en la entrada.
* Estable: sí, porque sólo intercambia cuando hay `>` estricto.

---

## 2. Selection Sort (selección)

```
para i ← 0 hasta n-2
  min ← i
  para j ← i+1 hasta n-1
    si A[j] < A[min] entonces min ← j
  intercambiar A[i], A[min]
```

En cada vuelta recorre lo que queda sin ordenar buscando el mínimo, y lo trae a la
posición `i`.

El intercambio es **incondicional** (se hace aunque `min == i`), igual que en el código
original de clase. Eso significa exactamente `n-1` intercambios siempre.

* Comparaciones: siempre `n(n-1)/2`, sin importar la entrada.
* Intercambios: `n-1`. Es el que menos mueve datos de los seis.
* Estable: **no**. El intercambio a larga distancia puede saltar un elemento igual por
  encima de otro.

---

## 3. Insertion Sort (inserción)

```
para i ← 1 hasta n-1
  clave ← A[i];   j ← i-1
  mientras j ≥ 0 y A[j] > clave
    A[j+1] ← A[j]
    j ← j-1
  A[j+1] ← clave
```

Saca el elemento `A[i]` y lo sostiene en la variable `clave` (en la animación la
posición queda con un anillo violeta). Después desplaza hacia la derecha a todos los
mayores hasta abrirle el hueco y lo deposita ahí.

No intercambia nunca: **desplaza**. Por eso su contador de intercambios se queda en
cero y todo el movimiento aparece como escrituras.

* Mejor caso O(n): si el arreglo ya está ordenado, el `mientras` falla a la primera.
* Estable: sí, porque sólo desplaza mientras `A[j] > clave` estricto.

---

## 4. Gnome Sort (gnomo)

```
i ← 0
mientras i < n
  si i = 0 o A[i] ≥ A[i-1]
    i ← i+1
  si no
    intercambiar A[i], A[i-1];   i ← i-1
```

Un solo ciclo. Avanza mientras el par esté en orden; cuando encuentra uno mal puesto,
lo intercambia y retrocede una posición para volver a revisar.

Hace el mismo trabajo lógico que Insertion Sort, pero pagándolo con intercambios en
lugar de desplazamientos: en el comparador se ve que su cuenta de comparaciones es
parecida y la de intercambios mucho mayor.

* Mejor caso O(n): si no retrocede nunca, es un solo recorrido.
* Estable: sí.

---

## 5. Exchange Sort (intercambio directo)

```
para i ← 0 hasta n-2
  para j ← i+1 hasta n-1
    si A[j] < A[i]
      intercambiar A[i], A[j]
```

Se parece a selección, pero en vez de recordar dónde está el mínimo, intercambia en el
momento en que encuentra algo menor. Al final de la vuelta `i`, la posición `i` contiene
el mínimo de lo que quedaba — igual que selección, pero habiendo movido datos muchas
veces por el camino.

* Comparaciones: las mismas que selección, `n(n-1)/2`.
* Intercambios: muchos más. Esta pareja es el mejor ejemplo del proyecto de que dos
  algoritmos con la misma complejidad pueden costar muy distinto.
* Estable: no.

---

## 6. Stooge Sort

```
stooge(A, l, h)
  si A[l] > A[h] entonces intercambiar
  si (h - l + 1) > 2
    t ← ⌊(h - l + 1) / 3⌋
    stooge(A, l,     h - t)
    stooge(A, l + t, h    )
    stooge(A, l,     h - t)
```

Ordena recursivamente los primeros dos tercios, luego los últimos dos tercios y
**otra vez** los primeros dos tercios. La tercera llamada es la que hace que funcione:
después de ordenar el último tercio, el primer bloque puede haber quedado alterado.

Su recurrencia es `T(n) = 3·T(2n/3) + O(1)`, que da
`O(n^(log₃ᐟ₂ 3)) ≈ O(n^2.71)` — peor que cualquier algoritmo cuadrático.

Con 100 elementos genera más de 260 000 pasos, que es el tope de la animación; por eso
la aplicación avisa cuando se pasa de 40 elementos.

* Estable: no.

---

## 7. Quick Sort (partición de Lomuto)

```
quickSort(A, lo, hi)
  si lo ≥ hi entonces regresar
  p ← particion(A, lo, hi)
  quickSort(A, lo,  p-1)
  quickSort(A, p+1, hi )

particion(A, lo, hi)
  pivote ← A[hi];   i ← lo - 1
  para j ← lo hasta hi-1
    si A[j] ≤ pivote entonces i ← i+1; intercambiar A[i], A[j]
  intercambiar A[i+1], A[hi];   regresar i+1
```

Se eligió **Lomuto** en vez de Hoare porque es mucho más fácil de seguir visualmente:
hay un solo índice `i` que marca la frontera de "lo menor o igual al pivote", y el
pivote termina siempre en su posición definitiva (por eso se pinta de verde en cuanto
la partición acaba).

El pivote es `A[hi]`, el último elemento. Es la elección más simple y también la peor
posible para entradas ya ordenadas o invertidas: en ese caso la partición deja un lado
vacío, la recursión tiene profundidad n y el algoritmo se degrada a **O(n²)**. Se puede
comprobar en la aplicación eligiendo la distribución «Invertida».

* Memoria: O(log n) en promedio por la pila de recursión, O(n) en el peor caso.
* Estable: no.

---

## 8. Merge Sort (mezcla)

```
mergeSort(A, lo, hi)
  si lo ≥ hi entonces regresar
  mid ← ⌊(lo + hi) / 2⌋
  mergeSort(A, lo,    mid)
  mergeSort(A, mid+1, hi )
  mezclar(A, lo, mid, hi)

mezclar(A, lo, mid, hi)
  copiar A[lo..hi] en T[lo..hi]
  i ← lo;   j ← mid+1
  para k ← lo hasta hi
    si T[i] ≤ T[j] entonces A[k] ← T[i]; i ← i+1
    si no              entonces A[k] ← T[j]; j ← j+1
```

Divide siempre a la mitad, así que su árbol de recursión tiene altura `log₂ n` y en cada
nivel se recorre el arreglo completo: **O(n log n) en todos los casos**, sin peor caso
malo.

La mezcla no se puede hacer en el sitio sin complicarla mucho, así que primero copia el
segmento a un arreglo auxiliar `T` y después escribe de vuelta en `A` tomando siempre el
menor de los dos frentes.

**Por qué la aplicación dibuja una segunda pista.** Mientras se mezcla, las posiciones
de `A` ya se están sobrescribiendo, así que resaltar `A[i]` y `A[j]` sería mentira: esos
valores ya no están ahí. La pista de abajo muestra `T`, de donde se lee de verdad, con
los punteros `i` y `j` marcados. Arriba se ve la escritura en `A[k]`.

* Memoria extra: O(n). Es el precio de su garantía de O(n log n).
* Estable: sí, gracias al `≤` de la comparación (ante un empate toma el de la izquierda).

---

## Cómo se cuentan los indicadores

| Indicador | Se incrementa en |
|---|---|
| Comparaciones | cada `m.cmp++`, justo antes de comparar dos elementos |
| Intercambios | dentro de `permuta()`, una vez por intercambio |
| Escrituras | `+2` por cada intercambio, `+1` por cada asignación directa `A[i] ← v` |
| Pasos | cantidad de eventos registrados por el grabador |
| Tiempo | `cronometrar()`, ejecutando el algoritmo sin grabar y promediando |

Los cuatro primeros los cuenta el propio algoritmo mientras corre. El motor de la
animación (`escenario.js`) los vuelve a deducir de los eventos, así que si alguna vez no
coincidieran, sería señal de que un evento se está quedando sin registrar.
