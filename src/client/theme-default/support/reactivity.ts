import {
  onMounted,
  shallowReadonly,
  shallowRef,
  toValue,
  watchEffect,
  type ShallowRef
} from 'vue'

export function clientComputed<T extends {}>(
  fn: () => T,
  defaultValue: any = {},
  options?: { flush?: 'pre' | 'post' | 'sync' }
): Readonly<ShallowRef<T>> {
  const data = shallowRef<T>(toValue(defaultValue))

  onMounted(() => {
    watchEffect(() => {
      data.value = toValue(fn)
    }, options)
  })

  return shallowReadonly(data)
}
