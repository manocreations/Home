// Guards this page: redirects non-admins to home.html, non-logged-in
// users to index.html.
const currentAdmin = requireAdmin();

/*
 * NOTE ON THE BACKEND:
 * This page expects these endpoints on the worker at API_BASE
 * (defined in auth.js):
 *
 *   GET    /admin/users          -> { success: true, users: [ {id, name, email, phone, address, photo}, ... ] }
 *   POST   /admin/users          -> { success: true, user: {...} }
 *   PUT    /admin/users/:id      -> { success: true, user: {...} }
 *   DELETE /admin/users/:id      -> { success: true }
 *   GET    /admin/permits        -> { success: true, permits: [ {...}, ... ] }
 *   PUT    /admin/permits/:id/verify -> { success: true, permit: {...} }
 *      body: { verified: true|false }. This is the only thing that
 *      flips a couple's home page from "under review" to the Verified
 *      Couple badge + Love Permit card + PVC upsell.
 *   PUT    /admin/permits/:id/reject -> { success: true, permit: {...} }
 *      body: { rejected: true, reason: "..." }. Sets permit status to
 *      "Rejected" and clears verified. The couple can then re-submit
 *      a fresh application from their home page.
 *
 * All should check that the caller's JWT belongs to
 * manojsalem98@gmail.com (never trust the frontend for this) before
 * returning/allowing changes to other people's data.
 */

// Toggle buttons

const usersSection = document.getElementById("users-section");
const permitsSection = document.getElementById("permits-section");

const toggleUsersBtn = document.getElementById("toggle-users-btn");
const togglePermitsBtn = document.getElementById("toggle-permits-btn");

const headerActions = document.querySelector(".header-actions");

const tbody = document.getElementById("users-tbody");
const loadingEl = document.getElementById("admin-loading");
const tableWrap = document.getElementById("table-wrap");
const errorEl = document.getElementById("admin-error");
const refreshBtn = document.getElementById("refresh-btn");

const addUserBtn = document.getElementById("add-user-btn");
const modal = document.getElementById("edit-modal");
const editModalTitle = document.getElementById("edit-modal-title");
const editName = document.getElementById("edit-name");
const editEmail = document.getElementById("edit-email");
const editPhone = document.getElementById("edit-phone");
const editAddress = document.getElementById("edit-address");
const editCardImage = document.getElementById("edit-card-image");
const editError = document.getElementById("edit-error");
const editSaveBtn = document.getElementById("edit-save-btn");
const editCancelBtn = document.getElementById("edit-cancel-btn");

const permitsTbody = document.getElementById("permits-tbody");
const permitsLoadingEl = document.getElementById("permits-loading");
const permitsTableWrap = document.getElementById("permits-table-wrap");
const permitsErrorEl = document.getElementById("permits-error");
const permitsRefreshBtn = document.getElementById("permits-refresh-btn");

const permitViewModal = document.getElementById("permit-view-modal");
const permitViewCloseBtn = document.getElementById("permit-view-close-btn");
const permitVerifyToggleBtn = document.getElementById("permit-verify-toggle-btn");
const permitRejectBtn = document.getElementById("permit-reject-btn");
const permitViewError = document.getElementById("permit-view-error");

let currentPermit = null;

let permitsCache = [];

let usersCache = [];
let editingId = null;
let modalMode = "edit"; // "edit" | "create"

// Force-hide on load regardless of what style.css does with .modal-overlay.
modal.hidden = true;
modal.style.display = "none";
permitViewModal.hidden = true;
permitViewModal.style.display = "none";

function userId(user) {
    return user.id || user._id || user.email;
}

function showAdminError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
}

async function loadUsers() {
    errorEl.hidden = true;
    tableWrap.hidden = true;
    loadingEl.hidden = false;
    loadingEl.textContent = "Loading users…";

    try {
        const res = await apiFetch("/admin/users");
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Server responded with ${res.status}`);
        }

        usersCache = data.users || [];
        renderTable();

        loadingEl.hidden = true;
        tableWrap.hidden = false;

    } catch (err) {
        console.error("Failed to load users:", err);
        loadingEl.hidden = true;
        showAdminError("Could not load users. " + err.message);
    }
}

function renderTable(list) {
    tbody.innerHTML = "";
    const users = list !== undefined ? list : usersCache;

    users.forEach((user) => {
        const tr = document.createElement("tr");

        const userTd = document.createElement("td");
        userTd.className = "cell-user";

        const userWrap = document.createElement("div");
        userWrap.className = "user-cell-wrap";

        const img = document.createElement("img");
        img.className = "admin-avatar";
        setAvatar(img, user.photo);

        const nameSpan = document.createElement("span");
        nameSpan.className = "user-cell-name";
        nameSpan.textContent = user.name || "—";

        userWrap.append(img, nameSpan);
        userTd.appendChild(userWrap);

        const emailTd = document.createElement("td");
        emailTd.dataset.label = "Email";
        emailTd.textContent = user.email || "—";

        const phoneTd = document.createElement("td");
        phoneTd.dataset.label = "Phone";
        phoneTd.textContent = user.phone || "Not added";

        const addressTd = document.createElement("td");
        addressTd.dataset.label = "Address";
        addressTd.textContent = user.address || "Not added";

        const actionTd = document.createElement("td");
        actionTd.className = "action-cell";

        const editBtn = document.createElement("button");
        editBtn.className = "secondary-btn";
        editBtn.type = "button";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => openEditModal(user));
        actionTd.appendChild(editBtn);

        // Don't offer to delete the admin's own account — that would
        // lock this page out from under them.
        if (!isAdmin(user)) {
            const deleteBtn = document.createElement("button");
            deleteBtn.className = "danger-btn";
            deleteBtn.type = "button";
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", () => deleteUser(user, deleteBtn));
            actionTd.appendChild(deleteBtn);
        }

        tr.append(userTd, emailTd, phoneTd, addressTd, actionTd);
        tbody.appendChild(tr);
    });
}

async function deleteUser(user, buttonEl) {
    const label = user.name || user.email || "this user";
    const confirmed = window.confirm(
        `Delete ${label}? This permanently removes their account and cannot be undone.`
    );
    if (!confirmed) return;

    const id = userId(user);
    buttonEl.disabled = true;
    buttonEl.textContent = "Deleting...";
    errorEl.hidden = true;

    try {
        const res = await apiFetch(`/admin/users/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Server responded with ${res.status}`);
        }

        usersCache = usersCache.filter((u) => userId(u) !== id);
        renderTable();

    } catch (err) {
        console.error("Failed to delete user:", err);
        showAdminError("Could not delete user. " + err.message);
        buttonEl.disabled = false;
        buttonEl.textContent = "Delete";
    }
}

function lockBodyScroll() {
    document.body.style.overflow = "hidden";
}

function unlockBodyScroll() {
    document.body.style.overflow = "";
}

function openEditModal(user) {
    modalMode = "edit";
    editingId = userId(user);
    editError.hidden = true;

    editModalTitle.textContent = "Edit User";
    editSaveBtn.textContent = "Save Changes";

    editName.value = user.name || "";
    editEmail.value = user.email || "";
    editPhone.value = user.phone || "";
    editAddress.value = user.address || "";
    editCardImage.value = user.card_image_url || "";

    modal.hidden = false;
    // Belt-and-suspenders: some stylesheets set .modal-overlay { display: ... }
    // with specificity that beats the browser's built-in [hidden] rule, which
    // would leave the modal visible even after `hidden` is toggled. Forcing
    // the inline style guarantees it actually shows/hides.
    modal.style.display = "flex";
    lockBodyScroll();
}

function openAddModal() {
    modalMode = "create";
    editingId = null;
    editError.hidden = true;

    editModalTitle.textContent = "Add User";
    editSaveBtn.textContent = "Add User";

    editName.value = "";
    editEmail.value = "";
    editPhone.value = "";
    editAddress.value = "";
    editCardImage.value = "";

    modal.hidden = false;
    modal.style.display = "flex";
    lockBodyScroll();
}

function closeEditModal() {
    modal.hidden = true;
    modal.style.display = "none";
    editingId = null;
    unlockBodyScroll();
}

async function saveEdit() {
    if (modalMode === "edit" && !editingId) {
        editError.textContent = "No user selected to edit — please close this and click Edit on a user row again.";
        editError.hidden = false;
        return;
    }

    const name = editName.value.trim();
    const email = editEmail.value.trim();

    if (!name || !email) {
        editError.textContent = "Name and email are required.";
        editError.hidden = false;
        return;
    }

    const payload = {
        name,
        email,
        phone: editPhone.value.trim(),
        address: editAddress.value.trim(),
        card_image_url: editCardImage.value.trim()
    };

    const busyLabel = modalMode === "create" ? "Adding..." : "Saving...";
    const idleLabel = modalMode === "create" ? "Add User" : "Save Changes";

    editSaveBtn.disabled = true;
    editSaveBtn.textContent = busyLabel;
    editError.hidden = true;

    try {
        const res = modalMode === "create"
            ? await apiFetch("/admin/users", {
                method: "POST",
                body: JSON.stringify(payload)
            })
            : await apiFetch(`/admin/users/${encodeURIComponent(editingId)}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Server responded with ${res.status}`);
        }

        if (modalMode === "create") {
            usersCache.push(data.user);
        } else {
            const idx = usersCache.findIndex((u) => userId(u) === editingId);
            if (idx !== -1) usersCache[idx] = data.user;
        }
        renderTable();

        closeEditModal();

    } catch (err) {
        console.error("Failed to save user:", err);
        editError.textContent = "Could not save changes. " + err.message;
        editError.hidden = false;
    } finally {
        editSaveBtn.disabled = false;
        editSaveBtn.textContent = idleLabel;
    }
}

addUserBtn.addEventListener("click", openAddModal);
refreshBtn.addEventListener("click", loadUsers);
editCancelBtn.addEventListener("click", closeEditModal);
editSaveBtn.addEventListener("click", saveEdit);
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeEditModal();
});

function showPermitsError(message) {
    permitsErrorEl.textContent = message;
    permitsErrorEl.hidden = false;
}

async function loadPermits() {
    permitsErrorEl.hidden = true;
    permitsTableWrap.hidden = true;
    permitsLoadingEl.hidden = false;
    permitsLoadingEl.textContent = "Loading permits…";

    try {
        const res = await apiFetch("/admin/permits");
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Server responded with ${res.status}`);
        }

        permitsCache = data.permits || [];
        renderPermitsTable();

        permitsLoadingEl.hidden = true;
        permitsTableWrap.hidden = false;

    } catch (err) {
        console.error("Failed to load permits:", err);
        permitsLoadingEl.hidden = true;
        showPermitsError("Could not load permits. " + err.message);
    }
}

function fmtDate(value) {
    if (!value) return "—";
    const d = new Date(value + "T00:00:00");
    if (isNaN(d)) return value;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// The couple's actual relationship state ("In Love" / "Married"), kept
// separate from approval status so it still displays correctly even
// after a permit is rejected. Falls back to `status` for any older rows
// that predate the relationship_status column/migration.
function relationshipStatusOf(permit) {
    if (permit.relationship_status) return permit.relationship_status;
    if (permit.status && permit.status !== "Rejected") return permit.status;
    return "—";
}

function makeVerifiedBadge(permit) {
    const badge = document.createElement("span");

    if (permit.status === "Rejected") {
        badge.className = "verified-badge badge-rejected";
        badge.textContent = "Rejected";
    } else if (permit.verified) {
        badge.className = "verified-badge badge-verified";
        badge.textContent = "✓ Verified";
    } else {
        badge.className = "verified-badge badge-pending";
        badge.textContent = "Pending";
    }

    return badge;
}

function renderPermitsTable(list) {
    permitsTbody.innerHTML = "";
    const permits = list !== undefined ? list : permitsCache;

    permits.forEach((permit) => {
        const tr = document.createElement("tr");

        const numTd = document.createElement("td");
        numTd.className = "cell-name";
        numTd.dataset.label = "Permit No.";
        numTd.textContent = permit.permit_number || "—";

        const coupleTd = document.createElement("td");
        coupleTd.dataset.label = "Couple";
        coupleTd.textContent = `${permit.name_a || "—"} & ${permit.name_b || "—"}`;

        const statusTd = document.createElement("td");
        statusTd.dataset.label = "Status";
        statusTd.textContent = relationshipStatusOf(permit);

        const verifiedTd = document.createElement("td");
        verifiedTd.dataset.label = "Verified";
        verifiedTd.innerHTML = "";
        verifiedTd.appendChild(makeVerifiedBadge(permit));

        const issuedTd = document.createElement("td");
        issuedTd.dataset.label = "Issued";
        issuedTd.textContent = fmtDate(permit.issued_date);

        const emergencyTd = document.createElement("td");
        emergencyTd.dataset.label = "Emergency Contact";
        emergencyTd.textContent = permit.emergency_mobile || "—";

        const submittedTd = document.createElement("td");
        submittedTd.dataset.label = "Submitted By";
        submittedTd.textContent = permit.submitted_by_email || "—";

        const actionTd = document.createElement("td");
        actionTd.className = "action-cell";
        const viewBtn = document.createElement("button");
        viewBtn.className = "secondary-btn";
        viewBtn.type = "button";
        viewBtn.textContent = "View";
        viewBtn.addEventListener("click", () => openPermitView(permit));
        actionTd.appendChild(viewBtn);

        tr.append(numTd, coupleTd, statusTd, verifiedTd, issuedTd, emergencyTd, submittedTd, actionTd);
        permitsTbody.appendChild(tr);
    });
}

function resetPermitMediaImg(imgEl) {
    imgEl.hidden = true;
    imgEl.removeAttribute("src");
}

function setPermitMediaImg(imgEl, url) {
    resetPermitMediaImg(imgEl);
    if (!url) return;
    imgEl.src = url;
    imgEl.hidden = false;
}

async function openPermitView(permit) {
    currentPermit = permit;
    permitViewError.hidden = true;

    document.getElementById("pv-permit-number").textContent = permit.permit_number || "—";
    document.getElementById("pv-status").textContent = relationshipStatusOf(permit);
    document.getElementById("pv-name-a").textContent = permit.name_a || "—";
    document.getElementById("pv-email-a").textContent = permit.email_a || "—";
    document.getElementById("pv-dob-a").textContent = fmtDate(permit.dob_a);
    document.getElementById("pv-profession-a").textContent = permit.profession_a || "—";
    document.getElementById("pv-name-b").textContent = permit.name_b || "—";
    document.getElementById("pv-email-b").textContent = permit.email_b || "—";
    document.getElementById("pv-dob-b").textContent = fmtDate(permit.dob_b);
    document.getElementById("pv-profession-b").textContent = permit.profession_b || "—";
    document.getElementById("pv-issued-date").textContent = fmtDate(permit.issued_date);
    document.getElementById("pv-emergency").textContent = permit.emergency_mobile || "—";
    document.getElementById("pv-first-meet").textContent = fmtDate(permit.first_meet);
    document.getElementById("pv-first-ily").textContent = fmtDate(permit.first_i_love_you);
    document.getElementById("pv-submitted-by").textContent = permit.submitted_by_email || "—";
    

    document.getElementById("pv-verified").textContent = permit.status === "Rejected"
        ? "Rejected"
        : (permit.verified ? "✓ Verified" : "Not verified yet");
    updateVerifyButton();
    updateRejectButton();

    const marriedRow = document.getElementById("pv-married-row");
    if (relationshipStatusOf(permit) === "Married" && permit.married_date) {
        marriedRow.hidden = false;
        document.getElementById("pv-married-date").textContent = fmtDate(permit.married_date);
    } else {
        marriedRow.hidden = true;
    }

    permitViewModal.hidden = false;
    permitViewModal.style.display = "flex";
    lockBodyScroll();

    const photoA = document.getElementById("pv-photo-a");
    const photoB = document.getElementById("pv-photo-b");
    const sigHim = document.getElementById("pv-sig-him");
    const sigHer = document.getElementById("pv-sig-her");

    setPermitMediaImg(photoA, permit.photo_a_key);
    setPermitMediaImg(photoB, permit.photo_b_key);
    setPermitMediaImg(sigHim, permit.sig_him_key);
    setPermitMediaImg(sigHer, permit.sig_her_key);
}

function closePermitView() {
    permitViewModal.hidden = true;
    permitViewModal.style.display = "none";
    unlockBodyScroll();
    currentPermit = null;
    permitViewError.hidden = true;
}

function updateVerifyButton() {
    if (!currentPermit) return;
    permitVerifyToggleBtn.textContent = currentPermit.verified ? "Unmark Verified" : "Mark as Verified";
    permitVerifyToggleBtn.classList.toggle("verified-state", !!currentPermit.verified);
}

async function toggleVerified() {
    if (!currentPermit) return;

    const targetId = currentPermit.id;
    const nextVerified = !currentPermit.verified;

    permitVerifyToggleBtn.disabled = true;
    permitVerifyToggleBtn.textContent = "Saving...";
    permitViewError.hidden = true;

    try {
        const res = await apiFetch(`/admin/permits/${encodeURIComponent(targetId)}/verify`, {
            method: "PUT",
            body: JSON.stringify({ verified: nextVerified })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Server responded with ${res.status}`);
        }

        currentPermit = data.permit;

        const idx = permitsCache.findIndex((p) => p.id === targetId);
        if (idx !== -1) permitsCache[idx] = data.permit;
        renderPermitsTable();

        document.getElementById("pv-verified").textContent = currentPermit.verified ? "✓ Verified" : "Not verified yet";
        updateVerifyButton();

    } catch (err) {
        console.error("Failed to update verification:", err);
        permitViewError.textContent = "Could not update verification. " + err.message;
        permitViewError.hidden = false;
        updateVerifyButton();
    } finally {
        permitVerifyToggleBtn.disabled = false;
    }
}

function updateRejectButton() {
    if (!currentPermit) return;
    const isRejected = currentPermit.status === "Rejected";
    permitRejectBtn.textContent = isRejected ? "Rejected" : "Reject";
    permitRejectBtn.disabled = isRejected;
    permitRejectBtn.classList.toggle("rejected-state", isRejected);
}

async function rejectPermit() {
    if (!currentPermit) return;

    const reason = window.prompt(
        "Reason for rejection (shown to the couple so they can fix and reapply):",
        ""
    );
    // Cancelled
    if (reason === null) return;

    const targetId = currentPermit.id;

    permitRejectBtn.disabled = true;
    permitRejectBtn.textContent = "Rejecting...";
    permitViewError.hidden = true;

    try {
        const res = await apiFetch(`/admin/permits/${encodeURIComponent(targetId)}/reject`, {
            method: "PUT",
            body: JSON.stringify({ rejected: true, reason: reason.trim() })
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Server responded with ${res.status}`);
        }

        currentPermit = data.permit;

        const idx = permitsCache.findIndex((p) => p.id === targetId);
        if (idx !== -1) permitsCache[idx] = data.permit;
        renderPermitsTable();

        document.getElementById("pv-status").textContent = relationshipStatusOf(currentPermit);
        document.getElementById("pv-verified").textContent = currentPermit.status === "Rejected"
            ? "Rejected"
            : (currentPermit.verified ? "✓ Verified" : "Not verified yet");
        updateVerifyButton();
        updateRejectButton();

    } catch (err) {
        console.error("Failed to reject permit:", err);
        permitViewError.textContent = "Could not reject permit. " + err.message;
        permitViewError.hidden = false;
        updateRejectButton();
    } finally {
        permitRejectBtn.disabled = currentPermit?.status === "Rejected";
    }
}

// Toggle section visibility
function showUsersSection() {
    usersSection.hidden = false;
    permitsSection.hidden = true;
    toggleUsersBtn.classList.add("active");
    togglePermitsBtn.classList.remove("active");
}

function showPermitsSection() {
    usersSection.hidden = true;
    permitsSection.hidden = false;
    toggleUsersBtn.classList.remove("active");
    togglePermitsBtn.classList.add("active");
}

toggleUsersBtn.addEventListener("click", () => {
    usersSection.hidden = false;
    permitsSection.hidden = true;

    toggleUsersBtn.classList.add("active");
    togglePermitsBtn.classList.remove("active");

    document.getElementById("add-user-btn").hidden = false;
    document.getElementById("refresh-btn").hidden = false;
    document.getElementById("permits-refresh-btn").hidden = true;
});

togglePermitsBtn.addEventListener("click", () => {
    usersSection.hidden = true;
    permitsSection.hidden = false;

    togglePermitsBtn.classList.add("active");
    toggleUsersBtn.classList.remove("active");

    document.getElementById("add-user-btn").hidden = true;
    document.getElementById("refresh-btn").hidden = true;
    document.getElementById("permits-refresh-btn").hidden = false;
});

permitsRefreshBtn.addEventListener("click", loadPermits);
permitViewCloseBtn.addEventListener("click", closePermitView);
permitVerifyToggleBtn.addEventListener("click", toggleVerified);
permitRejectBtn.addEventListener("click", rejectPermit);
permitViewModal.addEventListener("click", (e) => {
    if (e.target === permitViewModal) closePermitView();
});

if (currentAdmin) {
    loadPermits();
}

if (currentAdmin) {
    loadUsers();
}

// ── Verified filter dropdown (portal — rendered on <body> to escape table clipping) ──
let verifiedFilter = "all";

const verifiedFilterBtn = document.getElementById("verified-filter-btn");

// Build the portal dropdown and append directly to <body>
const verifiedDropdown = document.createElement("div");
verifiedDropdown.className = "th-dropdown";
verifiedDropdown.id = "verified-dropdown";
verifiedDropdown.hidden = true;
verifiedDropdown.style.cssText = "position:fixed;z-index:9999;display:none;";

const filterOptions = [
    { filter: "all",      label: "All" },
    { filter: "verified", label: "✅ Verified" },
    { filter: "pending",  label: "⏳ Pending" },
    { filter: "rejected", label: "❌ Rejected" },
];

filterOptions.forEach(({ filter, label }) => {
    const btn = document.createElement("button");
    btn.className = "th-dropdown-item" + (filter === "all" ? " active" : "");
    btn.dataset.filter = filter;
    btn.type = "button";
    btn.textContent = label;
    verifiedDropdown.appendChild(btn);
});

document.body.appendChild(verifiedDropdown);

const dropdownItems = verifiedDropdown.querySelectorAll(".th-dropdown-item");

function positionDropdown() {
    const rect = verifiedFilterBtn.getBoundingClientRect();
    verifiedDropdown.style.top  = (rect.bottom + 6) + "px";
    verifiedDropdown.style.left = (rect.left + rect.width / 2 - verifiedDropdown.offsetWidth / 2) + "px";
}

function openDropdown() {
    verifiedDropdown.hidden = false;
    verifiedDropdown.style.display = "flex";
    positionDropdown();
    verifiedFilterBtn.classList.add("open");
}

function closeDropdown() {
    verifiedDropdown.hidden = true;
    verifiedDropdown.style.display = "none";
    verifiedFilterBtn.classList.remove("open");
}

verifiedFilterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    verifiedDropdown.hidden ? openDropdown() : closeDropdown();
});

// Use mousedown instead of click so it fires before the button's click,
// preventing the race where the dropdown closes the same frame it opens.
document.addEventListener("mousedown", (e) => {
    if (!verifiedDropdown.hidden &&
        !verifiedDropdown.contains(e.target) &&
        e.target !== verifiedFilterBtn &&
        !verifiedFilterBtn.contains(e.target)) {
        closeDropdown();
    }
});

window.addEventListener("scroll", () => { if (!verifiedDropdown.hidden) positionDropdown(); }, true);
window.addEventListener("resize", () => { if (!verifiedDropdown.hidden) positionDropdown(); });

dropdownItems.forEach(item => {
    item.addEventListener("click", () => {
        verifiedFilter = item.dataset.filter;
        dropdownItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        verifiedFilterBtn.classList.toggle("has-filter", verifiedFilter !== "all");
        closeDropdown();
        applyPermitFilters();
    });
});

// Loose equality helper — APIs sometimes return true/"true"/1/"1"
function isTruthy(val) {
    return val === true || val === "true" || val === 1 || val === "1";
}

function filterByVerified(list) {
    if (verifiedFilter === "all") return list;
    return list.filter(p => {
        const verified = isTruthy(p.verified);
        const rejected = isTruthy(p.rejected) || p.status === "Rejected";
        if (verifiedFilter === "verified") return verified && !rejected;
        if (verifiedFilter === "rejected") return rejected;
        // pending = not verified and not rejected
        return !verified && !rejected;
    });
}

function applyPermitFilters() {
    const q = adminSearch.value.trim().toLowerCase();
    let list = permitsCache;

    if (q) {
        list = list.filter(p =>
            (p.permit_number      || "").toLowerCase().includes(q) ||
            (p.name_a             || "").toLowerCase().includes(q) ||
            (p.name_b             || "").toLowerCase().includes(q) ||
            (p.submitted_by_email || "").toLowerCase().includes(q) ||
            (p.emergency_mobile   || "").toLowerCase().includes(q)
        );
    }

    list = filterByVerified(list);
    renderPermitsTable(list);
}

// Reset filter when switching back to Users tab
toggleUsersBtn.addEventListener("click", () => {
    verifiedFilter = "all";
    dropdownItems.forEach(i => i.classList.toggle("active", i.dataset.filter === "all"));
    verifiedFilterBtn.classList.remove("has-filter");
});

// ── Search ──────────────────────────────────────────────────────────────────
const adminSearch = document.getElementById("admin-search");

function activeSection() {
    return permitsSection.hidden ? "users" : "permits";
}

adminSearch.addEventListener("input", () => {
    const q = adminSearch.value.trim().toLowerCase();

    if (activeSection() === "users") {
        if (!q) { renderTable(); return; }
        const filtered = usersCache.filter(u =>
            (u.name  || "").toLowerCase().includes(q) ||
            (u.email || "").toLowerCase().includes(q) ||
            (u.phone || "").toLowerCase().includes(q) ||
            (u.address || "").toLowerCase().includes(q)
        );
        renderTable(filtered);
    } else {
        applyPermitFilters();
    }
});

// Clear search when switching tabs
toggleUsersBtn.addEventListener("click", () => { adminSearch.value = ""; });
togglePermitsBtn.addEventListener("click", () => { adminSearch.value = ""; });
