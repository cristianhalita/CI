const readMessagesDiv = document.getElementById("readMessagesDiv");
const readWarningsDiv = document.getElementById("readWarningsDiv");
const noNewMessage = document.getElementById("noNewMessage");
const noArchivedMessage = document.getElementById("noArchivedMessage");
const noArchivedWarning = document.getElementById("noArchivedWarning");
const noNewWarning = document.getElementById("noNewWarning");

async function messageListener(checkBox, messageId, stamp, message) {
    if (checkBox.checked) {
        await readMessage(messageId);
        console.log(stamp, message);
        const pElement = document.createElement("p");
        const bElement = document.createElement("b");
        bElement.innerText = stamp;
        pElement.innerHTML = "<b>" + stamp + "</b>: " + message;
        readMessagesDiv.appendChild(pElement);

        console.log(checkBox.parentElement.remove());

        const count = noNewMessage.parentElement.getElementsByTagName("label").length;
        console.log(count);
        if (count < 1) {
            noNewMessage.classList.remove("d-none");
        }
        noArchivedMessage.classList.add("d-none");
    }
}

async function warningListener(checkBox, messageId, stamp, message) {
    if (checkBox.checked) {
        await readMessage(messageId);
        console.log(stamp, message);
        const pElement = document.createElement("p");
        const bElement = document.createElement("b");
        bElement.innerText = stamp;
        pElement.innerHTML = "<b>" + stamp + "</b>: " + message;
        readWarningsDiv.appendChild(pElement);

        console.log(checkBox.parentElement.remove());

        const count = noNewWarning.parentElement.getElementsByTagName("label").length;
        console.log(count);
        if (count < 1) {
            noNewWarning.classList.remove("d-none");
        }
        noArchivedWarning.classList.add("d-none");
    }
}

const unRead = document.getElementById("unRead");

async function readMessage(messageId) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const request = new Request(window.location.origin + window.location.pathname + "/messages/read", {
        method: "POST",
        body: JSON.stringify({
            messageId: messageId
        }),
        headers: headers
    });

    try {
        const response = await fetch(request);
        const status = response.status;

        console.log(status);
        const json = await response.json();

        if (status === 200) {
            unRead.innerText = json.unRead;
        }
        else {

        }
    }
    catch (e) {
        console.log(e);
    }
}

async function unReadMessage(messageId) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const request = new Request(window.location.origin + window.location.pathname + "/messages/unRead", {
        method: "POST",
        body: JSON.stringify({
            messageId: messageId
        }),
        headers: headers
    });

    try {
        const response = await fetch(request);
        const status = response.status;

        const json = await response.json();

        if (status === 200) {
            unRead.innerText = json.unRead;
        }
        else {

        }
    }
    catch (e) {
        console.log(e);
    }
}
