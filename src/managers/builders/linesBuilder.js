import { buildTextMarker } from './utils/marker'
import { baseLine, baseLineOutOfRoute } from '../../static/baseObjects'

export const buildLine = (flightLineId, flight, config, origin, destination, shouldShowLineOutOfRoute) => {
  const flightOrigin = origin || flight.origin
  const flightDestination = destination || flight.destination
  const linesArc = (origin && destination) ? 0 : config.linesArc
  return Object.assign(
    {
      id: flightLineId,
      color: flight.color || config.colors.lines,
      latitudes: [flightOrigin.latitude, flightDestination.latitude],
      longitudes: [flightOrigin.longitude, flightDestination.longitude],
      arc: linesArc,
      balloonText: buildTextMarker(flight, config.dataToShowOnMarkers)
    },
    shouldShowLineOutOfRoute ? baseLineOutOfRoute : baseLine
  )
}
