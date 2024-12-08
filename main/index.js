// index.hmtl functions 

import { db } from "./firebase-config.js"; 

// fetch data from firebase realtime db to be displayed
function displayProducts(category, containerId) {
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
                        <button id="add-to-cart-${productId}">
                            Add to Cart
                        </button>
                    `;
                    container.appendChild(productElement);

                    // add item to cart button functions
                    const addToCartButton = document.getElementById(`add-to-cart-${productId}`);
                    addToCartButton.addEventListener('click', () => addToSharedCart(productId, product.name, product.price));
                }
            });
        } else {
            console.error("No products available");
        }
    }).catch(error => console.error("Error fetching products:", error));
}