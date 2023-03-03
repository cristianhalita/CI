const startTime = new Date().getTime();
const readingSpeed = document.getElementById("timeSpend");
const linkClicked = document.getElementById("linkClicked");
const link = document.getElementById("link");
const form = document.getElementById("form");
const submitButton = document.getElementById("submitButton");

link.addEventListener("click", (evt) => {
    linkClicked.value = "true";
});

submitButton.addEventListener("click", (evt) => {
    readingSpeed.value = new Date().getTime() - startTime;
    form.submit();
});