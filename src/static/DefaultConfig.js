import { IN_PROGRESS } from './flightStates'

const DefaultConfig = {
  mapContainerId: 'map',
  linesArc: -0.7,
  shouldAnimateFlyingState: true,
  globalFlightsState: IN_PROGRESS,
  colors: {
    land: '#383747',
    background: '#504F64',
    aircrafts: '#000000',
    lines: '#000000',
    cities: '#000000'
  },
  zoomedContinent: null,
  dataToShowOnMarkers: [
    {
      id: 'name',
      text: 'Flight'
    },
    {
      id: 'origin.city',
      text: 'Origin'
    },
    {
      id: 'destination.city',
      text: 'Destination'
    },
    {
      id: 'state',
      text: 'State',
      additional: {
        0: 'Pending to start',
        1: 'Flying',
        2: 'Completed'
      }
    }
  ],
  animation: {
    enabled: true,
    flip: false,
    loop: true,
    duration: 8.5
  },
  zoom: {
    initialLevel: 1,
    minLevel: 1,
    maxLevel: 15,
    initialCenter: {
      latitude: null,
      longitude: null,
      level: null
    }
  },
  texts: {
    labelsFontSize: 8,
    markersFontSize: 14
  }
}

export default DefaultConfig
