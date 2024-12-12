import { auth , db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const signUpForm = document.getElementById("signUpForm");

signUpForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log("Collected email and password:", { email, password });

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User created successfully in Firebase Auth:', user);

            // record the user's data to firebase's realtime db
            set(ref(db, `users/${user.uid}`), {
                email: user.email,
                householdId: null 
            })
            .then(() => {
                console.log("User data saved in Realtime Database for:", { email });
                alert("Account created successfully!");
                window.location.href = "login.html"; // redirect to login.html after successful account creation
            })
            .catch((error) => {
                console.error("Error saving user data in Realtime Database:", error);
                alert("Error creating account. Please try again.");
            });
        })
        .catch((error) => {
            console.error("Error creating user in Firebase Auth:", error);
            alert(error.message);
        });
});