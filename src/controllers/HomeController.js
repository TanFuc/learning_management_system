const HomeController = {
  // [GET] /
  index(req, res) {
    res.render('home/index', {
      user: req.user,
      currentUrl: req.originalUrl,
    });
  },

  // [GET] /login
  login(req, res) {
    const redirectUrl = req.query.redirect || '/';
    const token = req.cookies?.token;

    if (token) {
      return res.redirect(redirectUrl);
    }

    res.render('users/login', { redirectUrl });
  },

  // [GET] /register
  register(req, res) {
    res.render('users/register');
  },

  // [GET] /contact
  contact(req, res) {
    res.render('home/contact', {
      currentUrl: req.originalUrl,
    });
  },

  // [GET] /about
  about(req, res) {
    res.render('home/about', {
      currentUrl: req.originalUrl,
    });
  },

  // [GET] /forgot-password
  forgotPassword(req, res) {
    res.render('users/forgot-password');
  },
};

export default HomeController;
