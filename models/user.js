var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    set: function(value) {return value.trim().toLowerCase()}
  },
  password: String,
  admin: {
    type: Boolean,
    default: false
  }
});

userSchema.statics.list = function(callback){
  return this.find({}, null, {sort: {_id:-1}}, callback).limit(50);
};

module.exports = mongoose.model('User', userSchema);
