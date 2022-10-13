const mongoose = require('mongoose');
const { Schema } = mongoose

const schema = {
  _id: { type: Number },
  DealID: { type: Number },
  State: {
    SectorStartEpoch: { type: Number },
    LastUpdatedEpoch: { type: Number }
  },
  Proposal: {
    PieceCID: { type: Object },
    PieceSize: { type: Number },
    VerifiedDeal: { type: Boolean },
    Client: { type: String },
    Provider: { type: String },
    Label: { type: String },
    StartEpoch: { type: Number },
    EndEpoch: { type: Number },
    StoragePricePerEpoch: { type: String },
    ProviderCollateral: { type: String },
    ClientCollateral: { type: String }
  }
}
const DealsSchema = new Schema(schema, { _id: false });

module.exports = mongoose.model('Deals', DealsSchema);
