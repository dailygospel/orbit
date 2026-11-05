"use strict";

const config = window.ORBIT_CONFIG || {};
const featureState = { roles: true, tags: true, tracers: true, radar: true };
const map = document.getElementById("lobby-map");
const radius = document.getElementById("radius");
const announcement = document.getElementById("demo-announcement");

function updateDemo() {
  map.classList.toggle("hide-tags", !featureState.tags);
  document
    .getElementById("tracer-layer")
    .classList.toggle("is-hidden", !featureState.tracers);
  document
    .getElementById("radar")
    .classList.toggle("is-hidden", !featureState.radar);
  document.querySelectorAll(".role-text").forEach((label) => {
    label.textContent = featureState.roles ? label.dataset.role : "UNKNOWN";
  });
  map.classList.toggle("roles-hidden", !featureState.roles);
  radius.disabled = !featureState.tracers;
  document.getElementById("radius-value").textContent = radius.value + " m";
  document.getElementById("tracer-radius").setAttribute("r", radius.value);
  document.querySelectorAll(".tracer-line").forEach((line) => {
    line.style.opacity =
      Number(line.dataset.distance) <= Number(radius.value) ? "1" : "0";
  });
}

document.querySelectorAll("[data-feature]").forEach((button) => {
  button.addEventListener("click", () => {
    const feature = button.dataset.feature;
    featureState[feature] = !featureState[feature];
    button.setAttribute("aria-pressed", String(featureState[feature]));
    updateDemo();
    announcement.textContent =
      button.textContent.trim() +
      (featureState[feature] ? " enabled." : " disabled.");
  });
});
radius.addEventListener("input", updateDemo);
updateDemo();

const dialog = document.getElementById("access-dialog");
const purchaseButton = document.getElementById("access-button");
let checkoutUrl = null;
try {
  if (typeof config.checkoutUrl === "string" && config.checkoutUrl.trim()) {
    const candidate = new URL(config.checkoutUrl.trim(), window.location.href);
    if (
      candidate.protocol === "https:" ||
      (candidate.origin === window.location.origin &&
        candidate.protocol === window.location.protocol)
    ) {
      checkoutUrl = candidate;
    }
  }
} catch {
  /* Keep the purchase information dialog if checkout has not been configured. */
}

if (checkoutUrl) {
  document.querySelectorAll("[data-checkout-link]").forEach((link) => {
    link.href = checkoutUrl.href;
  });
  const link = document.createElement("a");
  link.className = "button";
  link.id = "access-button";
  link.href = checkoutUrl.href;
  link.append(document.createTextNode("Buy access "));
  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";
  link.append(arrow);
  purchaseButton.replaceWith(link);
  document.getElementById("purchase-note").textContent =
    config.checkoutNote || "View pricing and purchase terms at checkout.";
  document.getElementById("purchase-faq").textContent =
    "Select Buy access to continue to checkout. Review the pricing and purchase terms before completing your order.";
} else {
  purchaseButton.addEventListener("click", () => dialog.showModal());
}

document.querySelectorAll(".dialog-close, .dialog-done").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  }
});
document.getElementById("copyright-year").textContent =
  new Date().getFullYear();
