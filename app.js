const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Save files in the "public/uploads" folder
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname); // Add a unique prefix to the filename
    }
});

const upload = multer({ storage: storage });

// Middleware to log request details
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/posts', (req, res) => {
    const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf-8'));
    res.render('index', { posts });
});

app.get('/post', (req, res) => {
    const postId = parseInt(req.query.id);
    const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf-8'));
    const post = posts.find(p => p.id === postId);
    res.render('post', { post });
});

app.get('/add-post', (req, res) => {
    res.render('add-post');
});

app.post('/add-post', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : null; // Save the image path if a file was uploaded

    const posts = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf-8'));

    const newPost = {
        id: posts.length + 1,
        title,
        content,
        image: imagePath, // Add the image path to the post
        date: new Date().toISOString()
    };

    posts.push(newPost);
    fs.writeFileSync(path.join(__dirname, 'data', 'posts.json'), JSON.stringify(posts, null, 2));
    res.redirect('/posts');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});