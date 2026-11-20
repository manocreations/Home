const user = getUser();
initAppMenu();

const loadingEl = document.getElementById("orders-loading");
const lockedEl = document.getElementById("orders-locked");
const pendingEl = document.getElementById("orders-pending");
const readyEl = document.getElementById("orders-ready");
const notifyBtn = document.getElementById("notify-btn");
const notifyMsg = document.getElementById("notify-msg");

function showOrdersState(name) {
    [loadingEl, lockedEl, pendingEl, readyEl].forEach((el) => {
        if (el) el.hidden = el.id !== "orders-" + name;
    });
}

function renderReadyPreview(permit) {
    const nameA = document.getElementById("orders-name-a");
    const nameB = document.getElementById("orders-name-b");
    const cardNo = document.getElementById("orders-card-no");

    if (nameA) nameA.textContent = permit.name_a || "—";
    if (nameB) nameB.textContent = permit.name_b || "—";
    if (cardNo) {
        cardNo.textContent = permit.permit_number || "Pending assignment";
    }
}

function initNotifyButton() {
    if (!notifyBtn || !user) return;

    const storageKey = "pvc_notify_" + (user.email || user.id || "default");
    const alreadySignedUp = localStorage.getItem(storageKey) === "1";

    if (alreadySignedUp) {
        notifyBtn.hidden = true;
        if (notifyMsg) notifyMsg.hidden = false;
        return;
    }

    notifyBtn.addEventListener("click", () => {
        localStorage.setItem(storageKey, "1");
        notifyBtn.hidden = true;
        if (notifyMsg) notifyMsg.hidden = false;
    });
}

async function loadOrdersPage() {
    try {
        const res = await apiFetch("/permits");
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Could not load permit status");
        }

        const permits = data.permits || [];

        if (permits.length === 0) {
            showOrdersState("locked");
            return;
        }

        const permit = permits[0];

        if (!permit.verified) {
            showOrdersState("pending");
            return;
        }

        renderReadyPreview(permit);
        initNotifyButton();
        showOrdersState("ready");

    } catch (err) {
        console.error("Failed to load orders page:", err);
        showOrdersState("locked");
    }
}

loadOrdersPage();
