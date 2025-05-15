import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authCheck = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (decoded.role !== 'teacher') {
      return res.redirect('/teacher');
    } else {
      return res.redirect('/courses');
    }

    next();
  } catch (err) {
    return res.redirect('/login');
  }
};

export default authCheck;
