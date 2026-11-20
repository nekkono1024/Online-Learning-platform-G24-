const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Point Express to your "view" folder (singular)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// Middleware to parse form data (helpful for login and Adds pages)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Optional: serve static files (CSS, client JS, images) from a "public" folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'comp3810-secret-key', // Secret key
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // Session valid for 1 hour
}));

//Replace this with actual DB queries later
const Users = [
    { username: 'student', password: '123', role: 'student' },
    { username: 'teacher', password: '123', role: 'teacher' }
];

// Ensure only logged-in users can access
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        next(); 
    } else {
        res.redirect('/login'); 
    }
}

// 2. Routes for all your EJS files
app.get('/', (req, res) => {
  res.render('/login');
});

//make a bit change on here 
app.get('/login', (req, res) => {
    // If already logged in, redirect based on role
    if (req.session.user) {
        return res.redirect(req.session.user.role === 'teacher' ? '/teacher' : '/student');
    }
    res.render('login', { error: null });
});

// Handle login form (POST)
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Find matching credentials
    const user = Users.find(u => u.username === username && u.password === password);

    if (user) {
        // Login successful: write to Session
        req.session.user = { username: user.username, role: user.role };
        
        // Redirect based on role
        if (user.role === 'teacher') {
            res.redirect('/teacher');
        } else {
            res.redirect('/student');
        }
    } else {
        // Login failed
        res.render('login', { error: 'Incorrect username or password!' });
    }
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/login');
    });
});
//only after login can check the page
// Student page (only accessible by students)
app.get('/student', isLoggedIn, (req, res) => {
    if (req.session.user.role !== 'student') return res.redirect('/login');
    res.render('student', { user: req.session.user }); // Pass user to EJS for display
});

// Teacher page (only accessible by teachers)
app.get('/teacher', isLoggedIn, (req, res) => {
    if (req.session.user.role !== 'teacher') return res.redirect('/login');
    res.render('teacher', { user: req.session.user });
});

app.get('/assignment', (req, res) => {
  res.render('assignment');
});

app.get('/adds', (req, res) => {
  res.render('Adds'); // Matches "Adds.ejs" in your view folder
});

app.get('/nav', (req, res) => {
  res.render('nav');
});

app.get('/grades', (req, res) => {
  res.render('Grades');
});

app.get('/update', (req, res) => {
  res.render('Update');
} );

app.get('/delete', (req, res) => {
  res.render('Delete');
});

// 3. Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
