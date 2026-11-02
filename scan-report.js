
const API_URL = "http://localhost:8080/api/scan/history";

function setIndicator(elementId, value, positiveText, negativeText) {
    const element = document.getElementById(elementId);

    element.textContent = value ? positiveText : negativeText;
    element.style.color = value ? "#22c55e" : "#f87171";
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return replacements[character];
    });
}

async function loadReport() {
    const params = new URLSearchParams(window.location.search);
    const scanId = params.get("id");

    if (!scanId || !/^\d+$/.test(scanId)) {
        document.getElementById("scannedUrl").textContent =
            "Invalid scan ID";
        return;
    }

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not fetch scan records");
        }

        const scans = await response.json();

        const scan = scans.find(
            item => String(item.id) === scanId
        );

        if (!scan) {
            document.getElementById("scannedUrl").textContent =
                "Scan record not found";
            return;
        }

        const score = Math.max(
            0,
            Math.min(100, Number(scan.riskScore) || 0)
        );

        const status = String(scan.status || "Unknown");
        const statusClass = status.toLowerCase();

        document.getElementById("scannedUrl").textContent =
            scan.url || "N/A";

        const badge = document.getElementById("statusBadge");
        badge.textContent = status;
        badge.className = "status " + statusClass;

        document.getElementById("riskScore").textContent = score;

        document.getElementById("riskMeter").style.width =
            score + "%";

        const circle = document.getElementById("scoreCircle");

        if (score >= 50) {
            circle.style.borderColor = "#ef4444";
            document.getElementById("riskTitle").textContent =
                "High Risk Indicators";
            document.getElementById("riskDescription").textContent =
                "Several configured indicators suggest elevated risk. Treat this URL cautiously.";
            document.getElementById("riskMeter").style.background =
                "#ef4444";
        } else if (score >= 20) {
            circle.style.borderColor = "#facc15";
            document.getElementById("riskTitle").textContent =
                "Moderate Risk Indicators";
            document.getElementById("riskDescription").textContent =
                "Some configured suspicious indicators were detected. Verify the URL independently.";
            document.getElementById("riskMeter").style.background =
                "#facc15";
        } else {
            circle.style.borderColor = "#22c55e";
            document.getElementById("riskTitle").textContent =
                "Low Risk Indicators";
            document.getElementById("riskDescription").textContent =
                "Few configured indicators were detected. This does not guarantee the URL is safe.";
            document.getElementById("riskMeter").style.background =
                "#22c55e";
        }

        document.getElementById("scanDate").textContent =
            scan.scannedAt
                ? new Date(scan.scannedAt).toLocaleString()
                : "N/A";

        setIndicator(
            "httpsStatus",
            scan.httpsEnabled,
            "Enabled",
            "Not Enabled"
        );

        setIndicator(
            "ipStatus",
            scan.ipAddressDetected,
            "Detected",
            "Not Detected"
        );

        setIndicator(
            "keywordStatus",
            scan.suspiciousKeywordDetected,
            "Detected",
            "Not Detected"
        );

        setIndicator(
            "longUrlStatus",
            scan.longUrlDetected,
            "Detected",
            "Not Detected"
        );

        const findingsList = document.getElementById("findingsList");

        const findings = scan.findings
            ? String(scan.findings).split(", ")
            : ["No findings recorded"];

        findingsList.innerHTML = findings.map(finding =>
            `<li>${escapeHTML(finding)}</li>`
        ).join("");

    } catch (error) {
        console.error(error);

        document.getElementById("scannedUrl").textContent =
            "Unable to load report. Check backend connection.";
    }
}

loadReport();
