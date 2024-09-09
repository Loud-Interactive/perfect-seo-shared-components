

export const urlSanitization = (url: string): string => {
  return url?.replaceAll("https://", "").replaceAll("http://", "").replaceAll("www.", "").replaceAll("/", "").toLowerCase()
}


export const findUniqueKeys = (newObj, oldObj) => {
  let keys = Object.keys(newObj)
  let finalObj = keys.reduce((prev, curr) => {
    if (newObj[curr] !== oldObj[curr]) {
      return ({ ...prev, [curr]: newObj[curr] })
    }
    else {
      return prev
    }
  }, {})
  return finalObj
}

export const getAverage = (arr: number[]) => {
  let quantity = arr.length;
  let sum = arr.reduce((prev, curr) => prev + curr, 0)

  return sum / quantity
}


export const convertArrayToObject = (arr: any[]) => {
  let obj = arr.reduce((prev, curr) => {
    return ({ ...prev, [curr.key]: curr.value })
  }, {})
  return obj
}
