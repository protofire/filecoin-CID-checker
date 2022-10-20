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

module.exports = {
  FILECOIN_GENESIS_UNIX_EPOCH,
  heightToUnix,
  heightToDate
}