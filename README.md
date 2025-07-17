📘 Learning Management System
A web-based platform for managing online courses, lesson groups, and lessons. Designed for admins and teachers to create, update, and organize educational content efficiently.

🚀 Features
User Authentication with JWT

Role-based Access Control (Admin, Teacher, Student)

Course Management (Create, Edit, Delete, Restore)

Lesson Group & Lesson Management

Soft delete & permanent delete

Admin dashboard built with Handlebars + Bootstrap

RESTful API using Node.js, Express.js, and MongoDB

🧪 Tech Stack
Backend: Node.js, Express.js, MongoDB, Mongoose

Frontend: Handlebars (hbs), Bootstrap 5

Authentication: JWT (JSON Web Token)

Database: MongoDB Atlas (or Local MongoDB)

Templating Engine: Handlebars

🔑 Admin Account
Use the following credentials to login as Admin:

Email: bibiqn77@gmail.com

Password: 123123

📁 Project Structure
learning_management_system/
├── config/               # DB and JWT config
├── controllers/          # Controllers for auth, courses, lessons
├── middleware/           # Auth & access control
├── models/               # Mongoose schemas (User, Course, Lesson...)
├── public/               # Static files (CSS, JS, images)
├── routes/               # Route declarations
├── utils/                # Helper functions
├── views/                # Handlebars templates
├── .env                  # Environment variables
├── app.js                # Main Express app
└── README.md             # Project documentation
⚙️ Setup Instructions
1. Clone the repo
git clone https://github.com/your-username/learning_management_system.git
cd learning_management_system
2. Install dependencies
npm install
3. Run the project
npm start

🧪 Example API Endpoints
Method	Endpoint	Description
GET	/courses	Get all public courses
POST	/courses/create	Create new course (Admin/Teacher)
PUT	/courses/:id/edit	Update course
DELETE	/courses/:id/delete	Soft delete course
GET	/admin/courses/trash	View trashed courses
DELETE	/courses/:id/force	Permanently delete course

🔐 Authentication Flow
Login Page: /login

JWT is stored in cookies

Middleware authMiddleware.js checks token for protected routes

💻 Screenshots
(Add screenshots of your project UI here if available)

📌 TODO
 User authentication

 Admin dashboard

 Course CRUD

 Lesson group & lesson features

 File upload for lessons

 Student view and enrollment system

🤝 Contributing
Fork the project

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📧 Contact
Nguyễn Tấn Phúc
Email: nguyentannphuc@gmail.com
