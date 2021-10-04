const mongoose = require('mongoose');
const { Schema } = mongoose

const schema = {
  _id: { type: Number },
  height: { type: Number },
}
const StatusSchema = new Schema(schema, { _id: false });

module.exports = mongoose.model('Status', StatusSchema);
