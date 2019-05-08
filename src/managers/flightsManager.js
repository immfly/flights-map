import { PENDING_TO_START, IN_PROGRESS, COMPLETED } from '../static/flightStates'
import { INITIAL, MIDDLE, FINAL } from '../static/flightPositions'

const isFlightPendingToStart = state => state === PENDING_TO_START
const isFlightInProgress = state => state === IN_PROGRESS
const isFlightCompleted = state => state === COMPLETED

export const getPositionOnLine = (point1, point2, actualPoint) => {
  const totalDistance = getDistanceInKM(point1, point2)
  const actualDistance = getDistanceInKM(point1, actualPoint)
  const position = actualDistance / totalDistance
  return position < INITIAL ? MIDDLE : (position > FINAL ? MIDDLE : position)
}

const getDistanceInKM = (point1, point2) => {
  const R = 6371
  const dLat = deg2rad(point2.latitude - point1.latitude) // deg2rad below
  const dLon = deg2rad(point2.longitude - point1.longitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

const deg2rad = deg => deg * (Math.PI / 180)

export const shouldSetFlightInProgress = (configState, animationEnabled, flightState) => {
  return configState !== 'animate' && animationEnabled && isFlightInProgress(flightState)
}

export const getFlightPosition = flightState => {
  if (isFlightPendingToStart(flightState)) return INITIAL
  if (isFlightCompleted(flightState)) return FINAL
  return MIDDLE
}

export const isFlightLanded = position => position === FINAL
export const isFlightPendingToTakeOff = position => position === INITIAL
export const isFlightOnMiddle = position => position === MIDDLE
