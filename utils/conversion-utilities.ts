

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