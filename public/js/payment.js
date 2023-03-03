const form = document.getElementById("paymentForm");

const transferWiseDiv = document.getElementById("transferWiseDiv");
const xoomDiv = document.getElementById("xoomDiv");
const huskyDiv = document.getElementById("huskyDiv");

const preferredPaymentMethod = document.getElementById("preferredPaymentMethod");
const bankInputs = bankDiv.getElementsByTagName("input");
const paypalInputs = paypalDiv.getElementsByTagName("input");
const transferWiseInputs = transferWiseDiv.getElementsByTagName("input");
const xoomInputs = xoomDiv.getElementsByTagName("input");
const huskyInputs = huskyDiv.getElementsByTagName("input");
const xoomCountry = document.getElementById("xoomCountry");

window.onload = () => {
    const method = preferredPaymentMethod.options[preferredPaymentMethod.selectedIndex].innerText;
    clearInputs();
    if (method === "Paypal") {
        for (let i = 0; i < paypalInputs.length; i++) {
            paypalInputs[i].required = true;
        }
    }
    else if (method === "Bankwire (SEPA & SWIFT)"){
        for (let i = 0; i < bankInputs.length; i++) {
            bankInputs[i].required = true;
        }
    }
    else if (method === "WISE (previously known as TransferWise)") {
        for (let i = 0; i < transferWiseInputs.length; i++) {
            transferWiseInputs[i].required = true;
        }
    }
    else if (method === "Xoom") {
        const confirmation = confirm("Are you sure you cannot use PayPal, Bankwire or TransferWise? Ok/Cancel");
        if (!confirmation) {
            preferredPaymentMethod.selectedIndex = 0;
        }
        else {
            for (let i = 0; i < xoomInputs.length; i++) {
                xoomInputs[i].required = true;
            }
            xoomCountry.required = true;
        }
    }
    else if (method === "Husky") {
        for (let i = 0; i < huskyInputs.length; i++) {
            huskyInputs[i].required = true;
        }
    }

    let value = companyPersonal.options[companyPersonal.selectedIndex];
    if (value) {
        value = value.value;
        if (value === "company") {
            companyDiv.classList.remove("d-none");
            companyName.required = true;
            vat.required = true;
        }
        else {
            companyDiv.classList.add("d-none");
            companyName.required = false;
            vat.required = false;
        }
    }

};

preferredPaymentMethod.addEventListener("change", (evt) => {
    const method = preferredPaymentMethod.options[preferredPaymentMethod.selectedIndex].innerText;
    clearInputs();
    if (method === "Paypal") {
        for (let i = 0; i < paypalInputs.length; i++) {
            paypalInputs[i].required = true;
        }
    }
    else if (method === "Bankwire (SEPA & SWIFT)"){
        for (let i = 0; i < bankInputs.length; i++) {
            bankInputs[i].required = true;
        }
    }
    else if (method === "WISE (previously known as TransferWise)") {
        for (let i = 0; i < transferWiseInputs.length; i++) {
            transferWiseInputs[i].required = true;
        }
    }
    else if (method === "Xoom") {
        const confirmation = confirm("Are you sure you cannot use PayPal, Bankwire or TransferWise? Ok/Cancel");
        if (!confirmation) {
            preferredPaymentMethod.selectedIndex = 0;
        }
        else {
            for (let i = 0; i < xoomInputs.length; i++) {
                xoomInputs[i].required = true;
            }
            xoomCountry.required = true;
        }
    }
    else if (method === "Husky") {
        for (let i = 0; i < huskyInputs.length; i++) {
            huskyInputs[i].required = true;
        }
    }
});


function companyPersonalListener(evt) {
    let value = evt.options[evt.selectedIndex];

    if (value) {
        value = value.value;
        if (value === "company") {
            companyDiv.classList.remove("d-none");
            companyName.required = true;
            vat.required = true;
        }
        else {
            companyDiv.classList.add("d-none");
            companyName.required = false;
            vat.required = false;
        }
    }
}

function clearInputs() {
    for (let i = 0; i < bankInputs.length; i++) {
        bankInputs[i].required = false;
    }
    for (let i = 0; i < paypalInputs.length; i++) {
        paypalInputs[i].required = false;
    }
    for (let i = 0; i < transferWiseInputs.length; i++) {
        transferWiseInputs[i].required = false;
    }
    for (let i = 0; i < xoomInputs.length; i++) {
        xoomInputs[i].required = false;
    }
    xoomCountry.required = false;
    for (let i = 0; i < huskyInputs.length; i++) {
        huskyInputs[i].required = false;
    }
}