import AirportsService from './AirportsService'

const getRandomFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)]
}

const getRandomColor = () => {
  return getRandomFromArray(['#F60', '#003580', '#FDC43E', '#824696', '#DA291C'])
}

const getRandomState = () => {
  return getRandomFromArray([0, 1, 2])
}

const buildRandomName = (length) => {
  const availableCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let text = ''
  for (let i = 0; i < length; i++) { text += availableCharacters.charAt(Math.floor(Math.random() * availableCharacters.length)) }
  return text.toUpperCase()
}

class FlightsMockedService {
  constructor () {
    this.airportsService = new AirportsService()
  }

  getRandom (total) {
    const flights = []
    for (let i = 0; i < total; i++) {
      const flight = {
        name: buildRandomName(5),
        origin: this.airportsService.getRandom(),
        destination: this.airportsService.getRandom(),
        color: getRandomColor(),
        state: getRandomState()
      }
      flights.push(flight)
    }
    return flights
  }
}

export default FlightsMockedService
