import { auth , db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const signUpForm = document.getElementById("signUpForm");

signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Save user data to Realtime Database
            set(ref(db, `users/${user.uid}`), {
                email: user.email,
                householdId: null // Initially, no household is associated
            })
            .then(() => {
                alert("User signed up and saved to database!");
                window.location.href = "login.html"; // Redirect to login after account creation
            })
            .catch((error) => {
                console.error("Error saving user to database:", error);
                alert("Error creating account. Please try again.");
            });
        })
        .catch((error) => {
            console.error("Error signing up:", error.message);
            alert(error.message);
        });
});
