import DefaultConfig from './static/defaultConfig'
import { mergeConfigObject, createMapContainer, createGlowingEffectStyle, buildMap, updateMap } from './managers/mapManager'

class FlightsMap extends global.HTMLElement {
  constructor () {
    super()
    this.addEventListener('mapLoaded', this.addPendingFlights)
  }

  async connectedCallback () {
    this.mapConfig = DefaultConfig
    this.upgradeProperty('config')
    this.upgradeProperty('flights')
    this.map = await this.createMap(this.mapConfig, this.mapFlights)
  }

  set flights (flights) {
    this.mapFlights = flights
    this.updateData(this.mapFlights)
  }

  set config (newConfig) {
    this.mapConfig = mergeConfigObject(this.mapConfig, newConfig)
  }

  upgradeProperty (prop) {
    if (this.hasOwnProperty(prop)) {
      let value = this[prop]
      delete this[prop]
      this[prop] = value
    }
  }

  attachContent (config) {
    const mapContainer = createMapContainer(config.mapContainerId, config.colors.background)
    this.shadowRoot.appendChild(mapContainer.cloneNode(true))
  }

  dispatchLoadedEvent () {
    const event = new window.Event('mapLoaded')
    this.dispatchEvent(event)
  }

  removeGlowSheet () {
    const glowStyleSheet = this.shadowRoot.getElementById('glow-stylesheet')
    if (!glowStyleSheet || !glowStyleSheet.parentNode) return

    glowStyleSheet.parentNode.removeChild(glowStyleSheet)
  }

  updateData (flights) {
    this.updateMap(this.map, flights, this.mapConfig)

    if (this.mapConfig.animation.shouldAnimateFlyingState) {
      this.removeGlowSheet()
      const glowEffectStyle = createGlowingEffectStyle(flights)
      this.shadowRoot.appendChild(glowEffectStyle)
      return
    }

    this.removeGlowSheet()
  }

  updateMap (map, flights, config) {
    if (flights && flights.length >= 0) {
      updateMap(map, flights, config, this.shadowRoot)
      if (!map) {
        this.pendingAddFlights = true
        return
      }
      if (!this.pendingAddFlights) {
        updateMap(map, flights, config, this.shadowRoot)
      }
    }
  }

  addPendingFlights () {
    if (this.pendingAddFlights) {
      if (!this.map) {
        var self = this
        self.tryToAddDataSinceMapIsLoaded = setInterval(function () {
          if (self.map) {
            updateMap(self.map, self.mapFlights, self.mapConfig, self.shadowRoot)
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
    this.attachContent(config)
    const map = await buildMap(config, flights)
    this.dispatchLoadedEvent()
    return map
  }
}

window.customElements.define('flights-map', FlightsMap)

export default FlightsMap
