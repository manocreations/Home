const user = getUser();

const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");
const continueBtn = document.getElementById("continue-btn");
const errorEl = document.getElementById("profile-error");
const backBtn = document.getElementById("back-btn");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");

const isEditing = !!(user && user.phone);

if (user) {
    nameEl.textContent = user.name || "—";
    emailEl.textContent = user.email || "—";
    if (user.phone) phoneInput.value = user.phone;
    if (user.address) addressInput.value = user.address;
}

if (isEditing) {
    pageTitle.textContent = "Update Your Profile";
    pageSubtitle.textContent = "Change your contact details below";
    continueBtn.innerHTML = 'Save Changes <span aria-hidden="true">→</span>';
}

backBtn.addEventListener("click", () => {
    window.location.href = isEditing ? "profile.html" : "index.html";
});

function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
}

async function saveProfile() {
    clearError();

    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();

    if (!/^[0-9]{10}$/.test(phone)) {
        showError("Please enter a valid 10-digit mobile number.");
        phoneInput.focus();
        return;
    }

    continueBtn.disabled = true;
    continueBtn.textContent = "Saving...";

    const payload = { phone };
    if (address) payload.address = address;

    try {
        const res = await apiFetch("/profile", {
            method: "PUT",
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = isEditing ? "profile.html" : "home.html";
        } else {
            showError(data.message || "Could not save your profile. Please try again.");
        }

    } catch (err) {
        console.error("Save profile error:", err);
        showError("Unable to connect to the server. Please check your connection and try again.");
    } finally {
        continueBtn.disabled = false;
        continueBtn.innerHTML = isEditing
            ? 'Save Changes <span aria-hidden="true">→</span>'
            : 'Save &amp; Continue <span aria-hidden="true">→</span>';
    }
}

continueBtn.addEventListener("click", saveProfile);

phoneInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveProfile();
});

phoneInput.addEventListener("input", () => {
    const digitsOnly = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    if (digitsOnly !== phoneInput.value) {
        phoneInput.value = digitsOnly;
    }
    if (!errorEl.hidden) clearError();
});

addressInput.addEventListener("input", () => {
    if (!errorEl.hidden) clearError();
});
