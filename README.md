# 📝 Online Exam Portal

A complete web-based examination system built with modern technologies, enabling administrators to create and manage exams while providing students with a seamless exam-taking experience.

## 🚀 Tech Stack

**Frontend:**

- React 18 with Vite[^1]
- Tailwind CSS for styling
- Axios for API calls
- React Router for navigation

**Backend:**

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

**Key Features:**

- Role-based access control (Admin/Student)
- Real-time exam timer with auto-submission
- Question bank management
- Responsive design for all devices[^2]

## ✨ Features

### Admin Features

- 🔐 **Secure Authentication** - Login/Register with JWT tokens
- ❓ **Question Management** - Create, edit, delete questions (MCQ, True/False, Short Answer)
- 📊 **Question Filtering** - Filter by subject, topic, and difficulty
- 📝 **Exam Creation** - Build exams by selecting questions from the bank
- 👥 **Student Management** - Assign exams to specific students
- 📈 **Results Tracking** - View and analyze exam results
- ⏰ **Exam Scheduling** - Set start/end times and duration

### Student Features

- 🎯 **Clean Dashboard** - View assigned and available exams
- ⏱️ **Real-time Timer** - Automatic submission when time expires
- 💾 **Auto-save** - Progress saved automatically during exam
- 🧭 **Easy Navigation** - Jump between questions with visual indicators
- 📱 **Mobile Responsive** - Take exams on any device
- 🔒 **Secure Exam Environment** - Prevents data loss and cheating

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/online-exam-portal.git
cd online-exam-portal
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Install Frontend Dependencies**[^1]
```bash
cd ../client  
npm install
```

4. **Environment Configuration**

Create `server/.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/exam-portal
JWT_SECRET=your_super_secret_jwt_key_here
PORT=5000
```

5. **Start the Application**

**Backend (Terminal 1):**

```bash
cd server
npm run dev
```

**Frontend (Terminal 2):**[^1]

```bash
cd client
npm run dev
```

6. **Access the Application**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📂 Project Structure

```
exam-portal/
├── client/                 # React frontend with Vite
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── admin/      # Admin-specific components
│   │   │   ├── student/    # Student-specific components
│   │   │   ├── auth/       # Authentication components
│   │   │   └── common/     # Shared components
│   │   ├── contexts/       # React Context (Auth)
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   ├── public/            # Static assets
│   └── vite.config.js     # Vite configuration
├── server/                # Node.js backend
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware
│   ├── controllers/       # Route controllers
│   └── server.js          # Entry point
└── README.md
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions (Admin Only)

- `GET /api/questions` - Get all questions with filters
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `GET /api/questions/metadata` - Get subjects/topics

### Exams

- `POST /api/exams` - Create exam (Admin)
- `GET /api/exams/admin` - Get all exams (Admin)
- `GET /api/exams/student` - Get student's exams
- `GET /api/exams/:id/take` - Get exam for taking
- `POST /api/exams/:id/submit` - Submit exam answers
- `GET /api/exams/:id/results` - Get exam results (Admin)

## 👥 User Roles

### Admin Account

- Create questions and exams
- Manage student assignments
- View results and analytics
- Full system access

### Student Account

- View assigned exams
- Take active exams
- Submit answers
- View personal results

## 🚦 Getting Started

1. **Create Admin Account**
    - Register with `role: "admin"`
    - Use Postman or modify registration form
2. **Add Questions**
    - Login as admin
    - Navigate to Questions tab
    - Create questions with different types and subjects
3. **Create Exam**
    - Go to Exams tab
    - Select questions from the bank
    - Set timing and assign to students
4. **Student Registration**
    - Students register normally (default role: "student")
    - Assigned exams appear on their dashboard

## 🔧 Development

### Available Scripts

**Backend:**

- `npm start` - Production server
- `npm run dev` - Development with nodemon

**Frontend:**[^1]

- `npm run dev` - Development server with Vite
- `npm run build` - Production build
- `npm run preview` - Preview production build

### Database Schema

**Users Collection:**

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (admin/student)
}
```

**Questions Collection:**

```javascript
{
  question: String,
  type: String (mcq/boolean/short),
  options: [String], // for MCQ
  correctAnswer: String,
  subject: String,
  topic: String,
  difficulty: String (easy/medium/hard),
  marks: Number
}
```

**Exams Collection:**

```javascript
{
  title: String,
  description: String,
  questions: [ObjectId],
  duration: Number, // minutes
  startTime: Date,
  endTime: Date,
  isActive: Boolean,
  assignedStudents: [ObjectId]
}
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based route protection
- Input validation and sanitization
- CORS configuration
- Secure HTTP headers

## 🎯 Future Enhancements

- [ ] Question categories and tagging
- [ ] Bulk question import (CSV/Excel)
- [ ] Advanced analytics and reporting
- [ ] Email notifications
- [ ] Proctoring features
- [ ] Mobile app with React Native
- [ ] Multi-language support
- [ ] Question difficulty analysis

**Made with ❤️ using React, Node.js, MongoDB, and Vite**[^1][^2]

[^1]: programming.build_tools

[^2]: programming.fullstack_development
