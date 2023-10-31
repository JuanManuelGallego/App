const fs = require('fs');
//const AWS = require('aws-sdk');
const express = require('express');
const session = require('express-session');
require('dotenv').config();
const app = express();
const port = 3000;

// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: AWS_REGION,
// });

// const cloudwatchlogs = new AWS.CloudWatchLogs();
// const logGroupName = 'VSA';
// const logStreamName = 'VSALogs';

// cloudwatchlogs.createLogStream({
//   logGroupName: logGroupName,
//   logStreamName: logStreamName,
// }, (err, data) => {
//   if (err) {
//     console.error('Error creating log stream:', err);
//   } else {
//     logData('Log stream created:', data);
//   }
// });

// function logData(log){
//     console.log(log);
//     cloudwatchlogs.putLogEvents({
//         logGroupName: logGroupName,
//         logStreamName: logStreamName,
//         logEvents: [
//             {
//                 timestamp: new Date().getTime(),
//                 message: log,
//             }
//         ]
//     }, (err, data) => {
//     if (err) {
//       console.error('Error sending log events:', err);
//     } else {
//       logData('Log events sent:', data);
//     }
//   });
// }

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('images'));

let users = [];
if (fs.existsSync('users.json')) {
    users = JSON.parse(fs.readFileSync('users.json'));
}

app.use(
    session({
        secret: process.env.SESSION_SECRET,
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
        //logData("User Logged in");
        res.redirect('/hello');
    } else {
        res.statusCode = 401; //Unauthorized
        //logData("Auth Failed");
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
    //logData("User registered");
    res.redirect('/login');
});


app.get('/hello', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/hello.html');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
