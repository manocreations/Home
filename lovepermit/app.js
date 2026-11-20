let isAuthenticating = false;

async function handleCredentialResponse(response) {
    if (isAuthenticating) return;
    isAuthenticating = true;

    const errorEl = document.getElementById("signin-error");
    if (errorEl) errorEl.hidden = true;

    try {
        const res = await fetch(
            "https://user-backend.lovepermit.workers.dev/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential })
            }
        );

        if (!res.ok) {
            throw new Error(`Server responded with status ${res.status}`);
        }

        const data = await res.json();

        if (!data.success) {
            showError(errorEl, "Login failed. Please try again.");
            return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const ADMIN_EMAIL = "manojsalem98@gmail.com";

        if (data.user.email === ADMIN_EMAIL) {
            window.location.href = "admin.html";
        } else {
            window.location.href = data.user.phone
                ? "home.html"
                : "complete-profile.html";
        }

    } catch (err) {
        console.error("Login error:", err);
        showError(errorEl, "Unable to connect to the server. Please try again.");
    } finally {
        isAuthenticating = false;
    }
}

function showError(el, message) {
    if (!el) {
        alert(message);
        return;
    }
    el.textContent = message;
    el.hidden = false;
}
