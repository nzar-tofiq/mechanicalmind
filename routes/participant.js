'use strict'
/*
 * GET Participant listing.
 */
exports.list = function(req, res){
  req.models.Participant.list(function(err, users) {
    if (err) return next(new Error(err));
    res.render('approve', {users: users});
  });
};

/*
* GET Participant registration form
*/
exports.register = function(req, res, next){
  req.models.Quiz.findOne({'_id' : req.params.id}, function(err, q){
    if(err) return next(new Error(err));
    req.session.quiz = q;
    res.render('participant/register');
  });
};

/*
 * Post Register route.
 */
exports.add = function(req, res, next) {
  var participant, tasks, i;
  participant = new req.models.Participant({});
  participant.institution  = {
    university : req.body.institution,
    course     : req.body.course,
    award      : req.body.award,
    level      : req.body.level
  };
  participant.gender       = req.body.gender;
  participant.age          = req.body.age;
  participant.disability   = req.body.disability;

  participant.save(function(err, p) {
    if (err) return next(new Error(err));
    return p;
  }).then(function (p) {
    req.session.participant = p;
    if(req.session.quiz.randomize){
      tasks = req.session.quiz.tasks;
      for (i = 0; i < tasks.length; i++) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = tasks[i];
        tasks[i] = tasks[j];
        tasks[j] = temp;
      };
      req.session.quiz.tasks = tasks;
    };
    res.redirect('/participant/task/1');
  });
};

/*
 * GET Participant task route.
 */
exports.task =  function(req, res, next){
  var quiz, num, response;
  if(!req.session.quiz) return next(new Error('Session is lost'));
  quiz = req.session.quiz;
  if(!req.params.num) return next(new Error('No task selected'));
  num = Number(req.params.num);
  if(num < req.session.quiz.tasks.length){
    res.render('participant/task', {task: req.session.quiz.tasks[num - 1], num: num, quiz: req.session.quiz});
  } else {
    res.redirect('/');
  }
};

/*
 * GET Answer route
 */
exports.answer = function(req, res, next) {
  var tNum, taskNumber, taskRecord, task, quiz, taskNum;
  if(!req.params.res) return next(new Error('No Answer selected'));
  if(!req.params.num) return next(new Error('No task selected'));
  if(!req.session.quiz) return next(new Error('Session lost'));
  tNum = Number(req.params.num) - 1;
  taskRecord = new req.models.TaskRecord({
    participant_id : req.session.participant._id,
    answer : req.params.res
  });
  taskRecord.save();
  req.models.Task.findOne({'_id': req.session.quiz.tasks[tNum]._id}, function(err, t) {
    t.records.push(taskRecord);
    t.save();
    taskNumber = t.num - 1;
    req.models.Quiz.findById(req.session.quiz._id, function(err, q) {
      q.tasks[taskNumber] = t;
      q.save(function(err, doc) {
        console.log(doc.tasks[taskNumber]);
        res.redirect('/participant/task/' + Number(tNum + 2));
      });
    });
  });
};
