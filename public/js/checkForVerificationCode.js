const verificationCodeDiv = document.getElementById("verificationCodeDiv");
const verificationCodeInput = document.getElementById("verificationCode");
const email = document.getElementById("email");
const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("loginButton");

email.addEventListener("input", async (evt) => {
    await checkVerificationCode();
});
loginForm.addEventListener("submit", async (evt) => {
    evt.preventDefault();
    loginButton.disabled = true;
    loginButton.innerText = "Signing in ...";
    const needsVerificationCode = await checkVerificationCode();
    if (!(needsVerificationCode && !verificationCodeInput.value)) {
        loginForm.submit();
    }
    loginButton.disabled = false;
    loginButton.innerText = "Sign in";
});
async function checkVerificationCode() {
    try {
        if (email.value && /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email.value)) {
            const response = await fetch(window.origin + "/checkForVerificationCode", {
                method: "POST",
                body: JSON.stringify({
                    email: email.value
                }),
                headers:
                    {"Content-Type": "application/json"}
            });
            const responseText = await response.text();
            const verificationCode = responseText === "true";

            if (verificationCode) {
                verificationCodeDiv.classList.remove("d-none");
                verificationCodeInput.required = true;
            }
            else {
                verificationCodeDiv.classList.add("d-none");
                verificationCodeInput.required = false;
            }
            return verificationCode;
        }
        else {
            verificationCodeDiv.classList.add("d-none");
            verificationCodeInput.required = false;
            return false;
        }
    }
    catch (e) {
        console.error(e);
    }
}
