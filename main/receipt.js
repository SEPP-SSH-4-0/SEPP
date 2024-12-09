import { auth, db } from "./firebase-config.js"; // Firebase auth and db references
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const householdId = snapshot.val().householdId; // Get householdId
                fetchCartData(householdId);
            } else {
                alert("User not found in the database.");
            }
        });
    } else {
        alert("Please log in first.");
    }
});
function fetchCartData(householdId) {
    const cartRef = ref(db, `households/${householdId}/cart`);
    let grandTotal = 0; // Total for all users

    // Get the container for all users
    const usersContainer = document.getElementById("users-container");

    onValue(cartRef, (snapshot) => {
        console.log("Cart snapshot received:", snapshot.val());  // Log cart snapshot to check all users

        // Create an array of promises to fetch user data
        let userPromises = [];

        snapshot.forEach((userCart) => {
            const userId = userCart.key; // Get user ID
            const userRef = ref(db, `users/${userId}`);

            // Create promise to fetch user data and process their cart
            userPromises.push(
                new Promise((resolve, reject) => {
                    onValue(userRef, (userSnapshot) => {
                        if (userSnapshot.exists()) {
                            const userEmail = userSnapshot.val().email; // Get user email
                            let userTotal = 0; // Track total for this user
                            let userItemsHtml = `<div class="user-receipt-container">
                                                    <h3>User: ${userEmail}</h3>`;
                            const items = userCart.child("items").val() || {};

                            if (Object.keys(items).length === 0) {
                                userItemsHtml += "<p>No items in the cart.</p>";
                            }

                            // Loop over items and calculate totals
                            Object.keys(items).forEach((itemId) => {
                                const product = items[itemId];
                                const itemTotal = product.price * product.quantity;
                                userTotal += itemTotal;

                                userItemsHtml += `
                                    <div>
                                        <p>${product.name} - $${product.price.toFixed(2)} x ${product.quantity} = $${itemTotal.toFixed(2)}</p>
                                    </div>
                                `;
                            });

                            // Calculate shared fees
                            const deliveryFee = 5.00;
                            const serviceFee = 2.00;
                            const numUsers = snapshot.size; // Number of users
                            const splitDeliveryFee = deliveryFee / numUsers;
                            const splitServiceFee = serviceFee / numUsers;

                            // Add delivery and service fee breakdown
                            userItemsHtml += ` 
                                <p>Delivery Fee Share: $${splitDeliveryFee.toFixed(2)}</p>
                                <p>Service Fee Share: $${splitServiceFee.toFixed(2)}</p>
                                <p><strong>Total for ${userEmail}: $${(userTotal + splitDeliveryFee + splitServiceFee).toFixed(2)}</strong></p>
                            </div>`;
                        });
                    });
                }