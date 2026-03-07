import { type ComputedRef, computed } from 'vue'

export function smartComputed<T>(
  getter: () => T,
  comparator = (oldValue: T, newValue: T) =>
    JSON.stringify(oldValue) === JSON.stringify(newValue)
): ComputedRef<T> {
  return computed((oldValue) => {
    const newValue = getter()
    return oldValue === undefined || !comparator(oldValue, newValue)
      ? newValue
      : oldValue
  })
}
