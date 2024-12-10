// for handling cart.html's interactions

import { auth, db } from "./firebase-config.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const householdId = snapshot.val().householdId; 
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

    onValue(cartRef, (snapshot) => {
        cartSummary.innerHTML = "";

        let grandTotal = 0; 
        let userTasks = []; // to track async user processing
        let userBreakdowns = []; 

        snapshot.forEach((userCart) => {
            const userId = userCart.key; 
            
            const userTask = new Promise((resolve, reject) => {
                const userRef = ref(db, `users/${userId}`);
                onValue(userRef, (userSnapshot) => {
                    if (userSnapshot.exists()) {
                        const userEmail = userSnapshot.val().email; // get user's email
        
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
        
                            userCartHtml += `
                                <div class="cart-product">
                                    <p>${product.name} - $${product.price.toFixed(2)} x ${product.quantity} = $${itemTotal.toFixed(2)}</p>
                                    <button class="remove-item-btn" data-user-id="${userId}" data-item-id="${itemId}">Remove</button>
                                </div>
                            `;
                        });
        
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

                        // remove item function
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

        // wait for all user data to be processed 
        Promise.all(userTasks).then(() => {
            // fees
            const deliveryFee = 3.99;
            const serviceFee = 2.79;
            const totalAmount = grandTotal + deliveryFee + serviceFee;

            // splitting fees equally
            const numUsers = userBreakdowns.length;
            const splitDelivery = deliveryFee / numUsers;
            const splitService = serviceFee / numUsers;

            // each user breakdown
            const cartSummaryDetails = document.getElementById("cart-summary-details");
            cartSummaryDetails.innerHTML = ""; // Clear previous content
            userBreakdowns.forEach((user) => {
                const userFinalTotal = user.total + splitDeliveryFee + splitServiceFee;
                cartSummaryDetails.innerHTML += `
                    <div class="cart-summary-user">
                        <h4>${user.email}'s Breakdown</h4>
                        <p>Subtotal (Items): $${user.total.toFixed(2)}</p>
                        <p>Delivery Fee Share: $${splitDelivery.toFixed(2)}</p>
                        <p>Service Fee Share: $${splitService.toFixed(2)}</p>
                        <p><strong>Final Total: $${userFinalTotal.toFixed(2)}</strong></p>
                        <hr />
                    </div>
                `;
            });

            document.getElementById("delivery-fee").innerText = deliveryFee.toFixed(2);
            document.getElementById("service-fee").innerText = serviceFee.toFixed(2);
            document.getElementById("total-amount").innerText = totalAmount.toFixed(2);
        }).catch((error) => {
            console.error("Error in processing user data:", error);
        });
    });
}

function removeCartItem(householdId, userId, itemId){
    const itemRef = ref(db, `households/${householdId}/cart/${userId}/items/${itemId}`);
    remove(itemRef)
        .then(() => {
            alert("Item removed successfully.");
        })
        .catch((error) => {
            console.error("Error removing item:", error);
            alert("Failed to remove item. Please try again.");
        });
}