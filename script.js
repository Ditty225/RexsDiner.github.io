// Global variables to track the discount and combo meals status
var discountApplied = false;
var selectedCombos = {};

// Define combo meals
var comboMeals = [
    {
        name: 'Combo 1',
        price: 1000,
        items: ['Steak Chargers', 'Fries', 'Shake of choice']
    },
    {
        name: 'Combo 2',
        price: 1500,
        items: ['Burger', 'Onion Rings', 'Soft Drink']
    },
    // Add more combos as needed
];

// Function to calculate the total
function calculateTotal() {
    var total = 0;
    var checkboxes = document.querySelectorAll('.menu-items input[type="checkbox"]:checked');

    checkboxes.forEach(function(checkbox) {
        var quantityInput = checkbox.closest('.menu-item').querySelector('input[type="number"]');
        var quantity = parseInt(quantityInput.value, 10);
        var price = parseFloat(checkbox.value);
        total += price * quantity;
    });

    // Apply combo meal prices if any are selected
    for (var comboName in selectedCombos) {
        if (selectedCombos.hasOwnProperty(comboName)) {
            var combo = comboMeals.find(function(c) { return c.name === comboName; });
            if (combo) {
                total += combo.price * selectedCombos[comboName];
            }
        }
    }

    // Apply discount if it's active
    if (discountApplied) {
        total *= 0.85; // Apply 15% discount
    }

    var totalElement = document.getElementById('total');
    totalElement.textContent = total.toFixed(2); // Update the total on the page
}

// Function to toggle discount
function toggleDiscount() {
    discountApplied = !discountApplied; // Toggle the discount status
    var button = document.getElementById('apply-discount-button');
    button.textContent = discountApplied ? 'Remove Discount' : 'Apply Discount';
    calculateTotal(); // Recalculate the total with or without the discount
}

// Function to zero out the total
function zeroTotal() {
    var totalElement = document.getElementById('total');
    totalElement.textContent = '0.00'; // Set the total display to 0.00
    alert('Total has been zeroed out for employee voucher.'); // Optional: alert to confirm the action
    window.zeroedTotal = true; // Add a flag to indicate the total should be treated as zero
}

// Function to update combo meal selection
function updateComboMeal(comboName) {
    var comboQuantity = parseInt(document.getElementById(`combo-${comboName.replace(/\s+/g, '-')}-quantity`).value, 10);
    if (comboQuantity > 0) {
        selectedCombos[comboName] = comboQuantity;
    } else {
        delete selectedCombos[comboName];
    }
    calculateTotal(); // Recalculate the total with or without the combo meal
}

// Function to submit the order
function submitOrder() {
    var nameInput = document.getElementById('name');
    if (!nameInput || nameInput.value.trim() === '') {
        alert('Please enter a name.');
        return;
    }
    var name = nameInput.value.trim();

    var selectedItems = [];
    var checkboxes = document.querySelectorAll('.menu-items input[type="checkbox"]:checked');
    checkboxes.forEach(function(checkbox) {
        var itemName = checkbox.nextElementSibling.textContent;
        var quantityInput = checkbox.closest('.menu-item').querySelector('input[type="number"]');
        var quantity = parseInt(quantityInput.value, 10);
        var price = parseFloat(checkbox.value);
        selectedItems.push({
            name: itemName.trim(),
            quantity: quantity,
            price: price
        });
    });

    // Add combo meal items if any are selected
    for (var comboName in selectedCombos) {
        if (selectedCombos.hasOwnProperty(comboName)) {
            var combo = comboMeals.find(function(c) { return c.name === comboName; });
            if (combo) {
                for (var i = 0; i < selectedCombos[comboName]; i++) {
                    combo.items.forEach(function(item) {
                        selectedItems.push({
                            name: item,
                            quantity: 1,
                            price: combo.price / combo.items.length // Distribute combo meal price among items
                        });
                    });
                }
            }
        }
    }

    var total = parseFloat(document.getElementById('total').textContent);

    // Check if the total was zeroed out
    if (window.zeroedTotal) {
        total = 0; // Override the total to zero if zeroedTotal flag is true
    }

    var commission = (total * 0.15).toFixed(2);

    var discordWebhookURL = 'https://discord.com/api/webhooks/1230691479316332586/v0F0gtfhrZcG0p_kY5DtwdKHsA6q8mRWrN_eP6SpxqNanRPRtFXVlutQvbT5zdm8RX96';

    var xhr = new XMLHttpRequest();
    xhr.open('POST', discordWebhookURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 204 || (xhr.status >= 200 && xhr.status < 300)) {
                alert('Order submitted successfully!');
            } else {
                alert('Failed to submit the order. Please try again.');
            }
        }
    };

    var embedDescription = selectedItems.map(item => `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join('\n');
    var voucherMessage = window.zeroedTotal ? 'Employee voucher used: Yes' : 'Employee voucher used: No';

    var message = JSON.stringify({
        content: 'New order!',
        embeds: [{
            title: 'Order Details',
            description: embedDescription,
            color: 5814783,
            fields: [
                { name: 'Name', value: name, inline: true },
                { name: 'Total', value: `$${total.toFixed(2)}`, inline: true },
                { name: 'Discount Applied', value: discountApplied ? 'Yes (15% off)' : 'No', inline: true },
                { name: 'Commission (15%)', value: `$${commission}`, inline: true },
                { name: 'Voucher', value: window.zeroedTotal ? 'Employee voucher used: Yes' : 'Employee voucher used: No', inline: false }

            ]
        }]
    });

    xhr.send(message);
}

// Function to reset the calculator
function resetCalculator() {
    var checkboxes = document.querySelectorAll('.menu-items input[type="checkbox"]');
    var quantityInputs = document.querySelectorAll('.menu-items input[type="number"]');

    checkboxes.forEach(function(checkbox) {
        checkbox.checked = false;
    });

    quantityInputs.forEach(function(quantityInput) {
        quantityInput.value = 1;
    });

    discountApplied = false; // Reset the discount status
    selectedCombos = {}; // Reset the combo meals selection
    document.getElementById('apply-discount-button').textContent = 'Apply Discount'; // Reset the button text

    comboMeals.forEach(function(combo) {
        var quantityInput = document.getElementById(`combo-${combo.name.replace(/\s+/g, '-')}-quantity`);
        quantityInput.value = 0; // Reset combo meal quantities
    });

    window.zeroedTotal = false; // Reset the zeroed total flag here only
    calculateTotal(); // Recalculate the total to $0.00
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('apply-discount-button').addEventListener('click', toggleDiscount);
    document.getElementById('calculate-button').addEventListener('click', calculateTotal);
    document.getElementById('zero-total-button').addEventListener('click', zeroTotal);
    document.getElementById('submit-order-button').addEventListener('click', submitOrder);
    document.getElementById('reset-button').addEventListener('click', resetCalculator);

    comboMeals.forEach(function(combo) {
        var container = document.createElement('div');
        container.className = 'combo-container';

        var label = document.createElement('label');
        label.textContent = combo.name;

        var quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.id = `combo-${combo.name.replace(/\s+/g, '-')}-quantity`;
        quantityInput.value = 0;
        quantityInput.min = 0;
        quantityInput.addEventListener('change', function() {
            updateComboMeal(combo.name);
        });

        container.appendChild(label);
        container.appendChild(quantityInput);
        document.getElementById('combo-meal-buttons').appendChild(container);
    });

    calculateTotal(); // Ensure the total is calculated on initial load
});
