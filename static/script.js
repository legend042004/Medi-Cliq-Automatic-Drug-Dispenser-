document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const startScanBtn = document.getElementById('startScan');
    const cancelScanBtn = document.getElementById('cancelScan');
    const scanResult = document.getElementById('scanResult');
    const medicineGrid = document.getElementById('medicineGrid');
    const cartButton = document.getElementById('cartButton');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const clearCartBtn = document.getElementById('clearCart');
    const checkoutBtn = document.getElementById('checkout');

    // Cart state
    let cart = [];
    let medicinesAvailable = {};

    // Fetch and display medicines
    async function loadMedicines() {
        try {
            const response = await fetch('/get_medicines');
            const data = await response.json();
            
            if (data.status === 'success') {
                medicinesAvailable = {};
                medicineGrid.innerHTML = data.data.map(medicine => {
                    medicinesAvailable[medicine.id] = medicine.quantity;
                    return `
                        <div class="bg-white p-4 rounded-lg shadow-md">
                            <h3 class="text-lg font-semibold mb-2">${medicine.name} (ID: ${medicine.id})</h3>
                            <p class="text-gray-600 mb-2">Available: ${medicine.quantity}</p>
                            <button onclick='addToCart(${JSON.stringify(medicine)});'
                                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                Add to Cart
                            </button>
                            <input type="number" id="quantity-${medicine.id}" value="1" min="1" max="${medicine.quantity - 1}" class="border p-1 w-16 mt-2">
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    }

    // Add to cart function
    window.addToCart = function(medicine) {
        const existingItem = cart.find(item => item.id === medicine.id);
        const quantityInput = document.getElementById(`quantity-${medicine.id}`);
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        const maxQuantity = medicinesAvailable[medicine.id] - 1;
        
        if (quantity > maxQuantity) {
            alert(`You cannot add more than ${maxQuantity} of this medicine.`);
            return;
        }

        if (existingItem) {
            existingItem.cartQuantity += quantity;
        } else {
            cart.push({ ...medicine, cartQuantity: quantity });
        }
        updateCartUI();
    };

    // Update cart UI
    function updateCartUI() {
        cartCount.textContent = cart.length;
        cartItems.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                    <h4 class="font-semibold">${item.name} (ID: ${item.id})</h4>
                    <p class="text-gray-600">Quantity: ${item.cartQuantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="updateQuantity(${item.id}, ${item.cartQuantity - 1})"
                            class="bg-gray-200 px-2 py-1 rounded">-</button>
                    <span>${item.cartQuantity}</span>
                    <button onclick="updateQuantity(${item.id}, ${Math.min(item.cartQuantity + 1, medicinesAvailable[item.id] - 1)})"
                            class="bg-gray-200 px-2 py-1 rounded">+</button>
                </div>
            </div>
        `).join('');
    }

    // Update quantity for non-scanned medicines
    window.updateQuantity = function(medicineId, newQuantity) {
        const item = cart.find(med => med.id === medicineId);
        if (item && newQuantity > 0 && newQuantity <= medicinesAvailable[medicineId] - 1) {
            item.cartQuantity = newQuantity;
        } else if (newQuantity <= 0) {
            cart = cart.filter(med => med.id !== medicineId);
        }
        updateCartUI();
    };

    startScanBtn.addEventListener('click', async () => {
        scanResult.textContent = 'Scanning...';
        try {
            const response = await fetch('/scan_qr');
            const data = await response.json();

            if (data.status === 'success') {
                addToCart(data.data);
                scanResult.textContent = `Added ${data.data.name} to cart!`;
            } else {
                scanResult.textContent = `Error: ${data.message}`;
            }
        } catch (error) {
            scanResult.textContent = `Error: ${error.message}`;
        }
    });
    cartButton.addEventListener('click', () => cartModal.classList.remove('hidden'));
    closeCart.addEventListener('click', () => cartModal.classList.add('hidden'));

    clearCartBtn.addEventListener('click', () => {
        cart = [];
        updateCartUI();
    });


    // Proceed to Pay and Update Database
    checkoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/update_medicine_stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart })
            });
            const data = await response.json();
            if (data.status === 'success') {
                alert('Order placed successfully!');
                cart = [];
                updateCartUI();
                loadMedicines(); // Refresh available quantities
            } else {
                alert('Error updating stock: ' + data.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });

    // Initial load
    loadMedicines();
});
