// Basic market data simulation (replace with real API later)
document.addEventListener("DOMContentLoaded", function() {
    const data = [
        { index: "NIFTY 50", value: "22,450", change: "+0.42%" },
        { index: "SENSEX", value: "74,850", change: "+0.38%" },
        { index: "NASDAQ", value: "15,800", change: "-0.21%" },
        { index: "S&P 500", value: "5,350", change: "+0.12%" },
        { index: "USD-INR", value: "83.10", change: "-0.05%" },
    ];

    const container = document.getElementById("marketData");
    data.forEach(item => {
        const color = item.change.includes('-') ? 'text-danger' : 'text-success';
        container.innerHTML += `
            <div class="mx-3">
                <strong>${item.index}:</strong> ${item.value} <span class="${color}">${item.change}</span>
            </div>`;
    });
});

// Your Stripe publishable key
const stripe = Stripe('pk_test_51RZlAdRtfVnx9vNJuXLlxGSLdlLYbJOFotizf4ngpFrbK9IQz19xsd93BsanCZvvEJyNpYZDwil0qGOptUqpzbQF00HKj5CAEu');

async function startCheckout() {
  const response = await fetch('/create-checkout-session');  // Backend call
  const session = await response.json();
  const result = await stripe.redirectToCheckout({
    sessionId: session.id
  });
  if (result.error) {
    alert(result.error.message);
  }
}
