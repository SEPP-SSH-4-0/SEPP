import { ref, get, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import { auth, db } from "./firebase-config.js"; 
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const cartCountElement = document.getElementById('cart-count'); 

function displayProducts(category, containerId) {
    console.log(`Displaying products for category: ${category}`);
    const dbRef = ref(db, 'products');
    get(dbRef).then((snapshot) => {
        if (snapshot.exists()) {
            const products = snapshot.val();
            const container = document.getElementById(containerId);
            container.innerHTML = ''; 

            Object.keys(products).forEach(productId => {
                const product = products[productId];
                if (product.category.toLowerCase() === category.toLowerCase()) {
                    const productElement = document.createElement('div');
                    productElement.classList.add('item');
                    productElement.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>£${product.price.toFixed(2)}</p>
                        <input type="number" value="1" min="1" id="${productId}-quantity">
                        <button id="add-to-cart-${productId}">Add to Cart</button>
                    `;
                    container.appendChild(productElement);

                    const addToCartButton = document.getElementById(`add-to-cart-${productId}`);
                    addToCartButton.addEventListener('click', () => addToSharedCart(productId, product.name, product.price));
                }
            });
            console.log(`Products displayed for category: ${category}`);
        } else {
            console.error("No products available");
        }
    }).catch(error => console.error("Error fetching products:", error));
}

function addToSharedCart(productId, productName, productPrice) {
    console.log(`Adding to cart: ${productName}, Price: £${productPrice}, ID: ${productId}`);
    const quantityInput = document.getElementById(`${productId}-quantity`);
    const quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity.");
        console.warn("Invalid quantity entered.");
        return;
    }

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;
            const userRef = ref(db, `users/${userId}`);

            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const householdId = snapshot.val().householdId;

                    const cartRef = ref(db, `households/${householdId}/cart/${userId}/items`);
                    push(cartRef, {
                        productId,
                        name: productName,
                        price: productPrice,
                        quantity
                    }).then(() => {
                        const userTotalRef = ref(db, `households/${householdId}/cart/${userId}/total`);
                        get(userTotalRef).then(totalSnapshot => {
                            const currentTotal = totalSnapshot.exists() ? totalSnapshot.val() : 0;
                            update(userTotalRef, {
                                total: currentTotal + (productPrice * quantity)
                            });

                            incrementCartCount(quantity);
                            updateCartCount(householdId);
                        });
                    }).catch(error => {
                        console.error("Error adding to cart:", error);
                        alert("Failed to add item to cart.");
                    });
                } else {
                    alert("Error fetching household information.");
                }
            });
        } else {
            alert("Please log in first.");
            window.location.href = "main/login.html";
        }
    });
}

function incrementCartCount(quantity) {
    console.log(`Incrementing cart count by: ${quantity}`);
    const currentCount = parseInt(cartCountElement.textContent);
    const newCount = isNaN(currentCount) ? quantity : currentCount + quantity;
    cartCountElement.textContent = newCount;
    console.log(`New cart count: ${newCount}`);
}

function updateCartCount(householdId) {
    console.log(`Updating cart count for household ID: ${householdId}`);
    const cartRef = ref(db, `households/${householdId}/cart`);
    onValue(cartRef, (snapshot) => {
        let totalItems = 0;

        snapshot.forEach(userCart => {
            userCart.child('items').forEach(item => {
                totalItems += item.val().quantity;
            });
        });

        cartCountElement.textContent = totalItems;  // update  cart count based on fb data
        console.log(`Updated cart count to: ${totalItems}`);
    });
}

displayProducts('vegetables', 'vegetables-container');
displayProducts('fruits', 'fruits-container');
displayProducts('Meat & Poultry', 'meat-container');

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, `users/${user.uid}`);
        get(userRef).then(snapshot => {
            if (snapshot.exists()) {
                const householdId = snapshot.val().householdId;
                updateCartCount(householdId);
            }
        });
    }
});
