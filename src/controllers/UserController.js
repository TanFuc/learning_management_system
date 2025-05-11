export const UserController = {
  index(req, res) {
    res.render('login');
  },

  login(req, res) {
    const { username, password } = req.body;

    if (username === 'admin' && password === '12345') {
      res.send('Đăng nhập thành công');
    } else {
      res.send('Thông tin đăng nhập không chính xác');
    }
  },

  register(req, res) {
    res.render('register');
  },

  createUser(req, res) {
    const { username, password, email } = req.body;
    res.send(`Đăng ký thành công với tên người dùng: ${username}`);
  },
};
