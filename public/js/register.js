const languagePairSelect = document.getElementById("languagePairSelect");
const languagePairLink = document.getElementById("languagePairLink");
const languagePairList = document.getElementById("languagePairList");
// const languagePairValues = document.getElementById("languagePairValues");
const languagePairSelectDiv = document.getElementById("languagePairs");
const languagePair1 = document.getElementById("languagePair1");
const languagePair2 = document.getElementById("languagePair2");
const languagePair3 = document.getElementById("languagePair3");
const languagePair4 = document.getElementById("languagePair4");

const submitButton = document.getElementById("submitButton");
const hiddenSubmitButton = document.getElementById("hiddenSubmitButton");

submitButton.addEventListener("click",(evt) => {
    if (languagePair1.value || languagePair2.value || languagePair3.value || languagePair4.value) {
        hiddenSubmitButton.click();
    }
    else {
        alert("Pleas click on 'ADD TO MY LANGUAGE PAIR LIST'");
        // languagePairSelectDiv.style.border = "1px solid red";
        // languagePairSelectDiv.style['border-radius'] = "5px";
    }
});

function buttonClickListener(evt) {
    const id = evt.target.value;
    const name = evt.target.getAttribute("languagePairName");
    let option = document.createElement("option");
    option.value = id;
    option.innerText = name;
    languagePairSelect.add(option);

    if (languagePair1.value == id) {
        languagePair1.value = null;
    }
    if (languagePair2.value == id) {
        languagePair2.value = null;
    }
    if (languagePair3.value == id) {
        languagePair3.value = null;
    }
    if (languagePair4.value == id) {
        languagePair4.value = null;
    }
    evt.target.parentElement.parentElement.remove();
    languagePairSelect.required = !(languagePair1.value || languagePair2.value || languagePair3.value || languagePair4.value);
}

languagePairLink.addEventListener("click", (evt) => {
    evt.preventDefault();
    const selectedLanguagePair = languagePairSelect.options[languagePairSelect.selectedIndex];
    const id = selectedLanguagePair.value;
    if (!id) {
        return;
    }
    const name = selectedLanguagePair.innerText;

    let changed = false;
    if (!languagePair1.value) {
        languagePair1.value = id;
        changed = true;
    }
    else if (!languagePair2.value) {
        languagePair2.value = id;
        changed = true;
    }
    else if (!languagePair3.value) {
        languagePair3.value = id;
        changed = true;
    }
    else if (!languagePair4.value) {
        languagePair4.value = id;
        changed = true;
    }
    else {
        alert("You can select a maximum of 4 language pairs.");
    }

    if (changed) {
        addRow(id, name);
    }
});

window.onload =  () => {
    if (languagePair1.value) {
        const name = removeOneOptions(languagePair1.value);
        addRow(languagePair1.value, name);
    }
    if (languagePair2.value) {
        const name = removeOneOptions(languagePair2.value);
        addRow(languagePair2.value, name);
    }
    if (languagePair3.value) {
        const name = removeOneOptions(languagePair3.value);
        addRow(languagePair3.value, name);
    }
    if (languagePair4.value) {
        const name = removeOneOptions(languagePair4.value);
        addRow(languagePair4.value, name);
    }
};

function removeOneOptions(id) {
    for (let i = 0; i < languagePairSelect.options.length; i++) {
        let currentOption = languagePairSelect.options[i];
        if (currentOption.value == id) {
            const name = currentOption.innerText;
            currentOption.remove();
            return name;
        }
    }
}

function addRow(id, name) {
    let trElement = document.createElement("tr");
    let nameTd = document.createElement("td");
    nameTd.innerText = name;
    trElement.appendChild(nameTd);
    let buttonTd = document.createElement("td");
    let buttonElement = document.createElement("button");
    buttonElement.type = "button";
    buttonElement.innerText = "Remove";
    buttonElement.value = id;
    buttonElement.classList.add('btn', 'btn-danger');
    buttonElement.setAttribute("languagePairName", name);
    buttonElement.addEventListener("click", buttonClickListener);
    buttonTd.appendChild(buttonElement);
    trElement.appendChild(buttonTd);
    languagePairList.appendChild(trElement);
    removeOneOptions(id);
    languagePairSelect.required = !(languagePair1.value || languagePair2.value || languagePair3.value || languagePair4.value);
}

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("email")) {
    document.getElementById("email").value = urlParams.get('email');
    document.getElementById("email").readOnly = true;
}
if (urlParams.has("firstName")) {
    document.getElementById("firstName").value = urlParams.get('firstName');
    document.getElementById("firstName").readOnly = true;
}
if (urlParams.has("lastName")) {
    document.getElementById("lastName").value = urlParams.get('lastName');
    document.getElementById("lastName").readOnly = true;
}
