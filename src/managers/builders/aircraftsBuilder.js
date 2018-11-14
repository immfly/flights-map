import { buildTextMarker } from './utils/marker'
import { baseAircraft } from '../../static/baseObjects'

export const buildAircraft = (flight, name, flightLineId, position, shouldAnimate, config) => {
  const color = flight.color || config.colors.aircrafts
  return Object.assign(
    {
      id: `state${flight.state}-${color.replace('#', '')}`,
      title: name,
      lineId: flightLineId,
      color: color,
      rollOverColor: color,
      positionOnLine: position,
      animateAlongLine: shouldAnimate,
      flipDirection: config.animation.flip,
      loop: config.animation.loop,
      balloonText: buildTextMarker(flight, config.dataToShowOnMarkers)
    },
    baseAircraft
  )
}
