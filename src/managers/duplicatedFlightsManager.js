import { flightsLinesArcs, maximumArc } from '../static/flightLinesArcs'

const isSameLine = (line1, line2) => line1.id === line2.id

const hasLineNObjects = (line, field, nObjects) => line[field] && line[field].length === nObjects

const hasLinesSameObjects = (line1, line2, field) => {
  const object1Line1 = line1[field][0]
  const object2Line1 = line1[field][1]
  const object1Line2 = line2[field][0]
  const object2Line2 = line2[field][1]
  if (object1Line1 === object1Line2 || object1Line1 === object2Line2) {
    if (object2Line1 === object1Line2 || object2Line1 === object2Line2) return true
  }
  
  return false
}

const hasLinesSameLatitudes = (line1, line2) => hasLinesSameObjects(line1, line2, 'latitudes')

const hasLinesSameLongitudes = (line1, line2) => hasLinesSameObjects(line1, line2, 'longitudes')

const hasLinesSameCoordinates = (line1, line2) => {
  if (isSameLine(line1, line2)) return
  if (!(hasLineNObjects(line1, 'latitudes', 2) && hasLineNObjects(line2, 'latitudes', 2))) return
  if (!(hasLineNObjects(line1, 'longitudes', 2) && hasLineNObjects(line2, 'longitudes', 2))) return
  return hasLinesSameLatitudes(line1, line2) && hasLinesSameLongitudes(line1, line2)
}

const existsEqualLine = (line, lines) => {
  for (let i = 0; i < lines.length; i++) {
    const iteratedLine = lines[i]
    if (hasLinesSameCoordinates(line, iteratedLine)) return true
  }

  return false
}

const order = (object, field) => {
  const value1 = object[field][0]
  const value2 = object[field][1]
  let min = value1
  let max = value2
  if (value2 < min) {
    min = value2
    max = value1
  }

  return { min, max }
}

const orderLatitudes = object => order(object, 'latitudes')

const orderLongitudes = object => order(object, 'longitudes')

const orderCoordinates = line => {
  const newLine = Object.assign({}, line)
  const latitudesOrdered = orderLatitudes(newLine)
  const longitudesOrdered = orderLongitudes(newLine)

  newLine.latitudes = [latitudesOrdered.min, latitudesOrdered.max]
  newLine.longitudes = [longitudesOrdered.min, longitudesOrdered.max]

  return newLine
}

const hasSameCoordinates = (line1, line2) => {
  return line1.latitudes[0] === line2.latitudes[0] &&
      line1.latitudes[1] === line2.latitudes[1] &&
      line1.longitudes[0] === line2.longitudes[0] &&
      line1.longitudes[1] === line2.longitudes[1]
}

const countNDuplicatedLines = (line, lines) => {
  let times = 0
  for (let i = 0; i < lines.length; i++) {
    if (hasSameCoordinates(line, lines[i])) times += 1
  }
  return times
}

const getNewArc = (line, duplicatedLines) => {
  const orderedCoordinatesLine = orderCoordinates(line)
  const nTimes = countNDuplicatedLines(orderedCoordinatesLine, duplicatedLines)
  duplicatedLines.push(orderedCoordinatesLine)
  let arc = flightsLinesArcs[nTimes]
  if (arc === undefined) arc = maximumArc
  return arc
}

export const manageLinesCurvatureDependingOnDuplicated = lines => {
  const duplicatedLines = []
  for (let i = 0; i < lines.length; i++) {
    const existsLine = existsEqualLine(lines[i], lines)
    if (existsLine) lines[i].arc = getNewArc(lines[i], duplicatedLines)
  }

  return lines
}
