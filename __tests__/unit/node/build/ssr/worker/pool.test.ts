import { createWorkerExecArgv } from 'node/build/ssr/worker/pool'

const inspectorOverrides = [
  '--no-inspect',
  '--no-inspect-brk',
  '--no-inspect-wait'
].filter((flag) => process.allowedNodeEnvironmentFlags.has(flag))

test('omits inspector flags and overrides NODE_OPTIONS', () => {
  expect(
    createWorkerExecArgv([
      '--enable-source-maps',
      '--inspect',
      '--inspect-brk=127.0.0.1:9230',
      '--inspect-port',
      '9231',
      '--loader',
      'tsx',
      '--inspect-publish-uid',
      'stderr,http',
      '--conditions=development'
    ])
  ).toEqual([
    '--enable-source-maps',
    '--loader',
    'tsx',
    '--conditions=development',
    ...inspectorOverrides
  ])
})

test('omits parent entrypoint modes', () => {
  expect(
    createWorkerExecArgv([
      '--enable-source-maps',
      '--',
      '-e',
      'build()',
      '--input-type',
      'module',
      '--test',
      '--watch-path',
      'src',
      '--test-coverage-include',
      'src/**/*.ts',
      '--watch-kill-signal=SIGTERM',
      '-pe',
      'process.version',
      '--conditions=development'
    ])
  ).toEqual([
    '--enable-source-maps',
    '--conditions=development',
    ...inspectorOverrides
  ])
})
