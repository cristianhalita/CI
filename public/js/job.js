const instructions = document.getElementsByClassName("instructions");
const submitButton = document.getElementById("submitButton");

let times = [];
let instructionId = null;
let start = null;
let end = null;

let screenshotStart, screenshotEnd, videoStart, videoEnd,
previewStart, previewEnd;
let isScreenshotOpened = false, isVideoOpened = false, isPreviewOpened = false;
let screenShotTime = 0, videoTime = 0, previewTime = 0;

for (let i = 0; i < instructions.length; i++) {
    instructions[i].addEventListener("click", clickListener);
    instructions[i].isClicked = false;
}

function clickListener(evt) {
    evt.target.isClicked = true;
    const currentInstruction = evt.target.innerText;

    closeAll();

    if (currentInstruction === "screenshot") {
        isScreenshotOpened = true;
    }
    else if (currentInstruction === "video") {
        isVideoOpened = true;
    }
    else if (currentInstruction === "preview") {
        isPreviewOpened = true;
    }
    else {
        instructionId = evt.target.getAttribute("instructionId");
    }

    checkIfAllClicked();
}

window.addEventListener("focus", (evt) => {
    if (instructionId) {
        end = new Date().getTime();
        const index = times.findIndex(value => value.instructionId === instructionId);
        let currentTime = 0;

        if (index === -1) {
            times.push({instructionId, time: end - start});
            currentTime = end - start;
        }
        else {
            times[index].time += end - start;
            currentTime = times[index].time;
        }

        console.log(instructionId);
        document.getElementById("instruction" + instructionId).value = currentTime;
    }
    else if (isScreenshotOpened) {
        screenshotEnd = new Date().getTime();
        screenShotTime += screenshotEnd - screenshotStart;
        document.getElementById("screenshot").value = screenShotTime;
    }
    else if (isVideoOpened) {
        videoEnd = new Date().getTime();
        videoTime += videoEnd - videoStart;
        document.getElementById("video").value = videoTime;
    }
    else if (isPreviewOpened) {
        previewEnd = new Date().getTime();
        previewTime += previewEnd - previewStart;
        document.getElementById("preview").value = previewTime;
    }

    closeAll();
});

window.addEventListener("blur", (evt) => {
    if (instructionId) {
        start = new Date().getTime();
    }
    else if (isScreenshotOpened) {
        screenshotStart = new Date().getTime();
    }
    else if (isVideoOpened) {
        videoStart = new Date().getTime();
    }
    else if (isPreviewOpened) {
        previewStart = new Date().getTime();
    }
});


function closeAll() {
    isPreviewOpened = false;
    isVideoOpened = false;
    isScreenshotOpened = false;
    instructionId = false;
}

function checkIfAllClicked() {
    for (let i = 0; i < instructions.length; i++) {
        if (!instructions[i].isClicked) {
            break;
        }
        else {
            if (i === instructions.length -1) {
                submitButton.disabled = false;
            }
        }
    }
}