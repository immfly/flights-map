import { isObject } from './object'

const equalArrays = (array1, array2) => {
  if (!array1 || !array2) return false
  if (array2.length !== array1.length) return false
  for (var i = 0, l = array2.length; i < l; i++) {
    if (array2[i] instanceof Array && array1[i] instanceof Array && !equalArrays(array2[i], array1[i])) return false
    else if ((!isNaN(array2[i]) || (typeof array2[i] === 'string' || array2[i] instanceof String)) && array1[i] !== array2[i]) return false
    else if (!equalObject(array2[i], array1[i])) return false
  }

  return true
}

export const equalObject = (object1, object2) => {
  if ((!object1 && object2) || (!object2 && object1)) return false

  const keys = Object.keys(object1)
  for (const key of keys) {
    if (isObject(object1[key])) {
      if ((!isNaN(object1[key]) || (typeof object1[key] === 'string' || object1[key] instanceof String)) && object1[key] !== object2[key]) return false
      if (!equalObject(object1[key], object2[key])) return false
    } else if (Array.isArray(object1[key]) && !equalArrays(object1[key], object2[key])) return false
    else if (object1[key] !== object2[key]) return false
  }

  return true
}
