import { ModuleGraph } from 'node/utils/moduleGraph'

describe('node/utils/moduleGraph', () => {
  let graph: ModuleGraph

  beforeEach(() => {
    graph = new ModuleGraph()
  })

  it('should correctly delete a module and its dependents', () => {
    graph.add('A', ['B', 'C'])
    graph.add('B', ['D'])
    graph.add('C', [])
    graph.add('D', [])

    expect(graph.delete('D')).toEqual(new Set(['D', 'B', 'A']))
  })

  it('should handle shared dependencies correctly', () => {
    graph.add('A', ['B', 'C'])
    graph.add('B', ['D'])
    graph.add('C', ['D']) // Shared dependency
    graph.add('D', [])

    expect(graph.delete('D')).toEqual(new Set(['A', 'B', 'C', 'D']))
  })

  it('merges dependencies correctly', () => {
    // Add module A with dependency B
    graph.add('A', ['B'])
    // Merge new dependency C into module A (B should remain)
    graph.add('A', ['C'])

    // Deleting B should remove A as well, since A depends on B.
    expect(graph.delete('B')).toEqual(new Set(['B', 'A']))
  })

  it('handles cycles gracefully', () => {
    // Create a cycle: A -> B, B -> C, C -> A.
    graph.add('A', ['B'])
    graph.add('B', ['C'])
    graph.add('C', ['A'])

    // Deleting any module in the cycle should delete all modules in the cycle.
    expect(graph.delete('A')).toEqual(new Set(['A', 'B', 'C']))
  })

  it('cleans up dependencies when deletion', () => {
    // Setup A -> B relationship.
    graph.add('A', ['B'])
    graph.add('B', [])

    // Deleting B should remove both B and A from the graph.
    expect(graph.delete('B')).toEqual(new Set(['B', 'A']))

    // After deletion, add modules again.
    graph.add('C', [])
    graph.add('A', ['C']) // Now A depends only on C.

    expect(graph.delete('C')).toEqual(new Set(['C', 'A']))
  })

  it('handles independent modules', () => {
    // Modules with no dependencies.
    graph.add('X', [])
    graph.add('Y', [])

    // Deletion of one should only remove that module.
    expect(graph.delete('X')).toEqual(new Set(['X']))
    expect(graph.delete('Y')).toEqual(new Set(['Y']))
  })
})
