exports.user = require('./user');
exports.participant = require('./participant')
exports.quiz = require('./quiz');

exports.index = function(req, res, next){
  res.render('index');
};
