import path from 'path'
import { promises as fs } from 'fs'

export async function exists(path: string) {
  try {
    await fs.stat(path)
    return true
  } catch (e) {
    return false
  }
}

export async function copyDir(from: string, to: string) {
  if (exists(to)) {
    await fs.rmdir(to, { recursive: true })
  }
  await fs.mkdir(to, { recursive: true })
  const content = await fs.readdir(from)
  for (const entry of content) {
    const fromPath = path.join(from, entry)
    const toPath = path.join(to, entry)
    const stat = await fs.stat(fromPath)
    if (stat.isFile()) {
      await fs.copyFile(fromPath, toPath)
    } else if (stat.isDirectory()) {
      await copyDir(fromPath, toPath)
    }
  }
}
