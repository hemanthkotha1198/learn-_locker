const multer = require('multer');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection string
const MONGODB_URI = 'mongodb+srv://pk:pk@cluster0.8lulz4b.mongodb.net/?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schemas for admin and student users
const adminSchema = new mongoose.Schema({
    fname: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    num: { type: String, required: true },
    passwd: { type: String, required: true },
    gender: String
});

const studentSchema = new mongoose.Schema({
    fname:  { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    num: { type: String, required: true },
    passwd: { type: String, required: true },
    gender: String
});

const Admin = mongoose.model('Admin', adminSchema);
const Student = mongoose.model('Student', studentSchema);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.css') {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// Use express-session middleware
app.use(session({
    secret: '$eCretK3y@f0r5ess10nMan@gement!',
    resave: false,
    saveUninitialized: false
}));

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Home.html'));
});

// Registration options page
app.get('/regopt.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'regopt.html'));
});

// Admin registration page
app.get('/AdminReg.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'AdminReg.html'));
});

// Student registration page
app.get('/StudentReg.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'StudentReg.html'));
});

// Admin home page
app.get('/AdminhomePage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'AdminhomePage.html'));
});

// Student home page
app.get('/StudenthomePage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'StudenthomePage.html'));
});

// Valid department codes
const validDepartmentCodes = ['it@pk', 'it@cr', 'it@hod'];
// Admin registration form submission// Admin registration form submission
app.post('/adminSubmit', async (req, res) => {
    try {
        if (!validDepartmentCodes.includes(req.body.deptcode)) {
            return res.status(400).send('Department code is invalid');
        }

        let gender = '';
        // Determine gender based on radio button ID
        switch (req.body.gender) {
            case 'dot-1':
                gender = 'male';
                break;
            case 'dot-2':
                gender = 'female';
                break;
            case 'dot-3':
                gender = 'preferred not to say';
                break;
            default:
                gender = 'preferred not to say';
        }

        // Hash the password using SHA-256
        const hashedPassword = crypto.createHash('sha256').update(req.body.passwd).digest('hex');

        const newAdmin = new Admin({
            fname: req.body.fname,
            username: req.body.username,
            email: req.body.email,
            num: req.body.num,
            passwd: hashedPassword,
            gender: gender
        });

        await newAdmin.save();
        res.redirect('/AdminhomePage.html');
    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
    }
});

// Student registration form submission
app.post('/studentSubmit', async (req, res) => {
    try {
        let gender = '';
        // Determine gender based on radio button ID
        switch (req.body.gender) {
            case 'dot-1':
                gender = 'male';
                break;
            case 'dot-2':
                gender = 'female';
                break;
            case 'dot-3':
                gender = 'preferred not to say';
                break;
            default:
                gender = 'preferred not to say';
        }

        // Hash the password using SHA-256
        const hashedPassword = crypto.createHash('sha256').update(req.body.passwd).digest('hex');

        const newStudent = new Student({
            fname: req.body.fname,
            username: req.body.username,
            email: req.body.email,
            num: req.body.num,
            passwd: hashedPassword,
            gender: gender
        });

        await newStudent.save();
        res.redirect('/StudenthomePage.html');
    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
    }
});


// Admin login route
app.post('/adminLogin', async (req, res) => {
    const email = req.body.email;
    const passwd = req.body.passwd;

    try {
        // Retrieve admin from the database using the email
        const admin = await Admin.findOne({ email: email });
        // If admin found, compare hashed passwords
        if (admin) {
            const hashedPassword = crypto.createHash('sha256').update(passwd).digest('hex');
            if (hashedPassword === admin.passwd) {
                req.session.adminUser = admin;
                res.redirect('/AdminhomePage.html');
            }
        }
    } catch (error) {
        console.error("Error:", error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
    }
});

// Student login route
app.post('/studentLogin', async (req, res) => {
    const email = req.body.email;
    const passwd = req.body.passwd;

    try {
        // Retrieve student from the database using the email
        const student = await Student.findOne({ email: email });
        // If Student found, compare hashed passwords
        if (student) {
            const hashedPassword = crypto.createHash('sha256').update(passwd).digest('hex');
            if (hashedPassword === student.passwd) {
                req.session.studentUser = student;
                res.redirect('/StudenthomePage.html');
            }
        }
    } catch (error) {
        console.error("Error:", error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
    }
});


// Route to update student details
app.post('/updateStudent', async (req, res) => {
    const email = req.body.email;
    try {
        // Find the student by email and update their details
        const updatedStudent = await Student.findOneAndUpdate({ email: email }, req.body, { new: true });
        if (updatedStudent) {
            // res.status(200).send('Student details updated successfully');
            res.send('<script>alert("Student details updated successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        } else {
            // res.status(404).send('Student not found');
            res.send('<script>alert("Student not found"); setTimeout(() => { window.location.href = "/updateStudent.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error("Error:", error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});
// Route to serve the HTML form for updating student account details
app.get('/updateStudentacc', (req, res) => {
    res.sendFile(path.join(__dirname, 'updateStudentacc.html'));
});

app.post('/updateStudentacc', async (req, res) => {
    const email = req.body.email;
    try {
        // Find the student by email and update their details
        const updatedStudent = await Student.findOneAndUpdate({ email: email }, req.body, { new: true });
        if (updatedStudent) {
            // res.status(200).send('Student details updated successfully');
            res.send('<script>alert("Student details updated successfully"); setTimeout(() => { window.location.href = "./StudentHomePage.html"; }, 1000);</script>');
        } else {
            // res.status(404).send('Student not found');
            res.send('<script>alert("Student not found"); setTimeout(() => { window.location.href = "/updateStudentacc.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error("Error:", error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/StudentHomePage.html"; }, 1000);</script>');
    }
});
// Route to serve the HTML form for updating admin details
app.get('/updateadmin', (req, res) => {
    res.sendFile(path.join(__dirname, 'updateadmin.html'));
});

// Route to update admin details
app.post('/updateadmin', async (req, res) => {
    const email = req.body.email;
    try {
        // Find the student by email and update their details
        const updatedStudent = await Admin.findOneAndUpdate({ email: email }, req.body, { new: true });
        if (updatedStudent) {
            // res.status(200).send('Student details updated successfully');
            res.send('<script>alert("Admin details updated successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        } else {
            // res.status(404).send('Student not found');
            res.send('<script>alert("Admin not found"); setTimeout(() => { window.location.href = "/updateadmin.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error("Error:", error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});
// Route to fetch student catalog data
app.get('/studentCatalog', async (req, res) => {
    try {
        // Fetch all students from the database
        const students = await Student.find({});
        res.status(200).json(students); // Return the list of students as JSON response
    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});

// Route to serve the HTML form for deleting a student
app.get('/deleteStudent', (req, res) => {
    res.sendFile(path.join(__dirname, 'deleteStudent.html'));
});

// Route to handle form submission for deleting a student
app.post('/deleteStudent', async (req, res) => {
    const email = req.body.email;
    try {
        // Find the student by email and delete them
        const deletedStudent = await Student.findOneAndDelete({ email: email });
        if (deletedStudent) {
            res.send('<script>alert("Student deleted successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        } else {
            res.send('<script>alert("Student not found"); setTimeout(() => { window.location.href = "/deleteStudent.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error("Error:", error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});

// Route to handle form submission for deleting a student
app.post('/deleteStudentacc', async (req, res) => {
    const email = req.body.email;
    try {
        // Find the student by email and delete them
        const deletedStudent = await Student.findOneAndDelete({ email: email });
        if (deletedStudent) {
            res.send('<script>alert("Student account deleted successfully"); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
        } else {
            res.send('<script>alert("Student not found"); setTimeout(() => { window.location.href = "/deletingstudentacc.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Internal Server Error');
    }
});
// Route to serve the HTML form for deleting an admin
app.get('/deletestudentacc.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'deletingstudentacc.html'));
});
// Route to serve the HTML form for deleting an admin
app.get('/deleteadmin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'deletingadmin.html'));
});

// Route to handle form submission for deleting a student
app.post('/deleteAdmin', async (req, res) => {
    const email = req.body.email;
    try {
        // Find the student by email and delete them
        const deletedStudent = await Admin.findOneAndDelete({ email: email });
        if (deletedStudent) {
            res.send('<script>alert("Admin Account  deleted successfully"); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
        } else {
            res.send('<script>alert("Admin not found"); setTimeout(() => { window.location.href = "/deletingadmin.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error("Error:", error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});
// POST route to handle change password form submission
app.post('/changePassword', async (req, res) => {
    // Extract data from the request body
    const { email, currentpassword, newpassword, confirmnewpassword } = req.body;

    // Basic validation
    if (!email || !currentpassword || !newpassword || !confirmnewpassword) {
        return res.status(400).send('All fields are required');
    }

    if (newpassword !== confirmnewpassword) {
        return res.status(400).send('New password and confirm new password do not match');
    }

    try {
        // Find user by email
        const user = await Admin.findOne({ email: email });

        // Check if the user exists
        if (!user) {
            res.send('<script>alert("User Not Found"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        }

        // Check if the current password matches
        const currentPasswordHash = crypto.createHash('sha256').update(currentpassword).digest('hex');
        if (user.passwd !== currentPasswordHash) {
            res.send('<script>alert("Incorrect Password"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        }

        // Update user's password
        const newPasswordHash = crypto.createHash('sha256').update(newpassword).digest('hex');
        user.passwd = newPasswordHash; // Assuming 'passwd' is the field for the password
        await user.save();

        // Respond with success message
        res.send('<script>alert("password updated successfully"); setTimeout(() => { window.location.href = "/Adminhomepage.html"; }, 1000);</script>');
    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});
// POST route to handle change password form submission
app.post('/changePasswordstudent', async (req, res) => {
    // Extract data from the request body
    const { email, currentpassword, newpassword, confirmnewpassword } = req.body;

    // Basic validation
    if (!email || !currentpassword || !newpassword || !confirmnewpassword) {
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/StudentHomePage.html"; }, 1000);</script>');
    }

    if (newpassword !== confirmnewpassword) {
        return res.status(400).send('New password and confirm new password do not match');
    }

    try {
        // Find user by email
        const user = await Student.findOne({ email: email });

        // Check if the user exists
        if (!user) {
            res.send('<script>alert("User Not Found"); setTimeout(() => { window.location.href = "/StudentHomePage.html"; }, 1000);</script>');
        }

        // Check if the current password matches
        const currentPasswordHash = crypto.createHash('sha256').update(currentpassword).digest('hex');
        if (user.passwd !== currentPasswordHash) {
            res.send('<script>alert("Incorrect current password"); setTimeout(() => { window.location.href = "/StudentHomePage.html"; }, 1000);</script>');
            // return res.status(401).send('');
        }

        // Update user's password
        const newPasswordHash = crypto.createHash('sha256').update(newpassword).digest('hex');
        user.passwd = newPasswordHash; // Assuming 'passwd' is the field for the password
        await user.save();

        // Respond with success message
        res.send('<script>alert("password updated successfully"); setTimeout(() => { window.location.href = "/StudentHomePage.html"; }, 1000);</script>');
    } catch (error) {
        console.error(error);
        res.send('<script>alert("Internal Server Error"); setTimeout(() => { window.location.href = "/StudentHomePage.html"; }, 1000);</script>');
        // res.status(500).send('Internal Server Error');
    }
});

// Function to get current date and time in ISO format
const getCurrentDateTime = () => {
    return new Date().toISOString();
};
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Schema for Project1 File
const Project1File = mongoose.model('Project1File', {
    projectName: String,
    technologies: [String],
    description: String,
    fileName: String,
    fileContent: Buffer,
    uploadTime: String ,
});

// Schema for Project2 File
const Project2File = mongoose.model('Project2File', {
    projectName: String,
    technologies: [String],
    description: String,
    fileName: String,
    fileContent: Buffer,
    uploadTime: String 
});

// Schema for Project3 File
const Project3File = mongoose.model('Project3File', {
    projectName: String,
    technologies: [String],
    description: String,
    fileName: String,
    fileContent: Buffer,
    uploadTime: String 
});

// Route to serve the HTML form for uploading a file for Project1
app.get('/file_upload1.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'file_upload1.html'));
});

// Route to serve the HTML form for uploading a file for Project2
app.get('/file_upload2.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'file_upload2.html'));
});

// Route to serve the HTML form for uploading a file for Project3
app.get('/file_upload3.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'file_upload3.html'));
});

// Route to handle file upload for Project1
app.post('/uploadFile1', upload.single('file'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;
        const { projectName, technologies, description } = req.body;
        const uploadTime = getCurrentDateTime(); // Get current date and time

        const newFile = new Project1File({
            technologies: technologies,
            description: description,
            projectName: projectName,
            fileName: originalname,
            fileContent: buffer,
            uploadTime: uploadTime
        });

        await newFile.save();
        res.send('<script>alert("File uploaded successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    } catch (error) {
        console.error('Error uploading file for Project1:', error.message);
        res.send('<script>alert("Error uploading file for Project"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});

// Route to handle file upload for Project2
app.post('/uploadFile2', upload.single('file'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;
        const { projectName, technologies, description } = req.body;
        const uploadTime = getCurrentDateTime(); // Get current date and time

        const newFile = new Project2File({
            technologies: technologies,
            description: description,
            projectName: projectName,
            fileName: originalname,
            fileContent: buffer,
            uploadTime: uploadTime
        });

        await newFile.save();
        res.send('<script>alert("File uploaded successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    } catch (error) {
        console.error('Error uploading file for Project2:', error.message);
        res.send('<script>alert("Error uploading file for Project"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});

// Route to handle file upload for Project3
app.post('/uploadFile3', upload.single('file'), async (req, res) => {
    try {
        const { originalname, buffer } = req.file;
        const { projectName, technologies, description } = req.body;
        const uploadTime = getCurrentDateTime(); // Get current date and time

        const newFile = new Project3File({
            technologies: technologies,
            description: description,
            projectName: projectName,
            fileName: originalname,
            fileContent: buffer,
            uploadTime: uploadTime
        });

        await newFile.save();
        res.send('<script>alert("File uploaded successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    } catch (error) {
        console.error('Error uploading file for Project3:', error.message);
        res.send('<script>alert("Error uploading file for Project"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});

// Route to handle file deletion for Project1
app.post('/deleteProjecttec1', async (req, res) => {
    const { proName } = req.body;

    try {
        const project = await Project1File.findOneAndDelete({ projectName: proName });
        if (!project) {
            res.status(404).send('Frontend project not found.');
        } else {
            res.send('<script>alert("File deleted successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error('Error deleting frontend project:', error.message);
        res.send('<script>alert("Error deleting frontend project."); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});

// Route to handle file deletion for Project2
app.post('/deleteProjecttec2', async (req, res) => {
    const { proName } = req.body;

    try {
        const project = await Project2File.findOneAndDelete({ projectName: proName });
        if (!project) {
            res.status(404).send('Backend project not found.');
        } else {
            res.send('<script>alert("File deleted successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error('Error deleting Backend project:', error.message);
        res.send('<script>alert("Error deleting frontend project."); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});

// Route to handle file deletion for Project3
app.post('/deleteProjecttec3', async (req, res) => {
    const { proName } = req.body;

    try {
        const project = await Project3File.findOneAndDelete({ projectName: proName });
        if (!project) {
            res.status(404).send('ML project not found.');
        } else {
            res.send('<script>alert("File deleted successfully"); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
        }
    } catch (error) {
        console.error('Error deleting ML project:', error.message);
        res.send('<script>alert("Error deleting frontend project."); setTimeout(() => { window.location.href = "/AdminhomePage.html"; }, 1000);</script>');
    }
});
app.get('/viewProjecttec.html', async (req, res) => {
    try {
        // Fetch frontend projects from the database
        const frontendProjects = await Project1File.find({}, { _id: 0, projectName: 1, technologies: 1, description: 1 ,fileName: 1});

        // Render HTML response with CSS styling
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Frontend Projects</title>
                <style>
                    /* Add your CSS styling here */
                    /* CSS for search box */
                    #searchInput {
                        padding: 8px;
                        margin-bottom: 10px;
                        width: 300px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    }

                    /* CSS for project list */
                    #projectList {
                        list-style-type: none;
                        padding: 0;
                    }

                    #projectList li {
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        margin-bottom: 10px;
                        padding: 10px;
                    }

                    #projectList h2 {
                        margin-top: 0;
                        margin-bottom: 5px;
                    }

                    #projectList p {
                        margin-top: 0;
                        margin-bottom: 5px;
                    }
                    .download-button {
                        background-color: #4CAF50; /* Green */
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 4px;
                    }
            
                    .download-button:hover {
                        background-color: #45a049; /* Darker Green */
                    }
                    hr {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>Frontend Projects</h1>
                <input type="text" id="searchInput" placeholder="Search by project name" onkeyup="searchProjects()">
                <ul id="projectList">
                    ${frontendProjects.map(project => `
                        <li>
                            <h2>${project.projectName}</h2>
                            <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
                            <p><strong>Description:</strong> ${project.description}</p>
                            <button class="download-button" onclick="downloadFile('${project.fileName}')">Download</button>
                        </li>
                    `).join('')}
                </ul>
                
                <script>
                    function searchProjects() {
                        const input = document.getElementById('searchInput');
                        const filter = input.value.toUpperCase();
                        const ul = document.getElementById('projectList');
                        const li = ul.getElementsByTagName('li');
                        for (let i = 0; i < li.length; i++) {
                            const title = li[i].getElementsByTagName('h2')[0];
                            if (title.innerHTML.toUpperCase().indexOf(filter) > -1) {
                                li[i].style.display = '';
                            } else {
                                li[i].style.display = 'none';
                            }
                        }
                    }

                    function downloadFile(fileName) {
                        // Send a request to download the file content for the given file name
                        window.location.href = '/download?fileName=' + encodeURIComponent(fileName);
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error retrieving frontend projects:', error);
        res.send('<script>alert("Error viewProject frontend project."); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
    }
});
// Route to handle file download
app.get('/download', async (req, res) => {
    try {
        const fileName = req.query.fileName;
        console.log('Requested file:', fileName);
        const file = await Project1File.findOne({ fileName: fileName });

        if (!file) {
            console.log('File not found in the database');
            res.status(404).send('File not found');
            return;
        }

        // Set the appropriate headers for file download
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', 'application/octet-stream');

        // Send the file content as response
        res.send(file.fileContent);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
});// Route to fetch frontend project details and render HTML with CSS for viewProjecttec2.html
app.get('/viewProjecttec2.html', async (req, res) => {
    try {
        // Fetch frontend projects from the database
        const frontendProjects = await Project2File.find({}, { _id: 0, projectName: 1, technologies: 1, description: 1 ,fileName: 1});

        // Render HTML response with CSS styling
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Backend Projects</title>
                <style>
                    /* Add your CSS styling here */
                    /* CSS for search box */
                    #searchInput {
                        padding: 8px;
                        margin-bottom: 10px;
                        width: 300px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    }

                    /* CSS for project list */
                    #projectList {
                        list-style-type: none;
                        padding: 0;
                    }

                    #projectList li {
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        margin-bottom: 10px;
                        padding: 10px;
                    }

                    #projectList h2 {
                        margin-top: 0;
                        margin-bottom: 5px;
                    }

                    #projectList p {
                        margin-top: 0;
                        margin-bottom: 5px;
                    }
                    .download-button {
                        background-color: #4CAF50; /* Green */
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 4px;
                    }
            
                    .download-button:hover {
                        background-color: #45a049; /* Darker Green */
                    }
                    hr {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>Backend Projects</h1>
                <input type="text" id="searchInput" placeholder="Search by project name" onkeyup="searchProjects()">
                <ul id="projectList">
                    ${frontendProjects.map(project => `
                        <li>
                            <h2>${project.projectName}</h2>
                            <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
                            <p><strong>Description:</strong> ${project.description}</p>
                            <button class="download-button" onclick="downloadFile('${project.fileName}')">Download</button>
                        </li>
                    `).join('')}
                </ul>
                
                <script>
                    function searchProjects() {
                        const input = document.getElementById('searchInput');
                        const filter = input.value.toUpperCase();
                        const ul = document.getElementById('projectList');
                        const li = ul.getElementsByTagName('li');
                        for (let i = 0; i < li.length; i++) {
                            const title = li[i].getElementsByTagName('h2')[0];
                            if (title.innerHTML.toUpperCase().indexOf(filter) > -1) {
                                li[i].style.display = '';
                            } else {
                                li[i].style.display = 'none';
                            }
                        }
                    }

                    function downloadFile(fileName) {
                        // Send a request to download the file content for the given file name
                        window.location.href = '/download2?fileName=' + encodeURIComponent(fileName);
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error retrieving frontend projects:', error);
        res.send('<script>alert("Error viewProject frontend project."); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
    }
});

// Route to handle file download for Project 2
app.get('/download2', async (req, res) => {
    try {
        const fileName = req.query.fileName;
        console.log('Requested file:', fileName);
        const file = await Project2File.findOne({ fileName: fileName });

        if (!file) {
            console.log('File not found in the database');
            res.status(404).send('File not found');
            return;
        }
        // D:\AcademicProject\pms\pms\reg.html
        // Set the appropriate headers for file download
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', 'application/octet-stream');

        // Send the file content as response
        res.send(file.fileContent);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
});

// Route to fetch frontend project details and render HTML with CSS for viewProjecttec3.html
app.get('/viewProjecttec3.html', async (req, res) => {
    try {
        // Fetch frontend projects from the database
        const frontendProjects = await Project3File.find({}, { _id: 0, projectName: 1, technologies: 1, description: 1 ,fileName: 1});

        // Render HTML response with CSS styling
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>ML Projects</title>
                <style>
                    /* Add your CSS styling here */
                    /* CSS for search box */
                    #searchInput {
                        padding: 8px;
                        margin-bottom: 10px;
                        width: 300px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                    }

                    /* CSS for project list */
                    #projectList {
                        list-style-type: none;
                        padding: 0;
                    }

                    #projectList li {
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        margin-bottom: 10px;
                        padding: 10px;
                    }

                    #projectList h2 {
                        margin-top: 0;
                        margin-bottom: 5px;
                    }

                    #projectList p {
                        margin-top: 0;
                        margin-bottom: 5px;
                    }
                    .download-button {
                        background-color: #4CAF50; /* Green */
                        border: none;
                        color: white;
                        padding: 10px 20px;
                        text-align: center;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 16px;
                        margin: 4px 2px;
                        cursor: pointer;
                        border-radius: 4px;
                    }
            
                    .download-button:hover {
                        background-color: #45a049; /* Darker Green */
                    }
                    hr {
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }
                </style>
            </head>
            <body>
                <h1>ML Projects</h1>
                <input type="text" id="searchInput" placeholder="Search by project name" onkeyup="searchProjects()">
                <ul id="projectList">
                    ${frontendProjects.map(project => `
                        <li>
                            <h2>${project.projectName}</h2>
                            <p><strong>Technologies:</strong> ${project.technologies.join(', ')}</p>
                            <p><strong>Description:</strong> ${project.description}</p>
                            <button class="download-button" onclick="downloadFile('${project.fileName}')">Download</button>
                        </li>
                    `).join('')}
                </ul>
                
                <script>
                    function searchProjects() {
                        const input = document.getElementById('searchInput');
                        const filter = input.value.toUpperCase();
                        const ul = document.getElementById('projectList');
                        const li = ul.getElementsByTagName('li');
                        for (let i = 0; i < li.length; i++) {
                            const title = li[i].getElementsByTagName('h2')[0];
                            if (title.innerHTML.toUpperCase().indexOf(filter) > -1) {
                                li[i].style.display = '';
                            } else {
                                li[i].style.display = 'none';
                            }
                        }
                    }

                    function downloadFile(fileName) {
                        // Send a request to download the file content for the given file name
                        window.location.href = '/download3?fileName=' + encodeURIComponent(fileName);
                    }
                </script>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error retrieving ML projects:', error);
        res.send('<script>alert("Error viewProject frontend project."); setTimeout(() => { window.location.href = "/Home.html"; }, 1000);</script>');
    }
});

// Route to handle file download for Project 3
app.get('/download3', async (req, res) => {
    try {
        const fileName = req.query.fileName;
        console.log('Requested file:', fileName);
        const file = await Project3File.findOne({ fileName: fileName });

        if (!file) {
            console.log('File not found in the database');
            res.status(404).send('File not found');
            return;
        }

        // Set the appropriate headers for file download
        res.setHeader('Content-disposition', 'attachment; filename=' + fileName);
        res.setHeader('Content-type', 'application/octet-stream');

        // Send the file content as response
        res.send(file.fileContent);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('Error downloading file');
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
