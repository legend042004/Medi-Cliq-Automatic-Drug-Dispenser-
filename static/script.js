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
                            <button onclick='addNonPrescribedToCart(${JSON.stringify(medicine)});'
                                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                Add to Cart
                            </button>
                            <input type="number" id="quantity-${medicine.id}" value="1" min="1" max="${medicine.quantity}" class="border p-1 w-16 mt-2">
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    }
    
    // Add to cart function for non prescribed
    window.addNonPrescribedToCart = function (medicineString) {
        const medicine = typeof medicineString === "string" ? JSON.parse(medicineString) : medicineString;
        const existingItem = cart.find(item => item.id === medicine.id);
        const quantityInput = document.getElementById(`quantity-${medicine.id}`);
        const newQuantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
        if (existingItem) {
            const totalQuantity = existingItem.cartQuantity + newQuantity;
    
            if (totalQuantity > medicine.quantity) {
                alert(`You cannot add more than ${medicine.quantity} of this medicine.`);
                return;
            }
    
            existingItem.cartQuantity += newQuantity;
        } else {
            if (newQuantity > medicine.quantity) {
                alert(`You cannot add more than ${medicine.quantity} of this medicine.`);
                return;
            }
            cart.push({ ...medicine, cartQuantity: newQuantity });
        }
    
        updateCartUI();
    };
    
    //scanned meds add to cart
    window.addScannedToCart = function (scannedItem) {
        const existingItem = cart.find(item => item.id === scannedItem.medicine_id);
    
        if (existingItem) {
            alert(`${scannedItem.name} is already in the cart with a fixed quantity.`);
            return;
        }
    
        cart.push({
            id: scannedItem.medicine_id,
            name: scannedItem.name,
            cartQuantity: scannedItem.cartQuantity,
            quantity: scannedItem.quantity,
            isScanned: true
        });
    
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
                    ${item.isScanned 
                        ? `<span class="bg-gray-300 px-3 py-1 rounded text-gray-600">Scanned (Fixed)</span>` 
                        : `
                            <button onclick="updateQuantity(${item.id}, ${item.cartQuantity - 1})"
                                    class="bg-gray-200 px-2 py-1 rounded">-</button>
                            <span>${item.cartQuantity}</span>
                            <button onclick="updateQuantity(${item.id}, ${Math.min(item.cartQuantity + 1, item.quantity)})"
                                    class="bg-gray-200 px-2 py-1 rounded">+</button>
                          `
                    }
                </div>
            </div>
        `).join('');
    }
    
    // Update quantity for non-scanned medicines
    window.updateQuantity = function (medicineId, newQuantity) {
        const item = cart.find(med => med.id === medicineId);
    
        if (item) {
            if (newQuantity > item.quantity) {
                alert(`Only ${item.quantity} of this medicine are available.`);
                return;  // Stop increasing beyond stock
            }
    
            if (newQuantity > 0) {
                item.cartQuantity = newQuantity;
            } else {
                cart = cart.filter(med => med.id !== medicineId);  // Remove item only if zero
            }
        }
    
        updateCartUI();
    };
    

    startScanBtn.addEventListener('click', async () => {
        scanResult.textContent = 'Scanning...';
        try {
            const response = await fetch('/scan_qr');
            const data = await response.json();
    
            if (data.status === 'success' && data.medicines.length > 0) {
                data.medicines.forEach(scannedItem => {
                    addScannedToCart(scannedItem);  // Add each medicine to the cart
                });
    
                scanResult.textContent = `Scanned ${data.medicines.length} medicines successfully!`;
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
