const user = getUser();

if (user && isAdmin(user)) {
    window.location.href = "admin.html";
}

initAppMenu();

if (user) {
    setAvatar(document.getElementById("photo"), user.photo);
    setAvatar(document.getElementById("summary-photo"), user.photo);

    const firstName = (user.name || "").trim().split(/\s+/)[0] || "there";
    document.getElementById("first-name").textContent = firstName;

    document.getElementById("summary-name").textContent = user.name || "—";
    document.getElementById("summary-email").textContent = user.email || "—";
    document.getElementById("summary-phone").textContent = user.phone || "Not added";
    document.getElementById("summary-address").textContent = user.address || "Not added";

    loadPermitStatus();
}

function showState(name) {
    ["none", "pending", "approved"].forEach((s) => {
        const el = document.getElementById("state-" + s);
        if (el) el.hidden = s !== name;
    });

    const pvcBox = document.getElementById("pvc-box");
    if (pvcBox) pvcBox.hidden = name !== "approved";
}

async function loadPermitStatus() {
    try {
        const res = await apiFetch("/permits");
        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || `Server responded with ${res.status}`);
        }

        const permits = data.permits || [];

        if (permits.length === 0) {
            showState("none");
            return;
        }

        // GET /permits already returns newest first, so [0] is the
        // latest application.
        const permit = permits[0];

        // Submitting an application no longer means it's "approved" —
        // that only happens once an admin flips permit.verified in the
        // admin panel. Until then, every submission (regardless of its
        // self-declared status of "In Love" or "Married") shows a
        // sample card with their couple names + "Application Submitted / under review" message.
        if (!permit.verified) {
            renderPendingSampleCard(permit);
            showState("pending");
            return;
        }

        renderApprovedCard(permit);
        showState("approved");
        loadCardImage();

    } catch (err) {
        console.error("Failed to load permit status:", err);
        // Fall back to the "apply now" state; not worth surfacing an
        // error banner for a non-critical section of the home page.
        showState("none");
    }
}

function renderPendingSampleCard(permit) {
    // Show the sample card image with couple names overlay during pending verification
    const sectionPending = document.getElementById("state-pending");
    if (!sectionPending) return;

    // Find or create card image container
    let cardContainer = sectionPending.querySelector(".ls-sample-card-container");
    
    if (!cardContainer) {
        cardContainer = document.createElement("div");
        cardContainer.className = "ls-sample-card-container";
        cardContainer.innerHTML = `
            <img src="sample-card.png" alt="Love Permit Sample" class="ls-sample-card-image">
            <div class="ls-sample-card-overlay">
                <div class="ls-sample-card-names"></div>
            </div>
        `;
        
        // Insert before the pending panel message
        const pendingPanel = sectionPending.querySelector(".ls-pending-panel");
        if (pendingPanel) {
            sectionPending.insertBefore(cardContainer, pendingPanel);
        } else {
            sectionPending.insertBefore(cardContainer, sectionPending.firstChild);
        }
    }

}

function renderApprovedCard(permit) {
    const isMarried = permit.status === "Married";

    document.getElementById("approved-name-a").textContent = permit.name_a || "—";
    document.getElementById("approved-name-b").textContent = permit.name_b || "—";
    document.getElementById("approved-status-line").textContent =
        "Status: " + (isMarried ? "Married Couple" : "Verified Couple");
}

// The cached "user" in localStorage can be stale (e.g. admin added a card
// image after this person last logged in), so pull a fresh copy from the
// backend just for the card section.
async function loadCardImage() {
    const cardImg = document.getElementById("card-image");
    const cardNote = document.getElementById("card-note");
    if (!cardImg || !cardNote) return;

    try {
        const res = await apiFetch("/me");
        const data = await res.json();

        if (res.ok && data.success && data.user.card_image_url) {
            cardImg.src = data.user.card_image_url;
            cardImg.onerror = () => {
                // Broken URL from admin — fall back to placeholder rather
                // than showing a broken-image icon.
                cardImg.onerror = null;
                cardImg.src = "sample-card.svg";
                cardNote.textContent = "This is a sample card preview — no real card is on file yet.";
                cardNote.hidden = false;
            };
            cardNote.textContent = "";
            cardNote.hidden = true;
        }
        // else: leave the default placeholder image/note as-is.

    } catch (err) {
        console.error("Failed to load card image:", err);
        // Leave the placeholder in place; not worth surfacing an error
        // banner for a non-critical section of the home page.
    }
}
