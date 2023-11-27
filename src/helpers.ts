import { createEffect, createSignal, type Signal } from "jail/signal"

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

export function formatTime(data: string) {
  return data.replace(
    /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+)(.*)/,
    "$4:$5 $3.$2.$1",
  )
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
