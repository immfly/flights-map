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

export const getPositioOnLine = (point1, point2, actualPoint) => {
  const totalDistance = getDistanceInKM(point1, point2)
  const actualDistance = getDistanceInKM(point1, actualPoint)
  return actualDistance / totalDistance
}

const getDistanceInKM = (point1, point2) => {
  var R = 6371; 
  var dLat = deg2rad(point2.latitude - point1.latitude);  // deg2rad below
  var dLon = deg2rad(point2.longitude-point1.longitude); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

const deg2rad = (deg)  => {
  return deg * (Math.PI/180)
}

export const shouldSetFlightInProgress = (configState, animationEnabled, flightState) => {
  return configState !== 'animate' && animationEnabled && isFlightInProgress(flightState)
}

export const getFlightPosition = (flightState) => {
  if (isFlightPendingToStart(flightState)) return FlightsPositions.INITIAL
  if (isFlightCompleted(flightState)) return FlightsPositions.FINAL
  return FlightsPositions.MIDDLE
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
