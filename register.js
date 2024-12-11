import { auth , db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const signUpForm = document.getElementById("signUpForm");

signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // record the user's data to firebase's realtime db
            set(ref(db, `users/${user.uid}`), {
                email: user.email,
                householdId: null 
            })
            .then(() => {
                alert("Account created successfully!");
                window.location.href = "login.html"; // redirect to login.html after successful account creation
            })
            .catch((error) => {
                alert("Error creating account. Please try again.");
            });
        })
        .catch((error) => {
            alert(error.message);
        });
});
