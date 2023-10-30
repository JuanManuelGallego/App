const express = require('express');
const session = require('express-session');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('images'));

let users = [];
if (fs.existsSync('users.json')) {
    users = JSON.parse(fs.readFileSync('users.json'));
}

app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: true,
    })
);

function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next(); 
    }
    res.redirect('/login'); 
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        req.session.isAuthenticated = true;
        res.redirect('/hello');
    } else {
        res.statusCode = 401; //Unauthorized
        res.send('Login failed. Please check your credentials and try again.');
    }
});

app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/register.html');
});

app.post('/register', (req, res) => {
    const { username, password, confirm_password } = req.body;

    if (users.find(user => user.username === username)) {
        return res.send('Username is already taken. Please choose another.');
    }

    if (password !== confirm_password) {
        return res.send('Password and confirmation do not match. Please try again.');
    }

    users.push({ username, password });

    fs.writeFileSync('users.json', JSON.stringify(users));

    res.redirect('/login');
});


app.get('/hello', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/hello.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
