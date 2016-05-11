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
  if(!req.params.slug) return next(new Error('No Experiment selected'));
  req.models.Quiz.findOne({slug : req.params.slug}, function(err, quiz){
    if(err) return next(new Error(err));
    req.session.quiz = quiz;
  }).exec().then(function(quiz){
    req.models.Task.find({quiz_id: quiz._id}, function(err, ts) {
    }).exec().then(function(ts) {
      req.session.quiz.tasks = ts;
      res.render('register', {quiz: req.session.quiz});
    });
  });
};

/*
 * Post Register route.
 */
exports.add = function(req, res, next) {
  var participant, arr, i;
  participant = new req.models.Participant({
    institution             : {
      university            : req.body.institution,
      course                : req.body.course,
      award                 : req.body.award,
      level                 : req.body.level
    },
    gender                  : req.body.gender,
    age                     : req.body.age,
    disability              : req.body.disability
  });
  participant.save(function(err, p) {
    if (err) return next(new Error(err));
    return p;
  }).then(function (p) {
    req.session.participant = p;
    if(req.session.quiz.randomize){
      arr = req.session.quiz.tasks;
      for (i = 0; i < arr.length; i++) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
      }
      req.session.quiz.tasks = arr;
    }
  }).then(function() {
    var quiz_record = new req.models.QuizRecord({
      quiz_id : req.session.quiz._id,
      participant_id : req.session.participant._id
    });
    quiz_record.save(function(err) {
      if (err) return next(new Error(err))
    })
    res.redirect('/exp/' + req.session.quiz.slug + '/task/1');
  })
};

/*
 * GET Participant task route.
 */
exports.task =  function(req, res, next){
  var quiz, slug, num, response;
  if(!req.session.quiz || !req.params.slug) return next(new Error('Session is lost'));
  quiz = req.session.quiz;
  if(!req.params.num) return next(new Error('No task selected'));
  num = Number(req.params.num);
  if(num <= req.session.quiz.tasks.length){
    res.render('quiz/task', {quiz: req.session.quiz, task: req.session.quiz.tasks[num - 1], num: num});
  }
  else {
    res.redirect('/');
  }
};

/*
 * GET Answer route
 */
exports.answer = function(req, res, next) {
  var response, num;
  if(!req.params.res) return next(new Error('No Answer selected'));
  if(!req.params.num) return next(new Error('No task selected'));
  if(!req.session.quiz) return next(new Error('Session lost'));
  num = Number(req.params.num);
  response = Number(req.params.res);
  if(req.params.res !== 'timedout'){
    req.models.QuizRecord.findOne({quiz_id: req.session.quiz._id, participant_id: req.session.participant._id},
    function(err, quizRecord) {
      if (err) return next(new Error(err));
      quizRecord.task_record.push({
        task_id        : req.session.quiz.tasks[num - 1]._id,
        response       : req.session.quiz.tasks[num - 1].responses[Number(response)],
        response_num   : Number(response) + 1
      });
      quizRecord.save(function(err) {
        if (err) return next(new Error(err));
      })
      res.redirect('/exp/' + req.session.quiz.slug + '/task/' + (num + 1));
    });
  } else {
    req.models.QuizRecord.findOne({quiz_id: req.session.quiz._id, participant_id: req.session.participant._id},
    function(err, quizRecord) {
      if (err) return next(new Error(err));
      quizRecord.task_record.push({
        task_id        : req.session.quiz.tasks[num - 1]._id,
        response       : 'Timed Out',
        response_num   : -1
      });
      quizRecord.save(function(err) {
        if (err) return next(new Error(err));
      });
    });
    res.redirect('/exp/' + req.session.quiz.slug + '/task/' + (num + 1));
  }
};
