var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema(
  {
    num      : Number,
    text     : String,
    img      : String,
    responses: [String],
    solution : Number,
    records : Array
  }
);

module.exports = mongoose.model('Task', taskSchema);
