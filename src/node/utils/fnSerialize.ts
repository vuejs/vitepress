export function serializeFunctions(value: any, key?: string): any {
  if (Array.isArray(value)) {
    return value.map((v) => serializeFunctions(v))
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((acc, key) => {
      if (key[0] === '_') return acc
      acc[key] = serializeFunctions(value[key], key)
      return acc
    }, {} as any)
  } else if (typeof value === 'function') {
    let serialized = value.toString()
    if (
      key &&
      (serialized.startsWith(key) || serialized.startsWith('async ' + key))
    ) {
      serialized = serialized.replace(key, 'function')
    }
    return `_vp-fn_${serialized}`
  } else {
    return value
  }
}

/*
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
*/

export const deserializeFunctions =
  'function deserializeFunctions(r){return Array.isArray(r)?r.map(deserializeFunctions):typeof r=="object"&&r!==null?Object.keys(r).reduce((t,n)=>(t[n]=deserializeFunctions(r[n]),t),{}):typeof r=="string"&&r.startsWith("_vp-fn_")?new Function(`return ${r.slice(7)}`)():r}'
