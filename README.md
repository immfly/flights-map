# @immfly/flights-map

![npm](https://img.shields.io/npm/v/@immfly/flights-map.svg) ![license](https://img.shields.io/npm/l/@immfly/flights-map.svg) ![github-issues](https://img.shields.io/github/issues/@immfly/flights-map.svg)  

Custom element that receives a list of flights and show them in a map with an optional custom configuration.

## Demo
https://immfly.github.io/flights-map-demo.github.io/

## Install

`npm install --save @immfly/flights-map`


## Usage
**1.** Import the package in your project. Options:
  - **ECMAScript 6**: `import '@immfly/flights-map`
  - **HTML**: `<script src="/node_modules/@immfly/flights-map/lib.js"></script>`

**2.** Add ```<flights-map></flights-map>``` tag in a html code snnipet. **Important**: this tag must be in a container with a height and a width. 

**3.** Set a flights array as property. The objects of this array must have this structure:
```
{
  name: 'V131', // Flight name
  origin: { 
    city: 'Paris', // Origin city name
    latitude: 48.8567, // Origin city latitude
    longitude: 2.3510 // Origin city longitude
  },
  destination: { 
    city: 'Toronto', // Destination city name
    latitude: 43.8163, // Destination city latitude
    longitude: -79.4287 // Destination city longitude
  },
  state: 0, // * Optional. Flight state: 0 means pending to start, 1 means in progress, and 2 means completed. If there is no state, the position of the aircraft on the flight will be on the middle
  color: '#F60' // * Optional. Color to be painted on the map, including aircraft, cities and line flight,
  route: [{latitude:29.719757, longitude:-13.391225, date:"2018-11-11T18:58:32.590Z"}, {latitude:29.719757, longitude:-13.391225, date:"2018-11-11T18:59:22.988Z"}] // * Optional. Array of points with latitude, longitude and date. If this key is on the flight object, the state will be ommited and the aircraft will be painted on the last last position
}
```

In **pure Javascript**, you can add this array list as property in this way:

```
var flightsArray = [...]
document.getElementsByTagName('flights-map')[0].flights = flightsArray
```

In this code snnipet, we access to the DOM element **<flights-map>** and set an array in its **flights** property.

In **ReactJS**, you can add this array list as property in this way:
```
import React from 'react'
import '@immfly/flights-map'

class FlightsMapContainer extends React.Component {
  render () {
    const flights = [
      {
        name: 'V131',
        origin: { city: 'Paris', latitude: 48.8567, longitude: 2.3510 },
        destination: { city: 'Toronto', latitude: 43.8163, longitude: -79.4287 },
        state: 0,
        color: '#F60'
      },
      {
        name: 'SZ1D',
        origin: { city: 'Szuć', latitude: 53.502781611608455, longitude: 20.730991641461287 },
        destination: { city: 'Storuman', latitude: 64.833677697428, longitude: 17.316869897704464 },
        state: 0,
        color: '#DA291C'
      }
    ]
    return <flights-map ref={(el) => { el => el && (el.flights = flights)} } />
  }
}

export default FlightsMapContainer
```

The most strange or particular code line could be `<flights-map ref={(el) => { el.flights = flights }} />`. 

`flights-map` is a **web custom element** and ReactJS does not interpret it as a React component. So, the only way to send JSON data (arrays, objects) to a custom element is using `ref`react components property. 

## Custom configuration
You can optionally specify a custom global configuration. This is the default configuration:
```
{
  mapContainerId: 'map', // The id of the map container on the custom element.
  linesArc: -0.7, // Angle of the lines curve on the map.
  globalFlightsState: 0.5, // The value of this can be between 0 and 1. It specifies the position of the aircraft on the line flight. For example, 0 will be at the begining of the line and 1 at the end.
  colors: {
    land: '#BDBDBD', // Specifies the colors of the land.
    background: '#F5F5F5', // Specifies the color of the map background.
    aircrafts: '#000000', // Specifies a global color for aircrafts wich flight has no color.
    lines: '#000000', // Specifies a global color for lines wich flight has no color.
    cities: '#000000' // Specifies a global color for cities wich flight has no color.
  },
  zoomedContinent: null, // Specifies default bounding boxes to initialize the map. You can use 'europe', 'asia', 'oceania', 'africa', 'north_america' or 'south_america'.
  forceUpdate: false, // In react applications, you have to forceUpdate to render the flights, when the component that wraps the flights-map already has been mounted.,
  showMarkers: false, // Specifies if the default markers have to be shown.
  dataToShowOnMarkers: [
    { id: 'name', text: 'Flight' },
    { id: 'origin.city', text: 'Origin' },
    { id: 'destination.city', text: 'Destination' }
  ], // Specifies the data to be shown on markers. 'id' is key on the object and 'text' is the name that will be showed on the marker.
  animation: {
    enabled: true, // If it is false, any aircraft will be animate altough its state is 'in progress'.
    flip: false, // Specifies if the aircrafts will move throug both directions. 
    loop: true, // Specifies if the aircrafts will move constantly on its line flight. 
    duration: 8.5, // Specifies the duration of the aircrafts animation.
    shouldAnimateFlyingState: true // * Optional. If it setted to true, the aircrafts and the airports with flights in state FLYING will be animated with a glow effect.
  },
  zoom: {
    initialLevel: 1, // Specifies initial zoom level.
    minLevel: 1, // Specifies minimum zoom level.
    maxLevel: 7 // Specifies maximum zoom level.
    initialCenter: { // Specifies initial zoom position of the map. If you have set the attribute zoomedContinent, this one has one effect.
      latitude: null, // Specifies the initial zoom latitude.
      longitude: null, // Specifies the initial zoom longitude.
      level: null // Specifies the initial zoom level.
    },
    homeButtonEnabled: false, // Specifies if the home button must be shown.
    buttonFillAlpha: 0.7, // Specifies the alpha value of the buttons background.
    buttonFillColor: '#E6E6E6', // Specifies the background color of the buttons.
    controlsPosition: {
      top: 20,
      right: 20
    } // Specifies the position of the map control (home, zomm in, zoom out). You can add left, bottom, top and right.
  },
  texts: { 
    labelsFontSize: 8, // Specifies labels font size of the map.
    markersFontSize: 14 // Specifies font size on flights markers.
  }
}
```

So, you can specify only the configuration you want to change. For example, if you only want to change the **color of the land** and the **font size on markers**, you have to set a property named **config**. For example:

In **pure Javascript**, you can add this configuration in this way:

```
var config = {
  colors: {
    land: '#BA68C8'
  },
  texts: {
    markersFontSize: 12
  }
}
document.getElementsByTagName('flights-map')[0].config = config
```

In **ReactJS**, you can add this configuration in this way:
```
import React from 'react'
import '@immfly/flights-map'

class FlightsMapContainer extends React.Component {
  render () {
    const config = {
      colors: {
        land: '#BA68C8'
      },
      texts: {
        markersFontSize: 12
      }
    }
    return <flights-map ref={(el) => { el && (el.config = config) }} />
  }
}

export default FlightsMapContainer
```

## Events
There are many javascript events: 
*  **flightsMapObjectClick**: after flight line, aircraft or airpots clicked.
*  **flightsMapLoaded**: after map loaded.


## Development usage
*Only if you haved clone the project and you want to interact with it, improve it or try it.*

First time, run `npm install`.

Once you have required npm packages installed, run `npm start` to start development mode. In the project there is a folder named **examples**, where you can find a simple pure Javascript and HTML example that loads a list of flights initially and change those flights five seconds later. 

If you want to add a new example, for example **index2.html**, you have to add it in the **examples** folder, and then modify the **template** attribute of the **htmlWebpackPlugin** on the **webpack.config.js** file, that it is located on the **dev** folder.

```
const htmlWebpackPlugin = new HtmlWebPackPlugin({
  template: './examples/index2.html', // Route of the file you want to run on develemponet mode
  filename: './index.html'
})
```

## Contributing

Contributions welcome; Please submit all pull requests the against master branch. If your pull request contains JavaScript patches or features, you should include relevant unit tests. Please check the [Contributing Guidelines](contributng.md) for more details. Thanks!

## Author

Albert Pérez Farrés 

## License

 - **MIT** : http://opensource.org/licenses/MIT
