import FlightStates from '../static/FlightStates'
import FlightsPositions from '../static/FlightsPositions'

const isFlightPendingToStart = (state) => {
  return state === FlightStates.PENDING_TO_START
}

const isFlightInProgress = (state) => {
  return state === FlightStates.IN_PROGRESS
}

const isFlightCompleted = (state) => {
  return state === FlightStates.COMPLETED
}

export const shouldSetFlightInProgres = (configState, flightState) => {
  return configState !== 'animate' && isFlightInProgress(flightState)
}

export const getFlightPosition = (flightState) => {
  if (isFlightPendingToStart(flightState)) return FlightsPositions.INITIAL
  if (isFlightCompleted(flightState)) return FlightsPositions.FINAL
  return FlightsPositions.MIDDLE
}

const isSameLine = (line1, line2) => {
  if (line1.id === line2.id) return
  if (line1.latitudes.length === 2 && line2.latitudes.length === 2) {
    const iterateLatitude1 = line1.latitudes[0]
    const iterateLatitude2 = line1.latitudes[1]
    const latitude1 = line2.latitudes[0]
    const latitude2 = line2.latitudes[1]
    if (latitude1 === 39.54864813244204 && iterateLatitude1 === 39.54864813244204) {
    }
    if (latitude1 === iterateLatitude1 || latitude1 === iterateLatitude2) {
      if (latitude2 === iterateLatitude1 || latitude2 === iterateLatitude2) {
        const iterateLongitude1 = line1.longitudes[0]
        const iterateLongitude2 = line1.longitudes[1]
        const longitude1 = line2.longitudes[0]
        const longitude2 = line2.longitudes[1]
        if (longitude1 === iterateLongitude1 || longitude1 === iterateLongitude2) {
          if (longitude2 === iterateLongitude1 || longitude2 === iterateLongitude2) {
            return true
          }
        }
      }
    }
  }
  return false
}

const existsEqualLine = (line, lines) => {
  for (let i = 0; i < lines.length; i++) {
    const iteratedLine = lines[i]
    if (isSameLine(line, iteratedLine)) {
      return true
    }
  }
  return false
}

const orderCoordinates = (line) => {
  const newLine = Object.assign(line)
  const latitude1 = line.latitudes[0]
  const latitude2 = line.latitudes[1]
  const longitude1 = line.longitudes[0]
  const longitude2 = line.longitudes[1]
  let minLatitude = latitude1
  let maxLatitude = latitude2
  let minLongitude = longitude1
  let maxLongitude = longitude2
  if (latitude2 < minLatitude) {
    minLatitude = latitude2
    maxLatitude = latitude1
  }
  if (longitude2 < minLongitude) {
    minLongitude = longitude2
    maxLongitude = latitude1
  }
  newLine.latitudes = [minLatitude, maxLatitude]
  newLine.longitudes = [minLongitude, maxLongitude]
  return newLine
}

const hasSameCoordinates = (line1, line2) => {
  if (line1.latitudes[0] === line2.latitudes[0] &&
    line1.latitudes[1] === line2.latitudes[1] &&
    line1.longitudes[0] === line2.longitudes[0] &&
    line1.longitudes[1] === line2.longitudes[1]) return true
  return false
}

const countNDuplicatedLines = (line, lines) => {
  let times = 0
  for (let i = 0; i < lines.length; i++) {
    if (hasSameCoordinates(line, lines[i])) times++
  }
  return times
}

const arcs = {
  0: 0,
  1: -0.25,
  2: 0.25,
  3: -0.5,
  4: 0.5,
  5: -0.75,
  6: 0.75,
  7: -0.8,
  8: 0.8,
}

const getNewArc = (line, duplicatedLines) => {
  const orderedCoordinatesLine = orderCoordinates(line)
  const nTimes = countNDuplicatedLines(orderedCoordinatesLine, duplicatedLines)
  duplicatedLines.push(orderedCoordinatesLine)
  const arc = arcs[nTimes]
  console.log(arc)
  return arc
}

export const manageLinesCurvatureDependingOnDuplicated = (lines) => {
  const duplicatedLines = []
  for (let i = 0; i < lines.length; i++) {
    const existsLine = existsEqualLine(lines[i], lines)
    if (existsLine) {
      lines[i].arc = getNewArc(lines[i], duplicatedLines)
    }
  }
  console.log(duplicatedLines)
  return lines
}

export const isFlightLanded = (position) => {
  return position === FlightsPositions.FINAL
}

export const isFlightPendingToTakeOff = (position) => {
  return position === FlightsPositions.INITIAL
}

export const isFlightOnMiddle = (position) => {
  return position === FlightsPositions.MIDDLE
}
