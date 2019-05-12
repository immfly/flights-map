import { isFlightLanded, isFlightPendingToTakeOff, isFlightOnMiddle } from '../flightsManager'
import { buildTextMarker } from './utils/marker'
import { baseAirport } from '../../static/baseObjects'

const buildAirport = (flight, airport, color, config) => {
  color = color || config.colors.cities
  return Object.assign(
    {
      id: `state${flight.state}-${flight.name}-${color.replace('#', '')}`,
      title: flight.name,
      labelFontSize: config.texts.labelsFontSize,
      color: color,
      selectedColor: color,
      rollOverColor: color,
      labelRollOverColor: '#000000',
      latitude: airport.latitude,
      longitude: airport.longitude,
      mouseEnabled: flight.selectable,
      selectable: flight.selectable,
      balloonText: buildTextMarker(flight, config.dataToShowOnMarkers)
    },
    baseAirport
  )
}

export const buildAirportsObjects = (flight, position, shouldAnimate, config) => {
  const images = []
  if (shouldAnimate || flight.route || isFlightOnMiddle(position)) {
    images.push(buildAirport(flight, flight.origin, flight.color, config))
    images.push(buildAirport(flight, flight.destination, flight.color, config))
  } else if (isFlightPendingToTakeOff(position)) {
    images.push(buildAirport(flight, flight.destination, flight.color, config))
  } else if (isFlightLanded(position)) {
    images.push(buildAirport(flight, flight.origin, flight.color, config))
  }
  return images
}
