var mongoose = require('mongoose');

var taskRecordSchema = new mongoose.Schema(
  {
    participant_id   : String,
    answer     : String
  }
);

module.exports = mongoose.model('TaskRecord', taskRecordSchema);
