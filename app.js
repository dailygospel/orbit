"use strict";

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const $ = (id) => document.getElementById(id);
  const features = {
    roles: {
      index: "01",
      title: "Role reveal",
      description:
        "Every role, in one place. Hide or show roles above players and in the roster. Role tags can also be controlled independently.",
    },
    tags: {
      index: "02",
      title: "In-game role tags",
      description:
        "Role tags follow the moving players. Switch them off to clear the map; revealed roles remain available in the roster below.",
    },
    tracers: {
      index: "03",
      title: "Adjustable player tracers",
      description:
        "Lines connect you to players inside the circle. Drag the radius slider: lines appear and disappear as players enter or leave your range.",
    },
    radar: {
      index: "04",
      title: "Live player radar",
      description:
        "The radar dots follow the exact positions of the five simulated players, including you. Switch it off or watch it update as the crew moves.",
    },
    noclip: {
      index: "05",
      title: "NoClip · wall crossing",
      description:
        "Follow the blue player along the dashed route. With NoClip on, the route passes straight through the wall. Turn it off to take the doorway instead.",
    },
    vision: {
      index: "06",
      title: "Lights-out visibility",
      description:
        "The lights are now off. Turn Orbit vision off to see the restricted view, then turn it on to see the full ship and the crew again.",
    },
  };
  const defaults = {
    roles: true,
    tags: true,
    tracers: true,
    radar: true,
    noclip: false,
    vision: true,
  };
  const reducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false;
  const state = {
    features: { ...defaults },
    active: "roles",
    radius: 350,
    lightsOut: false,
    paused: reducedMotion,
    elapsed: 0,
    wallStart: 0,
    visible: true,
  };
  const players = [
    {
      id: "scarlet",
      name: "Scarlet",
      role: "IMPOSTOR",
      color: "#ff718a",
      speed: 21,
      route: [
        [210, 185],
        [210, 285],
        [490, 285],
        [490, 220],
        [610, 220],
        [490, 220],
        [490, 285],
        [210, 285],
      ],
    },
    {
      id: "cyan",
      name: "Cyan",
      role: "ENGINEER",
      color: "#6ed7dd",
      speed: 19,
      route: [
        [800, 185],
        [800, 300],
        [490, 300],
        [490, 440],
        [490, 300],
        [800, 300],
        [800, 440],
        [800, 300],
      ],
    },
    {
      id: "violet",
      name: "Violet",
      role: "SCIENTIST",
      color: "#b599ff",
      speed: 17,
      route: [
        [210, 440],
        [210, 310],
        [505, 310],
        [505, 215],
        [505, 310],
        [210, 310],
      ],
    },
    {
      id: "gold",
      name: "Gold",
      role: "CREWMATE",
      color: "#f2cc75",
      speed: 23,
      route: [
        [560, 440],
        [490, 440],
        [490, 295],
        [600, 295],
        [490, 295],
        [490, 440],
      ],
    },
  ];
  const directRoute = [
    [615, 190],
    [735, 190],
  ];
  const doorwayRoute = [
    [615, 190],
    [490, 190],
    [490, 295],
    [785, 295],
    [785, 190],
    [735, 190],
  ];

  function svgElement(tag, attributes = {}, text) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attributes))
      node.setAttribute(key, String(value));
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function pathLength(points, closed) {
    let total = 0;
    for (let i = 0; i < points.length - 1; i++)
      total += Math.hypot(
        points[i + 1][0] - points[i][0],
        points[i + 1][1] - points[i][1],
      );
    if (closed)
      total += Math.hypot(
        points[0][0] - points.at(-1)[0],
        points[0][1] - points.at(-1)[1],
      );
    return total;
  }

  function positionOnPath(points, distance, closed = true) {
    const route = closed ? [...points, points[0]] : points;
    const total = pathLength(points, closed);
    let remaining = closed
      ? distance % total
      : Math.min(Math.max(distance, 0), total);
    for (let i = 0; i < route.length - 1; i++) {
      const [x1, y1] = route[i];
      const [x2, y2] = route[i + 1];
      const length = Math.hypot(x2 - x1, y2 - y1);
      if (remaining <= length && length > 0)
        return {
          x: x1 + ((x2 - x1) * remaining) / length,
          y: y1 + ((y2 - y1) * remaining) / length,
        };
      remaining -= length;
    }
    return { x: route.at(-1)[0], y: route.at(-1)[1] };
  }

  for (const player of players) {
    const group = svgElement("g", {
      "data-player": player.id,
      class: "npc-player",
    });
    const tag = svgElement("g", { class: "role-tag" });
    const leader = svgElement("line", {
      x1: 0,
      x2: 0,
      y1: -41,
      y2: -28,
      stroke: player.color,
      "stroke-opacity": 0.45,
      "stroke-width": 1,
      visibility: "hidden",
    });
    const tagBg = svgElement("rect", {
      x: -52,
      y: -65,
      width: 104,
      height: 24,
      rx: 5,
      class: "npc-tag-bg",
      stroke: player.color,
    });
    const role = svgElement(
      "text",
      { x: 0, y: -49, class: "npc-role", fill: player.color },
      player.role,
    );
    tag.append(tagBg, role);
    group.append(
      leader,
      tag,
      svgElement("use", {
        href: "#crew-symbol",
        x: -20,
        y: -27,
        width: 40,
        height: 48,
        color: player.color,
      }),
      svgElement("text", { x: 0, y: 37, class: "npc-name" }, player.name),
    );
    $("npc-layer").append(group);
    const line = svgElement("line", {
      stroke: player.color,
      "data-tracer": player.id,
    });
    $("tracer-lines").append(line);
    const dot = svgElement("circle", {
      r: 3.2,
      fill: player.color,
      "data-radar-player": player.id,
    });
    $("radar-dots").append(dot);
    const roster = document.createElement("div");
    roster.className = "roster-player";
    const swatch = document.createElement("span");
    swatch.className = "roster-color";
    swatch.style.backgroundColor = player.color;
    const copy = document.createElement("span");
    copy.className = "roster-copy";
    const name = document.createElement("span");
    name.className = "roster-name";
    name.textContent = player.name;
    const rosterRole = document.createElement("span");
    rosterRole.className = "roster-role";
    rosterRole.textContent = player.role;
    rosterRole.style.color = player.color;
    copy.append(name, rosterRole);
    roster.append(swatch, copy);
    $("roster").append(roster);
    player.elements = {
      group,
      tag,
      tagBg,
      role,
      line,
      dot,
      rosterRole,
      leader,
    };
  }
  const localDot = svgElement("circle", {
    r: 4,
    fill: "#4b9dff",
    stroke: "#b2e8ff",
    "stroke-width": 1,
    "data-radar-player": "you",
  });
  $("radar-dots").append(localDot);

  function radarPosition(dot, position) {
    dot.setAttribute("cx", (10 + (position.x / 960) * 160).toFixed(2));
    dot.setAttribute("cy", (10 + (position.y / 600) * 100).toFixed(2));
  }

  function localPosition() {
    if (state.active !== "noclip") return { x: 490, y: 295 };
    const route = state.features.noclip ? directRoute : doorwayRoute;
    const total = pathLength(route, false);
    const distance = (state.elapsed - state.wallStart) * 55;
    const progress = distance % (total * 2);
    return positionOnPath(
      route,
      progress <= total ? progress : total * 2 - progress,
      false,
    );
  }

  function render() {
    const local = localPosition();
    $("local-player").setAttribute(
      "transform",
      `translate(${local.x.toFixed(2)} ${local.y.toFixed(2)})`,
    );
    $("tracer-radius").setAttribute("cx", local.x);
    $("tracer-radius").setAttribute("cy", local.y);
    $("tracer-radius").setAttribute("r", state.radius);
    $("light-hole").setAttribute("cx", local.x);
    $("light-hole").setAttribute("cy", local.y);
    radarPosition(localDot, local);
    const placedTags = [];
    for (const player of players) {
      const position = positionOnPath(
        player.route,
        state.elapsed * player.speed,
      );
      player.position = position;
      const { group, line, dot, tag, leader } = player.elements;
      // Lift overlapping labels and retain a leader to their player.
      let tagOffset = 0;
      while (
        placedTags.some(
          (other) =>
            Math.abs(other.x - position.x) < 114 &&
            Math.abs(other.y - (position.y - 65 + tagOffset)) < 30,
        )
      ) {
        tagOffset -= 32;
      }
      placedTags.push({ x: position.x, y: position.y - 65 + tagOffset });
      tag.setAttribute("transform", `translate(0 ${tagOffset})`);
      leader.setAttribute("y1", -41 + tagOffset);
      leader.setAttribute(
        "visibility",
        state.features.tags && tagOffset < 0 ? "visible" : "hidden",
      );
      group.setAttribute(
        "transform",
        `translate(${position.x.toFixed(2)} ${position.y.toFixed(2)})`,
      );
      line.setAttribute("x1", local.x);
      line.setAttribute("y1", local.y);
      line.setAttribute("x2", position.x);
      line.setAttribute("y2", position.y);
      line.setAttribute(
        "visibility",
        state.features.tracers &&
          Math.hypot(position.x - local.x, position.y - local.y) <= state.radius
          ? "visible"
          : "hidden",
      );
      radarPosition(dot, position);
    }
  }

  function focusMap(x) {
    const viewport = $("scene-viewport");
    viewport.scrollLeft = Math.max(
      0,
      (x / 960) * $("lobby-map").clientWidth - viewport.clientWidth / 2,
    );
  }

  function announce(message) {
    $("demo-announcement").textContent = message;
  }

  function updateControls() {
    for (const button of document.querySelectorAll("[data-feature]")) {
      button.setAttribute(
        "aria-pressed",
        String(state.features[button.dataset.feature]),
      );
      button.classList.toggle(
        "is-active",
        button.dataset.feature === state.active,
      );
    }
    for (const player of players) {
      const { tag, tagBg, role, rosterRole } = player.elements;
      tag.setAttribute(
        "visibility",
        state.features.tags ? "visible" : "hidden",
      );
      role.textContent = state.features.roles ? player.role : "UNKNOWN";
      rosterRole.textContent = state.features.roles ? player.role : "UNKNOWN";
      role.setAttribute(
        "fill",
        state.features.roles ? player.color : "#8da6c6",
      );
      tagBg.setAttribute(
        "stroke",
        state.features.roles ? player.color : "#496080",
      );
      rosterRole.style.color = state.features.roles ? player.color : "#748aa9";
    }
    $("tracer-layer").setAttribute(
      "visibility",
      state.features.tracers ? "visible" : "hidden",
    );
    $("radius").value = String(state.radius);
    $("radius").disabled = !state.features.tracers;
    $("radius-value").textContent = `${state.radius} units`;
    $("radar").classList.toggle("is-disabled", !state.features.radar);
    $("radar").setAttribute(
      "aria-label",
      state.features.radar
        ? "Live radar showing the same five players as the map"
        : "Player radar disabled",
    );
    document.querySelector(".radar-caption").textContent = state.features.radar
      ? "ALL 5 PLAYERS TRACKED"
      : "RADAR DISABLED";
    $("lights-toggle").setAttribute("aria-pressed", String(state.lightsOut));
    $("lights-label").textContent = state.lightsOut
      ? "Lights off"
      : "Lights on";
    $("darkness-layer").setAttribute(
      "visibility",
      state.lightsOut && !state.features.vision ? "visible" : "hidden",
    );
    $("wall-demo").setAttribute(
      "visibility",
      state.active === "noclip" ? "visible" : "hidden",
    );
    const route = state.features.noclip ? directRoute : doorwayRoute;
    $("wall-route").setAttribute(
      "d",
      route.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" "),
    );
    $("wall-route-label").textContent = state.features.noclip
      ? "NOCLIP ON · DIRECT ROUTE"
      : "COLLISION ON · VIA DOORWAY";
    const feature = features[state.active];
    $("feature-index").textContent = feature.index;
    $("feature-title").textContent = feature.title;
    $("feature-description").textContent =
      state.active === "vision" && !state.lightsOut
        ? "The lights are on. Use the Lights on button above the map to turn them off, then compare the view with Orbit vision enabled or disabled."
        : feature.description;
    const actions = {
      roles: state.features.roles ? "Hide roles" : "Reveal roles",
      tags: state.features.tags ? "Hide role tags" : "Show role tags",
      tracers: state.features.tracers ? "Hide tracers" : "Show tracers",
      radar: state.features.radar ? "Disable radar" : "Enable radar",
      noclip: state.features.noclip
        ? "Compare with collision"
        : "Enable NoClip",
      vision: state.features.vision
        ? "Compare without vision"
        : "Restore full vision",
    };
    $("feature-action").replaceChildren(
      document.createTextNode(actions[state.active] + " "),
    );
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "↗";
    $("feature-action").append(arrow);
    $("pause-demo").setAttribute(
      "aria-label",
      state.paused ? "Resume simulation" : "Pause simulation",
    );
    $("pause-demo").setAttribute("aria-pressed", String(state.paused));
    $("pause-demo").firstElementChild.textContent = state.paused ? "▶" : "Ⅱ";
    let sceneState = "FULL LOBBY VISIBILITY";
    if (state.active === "noclip")
      sceneState = state.features.noclip
        ? "NOCLIP ON · CROSSING THE WALL"
        : "NOCLIP OFF · TAKING THE DOORWAY";
    else if (state.lightsOut)
      sceneState = state.features.vision
        ? "LIGHTS OUT · ORBIT VISION ACTIVE"
        : "LIGHTS OUT · RESTRICTED VISIBILITY";
    const statusDot = document.createElement("i");
    statusDot.className = "status-dot";
    $("scene-state").replaceChildren(
      statusDot,
      document.createTextNode(sceneState),
    );
    render();
  }

  function setFeature(feature, enabled) {
    state.active = feature;
    state.features[feature] = enabled;
    if (feature === "vision") state.lightsOut = true;
    if (feature === "noclip") state.wallStart = state.elapsed;
    updateControls();
    if (feature === "noclip") focusMap(675);
    announce(`${features[feature].title} ${enabled ? "enabled" : "disabled"}.`);
  }

  document.querySelectorAll("[data-feature]").forEach((button) => {
    button.addEventListener("click", () =>
      setFeature(
        button.dataset.feature,
        !state.features[button.dataset.feature],
      ),
    );
  });
  $("radius").addEventListener("input", () => {
    state.radius = Number($("radius").value);
    state.active = "tracers";
    updateControls();
  });
  $("feature-action").addEventListener("click", () =>
    setFeature(state.active, !state.features[state.active]),
  );
  $("lights-toggle").addEventListener("click", () => {
    state.lightsOut = !state.lightsOut;
    updateControls();
    announce(
      state.lightsOut ? "Ship lights turned off." : "Ship lights turned on.",
    );
  });
  $("pause-demo").addEventListener("click", () => {
    state.paused = !state.paused;
    updateControls();
    announce(state.paused ? "Simulation paused." : "Simulation resumed.");
  });
  $("reset-demo").addEventListener("click", () => {
    Object.assign(state, {
      features: { ...defaults },
      active: "roles",
      radius: 350,
      lightsOut: false,
      paused: reducedMotion,
      elapsed: 0,
      wallStart: 0,
    });
    updateControls();
    focusMap(490);
    announce("Simulation reset. All default settings restored.");
  });
  document.querySelectorAll("[data-demo-preset]").forEach((button) => {
    button.addEventListener("click", () => {
      const feature = button.dataset.demoPreset;
      if (feature === "roles") state.features.tags = true;
      if (feature === "tags") state.features.roles = true;
      setFeature(feature, true);
      $("playground").scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start",
      });
      if (feature !== "noclip") focusMap(490);
      document
        .querySelector(`[data-feature="${feature}"]`)
        .focus({ preventScroll: true });
    });
  });
  if (typeof window.IntersectionObserver === "function") {
    const observer = new window.IntersectionObserver(
      (entries) => {
        state.visible = entries[0].isIntersecting;
      },
      { rootMargin: "150px" },
    );
    observer.observe($("sandbox"));
  }
  updateControls();
  let lastTimestamp = null;
  let initialFocus = true;
  function frame(timestamp) {
    if (
      lastTimestamp !== null &&
      !state.paused &&
      !document.hidden &&
      state.visible
    ) {
      state.elapsed += Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      render();
    }
    lastTimestamp = timestamp;
    if (initialFocus) {
      focusMap(490);
      initialFocus = false;
    }
    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);

  const config = window.ORBIT_CONFIG || {};
  const dialog = $("access-dialog");
  let checkoutUrl = null;
  try {
    if (typeof config.checkoutUrl === "string" && config.checkoutUrl.trim()) {
      const candidate = new URL(
        config.checkoutUrl.trim(),
        window.location.href,
      );
      if (
        candidate.protocol === "https:" ||
        (candidate.origin === window.location.origin &&
          candidate.protocol === window.location.protocol)
      )
        checkoutUrl = candidate;
    }
  } catch {
    /* Leave checkout unavailable until a valid URL is supplied. */
  }
  if (checkoutUrl) {
    document.querySelectorAll("[data-checkout-link]").forEach((link) => {
      link.href = checkoutUrl.href;
    });
    document.querySelectorAll(".purchase-button").forEach((button) => {
      const link = document.createElement("a");
      link.className = button.className;
      link.href = checkoutUrl.href;
      link.dataset.plan = button.dataset.plan;
      while (button.firstChild) link.append(button.firstChild);
      button.replaceWith(link);
    });
    $("purchase-note").textContent =
      config.checkoutNote ||
      "$3 per 14 days or $20 lifetime. Review purchase terms at checkout.";
    $("purchase-faq").textContent =
      "Choose an access option to continue to checkout. Review the pricing and purchase terms before completing your order.";
  } else {
    document.querySelectorAll(".purchase-button").forEach((button) => {
      button.addEventListener("click", () => {
        $("dialog-plan").textContent =
          button.dataset.plan === "lifetime"
            ? "Lifetime access — $20."
            : "14-day access — $3 per 14 days.";
        dialog.showModal();
      });
    });
  }
  document
    .querySelectorAll(".dialog-close, .dialog-done")
    .forEach((button) =>
      button.addEventListener("click", () => dialog.close()),
    );
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  $("copyright-year").textContent = new Date().getFullYear();
})();
