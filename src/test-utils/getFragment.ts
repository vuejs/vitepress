import path from 'path'
import fs from 'fs'

export const getFragment = (
  dir: string,
  name: string,
  fragmentsDir = 'fragments'
): string => {
  const target = path.resolve(dir, `${fragmentsDir}/${name}`)
  // just return the file content for now
  return fs.readFileSync(target, 'utf-8')
}
