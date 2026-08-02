import { PageArtifactStore } from 'node/build/artifacts/store'
import type { MarkdownCompileResult } from 'node/markdownToVue'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
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

  test('deduplicates compilation and spools the artifact to disk', async () => {
    const storeRoot = await createRoot()
    const store = new PageArtifactStore(storeRoot)
    const artifact = createArtifact()
    const compile = vi.fn(async () => artifact)

    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        store.getOrCreate('page.md', '# Page', compile)
      )
    )

    expect(compile).toHaveBeenCalledTimes(1)
    expect(results).toEqual([artifact, artifact, artifact, artifact])
    expect(await store.getCurrent('./page.md')).toEqual(artifact)
    expect(await countFiles(storeRoot)).toBe(1)
  })

  test('preserves non-JSON page data without making artifacts cross-build', async () => {
    const storeRoot = await createRoot()
    const published = new Date('2025-01-02T03:04:05.000Z')
    const artifact = createArtifact({
      pageData: {
        ...createArtifact().pageData,
        frontmatter: { published, optional: undefined }
      }
    })
    const store = new PageArtifactStore(storeRoot)

    await store.getOrCreate('page.md', '# Page', async () => artifact)
    const restored = await store.getCurrent('page.md')

    expect(restored).toEqual(artifact)
    expect(restored?.pageData.frontmatter.published).toBeInstanceOf(Date)
    expect(
      Object.hasOwn(restored?.pageData.frontmatter ?? {}, 'optional')
    ).toBe(true)
    expect(
      await new PageArtifactStore(storeRoot).getCurrent('page.md')
    ).toBeUndefined()
  })

  test('finalizes once for a source and recompiles when the input changes', async () => {
    const store = new PageArtifactStore(await createRoot())
    const compile = vi.fn(async () => createArtifact())
    const finalize = vi.fn(async (artifact: MarkdownCompileResult) => ({
      ...artifact,
      pageData: { ...artifact.pageData, title: 'Finalized' }
    }))

    const first = await store.getOrCreate(
      'page.md',
      '# Page',
      compile,
      finalize
    )
    const second = await store.getOrCreate(
      'page.md',
      '# Page',
      compile,
      finalize
    )
    await store.getOrCreate('page.md', '# Changed', compile, finalize)
    await store.flush()

    expect(first.pageData.title).toBe('Finalized')
    expect(second).toEqual(first)
    expect(compile).toHaveBeenCalledTimes(2)
    expect(finalize).toHaveBeenCalledTimes(2)
  })
})

async function countFiles(root: string): Promise<number> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true })
  return entries.filter((entry) => entry.isFile()).length
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
    ...overrides
  }
}
