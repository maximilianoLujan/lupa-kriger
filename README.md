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
    ├── components/
    │   ├── ui/           # Button, Input
    │   ├── catalog/      # ArticleCard, AlternativeRow, StockBadge, SearchBar, ListHeader, Highlight
    │   └── Logo.tsx
    ├── config/env.ts     # Lee VITE_DATA_SOURCE y VITE_API_URL
    ├── data/articles/    # Repositorio de artículos: contrato, mock y API
    ├── hooks/            # useArticlesSearch, useDebouncedValue
    ├── pages/            # LoginPage, CatalogPage
    ├── types/            # Tipos del dominio (User, ProductBox, AlternativeArticle, Warehouse)
    ├── utils/            # formatPrice, text (normalizar y tokenizar búsquedas)
    └── test/             # Setup de Vitest y helpers de render
```

## Autenticación (mock)

El login es solo de frontend para el MVP. Las credenciales viven en `src/auth/credentials.ts`:

| Usuario | Contraseña |
|---|---|
| `123` | `123` |

La sesión se guarda en `sessionStorage` y se pierde al cerrar la pestaña. `useAuth()` expone `user`, `login()` y `logout()` para cualquier componente dentro de `<AuthProvider>`. Cuando exista backend, reemplazá `authenticate()` por la llamada real y el resto queda igual.

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

```
GET {VITE_API_URL}/articles/search?q=&page=&pageSize=   → SearchResponse
GET {VITE_API_URL}/warehouses                            → Warehouse[]
```

Los tipos están en `src/types/article.ts`. La forma sigue a la de lupa-web: cada resultado es una "cajita" (`ProductBox`) con el artículo cabecera, sus líneas descriptivas, los modelos de auto compatibles y la lista de equivalentes (`AlternativeArticle`) con marca, código de fabricante, precio y stock por sucursal.

### Agregar artículos al mock

Sumá objetos al array de `src/data/articles/mock/articles.mock.ts`. El test de datos verifica que no haya códigos repetidos y que cada equivalente tenga stock para todas las sucursales de `warehouses.mock.ts`.

## Catálogo

- Búsqueda libre con debounce de 300 ms. Matchea todas las palabras contra descripción, detalles, marca y modelo de auto, marca del equivalente y código de fabricante, sin distinguir acentos ni mayúsculas. Las coincidencias se resaltan.
- Paginado con botón "Cargar más".
- Stock por sucursal con círculos de color: verde más de 5, amarillo entre 1 y 5, rojo sin stock. Más de 9 se muestra como "+9".
- Layout mobile first: la cajita se apila en celular y se vuelve fila con columnas (foto, descripción, modelo, equivalentes) en pantallas grandes, como en lupa-web.

## Tailwind

Tailwind 4 se configura desde CSS, no desde un archivo JS. El tema de marca ya está definido en `src/index.css`, tomado del logo del cliente:

| Token | Valor | Clase |
|---|---|---|
| `brand` | `#e30613` | `bg-brand`, `text-brand` |
| `brand-dark` | `#b8000c` | hover de botones |
| `brand-light` | `#fdeaec` | fondos de alerta |
| `ink` | `#3d3d3d` | texto y bordes oscuros |
| `ink-dark` | `#2a2a2a` | paneles oscuros |

Para agregar más tokens, sumalos al bloque `@theme` del mismo archivo.

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
- Estilos solo con clases de Tailwind. Si algo se repite mucho, se vuelve componente, no clase CSS custom.
- Sin estado global más allá del contexto de auth. `useState` y props alcanzan para el MVP.
- Mobile first: escribí las clases base para celular y agregá `sm:`, `lg:` para pantallas más grandes.
- Todo cambio se commitea y pushea a `main`. No hay ambiente productivo todavía.
