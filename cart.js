import { auth, db } from "./firebase-config.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { ref, onValue, remove, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const cartSummary = document.getElementById("cart-summary");

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is authenticated:", user);
        const userRef = ref(db, `users/${user.uid}`);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                console.log("User data found in database:", snapshot.val());
                const householdId = snapshot.val().householdId;
                fetchCartData(householdId);
            } else {
                console.error("User not found in the database.");
                alert("User not found in the database.");
            }
        }).catch((error) => {
            console.error("Error fetching user data:", error);
        });
    } else {
        console.warn("No authenticated user. Redirecting to login.");
        alert("Please log in first.");
    }
});

function fetchCartData(householdId) {
    console.log("Fetching cart data for household ID:", householdId);
    const cartRef = ref(db, `households/${householdId}/cart`);

    onValue(cartRef, (snapshot) => {
        cartSummary.innerHTML = "";
        let grandTotal = 0; 
        let userTasks = []; 
        let userBreakdowns = []; 
        let usersWithItems = 0; 
        let totalItems = 0;

        if (!snapshot.exists()) {
            console.log("No cart data found for this household.");
            cartSummary.innerHTML = `<p>Your cart is empty.</p>`;
            return;
        }

        snapshot.forEach((userCart) => {
            const userId = userCart.key; 
            const userTask = new Promise((resolve, reject) => {
                const userRef = ref(db, `users/${userId}`);
                console.log("Processing cart for user ID:", userId);
                onValue(userRef, (userSnapshot) => {
                    if (userSnapshot.exists()) {
                        const userEmail = userSnapshot.val().email;

                        let userTotal = 0; 
                        let userCartHtml = `
                            <div class="cart-item">
                                <h3>User: ${userEmail}</h3>
                        `;
        
                        const items = userCart.child("items").val() || {};
                        Object.keys(items).forEach((itemId) => {
                            const product = items[itemId];
                            const itemTotal = product.price * product.quantity;
                            userTotal += itemTotal;
                            totalItems += product.quantity;

                            userCartHtml += `
                                <div class="cart-product">
                                    <p>${product.name} - £${product.price.toFixed(2)} x ${product.quantity} = £${itemTotal.toFixed(2)}</p>
                                    <button class="remove-item-btn" data-user-id="${userId}" data-item-id="${itemId}">Remove</button>
                                </div>
                            `;
                        });

                        if (Object.keys(items).length > 0) {
                            usersWithItems++;
                        }

                        userCartHtml += `
                                <p><strong>Total for User ${userEmail}: £${userTotal.toFixed(2)}</strong></p>
                            </div>
                        `;
        
                        cartSummary.innerHTML += userCartHtml;
                        grandTotal += userTotal;
        
                        userBreakdowns.push({
                            email: userEmail,
                            total: userTotal,
                        });

                        document.querySelectorAll(".remove-item-btn").forEach((btn) => {
                            btn.addEventListener("click", (event) => {
                                const userId = event.target.getAttribute("data-user-id");
                                const itemId = event.target.getAttribute("data-item-id");
                                removeCartItem(householdId, userId, itemId);
                            });
                        });
        
                        resolve(); 
                    } else {
                        console.error("User data not found for ID:", userId);
                        reject(); 
                    }
                });
            });
        
            userTasks.push(userTask);
        });

        Promise.all(userTasks).then(() => {
            calculateFees(grandTotal, usersWithItems, userBreakdowns, totalItems);
        }).catch((error) => {
            console.error("Error processing user data:", error);
        });
    });
}

function removeCartItem(householdId, userId, itemId){
    const itemRef = ref(db, `households/${householdId}/cart/${userId}/items/${itemId}`);
    remove(itemRef)
        .then(() => {
            console.log(`Item ${itemId} removed for user ${userId}.`);
        })
        .catch((error) => {
            console.error("Error removing item:", error);
            alert("Failed to remove item. Please try again.");
        });
}

function calculateFees(grandTotal, usersWithItems, userBreakdowns, totalItems) {
    const deliveryFee = 3.99;
    const serviceFee = 2.79;

    const cartSummaryDetails = document.getElementById("cart-summary-details");
    cartSummaryDetails.innerHTML = ""; 

    if (usersWithItems > 0) {
        const splitDeliveryFee = deliveryFee / usersWithItems;
        const splitServiceFee = serviceFee / usersWithItems;

        userBreakdowns.forEach((user) => {
            let userFinalTotal = user.total;

            if (user.total > 0) {
                userFinalTotal += splitDeliveryFee + splitServiceFee;
            }

            cartSummaryDetails.innerHTML += `
                <div class="cart-summary-user">
                    <h4>${user.email}'s Breakdown</h4>
                    <p>Subtotal (Items): £${user.total.toFixed(2)}</p>
                    ${user.total > 0 ? `<p>Delivery Fee Share: £${splitDeliveryFee.toFixed(2)}</p>` : ""}
                    ${user.total > 0 ? `<p>Service Fee Share: £${splitServiceFee.toFixed(2)}</p>` : ""}
                    <p><strong>Final Total: £${userFinalTotal.toFixed(2)}</strong></p>
                    <hr/>
                </div>
            `;
        });

        document.getElementById("delivery-fee").innerText = deliveryFee.toFixed(2);
        document.getElementById("service-fee").innerText = serviceFee.toFixed(2);
        document.getElementById("total-amount").innerText = (grandTotal + deliveryFee + serviceFee).toFixed(2);
    } 

    else {
        cartSummaryDetails.innerHTML = `<p>No users have items in their cart, so no fees are applied.</p>`;
        document.getElementById("delivery-fee").innerText = 'No delivery fee (No items in cart)';
        document.getElementById("service-fee").innerText = 'No service fee (No items in cart)';
        document.getElementById("total-amount").innerText = grandTotal.toFixed(2);
    }
}