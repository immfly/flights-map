import {shouldSetFlightInProgres, getFlightPosition, isFlightLanded, isFlightPendingToTakeOff, isFlightOnMiddle, manageLinesCurvatureDependingOnDuplicated} from './FlightsService'
import ContinentsCoordinates from '../static/ContinentsCoordinates'

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
    if (value) {
      text += getConfigText(markerConfig.text, value) + '</br>'
    }
  }
  return text
}

const buildPlane = (flight, name, flightLineId, position, shouldAnimate, config) => {
  const color = flight.color || config.colors.planes
  return Object.assign(
    {
      title: name,
      lineId: flightLineId,
      color: color,
      rollOverColor: color,
      positionOnLine: position,
      scale: 0.05,
      animateAlongLine: shouldAnimate,
      flipDirection: config.animation.flip,
      loop: config.animation.loop,
      balloonText: buildTextMarker(flight, config.dataToShowOnMarkers)
    },
    defaultPlane
  )
}

const buildLine = (flightLineId, flight, config) => {
  return Object.assign(
    {
      id: flightLineId,
      color: flight.color || config.colors.lines,
      latitudes: [flight.origin.latitude, flight.destination.latitude],
      longitudes: [flight.origin.longitude, flight.destination.longitude],
      arc: config.linesArc,
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
  const flightLineId = 'flight' + i
  const position = getFlightPosition(flight.state)
  const shouldAnimate = shouldSetFlightInProgres(config.globalFlightsState, flight.state)
  lines.push(buildLine(flightLineId, flight, config))
  images.push(buildPlane(flight, planeName, flightLineId, position, shouldAnimate, config))
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
  const managedLines = manageLinesCurvatureDependingOnDuplicated(lines)
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

const initialize  = (config, flights) => {
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
