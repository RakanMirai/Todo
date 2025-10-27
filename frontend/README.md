# Todo App - React Frontend

A modern React frontend for the FastAPI Todo application.

## Features

- 🔐 User authentication (login/register)
- ✅ Create, read, update, delete todos
- 🎨 Clean and responsive UI
- 🔄 Real-time updates
- 📱 Mobile-friendly design
- 🎯 Priority levels (low, medium, high)
- ✨ Filter todos by status

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- FastAPI backend running on http://localhost:8000

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to http://localhost:3000

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.js
│   │   │   └── Register.js
│   │   ├── Todo/
│   │   │   ├── TodoList.js
│   │   │   ├── TodoItem.js
│   │   │   └── TodoForm.js
│   │   └── Layout/
│   │       ├── Header.js
│   │       └── Navbar.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── App.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Usage

1. **Register a new account** or use existing credentials
2. **Login** to access your todos
3. **Create todos** with title, description, and priority
4. **Mark todos as complete** by clicking the checkbox
5. **Edit or delete** todos as needed
6. **Filter** todos by completion status

## Environment Variables

The app expects the backend API to be running on `http://localhost:8000`.
To change this, modify the `API_URL` in `src/services/api.js`.

## Available Scripts

- `npm start` - Run the development server
- `npm build` - Build for production
- `npm test` - Run tests

## Default Admin Account

- Username: `admin`
- Password: `admin123`

⚠️ Change this password in production!
