const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    public_id: { type: String, default: ''},
    url: { type: String, default: ''},
    secure_url: { type: String, default: ''}
  }
});

module.exports = mongoose.model('Product', productSchema);