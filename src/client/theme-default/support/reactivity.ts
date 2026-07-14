import { computed, type ComputedRef } from 'vue'

export function smartComputed<T>(
  getter: () => T,
  comparator = (newValue: T, oldValue: T) =>
    JSON.stringify(newValue) === JSON.stringify(oldValue)
): ComputedRef<T> {
  return computed((oldValue) => {
    const newValue = getter()
    return oldValue === undefined || !comparator(newValue, oldValue)
      ? newValue
      : oldValue
  })
}
