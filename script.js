
/* =====================================
   WISHORA - DIWALI CELEBRATION
===================================== */

const DEFAULT_MESSAGE =
    "May this beautiful festival fill your world with endless happiness, beautiful memories and countless reasons to smile.";
const MAX_MESSAGE_LENGTH = 280;
const greetingParams = new URLSearchParams(window.location.search);
const hasPersonalGreeting = greetingParams.has("to") && greetingParams.has("from");

const SETTINGS = {
    receiverName: (greetingParams.get("to") || "").trim().slice(0, 60) || "Someone Special",
    senderName: (greetingParams.get("from") || "").trim().slice(0, 60) || "A Friend",
    message: (greetingParams.get("message") || "").trim().slice(0, MAX_MESSAGE_LENGTH)
};

function renderGreeting() {
    const heroMessage = document.querySelector(".hero-message");
    const personalMessage = document.getElementById("personalMessage");

    document.getElementById("receiverName").textContent =
        SETTINGS.receiverName + " ❤️";

    document.querySelectorAll(".name-placeholder").forEach(element => {
        element.textContent = SETTINGS.receiverName;
    });

    document.getElementById("finalName").textContent =
        "Happy Diwali, " + SETTINGS.receiverName + " ❤️";

    document.getElementById("senderSignature").textContent =
        SETTINGS.senderName;

    if (SETTINGS.message) {
        heroMessage.textContent = SETTINGS.message;
        personalMessage.textContent = SETTINGS.message;
        personalMessage.hidden = false;
    } else {
        heroMessage.textContent = DEFAULT_MESSAGE;
        personalMessage.hidden = true;
    }
}

renderGreeting();

const senderSection = document.getElementById("create");

if (hasPersonalGreeting) {
    senderSection.hidden = true;
    document.getElementById("createNavLink").hidden = true;
    document.getElementById("createYourOwnBtn").hidden = false;
}

document.getElementById("createYourOwnBtn").addEventListener("click", () => {
    senderSection.hidden = false;
    document.getElementById("createNavLink").hidden = false;
    senderSection.scrollIntoView({ behavior: "smooth" });
});

const senderForm = document.getElementById("senderForm");
const senderRecipient = document.getElementById("senderRecipient");
const senderName = document.getElementById("senderName");
const senderMessage = document.getElementById("senderMessage");
const messageCount = document.getElementById("messageCount");
const shareResult = document.getElementById("shareResult");
const greetingLink = document.getElementById("greetingLink");
const shareStatus = document.getElementById("shareStatus");

senderMessage.addEventListener("input", () => {
    messageCount.textContent = senderMessage.value.length;
});

senderForm.addEventListener("submit", event => {
    event.preventDefault();

    const recipient = senderRecipient.value.trim();
    const sender = senderName.value.trim();
    const message = senderMessage.value.trim();

    if (!recipient || !sender) {
        shareStatus.textContent = "Add both names to create your greeting.";
        return;
    }

    const isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(
        window.location.hostname
    );

    if (!/^https?:$/.test(window.location.protocol) || isLocalHost) {
        shareStatus.textContent =
            "Publish this site on GitHub Pages first, then create a link from its HTTPS address.";
        return;
    }

    SETTINGS.receiverName = recipient;
    SETTINGS.senderName = sender;
    SETTINGS.message = message;
    renderGreeting();

    const linkUrl = new URL(window.location.href);
    linkUrl.search = "";
    linkUrl.hash = "";
    linkUrl.searchParams.set("to", recipient);
    linkUrl.searchParams.set("from", sender);

    if (message) {
        linkUrl.searchParams.set("message", message);
    }

    window.history.replaceState(null, "", linkUrl);
    greetingLink.value = linkUrl.href;
    shareResult.hidden = false;
    shareStatus.textContent = "";
    shareResult.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("shareWhatsAppBtn").addEventListener("click", () => {
    if (!greetingLink.value) return;

    const shareText =
        "I made a Diwali greeting just for you, " +
        senderRecipient.value.trim() +
        "! Open your celebration here: " +
        greetingLink.value;

    window.open(
        "https://wa.me/?text=" + encodeURIComponent(shareText),
        "_blank",
        "noopener"
    );
});

document.getElementById("copyLinkBtn").addEventListener("click", async () => {
    if (!greetingLink.value) return;

    try {
        await navigator.clipboard.writeText(greetingLink.value);
        shareStatus.textContent = "Greeting link copied. Share it with your recipient!";
    } catch (error) {
        greetingLink.focus();
        greetingLink.select();
        const copied = document.execCommand("copy");
        shareStatus.textContent = copied
            ? "Greeting link copied. Share it with your recipient!"
            : "Select and copy the greeting link above.";
    }
});

function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;

    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }

    return btoa(binary);
}

const senderPhotoInput = document.getElementById("senderPhoto");
const greetingFileStatus = document.getElementById("greetingFileStatus");

document.getElementById("createGreetingFileBtn").addEventListener("click", async () => {
    const recipient = senderRecipient.value.trim();
    const sender = senderName.value.trim();
    const message = senderMessage.value.trim();
    const photo = senderPhotoInput.files[0];

    if (!recipient || !sender) {
        greetingFileStatus.textContent =
            "Enter both names in the form above before creating your greeting.";
        return;
    }

    if (photo && !["image/jpeg", "image/png", "image/webp"].includes(photo.type)) {
        greetingFileStatus.textContent = "Choose a JPG, PNG, or WEBP photo.";
        return;
    }

    if (photo && photo.size > 4 * 1024 * 1024) {
        greetingFileStatus.textContent = "The recipient photo must be smaller than 4 MB.";
        return;
    }

    const button = document.getElementById("createGreetingFileBtn");
    button.disabled = true;
    button.textContent = "💌 Creating your greeting...";
    greetingFileStatus.textContent = "";

    try {
        const photoData = photo
            ? {
                type: photo.type,
                data: bytesToBase64(new Uint8Array(await photo.arrayBuffer()))
            }
            : null;
        const payload = new TextEncoder().encode(JSON.stringify({
            version: 1,
            recipient,
            sender,
            message,
            photo: photoData
        }));
        const file = new File([
            new TextEncoder().encode("WISHORA1"),
            payload
        ], "Diwali_Greeting.wishora", { type: "application/octet-stream" });
        const shareText =
            "I made a Diwali greeting just for you, " + recipient +
            "! Open the attached greeting on the Wishora site.";

        const downloadGreeting = () => {
            const downloadUrl = URL.createObjectURL(file);
            const link = document.createElement("a");
            const safeRecipient =
                recipient.replace(/[^a-z0-9]/gi, "_") || "Someone_Special";
            link.href = downloadUrl;
            link.download = "Diwali_Greeting_" + safeRecipient + ".wishora";
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
            greetingFileStatus.textContent =
                "Greeting file downloaded. Attach the .wishora file in WhatsApp or another app to send it.";
        };

        let supportsFileSharing = false;
        try {
            supportsFileSharing = Boolean(
                navigator.canShare && navigator.canShare({ files: [file] })
            );
        } catch (shareCheckError) {
            console.warn("Direct file sharing is unavailable; downloading instead.", shareCheckError);
        }

        if (supportsFileSharing) {
            try {
                await navigator.share({
                    title: "A Diwali greeting",
                    text: shareText,
                    files: [file]
                });
                greetingFileStatus.textContent =
                    "Choose WhatsApp or another app to send the greeting file.";
            } catch (shareError) {
                if (shareError.name === "AbortError") {
                    greetingFileStatus.textContent =
                        "Sharing cancelled. Your greeting file is still ready.";
                    return;
                }

                console.warn("Direct file sharing is unavailable; downloading instead.", shareError);
                downloadGreeting();
            }
        } else {
            downloadGreeting();
        }

    } catch (error) {
        if (error.name === "AbortError") {
            greetingFileStatus.textContent = "Sharing cancelled. Your greeting is still ready.";
        } else {
            console.error("Could not create or share greeting:", error);
            greetingFileStatus.textContent =
                "Could not create the greeting file. Please try again.";
        }
    } finally {
        button.disabled = false;
        button.textContent = "💌 Create & Share Greeting File";
    }
});

const greetingFileInput = document.getElementById("greetingFileInput");

document.getElementById("openGreetingFileBtn").addEventListener("click", () => {
    greetingFileInput.click();
});

greetingFileInput.addEventListener("change", async () => {
    const file = greetingFileInput.files[0];
    if (!file) return;

    if (file.size < 10 || file.size > 10 * 1024 * 1024) {
        alert("This doesn't look like a valid Wishora greeting file.");
        greetingFileInput.value = "";
        return;
    }

    try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const header = new TextDecoder().decode(bytes.subarray(0, 8));

        if (header !== "WISHORA1") {
            throw new Error("This isn't a valid Wishora greeting file.");
        }

        const greeting = JSON.parse(new TextDecoder().decode(bytes.slice(8)));

        if (
            !greeting ||
            greeting.version !== 1 ||
            typeof greeting.recipient !== "string" ||
            typeof greeting.sender !== "string" ||
            typeof greeting.message !== "string" ||
            (greeting.photo &&
                (!["image/jpeg", "image/png", "image/webp"].includes(greeting.photo.type) ||
                    typeof greeting.photo.data !== "string"))
        ) {
            throw new Error("This greeting file is invalid.");
        }

        SETTINGS.receiverName = greeting.recipient.slice(0, 60) || "Someone Special";
        SETTINGS.senderName = greeting.sender.slice(0, 60) || "A Friend";
        SETTINGS.message = greeting.message.slice(0, MAX_MESSAGE_LENGTH);
        renderGreeting();

        const receiverPhoto = document.getElementById("receiverPhoto");
        if (greeting.photo) {
            receiverPhoto.src =
                "data:" + greeting.photo.type + ";base64," + greeting.photo.data;
            receiverPhoto.hidden = false;
        } else {
            receiverPhoto.removeAttribute("src");
            receiverPhoto.hidden = true;
        }

        senderSection.hidden = true;
        document.getElementById("createNavLink").hidden = true;
        document.getElementById("createYourOwnBtn").hidden = false;
        document.getElementById("home").scrollIntoView({ behavior: "smooth" });
    } catch (error) {
        console.error("Could not open greeting:", error);
        alert(error.message || "Could not read this greeting file.");
        greetingFileInput.value = "";
    }
});

/* Smooth scrolling */

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: "smooth"
    });
}

/* =====================================
   FIREWORKS ENGINE
===================================== */

const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");

let particles = [];
let rockets = [];

function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;

    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const colors = [
    "#ffca70",
    "#ff5733",
    "#ff5fca",
    "#66e5ff",
    "#a88aff",
    "#ffffff",
    "#8cff9a"
];

class Particle {
    constructor(x, y, color, vx, vy) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = vx;
        this.vy = vy;
        this.life = 1;
        this.size = Math.random() * 2.8 + 1;
        this.gravity = 0.045;
        this.decay = Math.random() * 0.009 + 0.006;
    }

    update() {
        this.vx *= 0.99;
        this.vy *= 0.99;
        this.vy += this.gravity;

        this.x += this.vx;
        this.y += this.vy;

        this.life -= this.decay;
    }

    draw() {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }
}

class Rocket {
    constructor(x, targetY) {
        this.x = x;
        this.y = innerHeight + 10;
        this.targetY = targetY;
        this.speed = Math.random() * 3 + 7;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y -= this.speed;

        if (this.y <= this.targetY) {
            explode(this.x, this.y, this.color);
            return false;
        }

        return true;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

function explode(x, y, color) {
    const count = 100;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 1;

        particles.push(new Particle(
            x,
            y,
            color,
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        ));
    }
}

function launchOneRocket() {
    rockets.push(new Rocket(
        Math.random() * innerWidth,
        Math.random() * innerHeight * 0.55 + 30
    ));
}

function launchCelebration() {
    for (let i = 0; i < 12; i++) {
        setTimeout(launchOneRocket, i * 180);
    }
}

function animate() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);

    rockets = rockets.filter(rocket => {
        const active = rocket.update();
        rocket.draw();
        return active;
    });

    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });

    requestAnimationFrame(animate);
}

animate();

/* Fireworks buttons */

document.getElementById("fireworksBtn")
    .addEventListener("click", launchCelebration);

document.getElementById("bigFireworks")
    .addEventListener("click", launchCelebration);

document.getElementById("surpriseBtn")
    .addEventListener("click", () => {
        document.getElementById("surpriseMessage")
            .classList.add("show");

        launchCelebration();

        setTimeout(launchCelebration, 1300);

        document.getElementById("surpriseMessage")
            .scrollIntoView({ behavior: "smooth", block: "center" });
    });

/* =====================================
   DIYA LIGHTING
===================================== */

let allLit = false;

document.getElementById("lightAll")
    .addEventListener("click", function() {

        const diyas = document.querySelectorAll(".diya-item");

        allLit = !allLit;

        diyas.forEach((diya, index) => {
            setTimeout(() => {
                diya.classList.toggle("lit", allLit);
            }, index * 250);
        });

        this.textContent = allLit
            ? "✨ All Diyas Are Lit!"
            : "🪔 Light All Diyas";

        document.getElementById("diyaMessage").textContent =
            allLit
            ? "May your life shine with endless happiness! ✨"
            : "Your lights are waiting to shine again!";
    });

/* =====================================
   FLOATING BALLOONS
===================================== */

const balloonContainer = document.getElementById("balloons");

const balloonTypes = [
    "🎈", "🎈", "🎈", "🎈", "🎈"
];

function releaseBalloons(amount = 10) {

    for (let i = 0; i < amount; i++) {

        setTimeout(() => {

            const balloon = document.createElement("span");

            balloon.className = "flying-balloon";

            balloon.textContent =
                balloonTypes[
                    Math.floor(Math.random() * balloonTypes.length)
                ];

            balloon.style.left =
                Math.random() * 95 + "%";

            balloon.style.animationDuration =
                (Math.random() * 5 + 7) + "s";

            balloon.style.fontSize =
                (Math.random() * 25 + 30) + "px";

            balloonContainer.appendChild(balloon);

            balloon.addEventListener("animationend", () => {
                balloon.remove();
            });

        }, i * 180);
    }
}

document.getElementById("balloonBtn")
    .addEventListener("click", () => {
        releaseBalloons(20);
    });

/* =====================================
   AUTOMATIC FLOATING BALLOONS
===================================== */

setTimeout(() => releaseBalloons(8), 1500);

/* =====================================
   STARS AND FLOATING PARTICLES
===================================== */

const starContainer = document.getElementById("stars");

for (let i = 0; i < 50; i++) {

    const star = document.createElement("span");

    star.textContent = "✦";

    star.style.position = "fixed";
    star.style.left = Math.random() * 100 + "vw";
    star.style.top = Math.random() * 100 + "vh";

    star.style.color = "#ffda8b";
    star.style.opacity = Math.random() * 0.6 + 0.1;
    star.style.fontSize = Math.random() * 10 + 5 + "px";

    star.style.pointerEvents = "none";
    star.style.zIndex = "1";

    star.style.animation =
        `twinkle ${Math.random() * 3 + 2}s infinite alternate`;

    starContainer.appendChild(star);
}

/* Add twinkle animation */

const starStyle = document.createElement("style");

starStyle.textContent = `
@keyframes twinkle {
    from {
        opacity: 0.15;
        transform: scale(0.7);
    }
    to {
        opacity: 1;
        transform: scale(1.5);
    }
}
`;

document.head.appendChild(starStyle);

/* =====================================
   WELCOME
===================================== */

console.log("WISHORA Diwali Celebration Loaded!");
