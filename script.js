// Function to submit the order
function submitOrder() {
  var nameInput = document.getElementById('name');
  if (!nameInput || nameInput.value.trim() === '') {
    alert('Please enter a name.');
    return;
  }
  var name = nameInput.value.trim();

  var selectedItems = [];
  var checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
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

  var total = parseFloat(document.getElementById('total').textContent.substring(1));
  var discountApplied = document.getElementById('discount-checkbox').checked;

  if (discountApplied) {
    total *= 0.85; // Apply 15% discount
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
        { name: 'Commission (15%)', value: `$${commission}`, inline: true }
      ]
    }]
  });

  xhr.send(message);
}
