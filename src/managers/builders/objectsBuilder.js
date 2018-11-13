import { shouldSetFlightInProgress, getFlightPosition, getPositionOnLine } from '../flightsManager'
import { buildLine } from './linesBuilder'
import { buildAirportsObjects } from './airportsBuilder'
import { buildPlane } from './aircraftsBuilder'
import { cleanPoints } from './utils/arrayManager'
import { MIDDLE } from '../../static/flightPositions'

const buildObjectWithNoRoute = (flight, flightLineId, planeName, config, position, shouldAnimate, scale) => {
  const lines = [buildLine(flightLineId, flight, config, null, null)]
  const positionOnLine = flight.actualPosition ? getPositionOnLine(flight.origin, flight.destination, flight.actualPosition) : position
  const images = [buildPlane(flight, planeName, flightLineId, positionOnLine, shouldAnimate, scale, config)]
  return { images, lines }
}

const buildObjectWithRoute = (flight, planeName, config, shouldAnimate, scale) => {
  const images = []
  const lines = []
  const cleanedPoints = cleanPoints(flight.route)
  const points = cleanedPoints
  for (let i = 0; i < points.length - 1; i++) {
    const flightRouteLineId = 'flight-route' + i
    lines.push(buildLine(flightRouteLineId, flight, config, points[i], points[i + 1]))
  }
  const flightRouteLineId = 'flight-route-final'
  if (flight.actualPosition) lines.push(buildLine(flightRouteLineId, flight, config, flight.actualPosition, flight.destination, true))
  else lines.push(buildLine(flightRouteLineId, flight, config, points[points.length - 1], flight.destination, true))
  images.push(buildPlane(flight, planeName, flightRouteLineId, 0, shouldAnimate, scale, config))
  return { images, lines }
}

export const buildObjectsForFlight = (flight, index, config) => {
  const planeName = 'plane' + index
  const flightLineId = 'flight' + index
  const position = getFlightPosition(flight.state)
  const scale = position === MIDDLE ? 0.025 : 0.05
  const shouldAnimate = shouldSetFlightInProgress(config.globalFlightsState, config.animation.enabled, flight.state)
  const flightObjects = flight.route
    ? buildObjectWithRoute(flight, planeName, config, shouldAnimate, scale)
    : buildObjectWithNoRoute(flight, flightLineId, planeName, config, position, shouldAnimate, scale)
  const images = [...flightObjects.images, ...buildAirportsObjects(flight, position, shouldAnimate, config)]
  const lines = [...flightObjects.lines]
  return { images, lines }
}
