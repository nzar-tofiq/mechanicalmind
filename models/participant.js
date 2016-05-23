var mongoose = require('mongoose');
var participantSchema = new mongoose.Schema(
  {
    institution             : {
      university            : String,
      course                : String,
      award                 : String,
      level                 : Number
    },
    gender                  : String,
    age                     : Number,
    disability              : String,
    group                   : {
      type                  : String,
      default               : 'A'
    },
    date                    : {
      type                  : Date,
      default               : Date.now
    }
  }
);

module.exports = mongoose.model('Participant', participantSchema, 'Participant')
