# 🚀 Quick Reference - Book Community Platform

## Daily Startup (3 Easy Steps)

1. **Open PowerShell in project root**
2. **Run the startup script:**
   ```powershell
   .\start.ps1
   ```
   OR
   ```cmd
   start.bat
   ```
3. **Done!** Both servers will start automatically

---

## URLs

- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:5173 (or check terminal for actual port)
- **GitHub Pages:** https://yamantallozy.github.io/book_community_arabic

---

## Important Files

| File | Purpose |
|------|---------|
| `start.ps1` | PowerShell startup script |
| `start.bat` | Batch file startup script (alternative) |
| `README.md` | Full project documentation |
| `TROUBLESHOOTING.md` | Solutions to common problems |
| `backend\.env` | Database credentials (SECRET - not in git) |
| `backend\.env.example` | Template for .env file |

---

## Common Commands

### Start Servers (Automated)
```powershell
.\start.ps1
```

### Start Servers (Manual)
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd web
npm run dev
```

### Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd web
npm install
```

### Deploy to GitHub Pages
```bash
cd web
npm run build
npm run deploy
```

### Check Node Version
```bash
node --version  # Should be 20.19+ or 22.12+
```

---

## Troubleshooting Quick Fixes

### ❌ Error: "Cannot find module"
```bash
npm install
```

### ❌ Error: "Port already in use"
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### ❌ Error: Vite version warning
**→ Upgrade Node.js from [nodejs.org](https://nodejs.org/)**

### ❌ Error: Database connection failed
1. Check SQL Server is running (services.msc)
2. Verify credentials in `backend\.env`

### ❌ Nothing works
```powershell
# Nuclear option - fresh install
Remove-Item -Recurse -Force backend\node_modules, web\node_modules
.\start.ps1
```

---

## Project Structure

```
book_community/
├── start.ps1              ← USE THIS to start!
├── start.bat              ← Alternative startup script
├── README.md              ← Full documentation
├── TROUBLESHOOTING.md     ← Problem solutions
├── backend/               ← Node.js API
│   ├── .env              ← Your DB credentials (SECRET)
│   ├── .env.example      ← Template
│   └── server.js         ← Entry point
└── web/                   ← React frontend
    └── src/
```

---

## API Endpoints Quick Reference

### Auth
- `POST /api/users/register` - Create account
- `POST /api/users/login` - Login
- `GET /api/users/profile/:id` - View profile

### Books
- `GET /api/books` - List all books
- `GET /api/books/:id` - Book details
- `POST /api/books` - Add book (Auth)
- `PUT /api/books/:id` - Edit book (Admin)

### Reviews
- `GET /api/reviews/book/:bookId` - Get reviews
- `POST /api/reviews` - Add review (Auth)
- `POST /api/reviews/:id/reply` - Reply to review

---

## User Roles

- 👤 **User** - Read, review, manage profile
- 👨‍💼 **Admin** - Moderate books, manage users
- 👑 **Super Admin** - Full system access

---

## Need Help?

1. Check **TROUBLESHOOTING.md** first
2. Search error in browser console (F12)
3. Verify Node.js version: `node --version`
4. Make sure SQL Server is running

---

**Pro Tip:** Bookmark this file for quick access! 📌
