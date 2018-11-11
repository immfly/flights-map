import { shouldSetFlightInProgress, getFlightPosition, isFlightLanded, isFlightPendingToTakeOff, isFlightOnMiddle } from './FlightsService'
import { manageLinesCurvatureDependingOnDuplicated } from './DuplicatedFlightsService'
import { order, cleanPoints } from '../utils/arrayManager'
import ContinentsCoordinates from '../static/ContinentsCoordinates'
import FlightsPositions from '../static/FlightsPositions';

const defaultPlane = {
  svgPath: 'm2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47',
  positionScale: 1.3,
  fixedSize: true
}
const defaultLine = { alpha: 0.4, thickness: 2 }
const defaultAirport = { type: 'circle' }

const getConfigText = (keyText, value) => keyText + ': ' + '<b>' + value + '</b>'

const getValue = (object, attribute, additionalText) => {
  const attributes = attribute.split('.')
  let i = 0
  while (i < attributes.length) {
    object = object[attributes[i]]
    i++
  }
  if (additionalText) return additionalText[object]
  return object
}

const buildTextMarker = (flight, markersConfig) => {
  let text = ''
  for (const markerConfig of markersConfig) {
    const value = getValue(flight, markerConfig.id, markerConfig.additional)
    if (value || value === 0) {
      text += getConfigText(markerConfig.text, value) + '</br>'
    }
  }
  return text
}

const buildPlane = (flight, name, flightLineId, position, shouldAnimate, scale, config) => {
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
    defaultPlane
  )
}

const buildLine = (flightLineId, flight, config, origin, destination) => {
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
    defaultLine
  )
}

const buildAirport = (flight, airport, color, flightName, config) => {
  color = color || config.colors.cities
  return Object.assign(
    {
      title: airport.city,
      label: flightName || '',
      labelFontSize: config.texts.labelsFontSize,
      color: color,
      rollOverColor: color,
      labelRollOverColor: '#000000',
      latitude: airport.latitude,
      longitude: airport.longitude,
      balloonText: buildTextMarker(flight, config.dataToShowOnMarkers)
    },
    defaultAirport
  )
}

const isObject = (value) => {
  return value && typeof value === 'object' && value.constructor === Object
}

const buildMapData = (config, flightsData) => {
  return {
    type: 'map',
    areasSettings: { unlistedAreasColor: config.colors.land },
    imagesSettings: {
      color: config.colors.cities,
      rollOverColor: config.colors.cities,
      selectedColor: config.colors.cities,
      pauseDuration: 0.2,
      animationDuration: config.animation.duration,
      adjustAnimationSpeed: true
    },
    zoomControl: { minZoomLevel: config.zoom.minLevel, maxZoomLevel: config.zoom.maxLevel },
    linesSettings: { color: config.colors.lines, alpha: 0.4, thickness: 1 },
    dataProvider: {
      mapVar: window.AmCharts.maps.worldLow,
      images: flightsData.images,
      lines: flightsData.lines,
      zoomLevel: config.zoom.initialLevel,
      zoomLongitude: 15,
      zoomLatitude: 15
    },
    balloon: {
      textAlign: 'left',
      fontSize: config.texts.markersFontSize,
      cornerRadius: 6,
      adjustBorderColor: false,
      horizontalPadding: 10,
      verticalPadding: 10,
      shadowAlpha: 0,
      fillAlpha: 0.6
    },
    mouseCursorStyle: 'pointer',
    projection: 'winkel3'
  }
}

const updateContent = (map, contentMap) => {
  map.areasSettings = contentMap.areasSettings
  map.zoomControl = contentMap.zoomControl
  map.linesSettings = contentMap.linesSettings
  map.dataProvider = contentMap.dataProvider
  map.dataProvider.zoomLevel = map.zoomLevel()
  map.dataProvider.zoomLatitude = map.zoomLatitude()
  map.dataProvider.zoomLongitude = map.zoomLongitude()
  map.validateData()
}

export const mergeConfigObject = (baseObject, newObject) => {
  for (let key in newObject) {
    const object = newObject[key]
    if (baseObject.hasOwnProperty(key)) {
      baseObject[key] = isObject(object) ? mergeConfigObject(baseObject[key], object) : newObject[key]
    }
  }
  return baseObject
}

export const createMapContainer = (id, backgroundColor) => {
  const container = document.createElement('div')
  if (id) container.id = id
  container.style.backgroundColor = backgroundColor
  container.style.height = '100%'
  return container
}

export const getAirportsObjects = (flight, position, shouldAnimate, config) => {
  const images = []
  if (shouldAnimate || isFlightOnMiddle(position)) {
    images.push(buildAirport(flight, flight.origin, flight.color, flight.name, config))
    images.push(buildAirport(flight, flight.destination, flight.color, flight.name, config))
  } else if (isFlightPendingToTakeOff(position)) {
    images.push(buildAirport(flight, flight.destination, flight.color, flight.name, config))
  } else if (isFlightLanded(position)) {
    images.push(buildAirport(flight, flight.origin, flight.color, flight.name, config))
  }
  return images
}

const getObjectsForFlight = (flight, i, config) => {
  const images = []
  const lines = []
  const planeName = 'plane' + i
  let flightLineId = 'flight' + i
  let position = getFlightPosition(flight.state)
  const scale = position === 0.5 ? 0.025 : 0.05
  const shouldAnimate = shouldSetFlightInProgress(config.globalFlightsState, config.animation.enabled, flight.state)
  if (flight.route) {
    const cleanedPoints = cleanPoints(flight.route)
    const points = cleanedPoints
    for (let i = 0; i < points.length - 1; i++) {
      const flightRouteLineId = 'flight-route' + i
      lines.push(buildLine(flightRouteLineId, flight, config, points[i], points[i + 1]))
      position = FlightsPositions.FINAL
    }
    flightLineId = 'flight-route' + (points.length - 2)
  } else {
    lines.push(buildLine(flightLineId, flight, config))
  }
  images.push(buildPlane(flight, planeName, flightLineId, position, shouldAnimate, scale, config))
  images.push(...getAirportsObjects(flight, position, shouldAnimate, config))
  return {images, lines}
}

const buildData = (data, config) => {
  const images = []
  const lines = []
  if (data) {
    for (let i = 0; i < data.length; i++) {
      const flight = data[i]
      const flightObjects = getObjectsForFlight(flight, i, config)
      images.push(...flightObjects.images)
      lines.push(...flightObjects.lines)
    }
  }
  manageLinesCurvatureDependingOnDuplicated(lines)
  return { images, lines }
}

export const updateMap = (map, flights, config) => {
  const mapFlightsData = buildData(flights, config)
  map && updateContent(map, buildMapData(config, mapFlightsData))
}

const initializeMapZoom = (map, zoomData) => {
  if (zoomData) map.zoomToLongLat(zoomData.level, zoomData.longitude, zoomData.latitude, true)
}

const getContintentData = (data) => {
  return ContinentsCoordinates[data.toUpperCase()]
}

const getZoomData = (continentData) => {
  const continent = getContintentData(continentData)
  if (continent) return { level: continent.zoom, latitude: continent.latitude, longitude: continent.longitude }
}

const getSpecificZoomData = (center) => {
  return { level: center.level, latitude: center.latitude, longitude: center.longitude }
}

const initialize = (config, flights) => {
  const flightsData = buildData(flights, config)
  const flightsContainer = document.querySelector('flights-map')
  if (!flightsContainer) return
  const containerDivMap = flightsContainer.shadowRoot.getElementById(config.mapContainerId)
  const map = window.AmCharts.makeChart(containerDivMap, buildMapData(config, flightsData))
  if (config.zoomedContinent) initializeMapZoom(map, getZoomData(config.zoomedContinent))
  else if (config.zoom.initialCenter && config.zoom.initialCenter.latitude && config.zoom.initialCenter.longitude && config.zoom.initialCenter.level) {
    initializeMapZoom(map, getSpecificZoomData(config.zoom.initialCenter))
  }
  return map
}

export const buildMap = async (config, flights) => {
  const promise = new Promise(function (resolve) {
    setTimeout(function () {
      const map = initialize(config, flights)
      resolve(map)
    }, 1000)
  })
  return promise
}
