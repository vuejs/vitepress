import { spawn } from 'cross-spawn'
import type { SpawnOptions } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as prompts from '@clack/prompts'
import semver from 'semver'

const { version: currentVersion } = createRequire(import.meta.url)(
  '../package.json'
)
const { inc: _inc, valid } = semver

const versionIncrements = ['patch', 'minor', 'major'] as const

const tags = ['latest', 'next'] as const

const dir = fileURLToPath(new URL('.', import.meta.url))
const inc = (i: semver.ReleaseType) => _inc(currentVersion, i)
const run = (bin: string, args: string[], opts: SpawnOptions = {}) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(bin, args, {
      stdio: 'inherit',
      ...opts
    })

    child.on('error', reject)
    child.on('close', (code, signal) => {
      if (code === 0) {
        resolve()
      } else if (signal) {
        reject(new Error(`${bin} exited with signal ${signal}`))
      } else {
        reject(new Error(`${bin} exited with code ${code}`))
      }
    })
  })
const cancel = () => prompts.cancel('Operation cancelled')

async function main() {
  let targetVersion: string

  const versions = versionIncrements
    .map((i) => `${i} (${inc(i)})`)
    .concat(['custom'])

  const release = await prompts.select({
    message: 'Select release type',
    options: versions.map((label, value) => ({ label, value }))
  })
  if (prompts.isCancel(release)) return cancel()

  if (release === 3) {
    const customVersion = await prompts.text({
      message: 'Input custom version',
      initialValue: currentVersion
    })
    if (prompts.isCancel(customVersion)) return cancel()
    targetVersion = customVersion
  } else {
    targetVersion = versions[release].match(/\((.*)\)/)![1]
  }

  if (!valid(targetVersion)) {
    throw new Error(`Invalid target version: ${targetVersion}`)
  }

  const tag = await prompts.select({
    message: 'Select tag type',
    options: tags.map((label, value) => ({ label, value }))
  })
  if (prompts.isCancel(tag)) return cancel()

  const tagOk = await prompts.confirm({
    message: `Releasing v${targetVersion} on ${tags[tag]}. Confirm?`
  })
  if (prompts.isCancel(tagOk)) return cancel()

  if (!tagOk) {
    return
  }

  // Update the package version.
  prompts.log.step('Updating the package version...')
  updatePackage(targetVersion)

  // Build the package.
  prompts.log.step('Building the package...')
  await run('pnpm', ['build'])

  // Generate the changelog.
  prompts.log.step('Generating the changelog...')
  await run('pnpm', ['changelog'])
  await run('pnpm', ['prettier', '--write', 'CHANGELOG.md'])

  const changelogOk = await prompts.confirm({
    message: `Changelog generated. Does it look good?`
  })

  if (!changelogOk) {
    return
  }

  // Commit changes to the Git and create a tag.
  prompts.log.step('Committing changes...')
  await run('git', ['add', 'CHANGELOG.md', 'package.json'])
  await run('git', ['commit', '-m', `release: v${targetVersion}`])
  await run('git', ['tag', `v${targetVersion}`])

  // Publish the package.
  prompts.log.step('Publishing the package...')
  await run('pnpm', [
    'publish',
    '--tag',
    tags[tag],
    '--ignore-scripts',
    '--no-git-checks'
  ])

  // Push to GitHub.
  prompts.log.step('Pushing to GitHub...')
  await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`])
  await run('git', ['push'])
}

function updatePackage(version: string) {
  const pkgPath = resolve(resolve(dir, '..'), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

  pkg.version = version

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

main().catch((err) => console.error(err))
