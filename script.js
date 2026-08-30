document.addEventListener("DOMContentLoaded", () => {
  // Icons are optional: keep the dashboard functional if the CDN is unavailable.
  if (window.lucide) lucide.createIcons();

  // Responsive sidebar
  const sidebar = document.getElementById("sidebar");
  const mobileMenu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("sidebarOverlay");

  const toggleSidebar = () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  };
  mobileMenu?.addEventListener("click", toggleSidebar);
  overlay?.addEventListener("click", toggleSidebar);


  // Sidebar dropdowns: all groups are CLOSED by default.
  const navGroups = document.querySelectorAll(".nav-group");
  navGroups.forEach(group => {
    group.classList.remove("open");
    const toggle = group.querySelector(".nav-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  });

  navGroups.forEach(group => {
    const toggle = group.querySelector(".nav-toggle");
    if (!toggle) return;

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const opening = !group.classList.contains("open");

      // Close every other dropdown.
      navGroups.forEach(other => {
        other.classList.remove("open");
        const otherToggle = other.querySelector(".nav-toggle");
        if (otherToggle) otherToggle.setAttribute("aria-expanded", "false");
      });

      // Toggle the clicked dropdown.
      group.classList.toggle("open", opening);
      toggle.setAttribute("aria-expanded", String(opening));
    });
  });

  // Sidebar links are real clickable anchors. Keep the selected item visibly active.
  document.querySelectorAll(".side-nav a").forEach(link => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".side-nav a").forEach(item => item.classList.remove("selected"));
      link.classList.add("selected");
      if (window.innerWidth <= 960) {
        sidebar.classList.remove("open");
        overlay.classList.remove("show");
      }
    });
  });

  // Leaflet + OpenStreetMap demo map. The rest of the UI continues to work if Leaflet fails.
  let map = null;
  if (window.L && document.getElementById("map")) {
    map = L.map("map", {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false
    }).setView([-27.4698, 153.0251], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const vehicleIcon = L.divIcon({
      className: "truckly-map-marker",
      html: '<div style="width:28px;height:28px;border-radius:50%;background:#dff8f1;border:1px solid #7fe1c4;display:grid;place-items:center;box-shadow:0 0 0 7px rgba(70,207,166,.12)"><div style="width:11px;height:11px;border-radius:3px;background:#24c89c;border:2px solid #fff"></div></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
    L.marker([-27.4598, 153.0451], { icon: vehicleIcon }).addTo(map);
  }

  // Touch/mouse draggable car slider, intentionally no arrows
  const slider = document.getElementById("carSlider");
  const track = slider.querySelector(".car-track");
  const slides = [...slider.querySelectorAll(".car-slide")];
  let index = 0, startX = 0, currentX = 0, dragging = false, moved = false;

  const render = (animate = true) => {
    track.style.transition = animate ? "transform .35s ease" : "none";
    track.style.transform = `translateX(-${index * 100}%)`;
  };

  const pointerStart = (x) => {
    dragging = true;
    moved = false;
    startX = x;
    currentX = x;
    slider.classList.add("dragging");
    track.style.transition = "none";
  };

  const pointerMove = (x) => {
    if (!dragging) return;
    currentX = x;
    const delta = x - startX;
    if (Math.abs(delta) > 5) moved = true;
    track.style.transform = `translateX(calc(-${index * 100}% + ${delta}px))`;
  };

  const pointerEnd = () => {
    if (!dragging) return;
    dragging = false;
    slider.classList.remove("dragging");
    const delta = currentX - startX;
    if (Math.abs(delta) > slider.clientWidth * 0.18) {
      if (delta < 0 && index < slides.length - 1) index++;
      if (delta > 0 && index > 0) index--;
    }
    render(true);
  };

  slider.addEventListener("pointerdown", e => {
    slider.setPointerCapture?.(e.pointerId);
    pointerStart(e.clientX);
  });
  slider.addEventListener("pointermove", e => pointerMove(e.clientX));
  slider.addEventListener("pointerup", pointerEnd);
  slider.addEventListener("pointercancel", pointerEnd);
  slider.addEventListener("dragstart", e => e.preventDefault());

  // Dynamic tabs
  const tabs = document.querySelectorAll(".tab");
  const dashboardPanel = document.getElementById("dashboardPanel");
  const placeholderPanel = document.getElementById("placeholderPanel");

  const tabContent = {
    trips: "Trips content will appear here.",
    events: "Events content will appear here.",
    drivers: "Drivers content will appear here.",
    sensors: "Sensors content will appear here.",
    devices: "Devices content will appear here.",
    logs: "Logs content will appear here."
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const key = tab.dataset.tab;
      if (key === "dashboard") {
        dashboardPanel.style.display = "";
        placeholderPanel.style.display = "none";
      } else {
        dashboardPanel.style.display = "none";
        placeholderPanel.style.display = "flex";
        placeholderPanel.textContent = tabContent[key] || `${key} content will appear here.`;
      }
      if (window.lucide) lucide.createIcons();
    });
  });

  // Keep map correctly sized after responsive layout changes
  if (map) {
    window.addEventListener("resize", () => setTimeout(() => map.invalidateSize(), 150));
    setTimeout(() => map.invalidateSize(), 300);
  }
});
