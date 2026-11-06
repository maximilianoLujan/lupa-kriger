# Reglas del repo

- **Paleta del logo: rojo `#e30613` + grises claros + blanco. Nada rosa, nada negro ni oscuro.** Usar solo los tokens de `@theme` en `src/index.css` (`brand`, `brand-hover`, `brand-soft`, `brand-text`, `mint`, `butter`, `ink`, `ink-soft`, `line`, `canvas`). Nada de `black`, `gray-700+`, `slate-800+` ni textos `*-900`. El texto va en `ink` (gris medio). Los tintes del rojo (`brand-soft`) se usan muy poco porque se ven rosas.
- **Mobile first.** Clases base para celular, `sm:` y `lg:` para pantallas más grandes.
- **Cada feature con sus tests** al lado del archivo (`Foo.tsx` → `Foo.test.tsx`). Consultar por roles y labels accesibles.
- **Todo cambio se commitea y pushea a `main`** sin pedir confirmación. No hay ambiente productivo.
- **Datos:** la UI solo habla con `ArticlesRepository`. Mock en `src/data/articles/mock/`, API en `src/data/articles/api/`. Se elige con `VITE_DATA_SOURCE`.
- **Imágenes:** si una foto falta o falla, se muestra el logo del cliente (`ArticlePhoto`).
- **Funcionalidades bloqueadas:** las que todavía no existen van en el header como chips con tooltip "Próximamente" (`NavBar`).
- **Un solo acento de color** en la interfaz: el rojo del logo. Menta y manteca solo para el semáforo de stock, nunca varios colores juntos en un mismo bloque.
- **Columnas alineadas:** cabecera y cards usan las grillas compartidas de `src/components/catalog/columns.ts`. Si cambiás una columna, cambiala ahí.
