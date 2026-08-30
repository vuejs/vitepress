import {
  LineMap,
  MappedBuilder,
  sliceSegments,
  type LineMapSegment
} from 'node/markdown/lineMap'

describe('node/markdown/lineMap', () => {
  test('resolve walks segments and extrapolates past the last one', () => {
    const map = new LineMap([
      { start: 0, file: 'a.md', line: 0 },
      { start: 3, file: 'b.md', line: 10 },
      { start: 5, file: 'a.md', line: 4 }
    ])
    expect(map.resolve(0)).toEqual({ file: 'a.md', line: 0 })
    expect(map.resolve(2)).toEqual({ file: 'a.md', line: 2 })
    expect(map.resolve(3)).toEqual({ file: 'b.md', line: 10 })
    expect(map.resolve(4)).toEqual({ file: 'b.md', line: 11 })
    expect(map.resolve(9)).toEqual({ file: 'a.md', line: 8 })
  })

  test('builder maps appended chunks and coalesces continuations', () => {
    const b = new MappedBuilder()
    b.append('one\ntwo\n', [{ start: 0, file: 'a.md', line: 0 }])
    // continues exactly where a.md left off — no new segment needed
    b.append('three\n', [{ start: 0, file: 'a.md', line: 2 }])
    b.append('inc-1\ninc-2\n', [{ start: 0, file: 'b.md', line: 7 }])
    const { src, segments } = b.build()
    expect(src).toBe('one\ntwo\nthree\ninc-1\ninc-2\n')
    expect(segments).toEqual([
      { start: 0, file: 'a.md', line: 0 },
      { start: 3, file: 'b.md', line: 7 }
    ])
  })

  test('mid-line appends leave the line with its starter and mark it spliced', () => {
    const b = new MappedBuilder()
    b.append('before ', [{ start: 0, file: 'a.md', line: 4 }])
    b.append('x\ny\n', [{ start: 0, file: 'b.md', line: 0 }])
    b.append('tail\n', [{ start: 0, file: 'a.md', line: 5 }])
    const { src, segments, splicedLines } = b.build()
    expect(src).toBe('before x\ny\ntail\n')
    expect(segments).toEqual([
      { start: 0, file: 'a.md', line: 4 },
      { start: 1, file: 'b.md', line: 1 },
      { start: 2, file: 'a.md', line: 5 }
    ])
    expect([...splicedLines]).toEqual([0])
  })

  test('sliceSegments intersects and rebases', () => {
    const segments: LineMapSegment[] = [
      { start: 0, file: 'a.md', line: 0 },
      { start: 4, file: 'b.md', line: 20 }
    ]
    expect(sliceSegments(segments, 2, 6)).toEqual([
      { start: 0, file: 'a.md', line: 2 },
      { start: 2, file: 'b.md', line: 20 }
    ])
    expect(sliceSegments(segments, 4, 5)).toEqual([
      { start: 0, file: 'b.md', line: 20 }
    ])
    expect(sliceSegments(segments, 0, 0)).toEqual([])
  })
})
