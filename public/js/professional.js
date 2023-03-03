const freelanceTypeDiv = document.getElementById("freelanceType");
const inputsFreelanceType = freelanceTypeDiv.getElementsByTagName("input");

for (let i = 0; i < inputsFreelanceType.length; i++){
    if (inputsFreelanceType[i].type === "radio") {
        inputsFreelanceType[i].addEventListener("change", changeOther);
    }
}

function changeOther(evt) {
    if (evt.target.id === "Other: " && evt.target.checked) {
        let textInput = document.createElement("input");
        textInput.id = "otherTextInput";
        textInput.value = document.getElementById("otherDescription").value;
        textInput.name = "otherDescription";

        textInput.placeholder = "Please describe.";
        textInput.style.float = "right";
        textInput.style.height = "100%";
        textInput.style.width = "80%";
        textInput.classList.add("form-control");
        textInput.required = true;
        textInput.addEventListener("change", changeOther);
        evt.target.parentElement.appendChild(textInput);
    }
    else {
        try {
            console.log(evt.target, evt.target.parentElement);
            if (evt.target.type === "radio") {
                document.getElementById("otherTextInput").remove();
            }
        }
        catch (e) {
            console.log(e);
        }
    }
}



const languagePairSelect = document.getElementById("languagePairSelect");
const languagePairLink = document.getElementById("languagePairLink");
const languagePairList = document.getElementById("languagePairList");

const languagePair1 = document.getElementById("languagePair1");
const languagePair2 = document.getElementById("languagePair2");
const languagePair3 = document.getElementById("languagePair3");
const languagePair4 = document.getElementById("languagePair4");

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
const form = document.getElementById("professionalForm");

const inputs = form.getElementsByTagName("input");
const selects = form.getElementsByTagName("select");

const submitBtn = document.getElementById("submitButton");

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
    const buttons = languagePairList.getElementsByTagName("button");




    languagePairSelect.required = !(languagePair1.value || languagePair2.value || languagePair3.value || languagePair4.value);

    for (let i = 0; i < inputsFreelanceType.length; i++){
        if (inputsFreelanceType[i].checked && inputsFreelanceType[i].id === "Other: ") {
            let textInput = document.createElement("input");
            textInput.id = "otherTextInput";
            textInput.value = document.getElementById("otherDescription").value;
            textInput.name = "otherDescription";

            textInput.placeholder = "Please describe.";
            textInput.style.float = "right";
            textInput.style.height = "100%";
            textInput.style.width = "80%";
            textInput.classList.add("form-control");
            textInput.required = true;
            textInput.addEventListener("change", changeOther);
            inputsFreelanceType[i].parentElement.appendChild(textInput);
        }
    }

