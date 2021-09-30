const camelCaseFromHypencase = (str) => {
  return str.replace(/\b-([a-z])/g, (_, char) => char.toUpperCase())
}

const camelCaseToHypencase = (v) => {
  let ret = '',
    prevLowercase = false,
    prevIsNumber = false
  for (let s of v) {
    const isUppercase = s.toUpperCase() === s
    const isNumber = !isNaN(s)
    if (isNumber) {
      if (prevLowercase) {
        ret += '-'
      }
    } else {
      if (isUppercase && (prevLowercase || prevIsNumber)) {
        ret += '-'
      }
    }
    ret += s
    prevLowercase = !isUppercase
    prevIsNumber = isNumber
  }
  return ret.replace(/-+/g, '-').toLowerCase()
}

const isJsonString = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

const shortener = (string, prefix = 6, suffix = 4, sym = '...') => {
  if (!string) return ''

  if (string.length < 11) return string

  // str.replace(str.substring(6,9), '...')
  const strLength = string.length
  const substring = string.substring(prefix, strLength - suffix)
  const result = string.replace(substring, sym)
  return result
}

module.exports = {
  camelCaseFromHypencase,
  shortener,
  isJsonString,
  camelCaseToHypencase,
}
