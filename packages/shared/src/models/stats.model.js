const mongoose = require('mongoose');
const { Schema } = mongoose

const schema = {
  _id: { type: Number },
  numberOfUniqueClients: { type: Number },
  numberOfUniqueProviders: { type: Number },
  numberOfUniqueCIDs: { type: Number },
  totalDealSize: { type: Number },
  totalDeals: { type: Number },
  latestHeight: { type: Number },
}
const StatsSchema = new Schema(schema, { _id: false });

module.exports = mongoose.model('Stats', StatsSchema);
