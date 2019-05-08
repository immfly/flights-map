export const order = array => {
  return array.sort(function (a, b) {
    return new Date(a.date) - new Date(b.date)
  })
}

export const cleanWrongPoints = points => {
  const validPoints = []
  for (let i = 1; i < points.length; i++) {
    const previousPoint = points[i - 1]
    const point = points[i]
    let shouldAdd = true
    if (Math.abs(point.latitude - previousPoint.latitude) > 5) shouldAdd = false
    if (shouldAdd) validPoints.push(point)
  }
  return validPoints
}

export const cleanDuplicatedPoints = points => {
  const nonDuplicatedPoints = []
  for (let i = 0; i < points.length; i++) {
    const point = points[i]
    let exists = false
    for (let j = 0; j < nonDuplicatedPoints.length && !exists; j++) {
      const nonDuplicatedPoint = nonDuplicatedPoints[j]
      if (nonDuplicatedPoint.latitude === point.latitude && nonDuplicatedPoint.longitude === point.longitude) exists = true
    }
    if (!exists) nonDuplicatedPoints.push(point)
  }
  return nonDuplicatedPoints
}

export const cleanPoints = points => {
  const cleanedPoints = cleanDuplicatedPoints(points)
  return cleanWrongPoints(cleanedPoints)
}
