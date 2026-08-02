import { PageArtifactStore } from 'node/pageArtifacts'
import type { MarkdownCompileResult } from 'node/markdownToVue'
import { mkdtemp, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('PageArtifactStore', () => {
  let root: string | undefined

  afterEach(async () => {
    if (root) {
      await rm(root, { recursive: true, force: true })
      root = undefined
    }
  })

  async function createRoot() {
    root = await mkdtemp(path.join(tmpdir(), 'vitepress-page-artifacts-'))
    return root
  }

  test('persists artifacts and non-JSON page-data values across store instances', async () => {
    const cacheDir = await createRoot()
    const store = new PageArtifactStore(cacheDir, {
      namespace: 'site-config-v1'
    })
    const published = new Date('2025-01-02T03:04:05.000Z')
    const artifact = createArtifact({
      pageData: {
        ...createArtifact().pageData,
        frontmatter: { published, optional: undefined }
      }
    })

    await store.put('docs/page.md', '# Page', artifact)
    await store.flush()

    const restored = new PageArtifactStore(cacheDir, {
      namespace: 'site-config-v1'
    })
    const restoredArtifact = await restored.get('./docs/page.md', '# Page')
    expect(restoredArtifact).toEqual(artifact)
    expect(restoredArtifact?.pageData.frontmatter.published).toBeInstanceOf(
      Date
    )
    expect(
      Object.hasOwn(restoredArtifact?.pageData.frontmatter ?? {}, 'optional')
    ).toBe(true)
  })

  test('invalidates on source, namespace, and include dependency changes', async () => {
    const cacheDir = await createRoot()
    const include = path.join(cacheDir, 'shared.md')
    await writeFile(include, 'first include')

    const store = new PageArtifactStore(cacheDir, { namespace: 'routes-v1' })
    await store.put(
      'page.md',
      '# Page',
      createArtifact({ includes: [include] })
    )
    await store.flush()

    await expect(
      new PageArtifactStore(cacheDir, { namespace: 'routes-v1' }).get(
        'page.md',
        '# Changed'
      )
    ).resolves.toBeUndefined()
    await expect(
      new PageArtifactStore(cacheDir, { namespace: 'routes-v2' }).get(
        'page.md',
        '# Page'
      )
    ).resolves.toBeUndefined()

    await writeFile(include, 'changed include')
    await expect(
      new PageArtifactStore(cacheDir, { namespace: 'routes-v1' }).get(
        'page.md',
        '# Page'
      )
    ).resolves.toBeUndefined()
  })

  test('deduplicates concurrent compilation and identical CAS objects', async () => {
    const cacheDir = await createRoot()
    const store = new PageArtifactStore(cacheDir, { namespace: 'dedup' })
    const artifact = createArtifact()
    const compile = vi.fn(async () => {
      await Promise.resolve()
      return artifact
    })

    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        store.getOrCreate('page.md', '# Page', compile)
      )
    )

    expect(compile).toHaveBeenCalledTimes(1)
    expect(results).toEqual([artifact, artifact, artifact, artifact])

    // The page key belongs to the manifest, not to the immutable object. Two
    // entries with byte-identical output therefore share one object file.
    await store.put('alias.md', '# Alias', artifact)
    await store.flush()

    const objectsDir = path.join(
      cacheDir,
      'vitepress-page-artifacts',
      'objects'
    )
    const shards = await readdir(objectsDir)
    const objectFiles = (
      await Promise.all(
        shards.map((shard) => readdir(path.join(objectsDir, shard)))
      )
    ).flat()
    expect(objectFiles).toHaveLength(1)
  })

  test('shares content bodies across route-specific page overlays', async () => {
    const cacheDir = await createRoot()
    const store = new PageArtifactStore(cacheDir, {
      namespace: 'cross-version-body'
    })
    const artifact = createArtifact()
    await store.put('1.0/page.md', '# Page', artifact)
    await store.put('2.0/page.md', '# Page', {
      ...artifact,
      pageData: {
        ...artifact.pageData,
        relativePath: '2.0/page.md',
        filePath: '2.0/page.md'
      }
    })
    await store.flush()

    const artifactRoot = path.join(cacheDir, 'vitepress-page-artifacts')
    expect(await countShardedFiles(path.join(artifactRoot, 'objects'))).toBe(2)
    expect(await countShardedFiles(path.join(artifactRoot, 'bodies'))).toBe(1)
  })

  test('retains physical-module eligibility in compact page metadata', async () => {
    const cacheDir = await createRoot()
    const store = new PageArtifactStore(cacheDir, {
      namespace: 'source-module-identity'
    })
    const artifact = createArtifact({
      staticPage: undefined,
      requiresSourceModuleIdentity: true
    })

    await store.put('styled.md', '# Styled', artifact)

    await expect(store.getCurrentMetadata('styled.md')).resolves.toEqual({
      staticPage: false,
      requiresSourceModuleIdentity: true
    })
  })

  test('persists pre-hook artifacts and finalizes them once per build', async () => {
    const cacheDir = await createRoot()
    const compile = vi.fn(async () => createArtifact())
    const coldFinalize = vi.fn(async (artifact: MarkdownCompileResult) => ({
      ...artifact,
      pageData: { ...artifact.pageData, title: 'cold build' }
    }))
    const cold = new PageArtifactStore(cacheDir, {
      namespace: 'page-data-hooks'
    })

    const [coldFirst, coldSecond] = await Promise.all([
      cold.getOrCreate('page.md', '# Page', compile, coldFinalize),
      cold.getOrCreate('page.md', '# Page', compile, coldFinalize)
    ])
    expect(compile).toHaveBeenCalledTimes(1)
    expect(coldFinalize).toHaveBeenCalledTimes(1)
    expect(coldFirst.pageData.title).toBe('cold build')
    expect(coldSecond.pageData.title).toBe('cold build')
    expect((await cold.getCurrent('page.md'))?.pageData.title).toBe(
      'cold build'
    )
    await cold.flush()

    const warmCompile = vi.fn(async () => {
      throw new Error('Markdown must not run on a warm artifact hit')
    })
    const warmFinalize = vi.fn(async (artifact: MarkdownCompileResult) => ({
      ...artifact,
      pageData: {
        ...artifact.pageData,
        title: `${artifact.pageData.title}:warm build`
      }
    }))
    const warm = new PageArtifactStore(cacheDir, {
      namespace: 'page-data-hooks'
    })

    const warmFirst = await warm.getOrCreate(
      'page.md',
      '# Page',
      warmCompile,
      warmFinalize
    )
    const warmSecond = await warm.getOrCreate(
      'page.md',
      '# Page',
      warmCompile,
      warmFinalize
    )

    expect(warmCompile).not.toHaveBeenCalled()
    expect(warmFinalize).toHaveBeenCalledTimes(1)
    // The warm hook starts from the persistent pre-hook page data. It must not
    // receive the previous build's transformed result.
    expect(warmFirst.pageData.title).toBe('Page:warm build')
    expect(warmSecond.pageData.title).toBe('Page:warm build')
    expect((await warm.getCurrent('page.md'))?.pageData.title).toBe(
      'Page:warm build'
    )
  })

  test('turns a read-only cache miss into a coordinator error', async () => {
    const cacheDir = await createRoot()
    const store = new PageArtifactStore(cacheDir, {
      namespace: 'render-worker',
      readOnly: true
    })

    await expect(store.getOrCreate('missing.md', '# Missing')).rejects.toThrow(
      'The coordinator must compile page artifacts before starting render workers.'
    )
  })
})

async function countShardedFiles(root: string): Promise<number> {
  const shards = await readdir(root)
  return (
    await Promise.all(shards.map((shard) => readdir(path.join(root, shard))))
  ).flat().length
}

function createArtifact(
  overrides: Partial<MarkdownCompileResult> = {}
): MarkdownCompileResult {
  return {
    vueSrc: '<template><div><h1>Page</h1></div></template>',
    html: '<h1>Page</h1>',
    pageData: {
      title: 'Page',
      description: '',
      frontmatter: {},
      headers: [],
      relativePath: 'page.md',
      filePath: 'page.md'
    },
    deadLinks: [],
    includes: [],
    staticPage: true,
    ...overrides
  }
}
