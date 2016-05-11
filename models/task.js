var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema(
  {
    quiz_id  : {type: mongoose.Schema.Types.ObjectId, ref : 'Quiz'},
    text     : String,
    img      : String,
    responses: [String],
    solution : Number
  },
  {
    collection : 'Task'
  }
);

module.exports = mongoose.model('Task', taskSchema, 'Task');
