# Ordena — Visualizador de algoritmos de ordenamiento

Aplicación web para **ejecutar, visualizar paso a paso y comparar** ocho algoritmos de
ordenamiento sobre exactamente los mismos datos.

**Aplicación en línea:** `https://USUARIO.github.io/visualizador-ordenamiento/`
*(sustituyan la URL cuando publiquen)*

---

## Integrantes

| Nombre completo | Código | Responsabilidad principal |
|---|---|---|
| | | |
| | | |
| | | |
| | | |

---

## Descripción

La página muestra un arreglo como una gráfica de barras y anima, paso a paso, lo que
hace cada algoritmo sobre él: qué elementos compara, cuáles intercambia y qué escribe.
Al mismo tiempo resalta la línea del pseudocódigo que se está ejecutando y lleva la
cuenta de comparaciones, intercambios, escrituras y pasos.

La segunda vista permite poner dos algoritmos a correr **sobre el mismo arreglo** y
comparar sus indicadores lado a lado.

### La decisión de diseño que sostiene todo el proyecto

Cada algoritmo está escrito **una sola vez**. Mientras se ejecuta, va avisando lo que
hace a una función llamada `rec` (el grabador):

```js
m.cmp++;
rec({ t: 'cmp', i: j, j: j + 1, l: 2 });   // "comparé A[j] con A[j+1], línea 2"
if (a[j] > a[j + 1]) permuta(a, j, j + 1, m, rec, 3);
```

De ahí salen dos usos del mismo código:

* si `rec` **guarda** los avisos, obtenemos la lista de pasos que alimenta la animación
  y las métricas;
* si `rec` **no hace nada**, el algoritmo corre a velocidad normal y podemos
  cronometrarlo sin que la animación contamine la medición.

Como consecuencia no existen dos versiones del mismo algoritmo, y los números que ve
la persona son exactamente los del algoritmo que se ejecutó.

---

## Objetivo

Que alguien que no conoce estos algoritmos pueda **entender qué hacen viéndolos**, y
que quien ya los conoce pueda **comprobar cuantitativamente** por qué unos son mejores
que otros en cada tipo de entrada.

---

## Algoritmos implementados

### Fuerza bruta

| Algoritmo | Qué hace | Mejor | Promedio | Peor | Memoria | Estable |
|---|---|---|---|---|---|---|
| **Bubble Sort** | Compara vecinos y empuja el mayor al final en cada pasada. Implementado en su forma de fuerza bruta: hace siempre las n pasadas completas, sin corte anticipado. | O(n²) | O(n²) | O(n²) | O(1) | Sí |
| **Selection Sort** | Busca el mínimo de la parte no ordenada y lo coloca al inicio de esa parte. El intercambio es incondicional. | O(n²) | O(n²) | O(n²) | O(1) | No |
| **Insertion Sort** | Sostiene un elemento aparte y desplaza a los mayores hasta abrirle su hueco. | O(n) | O(n²) | O(n²) | O(1) | Sí |
| **Gnome Sort** | Avanza si el par está en orden; si no, intercambia y retrocede un paso. Es una inserción con un solo ciclo. | O(n) | O(n²) | O(n²) | O(1) | Sí |
| **Exchange Sort** | Fija una posición y la compara contra todas las de su derecha, intercambiando de inmediato. | O(n²) | O(n²) | O(n²) | O(1) | No |
| **Stooge Sort** | Ordena los primeros dos tercios, los últimos dos tercios y otra vez los primeros dos tercios. | O(n^2.71) | O(n^2.71) | O(n^2.71) | O(log n) | No |

### Divide y vencerás

| Algoritmo | Qué hace | Mejor | Promedio | Peor | Memoria | Estable |
|---|---|---|---|---|---|---|
| **Quick Sort** | Partición de Lomuto con el último elemento como pivote. | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| **Merge Sort** | Divide a la mitad, ordena cada mitad y las mezcla usando un arreglo auxiliar `T`. | O(n log n) | O(n log n) | O(n log n) | O(n) | Sí |

Todos viven en [`js/algoritmos.js`](js/algoritmos.js), cada uno en su propio objeto con
su pseudocódigo y su ficha de complejidad.

---

## Tecnologías utilizadas

* **HTML5, CSS3 y JavaScript (módulos ES2020)**. Sin frameworks, sin build, sin
  dependencias: lo que está en el repositorio es lo que corre en el navegador.
* **CSS custom properties** para el sistema de diseño (`css/tokens.css`), con tema
  claro y oscuro.
* **Google Fonts**: Space Grotesk (interfaz) y JetBrains Mono (código y cifras).
* **GitHub Pages** para el despliegue.

### Por qué sin framework

El proyecto tiene que poder defenderse línea por línea. Un framework habría añadido
capas que no aportan nada a un visualizador de ~1 500 líneas y habría escondido
justamente lo que se evalúa: los algoritmos y el control de la animación.

---

## Cómo ejecutar el proyecto

El proyecto usa **módulos ES**, así que hay que servirlo por HTTP. Si abren
`index.html` con doble clic (`file://`) el navegador bloqueará los módulos por
seguridad y la página saldrá en blanco.

### Opción 1 — Visual Studio Code con Live Server (la más cómoda)

1. Clonar el repositorio y abrir la carpeta en VS Code:
   ```bash
   git clone https://github.com/USUARIO/visualizador-ordenamiento.git
   cd visualizador-ordenamiento
   code .
   ```
2. Instalar la extensión **Live Server** (Ritwick Dey) desde el panel de extensiones.
3. Clic derecho sobre `index.html` → **Open with Live Server**.
4. Se abre en `http://127.0.0.1:5500`.

### Opción 2 — servidor de Python (sin instalar nada más)

```bash
cd visualizador-ordenamiento
python -m http.server 8000
```
Abrir `http://localhost:8000`.

### Opción 3 — Node

```bash
npx serve .
```

---

## Uso de la aplicación

### Pestaña «Visualizar»

| Control | Para qué sirve |
|---|---|
| **Algoritmo** | Elige cuál de los ocho se va a animar. |
| **Cantidad de elementos** | De 8 a 100 barras. |
| **Distribución** | Aleatoria, casi ordenada, invertida o con pocos valores distintos. |
| **Semilla** | Con la misma semilla se obtiene exactamente el mismo arreglo. |
| **Tus propios números** | Se escriben separados por comas y se ordenan esos. |
| **Velocidad** | De unos pocos pasos por segundo hasta decenas de miles. |
| **Transporte** | Reproducir/pausar, un paso atrás, un paso adelante, ir al final y reiniciar. |
| **Barra de avance** | Se puede arrastrar para saltar a cualquier punto de la ejecución. |

Atajos de teclado: `espacio` reproduce o pausa, `←` y `→` avanzan un paso, `R` reinicia.

**Cómo leer los colores**

| Color | Significado |
|---|---|
| Gris | Elemento sin tocar en este instante |
| Ámbar | Se está comparando |
| Rojo | Se está intercambiando |
| Violeta | Se está escribiendo un valor en esa posición |
| Azul | Pivote (Quick Sort) |
| Verde | Ya está en su posición final |
| Banda de fondo | Sub-arreglo sobre el que trabaja la recursión |

Merge Sort muestra además una **pista auxiliar** con el arreglo `T`: la mezcla lee de
ahí y escribe arriba, que es justamente la razón de su O(n) de memoria extra.

### Pestaña «Comparar»

Se eligen dos algoritmos y se ejecutan **sobre el mismo arreglo** que está cargado en la
otra pestaña. Ambos avanzan a la misma cantidad de pasos por segundo, así que el que
necesita menos trabajo termina antes. Debajo aparece la tabla con:

comparaciones · intercambios · escrituras · pasos registrados · tiempo de ejecución ·
complejidad promedio · memoria extra · estabilidad.

El **tiempo** se mide aparte: se ejecuta el algoritmo sin animación, repetidas veces
hasta acumular unos 40 ms, y se promedia.

### Experimentos que vale la pena hacer

1. **Insertion Sort** con distribución «Casi ordenada»: las comparaciones caen a casi n.
2. **Quick Sort** con distribución «Invertida»: el pivote de Lomuto es el peor posible y
   el algoritmo se degrada a O(n²). Compararlo contra Merge Sort en esa misma entrada.
3. **Selection vs Exchange**: hacen las mismas comparaciones, pero Exchange intercambia
   muchísimo más.
4. **Stooge** con 20 elementos: ya hace más pasos que cualquier cuadrático con 100.

---

## Deployment

Publicado con **GitHub Pages** (gratuito, sin dominio ni servicios de pago).

1. Subir el proyecto a la rama `main`.
2. En GitHub: **Settings → Pages**.
3. *Source*: `Deploy from a branch`. *Branch*: `main`, carpeta `/ (root)`.
4. **Save**. En un par de minutos queda en
   `https://USUARIO.github.io/visualizador-ordenamiento/`.

No hace falta compilar ni configurar nada: el repositorio ya es el sitio.

---

## Organización del equipo

El trabajo se organizó en **GitHub Projects**, con las columnas Backlog, Por hacer,
En progreso, En revisión y Terminado.

**Tablero:** `https://github.com/users/USUARIO/projects/N` *(completar)*

| Tarea | Responsable | Entrega | Se considera terminada cuando |
|---|---|---|---|
| | | | |

Estructura de carpetas del repositorio:

```
visualizador-ordenamiento/
├── index.html              Estructura de la página
├── README.md
├── .gitignore
├── assets/
│   └── favicon.svg
├── css/
│   ├── tokens.css          Colores, tipografías, espaciado, temas
│   ├── base.css            Normalización, texto, formularios
│   ├── layout.css          Barra superior, rejilla, riel, pie
│   └── componentes.css     Gráfico, transporte, pseudocódigo, tablas
├── docs/
│   ├── algoritmos.md       Explicación de cada algoritmo
│   └── capturas/           Evidencias
└── js/
    ├── algoritmos.js       Los ocho algoritmos + grabador + cronómetro
    ├── datos.js            Generación de arreglos con semilla
    ├── estado.js           El arreglo compartido entre las dos vistas
    ├── escenario.js        Motor de dibujo y reproducción de la animación
    ├── ui.js               Utilidades comunes, tema y pestañas
    ├── visualizar.js       Vista de un solo algoritmo
    ├── comparar.js         Vista de comparación
    └── main.js             Punto de entrada
```

### Dónde está cada cosa (para la defensa del código)

| Pregunta | Archivo | Referencia |
|---|---|---|
| ¿Cómo está implementado Quick Sort? | `js/algoritmos.js` | objeto `ALGOS.quick`, función `particion` |
| ¿Dónde se cuentan las comparaciones? | `js/algoritmos.js` | `m.cmp++` en cada algoritmo |
| ¿Dónde se convierten en animación? | `js/escenario.js` | función `aplicar()` |
| ¿Cómo se dibuja una barra? | `js/escenario.js` | función `pintar()` |
| ¿Cómo se mide el tiempo? | `js/algoritmos.js` | función `cronometrar()` |
| ¿Cómo se garantiza el mismo arreglo en los dos? | `js/estado.js` | `fijarDatos()` y `alCambiarDatos()` |
| ¿Cómo se reproduce el mismo arreglo dos veces? | `js/datos.js` | `mulberry32()` |
| ¿Cómo se resalta la línea del pseudocódigo? | `js/visualizar.js` | `marcarLinea()`, campo `l` de cada evento |

---

## Uso de IA

Se usaron herramientas de inteligencia artificial durante el desarrollo, principalmente
para:

* proponer la estructura inicial de archivos y la separación en módulos;
* resolver dudas de CSS (rejilla, temas con variables, controles personalizados);
* redactar el pseudocódigo en español y esta documentación;
* revisar casos borde de los algoritmos.

El equipo revisó, probó y adaptó todo el código resultante. Cada integrante puede
explicar el funcionamiento de las partes que le corresponden.

> *Completar con las herramientas concretas que usó el equipo y en qué parte.*

---

## Aprendizajes y conclusiones

* **La complejidad teórica se ve.** Poner Bubble y Merge con el mismo arreglo de 100
  elementos hace evidente la diferencia entre 9 900 y 539 comparaciones mucho mejor que
  la notación asintótica sola.
* **El peor caso no es un tecnicismo.** Quick Sort con pivote fijo pasa de ser el más
  rápido a comportarse como un cuadrático con sólo cambiar la distribución de entrada.
* **Contar operaciones es más informativo que cronometrar.** El tiempo depende de la
  máquina y del navegador; las comparaciones e intercambios son propios del algoritmo.
* **Separar el algoritmo de su visualización** fue la decisión más importante: el
  algoritmo no sabe que lo están dibujando, sólo reporta lo que hace.
* Insertion y Gnome resuelven el mismo problema con la misma complejidad, pero Gnome
  paga con intercambios lo que Insertion resuelve con desplazamientos: misma clase,
  distinto costo constante.
