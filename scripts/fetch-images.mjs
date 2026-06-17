import { createWriteStream } from 'node:fs'
import { mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { spawn } from 'node:child_process'

const ROOT = process.cwd()
const CARDS_PATH = join(ROOT, 'public', 'data', 'cards.json')

async function runOfficialMapping() {
  await new Promise((resolve, reject) => {
    const child = spawn('python', ['scripts/fetch-images-official.py'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('exit', (code) => {
      if (code === 0) resolve(undefined)
      else reject(new Error(`fetch-images-official.py exited with ${code}`))
    })
  })
}

async function downloadLocalImages() {
  const cards = JSON.parse(await readFile(CARDS_PATH, 'utf-8'))
  const targets = cards.filter((card) => card.imageUrl)

  let downloaded = 0
  let missing = 0

  for (const card of targets) {
    const dest = join(
      ROOT,
      'public',
      'cards',
      String(card.setId),
      `${card.number}.webp`,
    )

    try {
      const response = await fetch(card.imageUrl)
      if (!response.ok) {
        missing += 1
        continue
      }

      await mkdir(join(dest, '..'), { recursive: true })
      await pipeline(response.body, createWriteStream(dest))
      downloaded += 1
    } catch {
      missing += 1
    }
  }

  console.log(`Local cache: ${downloaded} saved, ${missing} failed`)
}

async function runFillMissing() {
  await new Promise((resolve, reject) => {
    const child = spawn('python', ['scripts/fill-missing-images.py'], {
      cwd: ROOT,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    })
    child.on('exit', (code) => {
      if (code === 0) resolve(undefined)
      else reject(new Error(`fill-missing-images.py exited with ${code}`))
    })
  })
}

async function main() {
  console.log('Step 1: map official berserk.ru image URLs...')
  await runOfficialMapping()

  console.log('Step 2: fill remaining gaps from URL patterns...')
  await runFillMissing()

  if (process.argv.includes('--local')) {
    console.log('Step 3: cache images locally...')
    await downloadLocalImages()
  } else {
    console.log('Skipping local download. Cards will use remote imageUrl.')
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
