var mongoose = require('mongoose');

var quizRecordSchema = new mongoose.Schema(
  {
    quiz_id          : {type: mongoose.Schema.Types.ObjectId, ref: 'Quiz'},
    participant_id   : {type: mongoose.Schema.Types.ObjectId, ref: 'Participant'},
    task_record      : [{
      task_id        : {type: mongoose.Schema.Types.ObjectId, ref: 'Task'},
      response       : String,
      response_num   : Number
    }]
  }
);

module.exports = mongoose.model('QuizRecord', quizRecordSchema);
