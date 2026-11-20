const user = getUser();

initAppMenu();

if (user) {
    setAvatar(document.getElementById("photo"), user.photo);
    document.getElementById("name").textContent = user.name || "—";
    document.getElementById("email").textContent = user.email || "—";
    document.getElementById("phone").textContent = user.phone || "Not added";
    document.getElementById("address").textContent = user.address || "Not added";
}

function goHome() {
    window.location.href = "home.html"; // Change to your home page if needed
}
