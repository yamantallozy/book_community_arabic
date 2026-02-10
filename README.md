# Book Community Platform (Arabic)

A full-stack book discussion community platform supporting Arabic RTL text, built with React (web), React Native (mobile), and Node.js backend with MSSQL database.

## 🚀 Quick Start

### Prerequisites
- **Node.js 20.19+ or 22.12+** ([Download here](https://nodejs.org/))
- **SQL Server Express** (for Windows)
- **npm** (comes with Node.js)

### First-Time Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd book_community
   ```

2. **Configure backend environment**
   - Navigate to `backend` folder
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`:
     ```
     PORT=5000
     DB_USER=sa
     DB_PASSWORD=your_actual_password
     DB_SERVER=localhost\SQLEXPRESS
     DB_NAME=BookCommunityDB
     JWT_SECRET=mysecretkey12345
     ```

3. **Run the startup script**
   ```powershell
   .\start.ps1
   ```

   The script will:
   - ✅ Check your Node.js version
   - ✅ Verify backend configuration
   - ✅ Install dependencies if needed
   - ✅ Start both backend and frontend servers

### Manual Start (Alternative)

If you prefer to start servers manually:

**Backend:**
```bash
cd backend
npm install  # Only needed first time or after package.json changes
npm start
```

**Frontend:**
```bash
cd web
npm install  # Only needed first time or after package.json changes
npm run dev
```

## 📁 Project Structure

```
book_community/
├── backend/          # Node.js + Express API
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth, RBAC, validation
│   ├── routes/       # API endpoints
│   ├── scripts/      # Database migrations & utilities
│   └── .env         # Environment variables (not in git)
├── web/             # React web application
│   └── src/
│       ├── components/
│       ├── pages/
│       └── utils/
└── mobile/          # React Native mobile app (WIP)
```

## 🔑 Key Features

- **User Authentication** (Register, Login, JWT)
- **Role-Based Access Control** (Super Admin, Admin, User)
- **Book Management** with moderation workflow (Pending → Approved/Rejected)
- **Reviews & Ratings** with nested replies
- **User Profiles** with avatar upload
- **Arabic RTL Support** throughout the platform
- **Advanced Book Filters** (genre, language, length, etc.)
- **Reading Shelves** (Currently Reading, Read, Want to Read)

## 🛠️ Troubleshooting

### "Failed to start" errors

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be 20.19+ or 22.12+. If not, upgrade from [nodejs.org](https://nodejs.org/)

2. **Check if ports are in use:**
   - Backend uses port **5000**
   - Frontend uses port **5173** (or next available)
   
   If port 5000 is in use:
   ```powershell
   # Find process using port 5000
   netstat -ano | findstr :5000
   # Kill the process (replace PID with actual process ID)
   taskkill /PID <PID> /F
   ```

3. **Database connection issues:**
   - Verify SQL Server is running
   - Check credentials in `backend\.env`
   - Ensure database `BookCommunityDB` exists

4. **Missing dependencies:**
   ```bash
   # Delete node_modules and reinstall
   cd backend
   rm -r node_modules
   npm install
   
   cd ../web
   rm -r node_modules
   npm install
   ```

### Common Errors

**"Cannot find module"**
- Run `npm install` in the respective folder (backend or web)

**"Port already in use"**
- Another process is using the port. Kill it or change the port in `.env`

**"Database connection failed"**
- Verify SQL Server is running
- Check database credentials in `.env`

## 📝 Development Workflow

1. **Make changes** to code
2. **Test locally** using the startup script
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

## 🌐 Deployment

### Frontend (GitHub Pages)
```bash
cd web
npm run build
npm run deploy
```

### Backend
Deploy to your preferred Node.js hosting (Heroku, DigitalOcean, AWS, etc.)

## 📚 API Documentation

Backend runs on `http://localhost:5000`

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update profile

### Books
- `GET /api/books` - Get all books (with filters)
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create new book (Auth required)
- `PUT /api/books/:id` - Update book (Admin/Creator)
- `DELETE /api/books/:id` - Delete book (Admin)

### Reviews
- `GET /api/reviews/book/:bookId` - Get book reviews
- `POST /api/reviews` - Create review (Auth required)
- `POST /api/reviews/:id/reply` - Reply to review

## 👥 Roles & Permissions

- **User**: Read books, write reviews, manage own profile
- **Admin**: Moderate books, manage users, edit content
- **Super Admin**: Full system access, manage all admins

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is private and confidential.

---

**Need help?** Check the troubleshooting section above or contact the development team.
