import express from 'express';
import handlebars from 'express-handlebars';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import methodOverride from 'method-override';
import moment from 'moment';

import route from './routes/index.js';
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
