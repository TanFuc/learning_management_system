const HomeController = {
  // [GET] /
  index(req, res) {
    res.render('home', {
      user: req.user,
      currentUrl: req.originalUrl,
    });
  },

  // [GET] /login
  login(req, res) {
    res.render('login');
  },

  // [GET] /register
  register(req, res) {
    res.render('register');
  },

  // [GET] /contact
  contact(req, res) {
    res.render('contact', {
      currentUrl: req.originalUrl,
    });
  },

  // [GET] /about
  about(req, res) {
    res.render('about', {
      currentUrl: req.originalUrl,
    });
  },

  // [GET] /forgot-password
  forgotPassword(req, res) {
    res.render('forgot-password');
  },
};

export default HomeController;
