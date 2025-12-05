#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const SOURCE_MD = path.join(ROOT, 'data', 'eco-zh_wikipedia.md')
const OUTPUT_JSON = path.join(ROOT, 'data', 'eco-zh-wikipedia.json')

const raw = await readFile(SOURCE_MD, 'utf8')
let markdown = raw

try {
  const notebook = JSON.parse(raw)
  if (Array.isArray(notebook.cells)) {
    markdown = notebook.cells
      .filter((cell) => cell.cell_type === 'markdown')
      .map((cell) => (cell.source || []).join('\n'))
      .join('\n')
  }
} catch (err) {
  // Treat as plain markdown if JSON parse fails.
}

const lines = markdown.split(/\r?\n/)
const codePattern = /^-\s*(?:\[(?<codeLink>[A-E]\d{2})\]\([^)]*\)|(?<code>[A-E]\d{2}))\s*(?<rest>.*)$/u
const entries = {}
const duplicateWarnings = []

for (const line of lines) {
  const trimmed = line.trim()
  if (!trimmed.startsWith('- ')) {
    continue
  }
  const match = trimmed.match(codePattern)
  if (!match) {
    continue
  }

  const code = (match.groups.codeLink || match.groups.code || '').toUpperCase()
  if (!code) {
    continue
  }

  const rest = match.groups.rest.trim()
  if (!rest || /^[–-]\s*\d{2}/.test(rest)) {
    continue
  }

  let label = rest
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .replace(/^[:：\-]+/, '')
    .trim()

  if (!label) {
    continue
  }

  // Collapse internal whitespace while keeping punctuation.
  label = label.replace(/\s+/g, ' ').trim()

  if (entries[code] && entries[code] !== label) {
    duplicateWarnings.push({ code, previous: entries[code], next: label })
  }

  entries[code] = label
}

const sortedCodes = Object.keys(entries).sort()
const sortedEntries = {}
for (const code of sortedCodes) {
  sortedEntries[code] = entries[code]
}

const payload = {
  generatedAt: new Date().toISOString(),
  source: path.relative(ROOT, SOURCE_MD),
  count: sortedCodes.length,
  entries: sortedEntries
}

await writeFile(OUTPUT_JSON, JSON.stringify(payload, null, 2) + '\n', 'utf8')

console.log(
  `[convert-eco-zh] Wrote ${sortedCodes.length} entries to ${path.relative(ROOT, OUTPUT_JSON)}`
)

if (duplicateWarnings.length) {
  console.warn('[convert-eco-zh] Duplicate codes detected:')
  for (const warning of duplicateWarnings) {
    console.warn(
      `  ${warning.code}: "${warning.previous}" -> "${warning.next}" (keeping latest)`
    )
  }
}
