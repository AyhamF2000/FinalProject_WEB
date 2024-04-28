email = document.getElementById('email'); //get the email input
password = document.getElementById('password'); // get the password input
repeat_password = document.getElementById('repeat-password'); //get the repeated password input
username = document.getElementById('username'); // get the username input

// div's for the error messages
const usenEmailError = document.getElementById('usenEmail');
const usenUsernameError = document.getElementById('usenUsername');
const passwordLengthError = document.getElementById('passwordLengthError');
const passwordNotMatchError = document.getElementById('passwordNotMatchError');


const form = document.getElementById('registrationForm');// our register form

form.addEventListener('submit', async function(event) {
    event.preventDefault(); // to prevent the defult form submission.

    if (validateForm()) { // check if every thing is valid

        validateEmailUser().then(isValidUser => { //check if ther is another user with the same email.
            console.log(isValidUser);
            if (isValidUser) {// if ther is't another user with the same email

                validateUsername().then(isValidUser => {// now check if there another user with the same username
                    console.log(isValidUser);
                    if (isValidUser) {// if not.... now we are readt to post the user to the data base
                        //create the new user
                        let data = { email: this.email.value, password:this.password.value ,user_name:this.username.value,todos:[]};
                        // call the post method to add the new user to the data base
                        postItem(data).then(()=> {
                            alert('You registered successfully.');        
                        window.location.href = 'http://localhost:3000/login';// go to the login page
                        }).catch(error => {
                        console.error('Failed to fetch order details:', error);
                        });
                    }
                });
            }
        });
    } else {
        validateEmailUser();// call the function , to tell the user if the email has been used
        validateUsername();// call the function , to tell the user if the username has been used
        console.error('Form validation failed');
    }
});


//check if the password lengh under 8, and if the tow passwords are equals to each other
function validateForm() {

    if (password.value.length < 8) {
        password.classList.add('is-invalid');
        passwordLengthError.style.display = 'block';
        passwordNotMatchError.style.display = 'none';
        return false;
    } else {
        password.classList.remove('is-invalid');
        passwordLengthError.style.display = 'none';
    }

    if (password.value != repeat_password.value) {
        password.classList.add('is-invalid');
        repeat_password.classList.remove('is-invalid');
        passwordLengthError.style.display = 'none';
        passwordNotMatchError.style.display = 'block';
        return false;
    } else {
        password.classList.remove('is-invalid');
        repeat_password.classList.remove('is-invalid');
        passwordNotMatchError.style.display = 'none';
    }
    return true;
}


// check if the user enter a valid email (not usen before), and hide and show the message
function validateEmailUser() {
    return isTherAnotherUserEmail().then(isUsed => {
        if (isUsed) {
            email.classList.add('is-invalid');
            usenEmailError.style.display = 'block';
            console.log('Email has been used.');
            return false;
        } else {
            email.classList.remove('is-invalid');
            usenEmailError.style.display = 'none';
            return true;
        }
    });
}
// check in the data base
function isTherAnotherUserEmail() {
    return getAllUsers().then(users => {
        let check = false;
        users.forEach(user => {
            if (user.email === email.value) {
                check = true;
            }
        });
        return check; // This ensures the promise resolves to the boolean value of check.
    });
}


// check if the user enter a valid username (not usen before), and hide and show the message
function validateUsername() {
    return isTherAnotherUserUsername().then(isUsed => {
        if (isUsed) {
            username.classList.add('is-invalid');
            usenUsernameError.style.display = 'block';
            console.log('Username has been used.');
            return false;
        } else {
            username.classList.remove('is-invalid');
            usenUsernameError.style.display = 'none';
            return true;
        }
    });
}
// check in the data base
function isTherAnotherUserUsername() {
    return getAllUsers().then(users => {
        let check = false;
        users.forEach(user => {
            if (user.user_name === username.value) {
                check = true;
            }
        });
        return check; // This ensures the promise resolves to the boolean value of check.
    });
}


//POST
async function postItem(data) {
    return fetch("http://localhost:3000/users/", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
    })
    .catch(error => console.error('Failed to post data:', error));
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
