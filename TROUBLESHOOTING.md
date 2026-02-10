# Troubleshooting Guide - Book Community Platform

This guide addresses common issues you might encounter when running the application.

## 🔴 **Problem: Recurring errors every time I start the app**

### Root Causes:
1. **Outdated Node.js version** (Most common)
2. **Missing or corrupted dependencies**
3. **Port conflicts**
4. **Database connection issues**

### Solutions:

#### 1️⃣ **Update Node.js** (HIGHLY RECOMMENDED)

Your current version: **20.18.0**  
Required version: **20.19+ or 22.12+**

**How to upgrade:**
1. Download the latest LTS version from [nodejs.org](https://nodejs.org/)
2. Run the installer (it will replace your current version)
3. Restart your terminal/PowerShell
4. Verify: `node --version`

**Why this matters:**
- Vite (the frontend build tool) requires newer Node.js features
- Outdated versions cause unpredictable errors
- This is the #1 cause of recurring issues

---

#### 2️⃣ **Use the Startup Scripts**

Instead of running `npm start` and `npm run dev` manually, use the automated scripts:

**Option A: PowerShell Script (Recommended)**
```powershell
.\start.ps1
```

**Option B: Batch File (If PowerShell blocked)**
```cmd
start.bat
```

**What these scripts do:**
- ✅ Check if Node.js is installed
- ✅ Verify environment configuration
- ✅ Auto-install dependencies if missing
- ✅ Start both servers automatically
- ✅ Show clear error messages

---

#### 3️⃣ **Clean Install Dependencies**

If you still get errors, try a fresh install:

```powershell
# Backend
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install

# Frontend
cd ../web
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

---

## 🔴 **Problem: "Cannot find module" errors**

### Solution:
```bash
# In the folder showing the error (backend or web)
npm install
```

This happens when:
- Dependencies are missing
- `node_modules` folder was deleted
- `package.json` was updated

---

## 🔴 **Problem: "Port 5000 already in use"**

### Solution:

**Find what's using the port:**
```powershell
netstat -ano | findstr :5000
```

**Kill the process:**
```powershell
taskkill /PID <PID_NUMBER> /F
```

**Alternative: Change the port**
Edit `backend\.env`:
```
PORT=5001
```

---

## 🔴 **Problem: "Database connection failed"**

### Solutions:

1. **Check if SQL Server is running:**
   - Open "Services" (Win + R, type `services.msc`)
   - Look for "SQL Server (SQLEXPRESS)"
   - If stopped, right-click → Start

2. **Verify credentials in `.env`:**
   ```
   DB_USER=sa
   DB_PASSWORD=your_actual_password  ← Make sure this is correct!
   DB_SERVER=localhost\SQLEXPRESS
   DB_NAME=BookCommunityDB
   ```

3. **Test database connection:**
   - Open SQL Server Management Studio (SSMS)
   - Try connecting with the same credentials
   - If it fails, your password is wrong

---

## 🔴 **Problem: Frontend shows blank/white page**

### Solutions:

1. **Check browser console:**
   - Press F12 in browser
   - Look at Console tab
   - Look for error messages

2. **Common causes:**
   - Backend not running (start it first!)
   - Wrong API URL in frontend
   - CORS issues

3. **Verify backend is running:**
   ```
   curl http://localhost:5000/api/books
   ```

---

## 🔴 **Problem: "vite: command not found" or Vite errors**

### Solution:

**Upgrade Node.js first** (see #1 above), then:

```bash
cd web
Remove-Item -Recurse -Force node_modules
npm install
```

---

## 🔴 **Problem: Changes not showing in browser**

### Solutions:

1. **Hard refresh the page:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data
   - Select "Cached images and files"

3. **Check if Vite is watching files:**
   - Look at the terminal running `npm run dev`
   - Should see "page reload" or "hmr update" messages

---

## 🔴 **Problem: PowerShell won't run .ps1 scripts**

### Error:
```
.\start.ps1 : File cannot be loaded because running scripts is disabled on this system.
```

### Solutions:

**Option 1: Use the batch file instead**
```cmd
start.bat
```

**Option 2: Allow PowerShell scripts (one-time)**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📋 **Daily Startup Checklist**

Before you start working:

- [ ] Is Node.js version 20.19+ or 22.12+?
- [ ] Is SQL Server running?
- [ ] Are you in the project root folder?
- [ ] Run `.\start.ps1` or `start.bat`
- [ ] Wait for both servers to start
- [ ] Open browser to the frontend URL

---

## 🆘 **Still Having Issues?**

### Collect this information:

1. **Node.js version:**
   ```bash
   node --version
   ```

2. **npm version:**
   ```bash
   npm --version
   ```

3. **Error messages:**
   - Full error text from terminal
   - Browser console errors (F12 → Console)

4. **What you were doing:**
   - Which command caused the error?
   - What page were you on?

### Reset Everything (Nuclear Option)

If all else fails:

```powershell
# Delete all dependencies
Remove-Item -Recurse -Force backend\node_modules
Remove-Item -Recurse -Force web\node_modules
Remove-Item -Force backend\package-lock.json
Remove-Item -Force web\package-lock.json

# Restart SQL Server
Restart-Service MSSQL$SQLEXPRESS

# Fresh install
.\start.ps1
```

---

## 🎯 **Prevention Tips**

1. **Always upgrade Node.js to latest LTS**
2. **Use the startup scripts, not manual commands**
3. **Don't modify `node_modules` manually**
4. **Keep `package.json` and `package-lock.json` in sync**
5. **Restart both servers after pulling updates**
6. **Check the README.md for latest setup instructions**

---

**Last Updated:** 2026-02-02
