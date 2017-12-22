let mongoose = require('mongoose');
let Schema = mongoose.Schema;

const TagSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  template: { type: Number },
  createdAt: { type: Date, default: Date.now},
  updatedAt: { type: Date, default: Date.now}
},{versionKey: false});

TagSchema.pre('save', function(next){
  const now = new Date();
  this.updatedAt = now;
  next();
});

module.exports = mongoose.model('tag',TagSchema);