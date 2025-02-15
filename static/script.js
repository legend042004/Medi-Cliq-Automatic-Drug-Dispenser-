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

    // Fetch and display medicines
    async function loadMedicines() {
        try {
            const response = await fetch('/get_medicines');
            const data = await response.json();
            
            if (data.status === 'success') {
                medicineGrid.innerHTML = data.data.map(medicine => `
                    <div class="bg-white p-4 rounded-lg shadow-md">
                        <h3 class="text-lg font-semibold mb-2">${medicine.name}</h3>
                        <p class="text-gray-600 mb-2">Available: ${medicine.quantity}</p>
                        <button onclick='addToCart(${JSON.stringify(medicine)});'
                            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                            Add to Cart
                        </button>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading medicines:', error);
        }
    }

    // Add to cart function
    window.addToCart = function(medicine) {
        const existingItem = cart.find(item => item.id === medicine.id);
        if (existingItem) {
            existingItem.cartQuantity += 1;
        } else {
            cart.push({ ...medicine, cartQuantity: 1 });
        }
        updateCartUI();
    };

    // Update cart UI
    function updateCartUI() {
        cartCount.textContent = cart.length;
        cartItems.innerHTML = cart.map(item => `
            <div class="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                    <h4 class="font-semibold">${item.name}</h4>
                    <p class="text-gray-600">Quantity: ${item.cartQuantity}</p>
                </div>
            </div>
        `).join('');
    }

    // QR Scanner functionality
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

    // Cart modal controls
    cartButton.addEventListener('click', () => cartModal.classList.remove('hidden'));
    closeCart.addEventListener('click', () => cartModal.classList.add('hidden'));

    // Clear cart
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        updateCartUI();
    });

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        alert('Order placed successfully!');
        cart = [];
        updateCartUI();
        cartModal.classList.add('hidden');
    });

    // Initial load
    loadMedicines();
});
