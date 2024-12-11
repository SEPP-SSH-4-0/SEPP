import { db, auth } from './firebase-config.js';
import { ref, set, get, push, update } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const createHouseholdForm = document.getElementById("createHouseholdForm");
const joinHouseholdForm = document.getElementById("joinHouseholdForm");

createHouseholdForm.addEventListener("submit", (event) => {
    event.preventDefault();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const householdName = document.getElementById("newHouseholdName").value.trim();

            if (householdName) {
                const householdId = push(ref(db, "households")).key;

                const householdData = {
                    householdName: householdName,
                    members: {
                        [user.uid]: { email: user.email, role: "admin" }
                    }
                };

                set(ref(db, `households/${householdId}`), householdData)
                    .then(() => {
                        update(ref(db, `users/${user.uid}`), { householdId: householdId })
                            .then(() => {
                                alert("Household created successfully!");
                                window.location.href = "index.html"; 
                            })
                            .catch((error) => {
                                console.error("Error linking household to user:", error);
                                alert("Error creating household. Please try again.");
                            });
                    })
                    .catch((error) => {
                        console.error("Error creating household:", error);
                        alert("Error creating household. Please try again.");
                    });
            } else {
                alert("Household name cannot be empty.");
            }
        } else {
            alert("You must be logged in to perform this action.");
            window.location.href = "login.html";
        }
    });
});


joinHouseholdForm.addEventListener("submit", (event) => {
    event.preventDefault();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const householdName = document.getElementById("householdId").value.trim();

            if (householdName) {
                const householdsRef = ref(db, "households");

                get(householdsRef)
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            const households = snapshot.val();
                            let foundHousehold = null;
                            let foundHouseholdId = null;

                            for (const [id, data] of Object.entries(households)) {
                                if (data.householdName === householdName) {
                                    foundHousehold = data;
                                    foundHouseholdId = id;
                                    break;
                                }
                            }

                             if (foundHousehold) {
                                const updates = {};
                                updates[`households/${foundHouseholdId}/members/${user.uid}`] = {
                                    email: user.email,
                                    role: "member",
                                };
                                updates[`users/${user.uid}/householdId`] = foundHouseholdId;

                                update(ref(db), updates)
                                    .then(() => {
                                        alert(`Successfully joined the household: ${foundHousehold.householdName}`);
                                        window.location.href = "index.html"; 
                                    })
                                    .catch((error) => {
                                        console.error("Error joining household:", error);
                                        alert("Error joining household. Please try again.");
                                    });
                            } else {
                                alert("No household found with that name. Please try again.");
                            }
                        } else {
                            alert("No households exist yet. Please try again later or create one.");
                        }
                    })
                    .catch((error) => {
                        console.error("Error searching for household:", error);
                        alert("Error searching for household. Please try again.");
                    });
            } else {
                alert("Household name cannot be empty.");
            }
        } else {
            alert("You must be logged in to perform this action.");
            window.location.href = "main/login.html";
        }
    });
});