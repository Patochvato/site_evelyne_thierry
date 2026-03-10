const toggleBtn = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (toggleBtn && navLinks) {
  toggleBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));
}

const galleryImages = [
  "Photos/Arrivée/1692878400022.jpg",
  "Photos/Arrivée/Arrivée portillon.jpg",
  "Photos/Arrivée/Arrivée.jpg",
  "Photos/Arrivée/IMG20251001164748.jpg",
  "Photos/Arrivée/Montée.jpeg",
  "Photos/Arrivée/Montée.jpg",
  "Photos/Arrivée/Virage.jpg",
  "Photos/Chambre/coucher soleil chambre.jpg",
  "Photos/Chambre/Fenêtre.jpg",
  "Photos/Chambre/photo4.jpg",
  "Photos/Chambre/Porte.jpg",
  "Photos/Chambre/Vue du lit.jpg",
  "Photos/Cuisine douche/Cuisine côté mer.jpg",
  "Photos/Cuisine douche/Cuisine côté mer1.jpg",
  "Photos/Cuisine douche/Cuisine côté Montagne.jpg",
  "Photos/Cuisine douche/Cuisine Entrée.jpg",
  "Photos/Cuisine douche/Cuisine Evier.jpg",
  "Photos/Cuisine douche/Douche Entrée.jpg",
  "Photos/Cuisine douche/Douche.jpg",
  "Photos/Cuisine douche/photo3.jpg",
  "Photos/Jardin/Choune.jpg",
  "Photos/Jardin/photo_accueil.jpg",
  "Photos/Jardin/Vu de la cuisine.jpg",
  "Photos/Piscine/1737977482213.jpg",
  "Photos/Piscine/1737977482221.jpg",
  "Photos/Piscine/Escalier.jpg",
  "Photos/Piscine/photo2.jpg",
  "Photos/Terrasse/1692878584817.jpg",
  "Photos/Terrasse/photo1.jpg",
  "Photos/Toilettes/1610615301390.jpg",
  "Photos/Toilettes/1692878585012.jpg",
  "Photos/Toilettes/1692878585027.jpg"
];

const slidesContainer = document.querySelector("#slides");

function toAssetUrl(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function toAltText(path) {
  const fileName = path.split("/").pop() || "photo";
  return fileName.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
}

if (slidesContainer) {
  slidesContainer.innerHTML = "";
  galleryImages.forEach((imgPath, index) => {
    const img = document.createElement("img");
    img.src = toAssetUrl(imgPath);
    img.alt = toAltText(imgPath);
    img.className = "slide";
    if (index === 0) {
      img.classList.add("active");
    }
    slidesContainer.appendChild(img);
  });
}

const slides = document.querySelectorAll(".slide");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");
const slider = document.querySelector(".slider");
const dotsContainer = document.querySelector("#slider-dots");
let current = 0;
let autoTimer = null;
let touchStartX = 0;
let touchEndX = 0;

function showSlide(i){
  slides.forEach(s => s.classList.remove("active"));
  slides[i].classList.add("active");

  const dots = dotsContainer?.querySelectorAll(".slider-dot") || [];
  dots.forEach(dot => dot.classList.remove("active"));
  dots[i]?.classList.add("active");
}

function goToSlide(index) {
  current = (index + slides.length) % slides.length;
  showSlide(current);
}

function startAutoPlay() {
  if (slides.length < 2) {
    return;
  }
  stopAutoPlay();
  autoTimer = setInterval(() => {
    goToSlide(current + 1);
  }, 5000);
}

function stopAutoPlay() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

if (slides.length){
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    slides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot";
      dot.setAttribute("aria-label", `Aller a la photo ${index + 1}`);
      dot.addEventListener("click", () => {
        goToSlide(index);
        startAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  showSlide(current);
  prevBtn?.addEventListener("click", () => { goToSlide(current - 1); startAutoPlay(); });
  nextBtn?.addEventListener("click", () => { goToSlide(current + 1); startAutoPlay(); });

  slider?.addEventListener("mouseenter", stopAutoPlay);
  slider?.addEventListener("mouseleave", startAutoPlay);
  slider?.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  slider?.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const delta = touchEndX - touchStartX;
    if (Math.abs(delta) > 40) {
      if (delta < 0) {
        goToSlide(current + 1);
      } else {
        goToSlide(current - 1);
      }
      startAutoPlay();
    }
  }, { passive: true });

  slider?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      goToSlide(current + 1);
      startAutoPlay();
    }
    if (event.key === "ArrowLeft") {
      goToSlide(current - 1);
      startAutoPlay();
    }
  });

  startAutoPlay();

  if (slides.length < 2) {
    if (prevBtn) prevBtn.style.display = "none";
    if (nextBtn) nextBtn.style.display = "none";
    if (dotsContainer) dotsContainer.style.display = "none";
  }
}

function normalizeIcsLines(icsText) {
  const lines = icsText.replace(/\r\n/g, "\n").split("\n");
  const unfolded = [];
  lines.forEach((line) => {
    if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.length) {
      unfolded[unfolded.length - 1] += line.slice(1);
    } else {
      unfolded.push(line);
    }
  });
  return unfolded;
}

function parseIcalDay(value) {
  const dayPart = (value || "").slice(0, 8);
  if (!/^\d{8}$/.test(dayPart)) {
    return null;
  }
  const year = Number(dayPart.slice(0, 4));
  const month = Number(dayPart.slice(4, 6));
  const day = Number(dayPart.slice(6, 8));
  return new Date(Date.UTC(year, month - 1, day));
}

function addDaysUtc(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function dayKeyUtc(date) {
  return date.toISOString().slice(0, 10);
}

function collectBookedDays(icsText) {
  const lines = normalizeIcsLines(icsText);
  const booked = new Set();
  let startDate = null;
  let endDate = null;

  lines.forEach((line) => {
    if (line === "BEGIN:VEVENT") {
      startDate = null;
      endDate = null;
      return;
    }

    if (line.startsWith("DTSTART")) {
      const value = line.split(":").pop();
      startDate = parseIcalDay(value);
      return;
    }

    if (line.startsWith("DTEND")) {
      const value = line.split(":").pop();
      endDate = parseIcalDay(value);
      return;
    }

    if (line === "END:VEVENT" && startDate) {
      const endExclusive = endDate || addDaysUtc(startDate, 1);
      let cursor = new Date(startDate);
      while (cursor < endExclusive) {
        booked.add(dayKeyUtc(cursor));
        cursor = addDaysUtc(cursor, 1);
      }
    }
  });

  return booked;
}

function monthStatus(bookedDays, year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let occupiedCount = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(Date.UTC(year, monthIndex, day));
    if (bookedDays.has(dayKeyUtc(current))) {
      occupiedCount += 1;
    }
  }

  let status = { label: "Quelques dates", className: "warn" };
  if (occupiedCount === 0) {
    status = { label: "Disponible", className: "ok" };
  } else if (occupiedCount >= daysInMonth) {
    status = { label: "Complet", className: "no" };
  }

  const freeCount = daysInMonth - occupiedCount;
  const freePercent = Math.round((freeCount / daysInMonth) * 100);

  return {
    label: status.label,
    className: status.className,
    daysInMonth,
    occupiedCount,
    freeCount,
    freePercent
  };
}

function getBookedRangesForMonth(bookedDays, year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const ranges = [];
  let rangeStart = null;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const current = new Date(Date.UTC(year, monthIndex, day));
    const isBooked = bookedDays.has(dayKeyUtc(current));

    if (isBooked && rangeStart === null) {
      rangeStart = day;
    }

    if (!isBooked && rangeStart !== null) {
      ranges.push([rangeStart, day - 1]);
      rangeStart = null;
    }
  }

  if (rangeStart !== null) {
    ranges.push([rangeStart, daysInMonth]);
  }

  return ranges;
}

function formatRangesForMonth(ranges, year, monthIndex) {
  const shortFormatter = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit" });
  return ranges.map(([startDay, endDay]) => {
    const startDate = new Date(Date.UTC(year, monthIndex, startDay));
    const endDate = new Date(Date.UTC(year, monthIndex, endDay));
    if (startDay === endDay) {
      return shortFormatter.format(startDate);
    }
    return `${shortFormatter.format(startDate)} au ${shortFormatter.format(endDate)}`;
  });
}

function renderAvailabilityCards(bookedDays) {
  const cards = document.querySelector("#calendar-cards");
  if (!cards) {
    return;
  }

  const formatter = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let html = "";

  for (let i = 0; i < 12; i += 1) {
    const monthDate = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
    const monthYear = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const status = monthStatus(bookedDays, monthYear, monthIndex);
    const monthLabel = formatter.format(monthDate);
    const bookedRanges = getBookedRangesForMonth(bookedDays, monthYear, monthIndex);
    const formattedRanges = formatRangesForMonth(bookedRanges, monthYear, monthIndex);
    const detailsHtml = formattedRanges.length
      ? `<details class="calendar-details"><summary>Voir les dates occupees (${formattedRanges.length})</summary><ul>${formattedRanges.map((range) => `<li>${range}</li>`).join("")}</ul></details>`
      : `<p class="calendar-dates-empty">Aucune date occupee ce mois.</p>`;

    html += `
      <article class="calendar-card">
        <div class="calendar-top">
          <p class="calendar-month">${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}</p>
          <span class="badge ${status.className}">${status.label}</span>
        </div>
        <div class="calendar-meter" aria-hidden="true">
          <div class="calendar-fill" style="width:${status.freePercent}%"></div>
        </div>
        <p class="calendar-meta">${status.freeCount} jours libres / ${status.daysInMonth}</p>
        ${detailsHtml}
      </article>
    `;
  }

  cards.innerHTML = html;
}

async function fetchIcalText(icalUrl) {
  const candidates = [
    `https://r.jina.ai/http://${icalUrl.replace(/^https?:\/\//, "")}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(icalUrl)}`,
    icalUrl
  ];

  for (const url of candidates) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) {
        continue;
      }
      const text = await response.text();
      if (text.includes("BEGIN:VCALENDAR") && text.includes("END:VCALENDAR")) {
        return text.slice(text.indexOf("BEGIN:VCALENDAR"));
      }
    } catch (error) {
      // Continue with next fallback source.
    }
  }

  throw new Error("Impossible de charger le flux iCal.");
}

async function initAvailabilityCalendar() {
  const section = document.querySelector("#disponibilites");
  const statusEl = document.querySelector("#calendar-status");
  if (!section) {
    return;
  }

  const icalUrl = (section.getAttribute("data-ical-url") || "").trim();
  if (!icalUrl) {
    if (statusEl) {
      statusEl.textContent = "Lien iCal manquant. Renseignez data-ical-url pour activer l'agenda automatique.";
    }
    return;
  }

  if (statusEl) {
    statusEl.textContent = "Synchronisation du calendrier en cours...";
  }

  try {
    const icsText = await fetchIcalText(icalUrl);
    const bookedDays = collectBookedDays(icsText);
    renderAvailabilityCards(bookedDays);
    if (statusEl) {
      statusEl.textContent = "Disponibilités mises à jour automatiquement depuis le flux iCal.";
    }
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = "Impossible de charger l'agenda automatique pour le moment.";
    }
  }
}

initAvailabilityCalendar();

async function initContactForm() {
  const form = document.querySelector("#contact-form");
  const feedback = document.querySelector("#contact-feedback");
  const submitBtn = document.querySelector("#contact-submit");

  if (!form || !feedback || !submitBtn) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "Envoi en cours...";
    feedback.className = "contact-feedback";
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const endpoint = "https://formsubmit.co/ajax/thierry.boisselier974@gmail.com";
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Echec de l'envoi");
      }

      feedback.textContent = "Message envoye avec succes. Nous vous repondrons rapidement.";
      feedback.classList.add("ok");
      form.reset();
    } catch (error) {
      feedback.textContent = "Envoi impossible pour le moment. Vous pouvez nous contacter via WhatsApp.";
      feedback.classList.add("err");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

initContactForm();

