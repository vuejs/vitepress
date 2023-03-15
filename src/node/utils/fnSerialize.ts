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

export function deserializeFunctions(value: any): any {
  if (Array.isArray(value)) {
    return value.map(deserializeFunctions)
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = deserializeFunctions(value[key])
      return acc
    }, {} as any)
  } else if (typeof value === 'string' && value.startsWith('_vp-fn_')) {
    return new Function(`return ${value.slice(7)}`)()
  } else {
    return value
  }
}
