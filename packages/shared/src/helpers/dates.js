// https://observablehq.com/@protocol/filecoin-epoch-calculator

const FILECOIN_GENESIS_UNIX_EPOCH = 1598306400

function heightToUnix (filEpoch) {
  return (filEpoch * 30) + FILECOIN_GENESIS_UNIX_EPOCH
}

function heightToDate (inputHeight) {
  const d = new Date()
  d.setTime(heightToUnix(inputHeight) * 1000)
  return d
}

function dateToHeight (inputDate = new Date()) {
  const unixEpoch = inputDate.getTime() / 1000
  const result = Math.floor((unixEpoch - FILECOIN_GENESIS_UNIX_EPOCH) / 30)
  return result
}

module.exports = {
  FILECOIN_GENESIS_UNIX_EPOCH,
  heightToUnix,
  heightToDate,
  dateToHeight
}