
const getConfigText = (keyText, value) => keyText + ': ' + '<b>' + value + '</b>'

const getValue = (object, attribute, additionalText) => {
  const attributes = attribute.split('.')
  let i = 0
  while (i < attributes.length) {
    object = object[attributes[i]]
    i++
  }
  if (additionalText) return additionalText[object]
  return object
}

export const buildTextMarker = (flight, markersConfig) => {
  let text = ''
  for (const markerConfig of markersConfig) {
    const value = getValue(flight, markerConfig.id, markerConfig.additional)
    if (value || value === 0) {
      text += getConfigText(markerConfig.text, value) + '</br>'
    }
  }
  return text
}
