import { auth, db } from "./firebase-config.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

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
    let grandTotal = 0; 


    const usersContainer = document.getElementById("users-container");

    onValue(cartRef, (snapshot) => {
        console.log("Cart snapshot received:", snapshot.val());

        let userPromises = [];

        snapshot.forEach((userCart) => {
            const userId = userCart.key; 
            const userRef = ref(db, `users/${userId}`);
            //Create promise
            userPromises.push(
                new Promise((resolve, reject) => {
                    onValue(userRef, (userSnapshot) => {
                        if (userSnapshot.exists()) {
                            const userEmail = userSnapshot.val().email; 
                            let userTotal = 0; 
                            let userItemsHtml = `<div class="user-receipt-container">
                                                    <h3>User: ${userEmail}</h3>`;
                            const items = userCart.child("items").val() || {};

                            if (Object.keys(items).length === 0) {
                                userItemsHtml += "<p>No items in the cart.</p>";
                            }

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
                            //Calculation
                            const deliveryFee = 5.00;
                            const serviceFee = 2.00;
                            const numUsers = snapshot.size; 
                            const splitDeliveryFee = deliveryFee / numUsers;
                            const splitServiceFee = serviceFee / numUsers;
                            //Fees breakdown
                            userItemsHtml += ` 
                                <p>Delivery Fee Share: $${splitDeliveryFee.toFixed(2)}</p>
                                <p>Service Fee Share: $${splitServiceFee.toFixed(2)}</p>
                                <p><strong>Total for ${userEmail}: $${(userTotal + splitDeliveryFee + splitServiceFee).toFixed(2)}</strong></p>
                            </div>`;

                            usersContainer.innerHTML += userItemsHtml;
                            //Grand total
                            grandTotal += userTotal + splitDeliveryFee + splitServiceFee;
                        }
                        resolve(); 
                    });
                })
            );
        });

        Promise.all(userPromises).then(() => {
            console.log("Receipt HTML after processing users:");
            //total price update again
            const totalPriceElement = document.getElementById("receipt-total-price");
            totalPriceElement.textContent = grandTotal.toFixed(2);
            //update users receipt
            const receiptFooter = document.getElementById("receipt-footer");
            receiptFooter.innerHTML = `
                <p>Total Price (including fees): $${grandTotal.toFixed(2)}</p>
                <button id="download-receipt-btn">Download Receipt</button>
                <button id="return-home-btn">Return to Homepage</button>
            `;


            const downloadButton = document.getElementById("download-receipt-btn");
            downloadButton.addEventListener("click", downloadReceipt);

            const returnHomeButton = document.getElementById("return-home-btn");
            returnHomeButton.addEventListener("click", returnToHomepage);
        });
    });
}


function downloadReceipt() {
    const receiptContent = document.getElementById("receipt-container").innerText;
    
    if (!receiptContent.trim()) {
        alert("There is no receipt content to download.");
        return;
    }

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'receipt.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function returnToHomepage() {
    window.location.href = 'index.html';
}
