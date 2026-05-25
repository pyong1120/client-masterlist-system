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
   SAVE CLIENT (🔥 FIXED)
========================= */

addClientBtn.addEventListener("click", async () => {

    try {

        const name =
            document.getElementById("petitionerName")?.value ||
            document.getElementById("clientName")?.value ||
            "";

        const caseNumber =
            document.getElementById("clientNo")?.value ||
            document.getElementById("caseNo")?.value ||
            "";

        if (!name || !caseNumber) {
            alert("Please fill required fields (Name & Case Number)");
            return;
        }

        const payload = {
            name,
            caseNumber,

            caseflow: {
                currentStage: typeFilter.value || "PI"
            },

            investigation: {
                clientNo: document.getElementById("clientNo")?.value || "",
                petitionerName: document.getElementById("petitionerName")?.value || "",
                address: document.getElementById("address")?.value || "",
                criminalCaseNo: document.getElementById("criminalCaseNo")?.value || "",
                courtOfOrigin: document.getElementById("courtOfOrigin")?.value || "",
                offense: document.getElementById("offense")?.value || "",
                sentence: document.getElementById("sentence")?.value || "",
                dateOfOrder: document.getElementById("dateOfOrder")?.value || "",
                dateReceived: document.getElementById("dateReceived")?.value || "",
                investigatingOfficer: document.getElementById("investigatingOfficer")?.value || ""
            },

            psir: {
                decision: document.getElementById("psirDecision")?.value || "",
                date: document.getElementById("psirDate")?.value || ""
            },

            probation: {
                clientNo: document.getElementById("probClientNo")?.value || "",
                petitionerName: document.getElementById("probPetitionerName")?.value || "",
                familyGroupNo: document.getElementById("familyGroupNo")?.value || "",
                supervisingOfficer: document.getElementById("supervisingOfficer")?.value || "",
                dateReceived: document.getElementById("probDateReceived")?.value || "",
                startDate: document.getElementById("startDate")?.value || "",
                endDate: document.getElementById("endDate")?.value || ""
            },

            finalReport: {
                terminationType: document.getElementById("terminationTypeFinal")?.value || "",
                revocationType: document.getElementById("revocationTypeFinal")?.value || "",
                extensionDate: document.getElementById("extensionDateFinal")?.value || ""
            },

            termination: {
                terminationType: document.getElementById("terminationType")?.value || "",
                revocationType: document.getElementById("revocationType")?.value || "",
                transferCourt: document.getElementById("transferCourt")?.value || "",
                transferDate: document.getElementById("transferDate")?.value || ""
            }
        };

        const res = await fetch("https://client-masterlist-system.onrender.com/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            console.error(data);
            alert("Failed to save client");
            return;
        }

        alert("Saved successfully!");

        await loadClients();

    } catch (err) {
        console.error("SAVE ERROR:", err);
        alert("Error saving client");
    }
});

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
   LOAD CLIENTS
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

            if (!surname.includes(searchValue.toLowerCase())) return;

            const clientYear = getYearFromCaseNumber(client.caseNumber || client.casenumber);

            if (selectedYear !== "all" && clientYear != selectedYear) return;

            if (selectedType !== "all" &&
                client.caseflow?.currentStage !== selectedType) return;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${client.caseNumber || client.casenumber}</td>
                <td>${client.name}</td>
            `;

            row.dataset.id = client.id;

            row.addEventListener("click", () => {

                selectedClientId = client.id;
                showClientDetails(client.id);

                if (selectedRow) selectedRow.classList.remove("active-row");

                row.classList.add("active-row");
                selectedRow = row;
            });

            clientTable.appendChild(row);
        });

    } catch (err) {
        console.error(err);
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
   DETAILS
========================= */

function showClientDetails(id) {

    const client = window.clientsData.find(c => c.id === id);
    if (!client) return;

    profileTitle.innerText = client.name;
    tabContent.innerHTML = `<p>Select tab above</p>`;
}

/* =========================
   TABS
========================= */

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        setActiveTab(tab.dataset.tab);
        switchTab(tab.dataset.tab);
    });
});

function setActiveTab(tabName) {
    tabs.forEach(tab => {
        tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
}

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
            <p>${client.probation?.clientNo || "-"}</p>
        `;
    }

    else if (tabName === "finalreport") {
        tabContent.innerHTML = `
            <h3>Final Report</h3>
            <p>${client.finalReport?.terminationType || "-"}</p>
        `;
    }

    else if (tabName === "termination") {
        tabContent.innerHTML = `
            <h3>Termination</h3>
            <p>${client.termination?.terminationType || "-"}</p>
        `;
    }
}

/* =========================
   INIT
========================= */

window.addEventListener("DOMContentLoaded", loadClients);

yearFilter.addEventListener("change", applyFilters);
typeFilter.addEventListener("change", applyFilters);

if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
}