const execa = require('execa')
const fs = require('fs-extra')
const path = require('path')
const puppeteer = require('puppeteer')
const jest$ = require('@jest/globals')
const { tmpdir } = require('os')

const timeout = (n) => new Promise((r) => setTimeout(r, n))

async function launchDevServer(binPath, devDir) {
  const server = execa(binPath, ['dev', devDir], {
    cwd: devDir
  })

  const errLogs = []
  server.stderr.on('data', (data) => {
    // console.log('devServer.stderr: ' + data)
    errLogs.push(data.toString())
  })

  const outLogs = []
  await new Promise((resolve) => {
    server.stdout.on('data', (data) => {
      // console.log('devServer.stdout: ' + data)
      outLogs.push(data.toString())
      if (data.toString().match('listening at')) {
        // dev server running
        resolve()
      }
    })
  })

  const close = () => {
    server.kill('SIGTERM', {
      forceKillAfterTimeout: 2000
    })
  }

  return { server, errLogs, outLogs, close }
}

async function launchBrowser() {
  return await puppeteer.launch(
    process.env.CI ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] } : {}
  )
}

async function tryRemoveDir(dir) {
  try {
    await fs.remove(dir)
  } catch {}
}

async function prepareFixture(fixtureDir, tmpDir) {
  await tryRemoveDir(tmpDir)
  await fs.copy(fixtureDir, tmpDir, {
    filter: (file) => !/dist|node_modules/.test(file)
  })
  const pkg = { name: path.basename(tmpDir) }
  const pkgJson = path.join(tmpDir, 'package.json')
  await fs.writeFile(pkgJson, JSON.stringify(pkg))
}

const getEl = async (page, selectorOrEl) => {
  return typeof selectorOrEl === 'string'
    ? await page.$(selectorOrEl)
    : selectorOrEl
}

const getText = async (page, selectorOrEl) => {
  const el = await getEl(page, selectorOrEl)
  return el ? el.evaluate((el) => el.textContent) : null
}

// poll until it updates
async function expectByPolling(poll, expected) {
  const maxTries = 20
  for (let tries = 0; tries < maxTries; tries++) {
    const actual = (await poll()) || ''
    if (actual.indexOf(expected) > -1 || tries === maxTries - 1) {
      jest$.expect(actual).toMatch(expected)
      break
    } else {
      await timeout(50)
    }
  }
}

module.exports = {
  launchDevServer,
  launchBrowser,
  prepareFixture,
  expectByPolling,
  timeout,
  getEl,
  getText
}
