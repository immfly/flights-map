
import { manageLinesCurvatureDependingOnDuplicated } from './duplicatedFlightsManager'
import { buildObjectsForFlight } from './builders/objectsBuilder'
import { addGlowingEffectToMapImages, getGlowingEffectCssClass } from './utils/glowingEffect'
import { equalObject } from './utils/objectComparator'
import { isObject } from './utils/object'
import { IN_PROGRESS } from '../static/flightStates'
import { baseAircraftsName } from '../static/baseObjects'
import ContinentsCoordinates from '../static/continentsCoordinates'

let oldMapData

const fireEvent = (name, detail) => {
  const event = new window.CustomEvent(name, { detail: detail })
  document.dispatchEvent(event)
}

const getObjectId = objectId => objectId.split(baseAircraftsName)[0]

const buildMapData = (config, mapData) => {
  let objectClicked = false
  const map = {
    type: 'map',
    theme: 'dark',
    areasSettings: { unlistedAreasColor: config.colors.land, selectable: true },
    addClassNames: true,
    imagesSettings: {
      color: config.colors.cities,
      rollOverColor: config.colors.cities,
      selectedColor: config.colors.cities,
      pauseDuration: 0.2,
      animationDuration: config.animation.duration,
      adjustAnimationSpeed: true
    },
    zoomControl: {
      minZoomLevel: config.zoom.minLevel,
      maxZoomLevel: config.zoom.maxLevel,
      buttonFillColor: config.zoom.buttonFillColor,
      buttonFillAlpha: config.zoom.buttonFillAlpha,
      homeButtonEnabled: config.zoom.homeButtonEnabled,
      top: config.zoom.controlsPosition.top,
      right: config.zoom.controlsPosition.right,
      bottom: config.zoom.controlsPosition.bottom,
      left: config.zoom.controlsPosition.left
    },
    linesSettings: { color: config.colors.lines, alpha: 0.4, thickness: 1 },
    dataProvider: {
      mapVar: window.AmCharts.maps.worldLow,
      images: mapData.images,
      lines: mapData.lines,
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
    listeners: [{
      event: 'click',
      method: function () {
        setTimeout(function () {
          if (!objectClicked) fireEvent('flightsMapClick')
        }, 100)
      }
    }, {
      event: 'clickMapObject',
      method: function (eventMap) {
        objectClicked = true
        fireEvent('flightsMapObjectClick', { flightName: getObjectId(eventMap.mapObject.title) })
        setTimeout(function () {
          objectClicked = false
        }, 250)
      }
    }],
    mouseCursorStyle: 'pointer',
    projection: 'winkel3'
  }

  if (!config.showMarkers) map.showBalloon = function () {}

  return map
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

export const createContainer = (id, backgroundColor) => {
  const container = document.createElement('div')

  if (id) container.id = id

  container.style.backgroundColor = backgroundColor
  container.style.height = '100%'

  return container
}

export const createGlowingEffectStyle = flights => {
  const style = document.createElement('style')
  style.id = 'glow-stylesheet'
  style.type = 'text/css'
  style.innerHTML = ''
  for (let i = 0; i < flights.length; i++) {
    const flight = flights[i]
    if (flight.state === IN_PROGRESS && !flight.hideGlowingEffect) {
      const glowingEffectClass = getGlowingEffectCssClass(flight)
      style.innerHTML += glowingEffectClass.classes
    }
  }

  return style
}

const preBuildData = (data, config) => {
  if (!data) return { images: [], lines: [] }

  const images = []
  const lines = []

  data.map((flight, index) => {
    const flightObjects = buildObjectsForFlight(flight, index, config)
    images.push(...flightObjects.images)
    lines.push(...flightObjects.lines)
  })

  manageLinesCurvatureDependingOnDuplicated(lines)

  return { images, lines }
}

const shouldUpdate = (map, oldMapData, newMapData, forceUpdate) => {
  return map && (forceUpdate || !equalObject(oldMapData, newMapData))
}

export const update = (map, flights, config, shadowRoot) => {
  const newMapData = preBuildData(flights, config)

  if (!shouldUpdate(map, oldMapData, newMapData, config.forceUpdate)) return

  oldMapData = newMapData
  updateContent(map, buildMapData(config, newMapData))

  if (!config.animation.shouldAnimateFlyingState) return

  addGlowingEffectToMapImages(shadowRoot, flights)
}

const initializeMapZoom = (map, zoomData) => {
  if (zoomData) map.zoomToLongLat(zoomData.level, zoomData.longitude, zoomData.latitude, true)
}

const getContintentData = data => ContinentsCoordinates[data.toUpperCase()]

const getZoomData = continentData => {
  const continent = getContintentData(continentData)
  if (continent) return { level: continent.zoom, latitude: continent.latitude, longitude: continent.longitude }
}

const getSpecificZoomData = center => {
  return { level: center.level, latitude: center.latitude, longitude: center.longitude }
}

const initialize = (config, flights) => {
  const flightsData = preBuildData(flights, config)
  const flightsContainer = document.querySelector('flights-map')
  if (!flightsContainer) return

  const containerDivMap = flightsContainer.shadowRoot.getElementById(config.mapContainerId)
  const map = window.AmCharts.makeChart(containerDivMap, buildMapData(config, flightsData))

  fireEvent('flightsMapLoaded')

  if (config.zoomedContinent) initializeMapZoom(map, getZoomData(config.zoomedContinent))
  else if (config.zoom.initialCenter && config.zoom.initialCenter.latitude && config.zoom.initialCenter.longitude && config.zoom.initialCenter.level) {
    initializeMapZoom(map, getSpecificZoomData(config.zoom.initialCenter))
  }

  return map
}

export const build = async (config, flights) => {
  const promise = new Promise(function (resolve) {
    setTimeout(function () {
      const map = initialize(config, flights)
      resolve(map)
    }, 1000)
  })

  return promise
}
