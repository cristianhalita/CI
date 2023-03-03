const width = window.screen.width;
const height = window.screen.height;

console.log(width, height);

const loginButton = document.getElementById("loginButton");
const messages = document.getElementById("messages");

loginButton.addEventListener("click", (evt) => {
    if ((width <= 640 && height <= 800) || (width <= 800 && height <= 640)) {
        evt.preventDefault();
        //TODO show message
        addWarning("You are trying to log in from a low resolution device. Please try from a higher resolution device, preferable from a PC or laptop.")
    }
});

function addWarning(msg) {
    let html = "<div class=\"alert alert-warning alert-dismissible fade show\">\n" +
        "                <button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>\n" +
        msg+
        "            </div>";

    messages.innerHTML += html;
}