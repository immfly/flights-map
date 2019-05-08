import { buildTextMarker } from './utils/marker'
import { baseLine, baseLineOutOfRoute } from '../../static/baseObjects'

export const buildLine = (flightLineId, flight, config, origin, destination, shouldShowLineOutOfRoute) => {
  const flightOrigin = origin || flight.origin
  const flightDestination = destination || flight.destination
  const color = flight.color || config.colors.lines
  const linesArc = (origin && destination) ? 0 : config.linesArc

  return Object.assign(
    {
      id: flightLineId,
      title: flight.name,
      color: color,
      selectedColor: color,
      latitudes: [flightOrigin.latitude, flightDestination.latitude],
      longitudes: [flightOrigin.longitude, flightDestination.longitude],
      arc: linesArc,
      mouseEnabled: flight.selectable,
      selectable: flight.selectable,
      balloonText: buildTextMarker(flight, config.dataToShowOnMarkers)
    },
    shouldShowLineOutOfRoute ? baseLineOutOfRoute : baseLine
  )
}
