
sessionStorage.clear();
const tasks = JSON.parse(sessionStorage.getItem('task') || '[]');

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);// QueryString
    const email = urlParams.get('email'); // get the email
    const username = urlParams.get('username'); //get the username
    const userId = urlParams.get('id'); // get the id

    const todoForm = document.getElementById('todoForm'); // get the todo form
    const saveListButton = document.getElementById('saveList'); // get the save list button
    const logoutButton = document.getElementById('logout'); // get the log out buttn

    const newTaskInput = document.getElementById('newTask'); // the input of the new task

    document.getElementById('userEmail').textContent = email; // paste the user email
    document.getElementById('userName').textContent = username; // paste the user username 


    sessionStorage.setItem('task', JSON.stringify([])); // empty the tasks

    // push the tasks for the current user to the session storage (from the data base)
    getUser(userId).then(user => {
        for (const todo of user.todos) {
            tasks.push(todo);// pushing each task to the session storage
        }
        loadTasks();// load the current tasks (to avoid displaying the old tasks that have been deleted)
    }).catch(error => {
        console.error('Failed to load user todos:', error);
        loadTasks();// to ensure loading even on failure (no user)
    });

    // things to do when we press the add task button
    todoForm.addEventListener('submit', function(event) {
        event.preventDefault();// to add our custom actions 
        const taskContent = newTaskInput.value.trim();// get the input value
        if (taskContent) { 
            tasks.push({ task: taskContent }); // add the task
            sessionStorage.setItem('task', JSON.stringify(tasks));// to make sure that we get the tasks from session storage
            loadTasks(); // reload the task list after adding new task
            newTaskInput.value = ''; // to clear the input field after adding the task
        }
    });

    //things to do when we press the save list button
    saveListButton.addEventListener('click', function() {
        PutTodosInDatBase(userId); // add the task to the data base
        loadTasks(); // load the new taskd list after adding the new task to the data base
        alert("The todos have been uploaded to the database!"); // telling the user that the todo has been added to the data base
    });

    //things to do when we press the log out button
    logoutButton.addEventListener('click', function() {
        sessionStorage.clear();//clear the session storage (to avoid showing todos for another user)
        window.location.href = 'http://localhost:3000/login';// after loging out --> go to the log in page
    });
    
});

// to add the new task to the data base (PUT the todos from the data base)
async function PutTodosInDatBase(userId){
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}/todos`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ todos: tasks }) 
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating todos:', error);
        throw error;  // Allows handling of the error by the caller
    }
}

// load the tasks from the session storage and print them to the page 
function loadTasks() {
    const todoList = document.getElementById('todoList'); // get the todos list
    todoList.innerHTML = ''; // clear the exiting list
    tasks.forEach((task, index) => {
        // build the HTML string for each task
        todoList.innerHTML += `
        <li id="task-${index}" class="list-group-item d-flex justify-content-between align-items-center">
        ${task.task}
        <div>
        <button onclick="editTask(${index})" class="btn btn-outline-primary btn-sm">Edit</button>
        <button onclick="deleteTask(${index})" class="btn btn-outline-danger btn-sm">Delete</button>
        </div>
    </li>`;
    });
}
// editing the task (edit it from the session storage, it will be edited from the data base after pressing the save list button)
function editTask(index) {
    let task = tasks[index];
    const newContent = prompt('Edit Task:', task.task); // prompt with the current task description
    if (newContent !== null && newContent.trim() !== '') {
        tasks[index].task = newContent.trim(); // update the task description
        sessionStorage.setItem('task', JSON.stringify(tasks));
        loadTasks(); // re-load tasks to update the todo list
    }
}
// delete task from session storage 
function deleteTask(index) {
    tasks.splice(index, 1);
    sessionStorage.setItem('task', JSON.stringify(tasks));
    loadTasks();
}


// get the user from data base via id
async function getUser(userId) {
    try {
        const response = await fetch(`http://localhost:3000/users/${userId}`, {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error fetching user:', error);
        throw error; 
    }
}
