# OptiCode - Web Technology Mini Project

OptiCode is a web-based code optimization platform for students and developers. It analyzes source code, detects basic inefficiencies, estimates rough complexity, and suggests cleaner coding practices.

## Features
- User registration and login system
- Session-based authentication
- Protected analyzer dashboard
- Multi-language support: C, C++, Java, Python, JavaScript
- Optimization score out of 100
- Basic issue detection and smart suggestions
- Before vs optimized code comparison
- Dark/light mode toggle

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Authentication: Custom session handling using cookies
- Storage: JSON file for demo users

## How to Run
1. Open terminal in the project folder
2. Run:
   ```bash
   npm install
   npm start
   ```
3. Open in browser:
   ```
   http://localhost:3000
   ```

## Demo Flow
1. Register a new user account
2. Log in with the same credentials
3. Load sample code or paste your own
4. Click **Analyze Code**
5. Review score, issues, suggestions, and optimized code

## Project Structure
- `server.js` - Express backend and authentication APIs
- `public/login.html` - Login and registration page
- `public/app.html` - Main analyzer dashboard
- `public/auth.js` - Frontend login/register logic
- `public/script.js` - Analyzer frontend logic
- `public/style.css` - Styling for both pages
- `data/users.json` - Demo user storage

## Important Note
This project uses pattern-based analysis, so it is best presented as a working prototype. For advanced versions, you can later add:
- Database integration
- Password encryption library
- AI-based refactoring suggestions
- File upload and saved history
- Admin dashboard

## Viva Explanation
The login system improves the project by making it look like a real web application. Only authenticated users can access the code analyzer. This demonstrates form handling, backend validation, cookies, sessions, protected routes, and user flow management.
