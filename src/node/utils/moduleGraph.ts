export class ModuleGraph {
  // Each module is tracked with its dependencies and dependents.
  private nodes: Map<
    string,
    { dependencies: Set<string>; dependents: Set<string> }
  > = new Map()

  /**
   * Adds or updates a module by merging the provided dependencies
   * with any existing ones.
   *
   * For every new dependency, the module is added to that dependency's
   * 'dependents' set.
   *
   * @param module - The module to add or update.
   * @param dependencies - Array of module names that the module depends on.
   */
  add(module: string, dependencies: string[]): void {
    // Ensure the module exists in the graph.
    if (!this.nodes.has(module)) {
      this.nodes.set(module, {
        dependencies: new Set(),
        dependents: new Set()
      })
    }
    const moduleNode = this.nodes.get(module)!

    // Merge the new dependencies with any that already exist.
    for (const dep of dependencies) {
      if (!moduleNode.dependencies.has(dep) && dep !== module) {
        moduleNode.dependencies.add(dep)
        // Ensure the dependency exists in the graph.
        if (!this.nodes.has(dep)) {
          this.nodes.set(dep, {
            dependencies: new Set(),
            dependents: new Set()
          })
        }
        // Add the module as a dependent of the dependency.
        this.nodes.get(dep)!.dependents.add(module)
      }
    }
  }

  /**
   * Deletes a module and all modules that (transitively) depend on it.
   *
   * This method performs a depth-first search from the target module,
   * collects all affected modules, and then removes them from the graph,
   * cleaning up their references from other nodes.
   *
   * @param module - The module to delete.
   * @returns A Set containing the deleted module and all modules that depend on it.
   */
  delete(module: string): Set<string> {
    const deleted = new Set<string>()
    if (!this.nodes.has(module)) return deleted

    const stack: string[] = [module]

    // Traverse the reverse dependency graph (using dependents).
    while (stack.length) {
      const current = stack.pop()!
      if (!deleted.has(current)) {
        deleted.add(current)
        const node = this.nodes.get(current)
        if (node) {
          for (const dependent of node.dependents) {
            stack.push(dependent)
          }
        }
      }
    }

    // Remove deleted nodes from the graph.
    // For each deleted node, also remove it from its dependencies' dependents.
    for (const mod of deleted) {
      const node = this.nodes.get(mod)
      if (node) {
        for (const dep of node.dependencies) {
          const depNode = this.nodes.get(dep)
          if (depNode) {
            depNode.dependents.delete(mod)
          }
        }
      }
      this.nodes.delete(mod)
    }

    return deleted
  }

  /**
   * Clears all modules from the graph.
   */
  clear(): void {
    this.nodes.clear()
  }

  /**
   * Creates a deep clone of the ModuleGraph instance.
   * This is useful for preserving the state of the graph
   * before making modifications.
   *
   * @returns A new ModuleGraph instance with the same state as the original.
   */
  clone(): ModuleGraph {
    const clone = new ModuleGraph()
    for (const [module, { dependencies, dependents }] of this.nodes) {
      clone.nodes.set(module, {
        dependencies: new Set(dependencies),
        dependents: new Set(dependents)
      })
    }
    return clone
  }
}
