const paymentSelect = document.getElementById("preferredPaymentMethod");
const paypalDiv = document.getElementById("paypalDiv");
const bankDiv = document.getElementById("bankDiv");
const companyDiv = document.getElementById("companyDiv");
const vat = document.getElementById("vat");
const companyName = document.getElementById("companyName");
const companyPersonal = document.getElementById("companyPersonal");

paymentSelect.addEventListener("change", () => {
    const selectedOption = paymentSelect.options[paymentSelect.selectedIndex].innerText;
    if (selectedOption == "Paypal"){
        const paypalInputs = paypalDiv.getElementsByTagName("input");
        for (let i = 0; i < paypalInputs.length; i++){
            paypalInputs[i].required = true;
        }
        const bankInputs = bankDiv.getElementsByTagName("input");
        for (let i = 0; i < bankInputs.length; i++) {
            bankInputs[i].required = false;
        }
    }
    else if (selectedOption == "Bankwire (SEPA & SWIFT)"){
        const paypalInputs = paypalDiv.getElementsByTagName("input");
        for (let i = 0; i < paypalInputs.length; i++){
            paypalInputs[i].required = false;
        }
        const bankInputs = bankDiv.getElementsByTagName("input");
        for (let i = 0; i < bankInputs.length; i++) {
            bankInputs[i].required = true;
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