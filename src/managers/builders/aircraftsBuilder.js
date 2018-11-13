import { buildTextMarker } from './utils/marker'
import { basePlane } from '../../static/baseObjects'

export const buildPlane = (flight, name, flightLineId, position, shouldAnimate, scale, config) => {
  const color = flight.color || config.colors.planes
  return Object.assign(
    {
      title: name,
      lineId: flightLineId,
      color: color,
      rollOverColor: color,
      positionOnLine: position,
      scale: scale,
      animateAlongLine: shouldAnimate,
      flipDirection: config.animation.flip,
      loop: config.animation.loop,
      balloonText: buildTextMarker(flight, config.dataToShowOnMarkers)
    },
    basePlane
  )
}
