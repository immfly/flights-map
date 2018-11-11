import DefaultConfig from './static/DefaultConfig'
import { mergeConfigObject, createMapContainer, buildMap, updateMap } from './services/MapService'

class FlightsMap extends global.HTMLElement {
  constructor () {
    super()
    this.addEventListener('mapLoaded', this.addPendingFlights)
  }

  async connectedCallback () {
    this.mapConfig = DefaultConfig
    this.upgradeProperty('flights')
    this.upgradeProperty('config')
    this.map = await this.createMap(this.mapConfig, this.mapFlights)
  }

  set flights (flights) {
    this.mapFlights = flights
    this.updateData(this.mapFlights)
  }

  set config (newConfig) {
    this.mapConfig = this.manageConfig(this.mapConfig, newConfig)
    this.updateData(this.mapFlights)
  }

  upgradeProperty (prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop]
      delete this[prop]
      this[prop] = value
    }
  }

  manageConfig (baseConfig, newConfig) {
    const config = mergeConfigObject(baseConfig, newConfig)
    return config
  }

  attachContent (id, backgroundColor) {
    const mapContainer = createMapContainer(id, backgroundColor)
    this.shadowRoot.appendChild(mapContainer.cloneNode(true))
  }

  dispatchLoadedEvent () {
    const event = new window.Event('mapLoaded')
    this.dispatchEvent(event)
  }

  updateData (flights) {
    this.updateMap(this.map, flights, this.mapConfig)
  }

  updateMap (map, flights, config) {
    if (flights && flights.length > 0) {
      console.log("Update ", flights.length)
      updateMap(map, flights, config)
      if (!map) {
        this.pendingAddFlights = true
        return
      }
      if (!this.pendingAddFlights) {
        updateMap(map, flights, config)
      }
    }
  }

  addPendingFlights () {
    if (this.pendingAddFlights) {
      if (!this.map) {
        var self = this
        self.tryToAddDataSinceMapIsLoaded = setInterval(function () {
          if (self.map) {
            updateMap(self.map, self.mapFlights, self.mapConfig)
            clearInterval(self.tryToAddDataSinceMapIsLoaded)
          }
        }, 300)
        return
      }
      this.pendingAddFlights = false
    }
  }

  async createMap (config, flights) {
    this.attachShadow({ mode: 'open' })
    this.attachContent(config.mapContainerId, config.colors.background)
    const map = await buildMap(config, flights)
    this.dispatchLoadedEvent()
    return map
  }
}

window.customElements.define('flights-map', FlightsMap)

export default FlightsMap
