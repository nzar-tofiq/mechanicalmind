// http://mongoosejs.com/docs/populate.html
var mongoose = require('mongoose');

var experimentSchema = new mongoose.Schema(
  {
    slug          : {
      type        : String,
      set         : function(value){return value.toLowerCase().replace(' ', '-')},
      validate    : [function(value) {return value.length<=120}, 'Slug is too long (120 max)']
    },
    owner_id       : {
      type        : String,
      required    : true
    },
    css_path       : {
      type        : String,
      set         : function(value){return value.toLowerCase().replace(' ', '-')}
    },
    img_path       : {
      type        : String,
      set         : function(value){return value.toLowerCase().replace(' ', '-')}
    },
    data_path      : {
      type        : String,
      set         : function(value){return value.toLowerCase().replace(' ', '-')}
    },
    title         : {
      type        : String,
      validate    : [function(value) {return value.length<=120}, 'Title is too long (120 max)']
    },
    style         : String,
    timeout       : Number,
    show_timer     : {
      type        : Boolean,
      default     : false
    },
    randomize     : {
      type        : Boolean,
      default     : false
    },
    tasks         : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    images        : [String],
    published     : Boolean,
    date_created  : {
      type        : Date,
      default     : Date.now
    }
  },
  {
    collection : 'Quiz'
  }
);

experimentSchema.statics.list = function(callback){
  return this.find({}, null, {sort: {_id:-1}}, callback).limit(50);
};

module.exports = mongoose.model('Quiz', experimentSchema, 'Quiz');
