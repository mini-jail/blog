import { createEffect, createSignal, type Signal } from "jail/signal"

type TimestampArray = [
  year: number,
  month: number,
  day: number,
  hours: number,
  minutes: number,
  seconds: number,
]

export function fromAsync<T>(
  promiseGetter: () => Promise<T>,
): Signal<T | undefined>
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

export async function fetchJSON<T>(url: string): Promise<T> {
  return await fetch(url).then((res) => res.json())
}

const TIMESTAMP_REGEX = /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+).*/

export function formatTime(data: string) {
  return data.replace(TIMESTAMP_REGEX, "$4:$5 $3.$2.$1")
}

export function secondsSince(data: string) {
  const matches = data.match(TIMESTAMP_REGEX)!.slice(1),
    args: TimestampArray = [0, 0, 0, 0, 0, 0]
  for (let i = 0; i < args.length; i++) {
    args[i] = Number(matches[i])
  }
  const date = new Date(...args)
  return Math.floor(date.valueOf() / 1000)
}

export function debounced<Callback extends (...args: unknown[]) => unknown>(
  callback: Callback,
  timeout: number,
): (...args: Parameters<Callback>) => void {
  let timeHandle: number
  return (function (...args) {
    clearTimeout(timeHandle)
    timeHandle = setTimeout(callback, timeout, ...args)
  }) as Callback
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
