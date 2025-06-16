import jwt from 'jsonwebtoken';

function isTeacher(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'teacher') {
      return res.status(403).render('errors/403', {
        error: 'Bạn không có quyền truy cập trang giáo viên',
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.redirect('/login');
  }
}

export default isTeacher;
