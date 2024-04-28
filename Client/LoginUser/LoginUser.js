// get the inputs
email = document.getElementById('email');
password = document.getElementById('password');

const UserNotFound = document.getElementById('UserNotFound');// error message when we get bad password or new user

const form = document.getElementById('loginForm');//the log in form


form.addEventListener('submit', function(event) {

    event.preventDefault();// to prevent the defult form submission.

    validateForm().then(result => {
        if (result.isEqual) { //if the user found in the data base 
            UserNotFound.style.display = 'none';
            UserNotFound.classList.remove('is-invalid');
            //QueryString
            window.location.href = `http://localhost:3000/todos?email=${email.value}&username=${result.username}&id=${result.id}`;
        } else {//if the user is not found in the database
            console.log('Validation failed');
            UserNotFound.classList.add('is-invalid');
            UserNotFound.style.display = 'block';
        }
    }).catch(error => {
        console.error('Error during form validation:', error);
    });

});


function validateForm() {
    const emailVal = email.value;
    const passwordVal = password.value;

    return getAllUsers().then(users => {
        let result = { isEqual: false, username: null , id: null}; // default return
        users.forEach(user => {

            if (user.email === emailVal && user.password === passwordVal) {
                result = {
                    isEqual: true,  // meaning that we have found a user with the same email and password
                    username: user.user_name, // store the username from the database
                    id: user._id// store the id from the database
                };
            }
        });
        return result; 
    }).catch(error => {
        console.error('Failed to fetch users:', error);
        return { isEqual: false, user_name: null,id: null };
    });
}


//GET
async function getAllUsers() {
    try {
        const response = await fetch("http://localhost:3000/users/", {
            method: "GET",
            headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const users = await response.json();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error; 
    }
}