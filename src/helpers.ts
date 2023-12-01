import { createEffect, createSignal, type Signal } from "jail/signal"

type TimestampArray = [
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number,
]

type Reactive<T> = () => T

export function fromAsync<T>(promiseGetter: () => Promise<T>): Signal<T>
export function fromAsync<T>(
  promiseGetter: () => Promise<T>,
  initialValue: T,
): Signal<T>
export function fromAsync<T>(
  promiseGetter: () => Promise<T>,
  initialValue?: T,
) {
  const signal = createSignal(initialValue)
  createEffect(() => promiseGetter().then(signal))
  return signal
}

export function recordFrom<T extends Record<string, any>>(
  signal: Signal<T>,
  initialValue?: Partial<T>,
): {
  [Key in keyof T]: Reactive<T[Key]>
} {
  return new Proxy<T>(Object.create(null), {
    get(_target, key: string) {
      return () => signal()?.[key] ?? initialValue?.[key]
    },
    set(_target, key: string & keyof T, value: any) {
      signal((record) => {
        record[key] = value
        return record
      })
      return true
    },
  })
}

export async function fetchJSON<T>(url: string): Promise<T> {
  return await fetch(url).then((res) => res.json())
}

const TIMESTAMP_REGEX = /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+).*/

export function formatTime(data: string) {
  return data.replace(TIMESTAMP_REGEX, "$4:$5 $3.$2.$1")
}

export function debounced<Callback extends (...args: unknown[]) => unknown>(
  callback: Callback,
  timeout: number,
): (...args: Parameters<Callback>) => void {
  let timeHandle: number
  return (...args) => {
    clearTimeout(timeHandle)
    timeHandle = setTimeout(callback, timeout, ...args)
  }
}

export function stringFromCharCode(_match: string, code: number) {
  return String.fromCharCode(code)
}

export function stringFromEntityMap(_match: string, code: string) {
  return entityMap[code] || ""
}

const entityMap: Record<string, string> = {
  "quot": '"',
  "apos": "'",
  "amp": "&",
  "lt": "<",
  "gt": ">",
}
