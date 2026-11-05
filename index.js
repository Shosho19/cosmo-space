const display_image = document.querySelector("#apod-image");
const display_title = document.querySelector("#apod-title");
const display_date = document.querySelector("#apod-date-detail");
const display_explanation = document.querySelector("#apod-explanation");
const dateInput = document.querySelector("#apod-date-input");
const dateLabel = document.querySelector(".date-input-wrapper span");
const loadBtn = document.querySelector("#load-date-btn");
const todayBtn = document.querySelector("#today-apod-btn");
const apod_spinner = document.querySelector("#apod-loading");
const View_Resolution_Btn = document.querySelector("#View_Resolution_Btn");
const mediaContainer = document.querySelector("#apod-image-container");
const apod_err_mssg = document.querySelector("#apod-error-message");

const apod_header_date = document.querySelector("#apod-date");
const apod_copyright = document.querySelector("#apod-copyright");
const apod_date_info = document.querySelector("#apod-date-info");
const apod_media_type = document.querySelector("#apod-media-type");

const sidebar = document.querySelector("#sidebar");
const sidebarToggle = document.querySelector("#sidebar-toggle");

const API_KEY = "AaMGuduUeot1Vb8cWiVahVBLEpsTdAKUF1g94aej";
let currentMediaUrl = "";

if (dateInput) {
    dateInput.max = new Date().toISOString().split("T")[0];
}

const tabs_links = document.querySelectorAll(".nav-link");
const tabs_sections = document.querySelectorAll(".app-section");

for (let i = 0; i < tabs_links.length; i++) {
    tabs_links[i].addEventListener("click", function (e) {
        e.preventDefault();
        const selected = this.dataset.section;

        for (let j = 0; j < tabs_sections.length; j++) {
            if (tabs_sections[j].dataset.section === selected) {
                tabs_sections[j].classList.remove("hidden");
            } else {
                tabs_sections[j].classList.add("hidden");
            }
        }

        if (selected === "launches") {
            getLaunches();
        } else if (selected === "planets") {
            getPlanets();
        }

        for (let j = 0; j < tabs_links.length; j++) {
            tabs_links[j].classList.remove("active_tab");
        }
        this.classList.add("active_tab");

        if (sidebar) {
            sidebar.classList.remove("sidebar-open");
        }
    });
}

if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", function () {
        sidebar.classList.toggle("sidebar-open");
    });
}

async function getPOD(date = null) {
    try {
        apod_err_mssg.classList.add("hidden");
        apod_spinner.classList.remove("hidden");
        display_image.classList.add("hidden");

        const existingIframe = mediaContainer.querySelector("iframe");
        if (existingIframe) existingIframe.remove();

        const API_URL = date
            ? `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`
            : `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`;

        const res = await fetch(API_URL);
        if (!res.ok) {
            apod_spinner.classList.add("hidden");
            apod_err_mssg.classList.remove("hidden");
            return;
        }

        const data = await res.json();
        displayPOD(data);
    } catch (error) {
        console.error(error);
        apod_spinner.classList.add("hidden");
        apod_err_mssg.classList.remove("hidden");
    }
}

display_image.addEventListener("load", function () {
    apod_spinner.classList.add("hidden");
    display_image.classList.remove("hidden");
});

display_image.addEventListener("error", function () {
    apod_spinner.classList.add("hidden");
    display_image.classList.add("hidden");
    apod_err_mssg.textContent = "Failed to load image.";
    apod_err_mssg.classList.remove("hidden");
});

function displayPOD(data) {
    apod_err_mssg.classList.add("hidden");

    display_title.textContent = data.title || "Astronomy Picture of the Day";
    display_date.innerHTML = `<i class="far fa-calendar mr-2"></i>${data.date}`;
    display_explanation.textContent = data.explanation || "";

    if (apod_header_date) apod_header_date.textContent = `Astronomy Picture of the Day - ${data.date}`;
    if (apod_date_info) apod_date_info.textContent = data.date;
    if (apod_media_type) apod_media_type.textContent = data.media_type === "video" ? "Video" : "Image";
    if (apod_copyright) apod_copyright.textContent = data.copyright ? `© ${data.copyright.trim()}` : "© NASA";

    currentMediaUrl = data.hdurl || data.url;

    if (data.media_type === "image") {
        display_image.src = currentMediaUrl;
        display_image.alt = data.title || "APOD Image";
    } else if (data.media_type === "video") {
        display_image.classList.add("hidden");
        apod_spinner.classList.add("hidden");

        const iframe = document.createElement("iframe");
        iframe.className = "w-full h-full rounded-2xl";
        iframe.src = data.url;
        iframe.frameBorder = "0";
        iframe.allowFullscreen = true;

        mediaContainer.insertBefore(iframe, mediaContainer.firstChild);
    }
}

dateInput.addEventListener("change", function () {
    if (!this.value) return;
    const selectedDate = new Date(`${this.value}T00:00:00`);
    dateLabel.textContent = selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
});

loadBtn.addEventListener("click", function () {
    getPOD(dateInput.value || null);
});

todayBtn.addEventListener("click", function () {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    dateInput.value = todayStr;
    dateLabel.textContent = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    getPOD();
});

if (View_Resolution_Btn) {
    View_Resolution_Btn.addEventListener("click", function () {
        if (currentMediaUrl) window.open(currentMediaUrl, "_blank");
    });
}

getPOD();

const LAUNCHES_API = "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";
const launchesSpinner = document.querySelector("#launches-loading");
const launchesError = document.querySelector("#launches-error-message");
const featuredLaunch = document.querySelector("#featured-launch");
const launchesGrid = document.querySelector("#launches-grid");

async function getLaunches() {
    launchesError.classList.add("hidden");
    launchesSpinner.classList.remove("hidden");
    featuredLaunch.classList.add("hidden");
    launchesGrid.classList.add("hidden");

    try {
        const res = await fetch(LAUNCHES_API);
        if (!res.ok) {
            launchesSpinner.classList.add("hidden");
            launchesError.classList.remove("hidden");
            launchesError.textContent = "Failed to fetch launches data.";
            return;
        }
        const data = await res.json();
        displayLaunches(data.results);
    } catch (error) {
        console.error(error);
        launchesSpinner.classList.add("hidden");
        launchesError.classList.remove("hidden");
    }
}

function getImageUrl(item) {
    if (!item) return "";
    if (typeof item.image === "string") return item.image;
    if (item.image && typeof item.image === "object") {
        return item.image.image_url || item.image.thumbnail_url || "";
    }
    if (item.rocket && item.rocket.configuration) {
        const config = item.rocket.configuration;
        if (typeof config.image_url === "string") return config.image_url;
        if (config.image && typeof config.image === "object") return config.image.image_url || "";
        if (typeof config.image === "string") return config.image;
    }
    return "";
}

function displayLaunches(launches) {
    launchesSpinner.classList.add("hidden");
    launchesError.classList.add("hidden");

    featuredLaunch.classList.remove("hidden");
    launchesGrid.classList.remove("hidden");

    if (!launches || !launches.length) {
        launchesError.textContent = "No upcoming launches found.";
        launchesError.classList.remove("hidden");
        featuredLaunch.classList.add("hidden");
        launchesGrid.classList.add("hidden");
        return;
    }

    const featured = launches[0];
    const launchDate = new Date(featured.net);

    const date = launchDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    const time = launchDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
    });

    const today = new Date();
    const diff = launchDate - today;
    const daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

    const provider = featured.launch_service_provider?.name || "SpaceX";
    const rocket = featured.rocket?.configuration?.name || "Rocket";
    const location = featured.pad?.location?.name || "Unknown Location";
    const country = featured.pad?.location?.country_code || "USA";
    const description = featured.mission?.description || "No mission description available.";
    const imageUrl = getImageUrl(featured);

    featuredLaunch.innerHTML = `
      <div class="relative bg-slate-800/30 border border-slate-700 rounded-3xl overflow-hidden group hover:border-blue-500/50 transition-all">
        <div class="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-8">
          <div class="flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-3 mb-4">
                <span class="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-semibold flex items-center gap-2">
                  <i class="fas fa-star"></i> Featured Launch
                </span>
                <span class="px-4 py-1.5 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                  ${featured.status?.abbrev || "Go"}
                </span>
              </div>
              <h3 class="text-3xl font-bold mb-3 leading-tight">${featured.name}</h3>
              <div class="flex flex-col xl:flex-row xl:items-center gap-4 mb-6 text-slate-400">
                <div class="flex items-center gap-2">
                  <i class="fas fa-building"></i>
                  <span>${provider}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-rocket"></i>
                  <span>${rocket}</span>
                </div>
              </div>
              <div class="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-xl mb-6">
                <i class="fas fa-clock text-2xl text-blue-400"></i>
                <div>
                  <p class="text-2xl font-bold text-blue-400">${daysLeft}</p>
                  <p class="text-xs text-slate-400">Days Until Launch</p>
                </div>
              </div>
              <div class="grid xl:grid-cols-2 gap-4 mb-6">
                <div class="bg-slate-900/50 rounded-xl p-4">
                  <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                    <i class="fas fa-calendar"></i> Launch Date
                  </p>
                  <p class="font-semibold">${date}</p>
                </div>
                <div class="bg-slate-900/50 rounded-xl p-4">
                  <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                    <i class="fas fa-clock"></i> Launch Time
                  </p>
                  <p class="font-semibold">${time}</p>
                </div>
                <div class="bg-slate-900/50 rounded-xl p-4">
                  <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                    <i class="fas fa-map-marker-alt"></i> Location
                  </p>
                  <p class="font-semibold text-sm line-clamp-1">${location}</p>
                </div>
                <div class="bg-slate-900/50 rounded-xl p-4">
                  <p class="text-xs text-slate-400 mb-1 flex items-center gap-2">
                    <i class="fas fa-globe"></i> Country
                  </p>
                  <p class="font-semibold">${country}</p>
                </div>
              </div>
              <p class="text-slate-300 leading-relaxed mb-6 line-clamp-3">${description}</p>
            </div>
            <div class="flex flex-col md:flex-row gap-3">
              <button class="flex-1 self-start md:self-center px-6 py-3 bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2">
                <i class="fas fa-info-circle"></i> View Full Details
              </button>
              <div class="icons self-end md:self-center flex gap-2">
                <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                  <i class="far fa-heart"></i>
                </button>
                <button class="px-4 py-3 bg-slate-700 rounded-xl hover:bg-slate-600 transition-colors">
                  <i class="fas fa-bell"></i>
                </button>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="relative h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-900/50 flex items-center justify-center">
              ${imageUrl ? `<img src="${imageUrl}" class="w-full h-full object-cover" alt="${featured.name}">` : `<i class="fas fa-rocket text-9xl text-slate-700/50"></i>`}
              <div class="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    let gridHTML = "";
    const otherLaunches = launches.slice(1);

    for (let i = 0; i < otherLaunches.length; i++) {
        const item = otherLaunches[i];
        const itemDate = new Date(item.net);
        const formattedDate = itemDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        const formattedTime = itemDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
        const itemProvider = item.launch_service_provider?.name || "SpaceX";
        const itemRocket = item.rocket?.configuration?.name || "Rocket";
        const itemLocation = item.pad?.location?.name || "Unknown";
        const itemImage = getImageUrl(item);

        gridHTML += `
          <div class="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group cursor-pointer">
            <div class="relative h-48 bg-slate-900/50 flex items-center justify-center">
              ${itemImage ? `<img src="${itemImage}" class="w-full h-full object-cover" alt="${item.name}">` : `<i class="fas fa-space-shuttle text-5xl text-slate-700"></i>`}
              <div class="absolute top-3 right-3">
                <span class="px-3 py-1 bg-green-500/90 text-white backdrop-blur-sm rounded-full text-xs font-semibold">
                  ${item.status?.abbrev || "Go"}
                </span>
              </div>
            </div>
            <div class="p-5">
              <div class="mb-3">
                <h4 class="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                  ${item.name}
                </h4>
                <p class="text-sm text-slate-400 flex items-center gap-2">
                  <i class="fas fa-building text-xs"></i>
                  ${itemProvider}
                </p>
              </div>
              <div class="space-y-2 mb-4">
                <div class="flex items-center gap-2 text-sm">
                  <i class="fas fa-calendar text-slate-500 w-4"></i>
                  <span class="text-slate-300">${formattedDate}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <i class="fas fa-clock text-slate-500 w-4"></i>
                  <span class="text-slate-300">${formattedTime}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <i class="fas fa-rocket text-slate-500 w-4"></i>
                  <span class="text-slate-300">${itemRocket}</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <i class="fas fa-map-marker-alt text-slate-500 w-4"></i>
                  <span class="text-slate-300 line-clamp-1">${itemLocation}</span>
                </div>
              </div>
              <div class="flex items-center gap-2 pt-4 border-t border-slate-700">
                <button class="flex-1 px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors text-sm font-semibold">
                  Details
                </button>
                <button class="px-3 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <i class="far fa-heart"></i>
                </button>
              </div>
            </div>
          </div>
        `;
    }

    launchesGrid.innerHTML = gridHTML;
}
const PLANETS_API =
  "https://solar-system-opendata-proxy.vercel.app/api/planets";

const planetCards = document.querySelectorAll(".planet-card");
const planetsLoading = document.getElementById("planets-loading");
const planetsErrorMessage = document.getElementById(
  "planets-error-message"
);

let planets = [];
let planetsLoaded = false;

async function getPlanets() {
  if (planetsLoaded) return;

  try {
    planetsLoading.classList.remove("hidden");
    planetsErrorMessage.classList.add("hidden");

    const res = await fetch(PLANETS_API);

    if (!res.ok) {
      throw new Error("Failed to fetch planets.");
    }

    const data = await res.json();
    planets = data.bodies;

    planetsLoaded = true;

    const earth = planets.find(
      (planet) => planet.englishName.toLowerCase() === "earth"
    );

    if (earth) {
      displayPlanet(earth);

      for (let i = 0; i < planetCards.length; i++) {
        if (planetCards[i].dataset.planetId === "earth") {
          planetCards[i].classList.add("ring-2", "ring-blue-500");
          break;
        }
      }
    }
  } catch (err) {
    console.error(err);
    planetsErrorMessage.classList.remove("hidden");
  } finally {
    planetsLoading.classList.add("hidden");
  }
}

getPlanets();

for (let i = 0; i < planetCards.length; i++) {
  planetCards[i].addEventListener("click", function () {
    for (let j = 0; j < planetCards.length; j++) {
      planetCards[j].classList.remove("ring-2", "ring-blue-500");
    }

    this.classList.add("ring-2", "ring-blue-500");

    const planetId = this.dataset.planetId;

    const selectedPlanet = planets.find(
      (planet) => planet.englishName.toLowerCase() === planetId
    );

    if (selectedPlanet) {
      displayPlanet(selectedPlanet);
    }
  });
}

function displayPlanet(planet) {
  document.querySelector("#planet-detail-image").src =
    planet.image || "./assets/images/default-planet.png";

  document.querySelector("#planet-detail-name").textContent =
    planet.englishName || "Unknown";

  document.querySelector("#planet-detail-description").textContent =
    planet.description || "No description available.";

  document.querySelector("#planet-distance").textContent =
    (planet.semimajorAxis?.toLocaleString() || "N/A") + " km";

  document.querySelector("#planet-radius").textContent =
    (planet.meanRadius?.toLocaleString() || "N/A") + " km";

  document.querySelector("#planet-mass").textContent =
    planet.mass
      ? `${planet.mass.massValue} × 10^${planet.mass.massExponent} kg`
      : "N/A";

  document.querySelector("#planet-density").textContent =
    (planet.density ?? "N/A") + " g/cm³";

  document.querySelector("#planet-orbital-period").textContent =
    (planet.sideralOrbit ?? "N/A") + " days";

  document.querySelector("#planet-rotation").textContent =
    (Math.abs(planet.sideralRotation) || "N/A") + " hours";

  document.querySelector("#planet-moons").textContent =
    planet.moons ? planet.moons.length : 0;

  document.querySelector("#planet-gravity").textContent =
    (planet.gravity ?? "N/A") + " m/s²";

  document.querySelector("#planet-discoverer").textContent =
    planet.discoveredBy || "Known since antiquity";

  document.querySelector("#planet-discovery-date").textContent =
    planet.discoveryDate || "Ancient";

  document.querySelector("#planet-body-type").textContent =
    planet.type || "Planet";

  document.querySelector("#planet-volume").textContent = planet.vol
    ? `${planet.vol.volValue} × 10^${planet.vol.volExponent} km³`
    : "N/A";

  document.querySelector("#planet-perihelion").textContent =
    (planet.perihelion?.toLocaleString() || "N/A") + " km";

  document.querySelector("#planet-aphelion").textContent =
    (planet.aphelion?.toLocaleString() || "N/A") + " km";

  document.querySelector("#planet-eccentricity").textContent =
    planet.eccentricity ?? "N/A";

  document.querySelector("#planet-inclination").textContent =
    (planet.inclination ?? "N/A") + "°";

  document.querySelector("#planet-axial-tilt").textContent =
    (planet.axialTilt ?? "N/A") + "°";

  document.querySelector("#planet-temp").textContent =
    (planet.avgTemp ?? "N/A") + " K";

  document.querySelector("#planet-escape").textContent =
    (planet.escape?.toLocaleString() || "N/A") + " m/s";

  const facts = document.querySelector("#planet-facts");

  facts.innerHTML = `
        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span>Mean Radius : ${planet.meanRadius?.toLocaleString() || "N/A"} km</span>
        </li>

        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span>Gravity : ${planet.gravity ?? "N/A"} m/s²</span>
        </li>

        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span>Moons : ${planet.moons ? planet.moons.length : 0}</span>
        </li>

        <li class="flex items-start">
            <i class="fas fa-check text-green-400 mt-1 mr-2"></i>
            <span>Type : ${planet.type || "Unknown"}</span>
        </li>
    `;
}