import express from 'express';
import handlebars from 'express-handlebars';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// .env
dotenv.config();

// Khai báo
const port = process.env.PORT || 3000;

// Tạo instance của Express
const app = express();
const __dirname = path.resolve('src'); 


app.use(express.static(path.join(__dirname, 'public')));
// HTTP logger
app.use(morgan('combined'));

// Template engine
app.engine('hbs', handlebars.engine({
  extname: '.hbs',
}));
app.set('view engine', 'hbs');

// Cấu hình đường dẫn views
app.set('views', path.join(__dirname, 'resources', 'views'));

// Route
app.get('/', (req, res) => {
  res.render('home');
});

// Khởi động server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
