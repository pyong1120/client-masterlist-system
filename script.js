/* =========================
   GLOBAL STATE
========================= */

let selectedType = "all";
let selectedYear = "all";
let selectedClientId = null;
let searchValue = "";

let clients = [];
window.clientsData = [];

const yearFilter = document.getElementById("yearFilter");
const clientTable = document.getElementById("clientTable");
const addClientBtn = document.getElementById("addClientBtn");
const typeFilter = document.getElementById("typeFilter");
const searchInput = document.getElementById("search");

const profileTitle = document.getElementById("profileTitle");
const tabContent = document.getElementById("tabContent");
const tabs = document.querySelectorAll(".tab");

let selectedRow = null;

/* =========================
   HELPERS
========================= */

function getYearFromCaseNumber(caseNumber) {
    const parts = caseNumber.split("-");
    return parts[1] || "";
}

/* =========================
   LOAD YEAR FILTER
========================= */

function loadYearOptions() {

    const years = [
        ...new Set(
            window.clientsData.map(c => getYearFromCaseNumber(c.caseNumber))
        )
    ].sort();

    yearFilter.innerHTML = `<option value="all">Select year</option>`;

    years.forEach(year => {
        if (!year) return;

        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;

        yearFilter.appendChild(option);
    });
}

/* =========================
   LOAD CLIENTS FROM DB
========================= */

async function loadClients() {

    try {

        clientTable.innerHTML = "";

        const res = await fetch("https://client-masterlist-system.onrender.com/clients");
        window.clientsData = await res.json();

        loadYearOptions();

        window.clientsData.forEach(client => {

            const surname = (client.name || "")
                .trim()
                .split(" ")
                .slice(-1)[0]
                .toLowerCase();

            if (!surname.includes(searchValue.toLowerCase())) {
                return;
            }

            const clientYear = getYearFromCaseNumber(client.caseNumber || client.casenumber);

            if (selectedYear !== "all" && clientYear != selectedYear) {
                return;
            }

            if (
                selectedType !== "all" &&
                client.caseflow?.currentStage !== selectedType
            ) {
                return;
            }

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${client.caseNumber || client.casenumber}</td>
                <td>${client.name}</td>
            `;

            row.dataset.id = client.id;

            row.addEventListener("click", () => {

                selectedClientId = client.id;
                showClientDetails(client.id);

                if (selectedRow) {
                    selectedRow.classList.remove("active-row");
                }

                row.classList.add("active-row");
                selectedRow = row;
            });

            clientTable.appendChild(row);
        });

    } catch (err) {
        console.error("Error loading clients:", err);
    }
}

/* =========================
   FILTERS
========================= */

function applyFilters() {

    selectedYear = yearFilter.value;
    selectedType = typeFilter.value;
    searchValue = searchInput.value.trim();

    loadClients();
}

/* =========================
   SHOW CLIENT DETAILS
========================= */

function showClientDetails(id) {

    const client = window.clientsData.find(c => c.id === id);

    if (!client) return;

    profileTitle.innerText = client.name;

    tabContent.innerHTML = `<p>Please select a category tab above.</p>`;

    tabs.forEach(tab => tab.classList.remove("active"));
}

/* =========================
   TABS
========================= */

function setActiveTab(tabName) {

    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
}

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        const tabName = tab.dataset.tab;

        setActiveTab(tabName);
        switchTab(tabName);
    });
});

function switchTab(tabName) {

    if (!selectedClientId) return;

    const client = window.clientsData.find(c => c.id === selectedClientId);
    if (!client) return;

    if (tabName === "investigation") {
        tabContent.innerHTML = `<h3>Investigation</h3>`;
    }

    else if (tabName === "psir") {
        tabContent.innerHTML = `<h3>PSIR</h3>`;
    }

    else if (tabName === "probation") {
        tabContent.innerHTML = `
            <h3>Probation</h3>

            <p><strong>Client No:</strong> ${client.probation?.clientNo || "-"}</p>
            <p><strong>Petitioner's Name:</strong> ${client.probation?.petitionerName || "-"}</p>
            <p><strong>Family Group No:</strong> ${client.probation?.familyGroupNo || "-"}</p>
            <p><strong>Supervising Officer:</strong> ${client.probation?.supervisingOfficer || "-"}</p>
            <p><strong>Date Received:</strong> ${client.probation?.dateReceived || "-"}</p>
            <p><strong>Start Date:</strong> ${client.probation?.startDate || "-"}</p>
            <p><strong>End Date:</strong> ${client.probation?.endDate || "-"}</p>
        `;
    }

    else if (tabName === "finalreport") {
        tabContent.innerHTML = `
            <h3>Final Report</h3>

            <p><strong>Termination Type:</strong> ${client.finalReport?.terminationType || "-"}</p>
            <p><strong>Revocation Type:</strong> ${client.finalReport?.revocationType || "-"}</p>
            <p><strong>Extension Date:</strong> ${client.finalReport?.extensionDate || "-"}</p>
        `;
    }

    else if (tabName === "termination") {
        tabContent.innerHTML = `
            <h3>Termination</h3>

            <p><strong>Termination Type:</strong> ${client.termination?.terminationType || "-"}</p>
            <p><strong>Revocation Type:</strong> ${client.termination?.revocationType || "-"}</p>
            <p><strong>Transfer Court:</strong> ${client.termination?.transferCourt || "-"}</p>
            <p><strong>Transfer Date:</strong> ${client.termination?.transferDate || "-"}</p>
        `;
    }
}

/* =========================
   EVENTS
========================= */

yearFilter.addEventListener("change", applyFilters);
typeFilter.addEventListener("change", applyFilters);

if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
}

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded", loadClients);