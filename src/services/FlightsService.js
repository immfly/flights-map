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

class FlightsService {
  shouldSetFlightInProgress (configState, flightState) {
    return configState !== 'animate' && isFlightInProgress(flightState)
  }

  getFlightPosition (flightState) {
    if (isFlightPendingToStart(flightState)) return FlightsPositions.INITIAL
    if (isFlightCompleted(flightState)) return FlightsPositions.FINAL
    return 0
  }

  isFlightCompleted (position) {
    return position === FlightsPositions.INITIAL
  }
}

export default FlightsService
