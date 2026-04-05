/**
 * Generic fetch wrapper with error handling.
 * Returns parsed JSON or throws a descriptive error.
 */

export interface FetchResult<T> {
  data: T | null
  error: string | null
}

export async function fetchJson<T>(url: string): Promise<FetchResult<T>> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      return { data: null, error: `HTTP ${res.status}: ${res.statusText}` }
    }
    const data = (await res.json()) as T
    return { data, error: null }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: msg }
  }
}
