const express = require('express');
const app = express();
app.use(express.urlencoded());
const MongoClient = require('mongodb').MongoClient;
const ejb = require('ejs');
app.set('view engine', 'ejs');
// Use UUIDv4 for IDs
const uuidv4 = require('uuid/v4');
const dbname = 'employeedb';

// Create users.
MongoClient.connect("mongodb://localhost:27017/employeedb", (err, client) => {
    const adminDb = client.db(dbname).admin();
    ["Edmund", "Lorenzo", "Ebenezer", "Josh"].forEach((emp, index) => {
	// Why is it createUser in MongoDb but addUser in Node??? :(
	adminDb.addUser(emp, 'tops3kr3t', {
	    roles: [
		{ role: 'readWrite', db: dbname }
	    ]
	}, (err, result) => {
	    // we assume this means that the user has already been created
	    // warn and move on...
	    if (err) {
		console.log("User already exists");
	    }
	});
    });
});

// start page
app.get('/', (req, res) => {
    res.render('index');
});

// employees
app.get('/employeeList', (req, res) => {
    MongoClient.connect("mongodb://localhost:27017/employeedb", (err, client) => {
	const adminDb = client.db(dbname).admin();
	emps = [];
	adminDb.command({"usersInfo":1}, (err, users) => {
	    emps += "<p>" + users + "</p>";
	});
	emplist = ["Edmund", "Lorenzo", "Ebenezer", "Josh"]
	res.render('employees', {employees: emplist});
    });
});

// todo list
app.get('/todoList', (req, res) => {
    //var page = menu() + "<h1>TODO List</h1>";

    MongoClient.connect("mongodb://localhost:27017/employeedb", (err, client) => {
	client.db('employeedb').collection('todo').find().toArray()
	    .then(results => {
		res.render('todo', {todos: results});
		// build the list to todos
		//for (result of results) {
		//    page += "<p>" + result.task + "</p>";
		//}
		//page += '<a href="/todo">Add todo</a>';
		//res.send(page);
	    });
    });
});

// show todo form
app.get('/todo', (req, res) => {
    res.render('todoform');
});

// handle todo form
app.post('/todo', (req, res) => {
    MongoClient.connect("mongodb://localhost:27017/employeedb", (err, client) => {
	// I'll just use insertOne to add to mongodb.
	client.db('employeedb').collection('todo').insertOne(
	    {id: uuidv4(), task: req.body.task});
    });
    res.render('thankyou');
});

// start the server
app.listen(3000, () => {
    console.log("Employee list application running on localhost");
})
