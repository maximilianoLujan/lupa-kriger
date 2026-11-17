import { describe, expect, it } from 'vitest'
import indexHtml from '../index.html?raw'

/** Los archivos que hay en `public/` (se sirven desde la raíz del sitio). */
const publicFiles = Object.keys(import.meta.glob('../public/*.png')).map((path) => path.replace('../public', ''))

describe('ícono de la pestaña', () => {
  it('index.html apunta al logo del cliente y los archivos existen en public/', () => {
    const html = new DOMParser().parseFromString(indexHtml, 'text/html')
    const hrefs = [...html.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]')].map((l) =>
      l.getAttribute('href'),
    )

    expect(hrefs).toEqual(['/favicon-32.png', '/favicon-192.png', '/apple-touch-icon.png'])
    for (const href of hrefs) expect(publicFiles).toContain(href)
  })
})
