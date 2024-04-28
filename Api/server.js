const express = require('express');
const moment = require("moment"); // for the time 
const path = require('path'); // for the path to the client pages

//npm install express-session // this will help us to make sure there is just one user connected to the server

const cors =require('cors');

const { MongoClient, ObjectId } = require('mongodb'); 

const app = express();
const port = "3000";

app.use(express.json());
app.use(cors());

// because the Client folder is not in the same level with the server.js
app.use(express.static(path.join(__dirname, '..', 'Client'))); 

let dbName ="finalProjectWEB";
let CollectionName = "Users";

const connectionDb = `mongodb+srv://ayham:af09127412345@cluster0.pxmjsxl.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const clientDb = new MongoClient(connectionDb);

async function ConnectDb(){
    try{
        await clientDb.connect();
        console.log("Connected to Db....");
    }
    catch{
        await clientDb.close();
        console.log("Db Closed...")
    }
}

//POST
app.post('/users', async (req,res)=>{
    try {
        const newItem =req.body;
        const collection =clientDb.db(dbName).collection(CollectionName);
        const result = await collection.insertOne(newItem);
        const user = await collection.findOne({_id: result.insertedId});
        res.status(201).send(user);
    } catch(error){
        res.status(500).send(error.toString());
    }
});

//GET
app.get('/users', async (req,res)=>{
    const collection = clientDb.db(dbName).collection(CollectionName);
    try {
        const users = await collection.find({}).toArray();
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

//GET ONE
app.get('/users/:id', async (req,res)=>{
    const collection = clientDb.db(dbName).collection(CollectionName);
    try {
        const id = new ObjectId(req.params.id);
        const user = await collection.findOne({_id: id});
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

//DELETE
app.delete('/users/:id', async(req,res)=>{
    const id = req.params.id;
    const collection = clientDb.db(dbName).collection(CollectionName);
    try {
        const result = await collection.deleteOne({_id: new ObjectId(id)});
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

//-----------------------------------------------------------------------------------------

//To get the RegisterUser.html page from Client folder 
app.get("/registeruser",(request,response) => {
    let time = moment().format('yyyy-mm-dd:hh:mm:ss'); // npm install moment
    msg = "At Date:" + time + " -----> "+"Register User Page is requested..."
    console.log(msg);

    // '..' --> to get to the parent folder of the api folder witch saved in __dirname.
    response.sendFile(path.join(__dirname, '..', 'Client', 'RegisterUser', 'RegisterUser.html')); 
});

//To get the Login.html page from Client folder 
app.get("/login",(request,response) => {
    let time = moment().format('yyyy-mm-dd:hh:mm:ss'); // npm install moment
    msg = "At Date:" + time + " -----> "+"Login Page is requested..."
    console.log(msg);

    // '..' --> to get to the parent folder of the api folder witch saved in __dirname.
    response.sendFile(path.join(__dirname, '..', 'Client', 'LoginUser', 'LoginUser.html')); 
});

//To get the Todos.html page from Client folder 
app.get("/todos",(request,response) => {
    let time = moment().format('yyyy-mm-dd:hh:mm:ss'); // npm install moment
    msg = "At Date:" + time + " -----> "+" todos Page Page is requested..."
    console.log(msg);

    // '..' --> to get to the parent folder of the api folder witch saved in __dirname.
    response.sendFile(path.join(__dirname, '..', 'Client', 'Todos', 'Todos.html')); 
});

//-----------------------------------------------------------------------------------------

ConnectDb(); // make the connection between the api and the mongoDb server

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// PUT - Update the entire todo list for a specific user
app.put('/users/:id/todos', async (req, res) => {
    const id = req.params.id;
    const todos = req.body.todos; // this should be an array of todos
    const collection = clientDb.db(dbName).collection(CollectionName);
    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { todos: todos } }
        );
        if (result.modifiedCount === 0) {
            return res.status(204).send('User not found or todo list unchanged');
        }
        res.status(200).send('Todo list updated successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

// DELETE - Clear the todo list for a specific user
app.delete('/users/:id/todos', async (req, res) => {
    const id = req.params.id;
    const collection = clientDb.db(dbName).collection(CollectionName);

    try {
        const result = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { todos: [] } } // Setting todos array to empty
        );
        if (result.modifiedCount === 0) {
            return res.status(404).send('todos list already empty');
        }
        res.status(200).send('Todos list cleared successfully');
    } catch (error) {
        res.status(500).send(error.toString());
    }
});

//-------------------------------------------------------------------
app.get('/registeruser/reset', (request, response) => {
    if (request.session.isUserConnected) {
        request.session.isUserConnected = false;
        response.send('Session state reset on page refresh.');
    } else {
        response.send('No active session to reset.');
    }
});
