export function serializeFunctions(value: any): any {
  if (Array.isArray(value)) {
    return value.map(serializeFunctions)
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = serializeFunctions(value[key])
      return acc
    }, {} as any)
  } else if (typeof value === 'function') {
    return `_vp-fn_${value.toString()}`
  } else {
    return value
  }
}
