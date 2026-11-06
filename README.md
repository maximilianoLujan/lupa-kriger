# Lupa Kriger

MVP de un catálogo de repuestos de autos. Base limpia con React + TypeScript + Tailwind CSS sobre Vite, sin código de demo.

## Stack

| Herramienta | Versión | Para qué |
|---|---|---|
| React | 19 | UI |
| TypeScript | 7 | Tipado |
| Vite | 8 | Dev server y build |
| Tailwind CSS | 4 | Estilos (plugin oficial de Vite, sin `tailwind.config`) |
| oxlint | 1 | Lint rápido |
| TanStack Query | 5 | Datos del servidor: caché, paginado, reintentos |
| Axios | 1 | Cliente HTTP con interceptores (token, refresh, errores) |
| Zustand | 5 | Estado global del front (carrito) |
| Vitest | 5 | Tests unitarios y de componentes (jsdom + Testing Library) |

## Requisitos

- Node.js 20 o superior (desarrollado con 24)
- npm 10 o superior

## Arranque

```bash
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Chequeo de tipos y build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción localmente |
| `npm run lint` | Corre oxlint sobre el proyecto |
| `npm test` | Corre los tests una vez (Vitest + Testing Library) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura en `coverage/` |

## Estructura

```
.
├── index.html            # Punto de entrada HTML
├── vite.config.ts        # Vite + plugins (react, tailwind)
├── tsconfig*.json        # Configuración de TypeScript (app y node)
├── .oxlintrc.json        # Reglas de lint
├── public/               # Archivos estáticos servidos tal cual
└── src/
    ├── main.tsx          # Monta la app en #root
    ├── App.tsx           # Componente raíz
    ├── index.css         # Importa Tailwind + tema de marca (@theme)
    ├── assets/           # Logo del cliente
    ├── auth/             # Contexto de sesión, hook useAuth y credenciales mock
    ├── cart/             # Carrito en memoria (CartProvider, useCart)
    ├── components/
    │   ├── ui/           # Button, Input
    │   ├── catalog/      # ArticleCard, AlternativeRow, AddToCartButton, CartDrawer, StockBadge, SearchBar, ListHeader, NavBar, Highlight
    │   └── Logo.tsx
    ├── config/env.ts     # Lee VITE_DATA_SOURCE y VITE_API_URL
    ├── data/articles/    # Repositorio de artículos: contrato, mock y API
    ├── hooks/            # useArticlesSearch, useDebouncedValue
    ├── pages/            # LoginPage, CatalogPage
    ├── types/            # Tipos del dominio (User, ProductBox, AlternativeArticle, Warehouse)
    ├── utils/            # formatPrice, text (normalizar y tokenizar búsquedas)
    └── test/             # Setup de Vitest y helpers de render
```

## Autenticación

Con `VITE_DATA_SOURCE=mock` el login es solo de frontend. Las credenciales viven en `src/auth/credentials.ts`:

| Usuario | Contraseña |
|---|---|
| `123` | `123` |

Con `VITE_DATA_SOURCE=api` el login va contra el ERP (`POST /v1/auth/login`, `src/auth/api.ts`): el usuario es el
email de un miembro de la empresa cuyo rol tenga el permiso **Lupa › Consultar artículos** (`lupa.articles.read`) y
nada más. La API devuelve los tokens; el de acceso viaja como `Authorization: Bearer` en cada búsqueda. Si la API
responde 401 (sesión vencida), la app vuelve sola al login.

La sesión (usuario y tokens) se guarda en `sessionStorage` y se pierde al cerrar la pestaña. `useAuth()` expone
`user`, `login()` y `logout()` para cualquier componente dentro de `<AuthProvider>`.

## Fuente de datos: mock o API

La UI nunca habla con la API directamente. Pasa por `ArticlesRepository` (`src/data/articles/repository.ts`), una interfaz con dos implementaciones:

| Implementación | Archivo | Cuándo |
|---|---|---|
| `MockArticlesRepository` | `src/data/articles/mock/` | Default. Busca sobre los artículos hardcodeados en `articles.mock.ts`, pagina de a 10 y simula 300 ms de red. |
| `ApiArticlesRepository` | `src/data/articles/api/` | Llama por `fetch` a la API real. Todavía no hay backend; el archivo documenta el contrato que tiene que cumplir. |

Se elige por variable de entorno. Copiá `.env.example` a `.env` y ajustá:

```bash
VITE_DATA_SOURCE=mock   # o api
VITE_API_URL=http://localhost:3000
```

`src/data/articles/index.ts` arma la instancia según eso. Los componentes reciben el repositorio como prop (con ese default), así los tests inyectan uno propio.

### Contrato de la API

Es el módulo **Lupa** del ERP (ADR-0255 del repo del ERP), con la sesión del usuario:

```
GET {VITE_API_URL}/v1/lupa/articles/search?q=&page=&pageSize=   → { items, page, pageSize, hasMore, total }
GET {VITE_API_URL}/v1/lupa/warehouses                            → { items: [{ code, name }] }
```

Cada ítem es una "cajita": el artículo que coincidió (`code`), el nombre de su grupo de equivalencia (`name`), líneas
descriptivas (`details`), la unión de modelos compatibles de Repuestos (`compatibleModels`) y las `alternatives` (el
artículo y sus equivalentes activos) con `brandName`, `oemCodes`, `price` (con IVA, lista por defecto; string decimal)
y `stock` por código de depósito (string decimal). `ApiArticlesRepository` traduce eso a los tipos de la app
(`src/types/article.ts`): `price` → `priceList` (número), `stock` → números, `make` → `brandName`, años → `since`/`until`.
Las fotos todavía no se muestran (la API las sirve con sesión): queda el logo del cliente.

### Agregar artículos al mock

Sumá objetos al array de `src/data/articles/mock/articles.mock.ts`. El test de datos verifica que no haya códigos repetidos y que cada equivalente tenga stock para todas las sucursales de `warehouses.mock.ts`.

## Peticiones y estado

Tres capas, cada una con una sola responsabilidad:

| Capa | Dónde | Qué hace |
|---|---|---|
| Cliente HTTP | `src/lib/http.ts` | Instancia de Axios con `VITE_API_URL`. Manda `Authorization: Bearer` con el token de la sesión. Ante un 401 llama a `POST /v1/auth/refresh` una sola vez (aunque fallen varias peticiones a la vez), guarda los tokens nuevos y repite la petición. Si no puede renovar, cierra la sesión y la app vuelve al login. Todo error llega como `ApiError` con `status` y mensaje legible (`status` 0 es red caída). |
| Repositorios | `src/data/articles/` y `src/auth/api.ts` | Traducen el contrato del ERP a los tipos de la app. No saben de tokens ni de errores: eso lo hace el cliente. |
| Hooks de datos | `src/hooks/` | TanStack Query. `useArticlesSearch` es un `useInfiniteQuery` por texto buscado (cada búsqueda queda cacheada, "Cargar más" trae la página siguiente). `useWarehouses` es un `useQuery` que se pide una vez por sesión. Las claves están en `queryKeys.ts`. |

El `QueryClient` de la app (`src/lib/queryClient.ts`) reintenta una vez los errores de red o de servidor y nunca los 4xx. En desarrollo aparecen las devtools de Query abajo a la izquierda.

Para agregar un endpoint nuevo: sumá el método al repositorio, un hook con `useQuery` o `useMutation` y su clave en `queryKeys.ts`. Las peticiones que no deben renovar sesión ante 401 (login, refresh, logout) llevan `skipAuthRefresh: true`.

### Estado global

El carrito es un store de Zustand (`src/cart/store.ts`) persistido en `sessionStorage`. Los componentes usan `useCart()`, que expone items, totales y acciones. Si hace falta otro estado global (preferencias, filtros), va en otro store, no en contexto.

### Tests de peticiones

`src/test/fakeHttp.ts` crea el cliente real con un adapter falso: el handler decide qué responde cada petición y se puede asertar URL, headers y body. Así se prueban los interceptores sin red.

## Catálogo

- Búsqueda libre con debounce de 300 ms. Matchea todas las palabras contra descripción, detalles, marca y modelo de auto, marca del equivalente y código de fabricante, sin distinguir acentos ni mayúsculas. Las coincidencias se resaltan.
- Paginado con botón "Cargar más".
- Stock con círculos de color: verde más de 5, amarillo entre 1 y 5, rojo sin stock. Más de 9 se muestra como "+9". Hay un solo depósito y la columna dice STOCK; si la API devuelve varios, aparece una columna por depósito con su nombre corto.
- Layout mobile first: la cajita se apila en celular y se vuelve fila con columnas (foto, descripción, modelo, equivalentes) en pantallas grandes, como en lupa-web.
- Fotos: si el artículo no tiene URL o la imagen falla al cargar, `ArticlePhoto` muestra el logo del cliente.
- Carrito (`src/cart/`): cada equivalente tiene un botón de agregar en la columna PEDIR; al tocarlo se convierte en un control − [cantidad] + donde también se puede escribir la cantidad a mano (`QuantityStepper`). Tras 2,5 s sin actividad el control se cierra solo y vuelve el botón con la cantidad que hay en el carrito; tocarlo de nuevo reabre el control. Llegar a 0 lo saca del carrito. Contador en el header y panel lateral con el mismo control y el total. Se persiste en `sessionStorage`. El envío del pedido todavía no existe.
- Las columnas de la cabecera y de las cards comparten las grillas de `src/components/catalog/columns.ts`, así los títulos quedan alineados con el contenido.
- Header con chips de secciones (`NavBar`). Las que todavía no existen (Pedidos, Ofertas, Favoritos, Mis vehículos, Cuenta corriente) se ven bloqueadas con candado y muestran "Próximamente" al pasar el mouse, enfocar o tocar. Para habilitar una, sacale `locked` en `NAV_ITEMS`.

## Tailwind y paleta

**Regla del repo: la paleta sale del logo (rojo + gris + blanco), nada negro ni oscuro, nada rosa.** Tailwind 4 se configura desde CSS. Los únicos colores permitidos son los tokens del bloque `@theme` de `src/index.css`:

| Token | Valor | Uso |
|---|---|---|
| `brand` | `#e30613` | Rojo del logo: botones, chip activo, carrito, panel del login |
| `brand-hover` | `#c9050f` | Hover de botones |
| `brand-soft` | `#fdeeee` | Tinte leve del rojo, solo para alertas y "sin stock" |
| `brand-text` | `#c8101b` | Rojo para texto sobre fondo claro |
| `mint` `butter` | pastel | Semáforo de stock (con y poco stock) |
| `ink` | `#555b64` | Texto principal (gris medio, no negro) |
| `ink-soft` | `#8a9099` | Texto secundario |
| `line` | `#e4e5e9` | Bordes y divisores |
| `canvas` | `#f4f4f6` | Fondo de página y cabecera de columnas |

No usar `black`, `gray-700+`, `slate-800+` ni clases `*-900`. Para agregar un color, sumá un token pastel al `@theme`.

## Alcance del MVP

Lo mínimo para validar la idea:

1. Login (hecho).
2. Listado de repuestos con búsqueda por texto (hecho, con datos mock).
3. Conectar la API real cuando exista.
4. Pedidos / carrito, si el cliente lo pide.

## Testing

Cada feature se entrega con sus tests al lado del archivo que prueba (`Foo.tsx` → `Foo.test.tsx`). Se usa Vitest con jsdom y Testing Library, consultando por roles y labels accesibles, no por clases ni ids.

- Lógica pura (`credentials.ts`): tests unitarios directos.
- Hooks y contexto (`AuthProvider`): `renderHook` con el provider como wrapper.
- Páginas: `renderWithProviders` de `src/test/render.tsx` e interacción con `userEvent`.
- `App.test.tsx` cubre el flujo completo login → catálogo → salir.

## Convenciones

- Componentes en PascalCase, un componente por archivo.
- Tipos del dominio en `src/types/`, nunca inline en componentes.
- Estilos solo con clases de Tailwind y los tokens pastel del tema. Si algo se repite mucho, se vuelve componente, no clase CSS custom.
- Sin colores negros ni oscuros. Ver "Tailwind y paleta".
- Sin estado global más allá del contexto de auth. `useState` y props alcanzan para el MVP.
- Mobile first: escribí las clases base para celular y agregá `sm:`, `lg:` para pantallas más grandes.
- Todo cambio se commitea y pushea a `main`. No hay ambiente productivo todavía.
