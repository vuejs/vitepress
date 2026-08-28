/*
export function deserializeFunctions(value: any, fns: any[]): any {
  if (Array.isArray(value)) {
    return value.map((v) => deserializeFunctions(v, fns))
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = deserializeFunctions(value[key], fns)
      return acc
    }, {} as any)
  } else if (typeof value === 'string' && value.startsWith('_vp-fn_')) {
    return fns[+value.slice(7)] ?? value
  } else {
    return value
  }
}
*/

// functions are emitted as plain code next to this and only looked up here by
// index, so no `new Function` is needed and strict CSP (no `unsafe-eval`)
// stays intact (#3685)
export const deserializeFunctions =
  'function deserializeFunctions(r,e){return Array.isArray(r)?r.map(t=>deserializeFunctions(t,e)):typeof r=="object"&&r!==null?Object.keys(r).reduce((t,n)=>(t[n]=deserializeFunctions(r[n],e),t),{}):typeof r=="string"&&r.startsWith("_vp-fn_")?e[+r.slice(7)]??r:r}'

export function serializeFunctions(
  value: any,
  fns: string[],
  key?: string
): any {
  if (Array.isArray(value)) {
    return value.map((v) => serializeFunctions(v, fns))
  } else if (typeof value === 'object' && value !== null) {
    return Object.keys(value).reduce((acc, key) => {
      if (key[0] === '_') return acc
      acc[key] = serializeFunctions(value[key], fns, key)
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
    return `_vp-fn_${fns.push(`(${serialized})`) - 1}`
  } else {
    return value
  }
}
