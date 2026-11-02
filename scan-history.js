
const API_URL = "http://localhost:8080/api/scan/history";

let allScans = [];

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

async function loadHistory() {
    const table = document.getElementById("historyTable");

    table.innerHTML = `
        <tr><td colspan="5">Loading scan history...</td></tr>
    `;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to load scan history");
        }

        allScans = await response.json();

        document.getElementById("totalScans").textContent =
            allScans.length;

        document.getElementById("safeScans").textContent =
            allScans.filter(scan => scan.status === "Safe").length;

        document.getElementById("suspiciousScans").textContent =
            allScans.filter(scan => scan.status === "Suspicious").length;

        document.getElementById("dangerousScans").textContent =
            allScans.filter(scan => scan.status === "Dangerous").length;

        displayHistory();

    } catch (error) {
        table.innerHTML = `
            <tr>
                <td colspan="5">Unable to load history. Check backend.</td>
            </tr>
        `;

        console.error(error);
    }
}

function displayHistory() {
    const table = document.getElementById("historyTable");

    const searchText = document
        .getElementById("searchInput").value.toLowerCase().trim();

    const selectedStatus =
        document.getElementById("statusFilter").value;

    const selectedSort =
        document.getElementById("sortFilter").value;

    let filteredScans = allScans.filter(scan => {
        const url = String(scan.url ?? "").toLowerCase();
        const status = String(scan.status ?? "");

        return url.includes(searchText) &&
            (selectedStatus === "All" || status === selectedStatus);
    });

    if (selectedSort === "newest") {
        filteredScans.sort((a, b) =>
            new Date(b.scannedAt) - new Date(a.scannedAt)
        );
    } else if (selectedSort === "oldest") {
        filteredScans.sort((a, b) =>
            new Date(a.scannedAt) - new Date(b.scannedAt)
        );
    } else if (selectedSort === "risk-high") {
        filteredScans.sort((a, b) =>
            (b.riskScore ?? 0) - (a.riskScore ?? 0)
        );
    } else if (selectedSort === "risk-low") {
        filteredScans.sort((a, b) =>
            (a.riskScore ?? 0) - (b.riskScore ?? 0)
        );
    }

    if (filteredScans.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5">No matching scan records found.</td>
            </tr>
        `;
        return;
    }

    table.innerHTML = filteredScans.map(scan => {
        const statusClass =
            String(scan.status ?? "unknown").toLowerCase();

        const date = scan.scannedAt
            ? new Date(scan.scannedAt).toLocaleString()
            : "N/A";

        const reportLink =
            `scan-report.html?id=${encodeURIComponent(scan.id)}`;

        return `
            <tr>
                <td>${escapeHTML(scan.id ?? "N/A")}</td>

                <td class="url-cell">
                    <a class="report-link"
                       href="${reportLink}">
                        ${escapeHTML(scan.url ?? "")}
                    </a>
                </td>

                <td>
                    <span class="status ${statusClass}">
                        ${escapeHTML(scan.status ?? "Unknown")}
                    </span>
                </td>

                <td>${scan.riskScore ?? 0}/100</td>

                <td>${escapeHTML(date)}</td>
            </tr>
        `;
    }).join("");
}

document.getElementById("searchInput")
    .addEventListener("input", displayHistory);

document.getElementById("statusFilter")
    .addEventListener("change", displayHistory);

document.getElementById("sortFilter")
    .addEventListener("change", displayHistory);

loadHistory();
