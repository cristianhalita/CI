const form = document.getElementById("personalForm");

const inputs = form.getElementsByTagName("input");
const selects = form.getElementsByTagName("select");

const submitBtn = document.getElementById("submitButton");

for (let i = 0; i < inputs.length; i++){
    inputs[i].addEventListener("change", eventListener);
}

function eventListener(evt) {
    submitBtn.disabled = false;
}

for (let i = 0; i < selects.length; i++){
    selects[i].addEventListener("change", eventListener);
} 