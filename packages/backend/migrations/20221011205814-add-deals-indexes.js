const up = async (db, client) => {
  await db.collection('deals').createIndex({
    'State.SectorStartEpoch': -1,
    _id: -1
  })
  await db.collection('deals').createIndex({
    'State.SectorStartEpoch': 1,
    _id: -1
  })
  await db.collection('deals').createIndex({
    'State.SectorStartEpoch': 1,
    _id: 1
  })
}

const down = async (db, client) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
module.exports = { up, down }
