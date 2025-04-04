let items = [];
let receiptNumber = "CS-0001";
let database = {
    products: {
        "4890008100309": { name: "Milk 500ml", price: 65.00 },
        "5901234123457": { name: "Bread 400g", price: 55.00 },
        "4890008100316": { name: "Sugar 1kg", price: 130.00 },
        "4890008100323": { name: "Rice 2kg", price: 220.00 },
        "4890008100330": { name: "Cooking Oil 1L", price: 195.00 },
        "4890008100347": { name: "Maize Flour 2kg", price: 140.00 },
        "4890008100354": { name: "Tea Leaves 250g", price: 85.00 },
        "4890008100361": { name: "Salt 1kg", price: 35.00 },
        "4890008100378": { name: "Soap Bar", price: 45.00 },
        "4890008100385": { name: "Toilet Paper 4 Rolls", price: 95.00 }
    }
};

// Initialize the date and time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('date-time').textContent = now.toLocaleDateString('en-KE', options);
    document.getElementById('receipt-datetime').textContent = now.toLocaleDateString('en-KE', options);
}

// Update the receipt totals
function updateTotals() {
    let subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let vat = subtotal * 0.16;
    let total = subtotal + vat;

    document.getElementById('subtotal').textContent = `KSh ${subtotal.toFixed(2)}`;
    document.getElementById('vat').textContent = `KSh ${vat.toFixed(2)}`;
    document.getElementById('total').textContent = `KSh ${total.toFixed(2)}`;
}

// Add item to receipt
function addItemToReceipt(barcode, name, price, quantity) {
    // Add to items array
    const itemTotal = price * quantity;
    const item = { barcode, name, price, quantity, total: itemTotal };
    items.push(item);

    // Add to receipt table
    const receiptBody = document.getElementById('receipt-body');
    const row = document.createElement('tr');
    row.innerHTML = `
                <td>${name}</td>
                <td>${quantity}</td>
                <td>KSh ${price.toFixed(2)}</td>
                <td>KSh ${itemTotal.toFixed(2)}</td>
                <td><button class="remove-item" data-index="${items.length - 1}">X</button></td>
            `;
    receiptBody.appendChild(row);

    // Update totals
    updateTotals();

    // Add event listener to remove button
    row.querySelector('.remove-item').addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        items.splice(index, 1);
        receiptBody.removeChild(row);
        updateTotals();
        // Re-index the remove buttons
        document.querySelectorAll('.remove-item').forEach((btn, i) => {
            btn.setAttribute('data-index', i);
        });
    });
}

// Clear the receipt
function clearReceipt() {
    items = [];
    document.getElementById('receipt-body').innerHTML = '';
    updateTotals();
    // Generate new receipt number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    receiptNumber = `CS-${randomNum}`;
    document.getElementById('receipt-number').textContent = receiptNumber;
    updateDateTime();
}

// Save product to database
function saveProductToDatabase(barcode, name, price) {
    database.products[barcode] = { name, price };
    console.log(`Product added to database: ${barcode}, ${name}, KSh ${price}`);
}

// Handle barcode scanning
function handleBarcodeInput(barcode) {
    if (database.products[barcode]) {
        const product = database.products[barcode];
        document.getElementById('barcode').value = barcode;
        document.getElementById('product-name').value = product.name;
        document.getElementById('price').value = product.price;
        document.getElementById('scanner-status').textContent = `Scanned: ${product.name} - KSh ${product.price}`;

        // Add item automatically
        addItemToReceipt(barcode, product.name, product.price, 1);

        // Clear inputs except barcode
        document.getElementById('barcode').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('price').value = '';
        document.getElementById('quantity').value = '1';
    } else {
        document.getElementById('scanner-status').textContent = `Product not found: ${barcode}. Please enter details manually.`;
        document.getElementById('barcode').value = barcode;
    }
}

// Print receipt
function printReceipt() {
    // Create a printable version of the receipt
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
                <html>
                <head>
                    <title>Receipt - ${receiptNumber}</title>
                    <style>
                        body {
                            font-family: 'Courier New', monospace;
                            width: 80mm;
                            margin: 0 auto;
                            padding: 5mm;
                        }
                        .receipt-header {
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                        th, td {
                            text-align: left;
                            padding: 3px 0;
                        }
                        .receipt-footer {
                            text-align: center;
                            margin-top: 10px;
                            font-size: 12px;
                            border-top: 1px dashed #000;
                            padding-top: 10px;
                        }
                        .item-row {
                            border-bottom: 1px dotted #ddd;
                        }
                        .total-row {
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt-header">
                        <h2>Comolor's Supermarket</h2>
                        <p>Nairobi, Kenya</p>
                        <p>TEL: +254 700 000000</p>
                        <p>${document.getElementById('receipt-datetime').textContent}</p>
                        <p>Receipt #: ${receiptNumber}</p>
                    </div>
                    
                    <table>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                        ${items.map(item => `
                            <tr class="item-row">
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>${item.price.toFixed(2)}</td>
                                <td>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </table>
                    
                    <table style="margin-top: 10px;">
                        <tr>
                            <td>Subtotal:</td>
                            <td>KSh ${document.getElementById('subtotal').textContent.replace('KSh ', '')}</td>
                        </tr>
                        <tr>
                            <td>VAT (16%):</td>
                            <td>KSh ${document.getElementById('vat').textContent.replace('KSh ', '')}</td>
                        </tr>
                        <tr class="total-row">
                            <td>TOTAL:</td>
                            <td>KSh ${document.getElementById('total').textContent.replace('KSh ', '')}</td>
                        </tr>
                    </table>
                    
                    <div class="receipt-footer">
                        <p>Thank you for shopping at Comolor's Supermarket!</p>
                        <p>Please come again</p>
                        <p>Goods once sold are not returnable</p>
                    </div>
                </body>
                </html>
            `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
    // Initialize date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Add item button
    document.getElementById('add-item').addEventListener('click', function () {
        const barcode = document.getElementById('barcode').value;
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('price').value);
        const quantity = parseInt(document.getElementById('quantity').value);

        if (name && price && quantity) {
            addItemToReceipt(barcode, name, price, quantity);

            // If barcode is provided, save to database
            if (barcode && !database.products[barcode]) {
                saveProductToDatabase(barcode, name, price);
            }

            // Clear inputs
            document.getElementById('barcode').value = '';
            document.getElementById('product-name').value = '';
            document.getElementById('price').value = '';
            document.getElementById('quantity').value = '1';
        } else {
            alert('Please fill in all fields');
        }
    });

    // Quick add buttons
    document.querySelectorAll('.quick-add button').forEach(button => {
        button.addEventListener('click', function () {
            const barcode = this.getAttribute('data-barcode');
            const name = this.getAttribute('data-name');
            const price = parseFloat(this.getAttribute('data-price'));
            addItemToReceipt(barcode, name, price, 1);
        });
    });

    // New receipt button
    document.getElementById('new-receipt').addEventListener('click', clearReceipt);

    // Print receipt button
    document.getElementById('print-receipt').addEventListener('click', printReceipt);

    // Save receipt button
    document.getElementById('save-receipt').addEventListener('click', function () {
        alert(`Receipt ${receiptNumber} saved to database.`);
        clearReceipt();
    });

    // Barcode scanner simulation
    document.getElementById('barcode').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const barcode = this.value.trim();
            if (barcode) {
                handleBarcodeInput(barcode);
            }
        }
    });

    // Listen for barcode scanner input (which often ends with Enter key)
    document.addEventListener('keydown', function (e) {
        if (document.activeElement !== document.getElementById('barcode') &&
            document.activeElement.tagName !== 'INPUT') {
            const key = e.key;

            // If Enter key is pressed after scanning
            if (key === 'Enter' && window.currentBarcode) {
                e.preventDefault();
                handleBarcodeInput(window.currentBarcode);
                window.currentBarcode = '';
            }
            // Build up barcode as it's scanned
            else if (/[\d]/.test(key)) {
                if (!window.currentBarcode) window.currentBarcode = '';
                window.currentBarcode += key;
            }
        }
    });
});