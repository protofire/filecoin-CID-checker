const up = async (db) => {
  await db.collection('deals').createIndex({
    'Proposal.PieceCID': 1,
  })
  await db.collection('deals').createIndex({
    'Proposal.Label': 1,
  })
  await db.collection('deals').createIndex({
    'Proposal.Provider': 1,
  })
  await db.collection('deals').createIndex({
    'Proposal.Client': 1,
  })
}

const down = async (/*db, client*/) => {
  // TODO write the statements to rollback your migration (if possible)
  // Example:
  // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
}
module.exports = { up, down }
