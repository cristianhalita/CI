let vatDiv, type, totalValue, totalToBePaid, nonVatDiv, vat, vatValue, paymentMethod, paypalDiv, wireTransferDiv, transferWiseDiv, xoomDiv;

window.onload = () => {
    vatDiv = document.getElementById("vatDiv");
    type = document.getElementById("type");
    totalValue = document.getElementById("totalValue");
    totalToBePaid = document.getElementById("totalToBePaid");
    nonVatDiv = document.getElementById("nonVatDiv");
    vat = document.getElementById("vat");
    vatValue = document.getElementById("vatValue");
    paypalDiv = document.getElementById("paypalDiv");
    wireTransferDiv = document.getElementById("wireTransferDiv");
    paymentMethod = document.getElementById("paymentMethod");
    transferWiseDiv = document.getElementById("transferWiseDiv");
    xoomDiv = document.getElementById("xoomDiv");

    paymentMethod.addEventListener("change", paymentMethodListener);
    vat.addEventListener("input", vatListener);
    type.addEventListener("change", typeListener);

    const currentType = type.options[type.selectedIndex].innerText;
    if (currentType === "Invoice") {
        vatDiv.style.display = "";
        nonVatDiv.style.display = "none";
    }
    else if (currentType === "Note") {
        nonVatDiv.style.display = "";
        vatDiv.style.display = "none";
    }

    const currentPaymentMethod = paymentMethod.options[paymentMethod.selectedIndex].innerText;

    clearDivs();

    if (currentPaymentMethod === "Paypal") {
        paypalDiv.style.display = "";
    }
    else if (currentPaymentMethod === "Bankwire (SEPA & SWIFT)") {
        wireTransferDiv.style.display = "";
    }
    else if (currentPaymentMethod === "WISE (previously known as TransferWise)") {
        transferWiseDiv.style.display = "";
    }
    else if (currentPaymentMethod === "Xoom") {
        xoomDiv.style.display = "";
    }
};

function clearDivs() {
    wireTransferDiv.style.display = "none";
    paypalDiv.style.display = "none";
    transferWiseDiv.style.display = "none";
    xoomDiv.style.display = "none";
}

function typeListener(evt) {
    const currentValue = evt.target.options[evt.target.selectedIndex].innerText;
    console.log(currentValue);
    if (currentValue === "Invoice") {
        vatDiv.style.display = "";
        nonVatDiv.style.display = "none";
    }
    else if (currentValue === "Note") {
        vatDiv.style.display = "none";
        nonVatDiv.style.display = "";
    }
}

function vatListener(evt) {
    const currentValue = evt.target.value;
    vatValue.innerText = totalValue.innerText / 100 * currentValue;
    vatValue.innerText = Math.floor(vatValue.innerText * 100) / 100;

    totalToBePaid.innerText = parseFloat(totalValue.innerText) + parseFloat(vatValue.innerText);
    totalToBePaid.innerText = Math.floor(totalToBePaid.innerText * 100) / 100;

}

function paymentMethodListener(evt) {
    const currentPaymentMethod = evt.target.options[paymentMethod.selectedIndex].innerText;

    clearDivs();

    if (currentPaymentMethod === "Paypal") {
        paypalDiv.style.display = "";
    }
    else if (currentPaymentMethod === "Bankwire (SEPA & SWIFT)") {
        wireTransferDiv.style.display = "";
    }
    else if (currentPaymentMethod === "WISE (previously known as TransferWise)") {
        transferWiseDiv.style.display = "";
    }
    else if (currentPaymentMethod === "Xoom") {
        xoomDiv.style.display = "";
    }
}
