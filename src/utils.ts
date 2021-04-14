// Taken from https://github.com/michaelrhodes/hsv-rgb/blob/master/index.js
function rgb(h: number, s: number, v: number) {
  var s = s / 100,
    v = v / 100
  var c = v * s
  var hh = h / 60
  var x = c * (1 - Math.abs((hh % 2) - 1))
  var m = v - c

  // @ts-ignore
  var p = parseInt(hh, 10)
  var rgb =
    p === 0
      ? [c, x, 0]
      : p === 1
      ? [x, c, 0]
      : p === 2
      ? [0, c, x]
      : p === 3
      ? [0, x, c]
      : p === 4
      ? [x, 0, c]
      : p === 5
      ? [c, 0, x]
      : []

  return [
    Math.round(255 * (rgb[0] + m)),
    Math.round(255 * (rgb[1] + m)),
    Math.round(255 * (rgb[2] + m)),
  ]
}

export function faunaFetch(
  url: RequestInfo,
  params: RequestInit | undefined,
): Promise<any> {
  const signal = params?.signal
  delete params?.signal
  const abortPromise = new Promise((resolve) => {
    if (signal) {
      signal.onabort = resolve
    }
  })
  return Promise.race([abortPromise, fetch(url, params)])
}

export function randomColor(): number {
  let randomHue = Math.floor(Math.random() * 360)

  let rgbVals = rgb(randomHue, 60, 100)

  let combined = rgbVals[0] * 65536 + rgbVals[1] * 256 + rgbVals[2]

  return combined
}
