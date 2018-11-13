import { glowingEffectSelector } from '../../static/glowingEffectSelector'

const defaultHSL = {
  light: 'hsl(7, 50%, 38%)',
  strong: 'hsl(7, 50%, 78%)'
}

const getHSLColor = (color) => {
  if (!color) return defaultHSL
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color)

  const r = parseInt(result[1], 16) / 255
  const g = parseInt(result[2], 16) / 255
  const b = parseInt(result[3], 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  let h
  let s
  let l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  s = Math.round(s * 100)
  l = Math.round(l * 100)
  h = Math.round(360 * h)

  const maximumL = l + 30
  const lStrong = maximumL > 100 ? 100 : maximumL

  const light = 'hsl(' + h + ', ' + s + '%, ' + l + '%)'
  const strong = 'hsl(' + h + ', ' + s + '%, ' + lStrong + '%)'
  return { light, strong }
}

const addGlowingEffectToMapImagesByColor = (shadowRoot, color) => {
  const className = getClassName(color)
  const filterId = getFilterId(color)
  console.log('filter', className)
  console.log('filter', filterId)
  const imagesElements = shadowRoot.querySelectorAll(className)
  for (let i = 0; i < imagesElements.length; i++) {
    const element = imagesElements[i].parentElement
    console.log()
    if (!element.innerHTML.includes('<defs>')) {
      element.innerHTML +=
        '<defs>' +
        `  <filter id="${filterId.replace('#', '')}">` +
        '    <femerge>' +
        '      <femergenode in="SourceGraphic"></femergenode>' +
        '    </femerge>' +
        '  </filter>' +
        '</defs>'
    }
  }
}

export const addGlowingEffectToMapImages = (shadowRoot, flights) => {
  flights.map(flight => addGlowingEffectToMapImagesByColor(shadowRoot, flight.color))
}

const defaultFilterId = '#glow'
const getFilterId = color => color ? defaultFilterId + color.replace('#', '') : defaultFilterId
const getClassName = color => color ? glowingEffectSelector + '-' + color.replace('#', '') : glowingEffectSelector

export const getGlowingEffectCssClass = (color) => {
  const hslColor = getHSLColor(color)
  const effectName = 'light-pulse' + (color ? color.replace('#', '') : '')
  const filterId = getFilterId(color)
  const className = getClassName(color)
  console.log('class', className)
  console.log('class', filterId)
  const classes = className +
    '{ ' +
    `  filter: url(${filterId});` +
    `  -webkit-animation: ${effectName} 3s infinite;` +
    `  -moz-animation: ${effectName} 3s infinite;` +
    `  animation: ${effectName} 3s infinite;` +
    '}' +
    `@keyframes ${effectName} {` +
    `  50%   { fill: ${hslColor.light}; }` +
    `  50%  { fill: ${hslColor.strong}; }` +
    `  100% { fill: ${hslColor.light}; }` +
    '}' +
    `@-webkit-keyframes ${effectName} {` +
    `  50%   { fill: ${hslColor.light}; }` +
    `  50%  { fill: ${hslColor.strong}; }` +
    `  100% { fill: ${hslColor.light}; }` +
    '}'
  return classes
}
