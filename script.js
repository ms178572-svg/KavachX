
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");

const message = document.getElementById("message");

// Switch to Login tab
loginTab.addEventListener("click", function () {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");

    loginTab.classList.add("active");
    registerTab.classList.remove("active");

    message.innerText = "";
});

// Switch to Register tab
registerTab.addEventListener("click", function () {
    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    registerTab.classList.add("active");
    loginTab.classList.remove("active");

    message.innerText = "";
});

// Registration
registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    message.innerText = "Registering...";
    message.style.color = "#00ff99";

    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fullName: fullName,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Registration failed!");
        }

        message.innerText = data.message || "Registration successful!";
        message.style.color = "#00ff99";

        document.getElementById("loginEmail").value = email;

        registerForm.reset();

        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        loginTab.classList.add("active");
        registerTab.classList.remove("active");

    } catch (error) {
        message.innerText = error.message || "Backend connection failed!";
        message.style.color = "#ff4444";
    }
});

// Login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    message.innerText = "Logging in...";
    message.style.color = "#00ff99";

    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed!");
        }

        localStorage.setItem("user", data.email);

        message.innerText = "Login successful!";
        message.style.color = "#00ff99";

        window.location.href = "dashboard.html";

    } catch (error) {
        message.innerText = error.message || "Backend connection failed!";
        message.style.color = "#ff4444";
    }
});
