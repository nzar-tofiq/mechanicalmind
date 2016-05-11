/*
 * GET Register route.
 */
exports.register = function(req, res, next) {
  res.render('a');
};

/*
 * GET Admin Page
 */
exports.admin= function(req, res){
  res.render('admin');
};

/*
 * GET login page.
 */
exports.login = function(req, res, next) {
  res.render('login');
};

/*
 * GET users listing.
 */
exports.list = function(req, res){
  req.models.User.list(function(err, users) {
    if (err) return next(new Error(err));
    res.send({users: users});
  });
};

/*
 * GET logout route.
 */
exports.logout = function(req, res, next) {
  req.session.destroy();
  res.redirect('/');
};

/*
 * Post Register route.
 */
exports.add = function(req, res, next) {
  if (!req.body.email || !req.body.password)
    res.render('register', {err: 'No email or password'});
  var user = new req.models.User({
    email: req.body.email,
    password: req.body.password,
    admin: true
  });
  user.save(function(err, userResponse) {
    if (err) return next(new Error(err));
    res.redirect('admin');
  });
};

/*
 * POST authenticate route.
 */
exports.authenticate = function(req, res, next) {
  req.models.User.findOne({ email: req.body.email }, function(err, user) {
    if (!user) res.render('login', { err: 'Invalid email or password.' });
    else {
      if (req.body.password === user.password) {
        // sets a cookie with the user's info
        req.session.admin = user.admin;
        req.session.userid = user._id
        res.redirect('/admin');
      } else {
        res.render('login', { err: 'Invalid email or password.' });
      }
    }
  });
};
