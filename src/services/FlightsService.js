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

export const isFlightLanded = (position) => {
  return position === FlightsPositions.FINAL
}

export const isFlightPendingToTakeOff = (position) => {
  return position === FlightsPositions.INITIAL
}

export const isFlightOnMiddle = (position) => {
  return position === FlightsPositions.MIDDLE
}
