import { useSearchParams } from 'react-router-dom'

export const useUrlState = <T extends Record<string, string | number | undefined>>(
  initial: T
) => {
  const [params, setParams] = useSearchParams()

  const get = <K extends keyof T>(key: K): T[K] => {
    const val = params.get(String(key))
    if (val === null) return initial[key]
    return (typeof initial[key] === 'number' ? Number(val) : val) as T[K]
  }

  const set = (next: Partial<T>) => {
    const obj: Record<string, string> = {}
    Object.entries({ ...initial, ...Object.fromEntries(params), ...next }).forEach(([k, v]) => {
      if (v === undefined || v === '') return
      obj[k] = String(v)
    })
    setParams(obj)
  }

  return { get, set }
}


