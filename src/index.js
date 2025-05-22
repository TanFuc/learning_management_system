import express from 'express';
import handlebars from 'express-handlebars';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import moment from 'moment';
import cookieParser from 'cookie-parser';
import route from './routes/index.js';
import authMiddleware from './middleware/auth.js';
import { connectDB } from './utils/db.js';

// .env
dotenv.config();

// Khai báo
const port = process.env.PORT || 3000;

// Tạo instance của Express
const app = express();
const __dirname = path.resolve('src');

// Kết nối DB
await connectDB();

// Cấu hình files
app.use(cookieParser());
app.use(authMiddleware);
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());
app.use(methodOverride('_method'));

// HTTP logger
// app.use(morgan('combined'));

// Template engine
app.engine(
  'hbs',
  handlebars.engine({
    extname: '.hbs',
    helpers: {
      join: (arr) => arr?.join(', ') || '',
      formatDate: (date) => moment(date).format('DD/MM/YYYY'),
      isActive: function (currentUrl, linkUrl, options) {
        return currentUrl === linkUrl ? 'active' : '';
      },
      eq: function (a, b) {
        return String(a) === String(b);
      },
      inc: (value) => parseInt(value) + 1,
      trimText: function (text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
      },
      ifEquals: function (arg1, arg2, options) {
        return arg1 === arg2 ? options.fn(this) : options.inverse(this);
      },
      range: (start, end) => {
        let arr = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
      },
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      gt: (a, b) => a > b,
      lt: (a, b) => a < b,
      isWatched: function (watchedList, lessonId, options) {
        if (watchedList.includes(lessonId.toString())) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      formatCurrency: function (value) {
        return value.toLocaleString('vi-VN') + 'đ';
      },
      isPaid(price, options) {
        if (price > 0) {
          return options.fn(this);
        } else {
          return options.inverse(this);
        }
      },
      includes: function (array, value) {
        return array && array.includes(value.toString());
      },
    },
  }),
);
app.set('view engine', 'hbs');

// Cấu hình đường dẫn views
app.set('views', path.join(__dirname, 'resources', 'views'));

// Route
route(app);

// Khởi động server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
