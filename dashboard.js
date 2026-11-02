function openURLScanner() {
    window.location.href = "url-scanner.html";
}

function openHistory() {
    window.location.href = "scan-history.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "index.html";
}