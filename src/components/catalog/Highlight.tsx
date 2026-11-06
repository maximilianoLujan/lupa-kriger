import { useMemo } from 'react'
import { escapeRegExp, tokenize } from '../../utils/text'

interface HighlightProps {
  text: string
  query: string
}

/** Resalta las palabras de `query` dentro de `text`, sin distinguir acentos ni mayúsculas. */
export function Highlight({ text, query }: HighlightProps) {
  const tokens = useMemo(() => tokenize(query), [query])
  if (!tokens.length || !text) return <>{text}</>

  // Comparamos sobre una versión sin acentos pero recortamos el texto original,
  // así "bujia" resalta "Bujía" y se muestra con la tilde.
  const folded = text.normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (folded.length !== text.length) return <>{text}</>

  const regex = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi')
  const parts: Array<{ value: string; hit: boolean }> = []
  let last = 0
  for (const match of folded.matchAll(regex)) {
    const start = match.index
    if (start > last) parts.push({ value: text.slice(last, start), hit: false })
    parts.push({ value: text.slice(start, start + match[0].length), hit: true })
    last = start + match[0].length
  }
  if (last < text.length) parts.push({ value: text.slice(last), hit: false })

  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark key={i} className="rounded-sm bg-yellow-200 px-0.5 text-inherit">
            {p.value}
          </mark>
        ) : (
          <span key={i}>{p.value}</span>
        ),
      )}
    </>
  )
}
