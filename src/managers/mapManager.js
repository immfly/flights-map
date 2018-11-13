
import { manageLinesCurvatureDependingOnDuplicated } from './duplicatedFlightsManager'
import { buildObjectsForFlight } from './builders/objectsBuilder'
import { addGlowingEffectToMapImages } from './utils/glowingEffect'
import ContinentsCoordinates from '../static/continentsCoordinates'
import { glowingEffectSelector } from '../static/glowingEffectSelector'

const isObject = (value) => {
  return value && typeof value === 'object' && value.constructor === Object
}

const buildMapData = (config, flightsData) => {
  return {
    type: 'map',
    theme: 'dark',
    areasSettings: { unlistedAreasColor: config.colors.land },
    addClassNames: true,
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

export const createGlowingEffectStyle = () => {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = glowingEffectSelector +
  '{ \
    filter: url(#glow); \
    fill: hsl(7, 50%, 38%); \
    -webkit-animation: light-pulse 3s infinite; \
    -moz-animation: light-pulse 3s infinite; \
    animation: light-pulse 3s infinite; \
  } \
  @keyframes light-pulse { \
    1%   { fill: hsl(7, 50%, 38%); } \
    50%  { fill: hsl(7, 50%, 78%); } \
    100% { fill: hsl(7, 50%, 38%); } \
  } \
  @-webkit-keyframes light-pulse { \
    1%   { fill: hsl(7, 50%, 38%); } \
    50%  { fill: hsl(7, 50%, 78%); } \
    100% { fill: hsl(7, 50%, 38%); } \
  }';
  return style
}

const buildData = (data, config) => {
  const images = []
  const lines = []
  if (data) {
    for (let i = 0; i < data.length; i++) {
      const flight = data[i]
      const flightObjects = buildObjectsForFlight(flight, i, config)
      images.push(...flightObjects.images)
      lines.push(...flightObjects.lines)
    }
  }
  manageLinesCurvatureDependingOnDuplicated(lines)
  return { images, lines }
}

export const updateMap = (map, flights, config, shadowRoot) => {
  const mapFlightsData = buildData(flights, config)
  map && updateContent(map, buildMapData(config, mapFlightsData))
  if (config.shouldAnimateFlyingState) {
    map && map.addListener( "zoomCompleted", function() {
      addGlowingEffectToMapImages(shadowRoot)
    })
    addGlowingEffectToMapImages(shadowRoot)
  }
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
