// Himanshu Yadav — portfolio interactions
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  menuToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  navLinks?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Skills map to the actual project cards. HTML/CSS are mapped to the two web projects.
  const skillProjectMap = {
    // No C or C++ project is listed in the supplied portfolio, so those skills
    // correctly show "Project not found" until a relevant project is added.
    "HTML": ["project-quiz", "project-reading"],
    "CSS": ["project-quiz", "project-reading"]
  };
  const feedback = document.getElementById("skillFeedback");
  const notFoundPanel = document.getElementById("notFoundPanel");
  const notFoundText = document.getElementById("notFoundText");

  document.querySelectorAll(".skill-card").forEach((button) => {
    button.addEventListener("click", () => {
      const skill = button.dataset.skill;
      const projects = (skillProjectMap[skill] || [])
        .map((id) => document.getElementById(id)).filter(Boolean);
      if (projects.length) {
        notFoundPanel.hidden = true;
        feedback.textContent = `${skill}: ${projects.length} related project${projects.length === 1 ? "" : "s"} found.`;
        projects[0].scrollIntoView({ behavior: "smooth", block: "center" });
        projects.forEach((project) => {
          project.classList.remove("project-highlight");
          void project.offsetWidth;
          project.classList.add("project-highlight");
        });
      } else {
        feedback.textContent = "";
        notFoundText.textContent = `No project is currently linked to “${skill}”.`;
        notFoundPanel.hidden = false;
        document.getElementById("projects").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
  document.getElementById("closeNotFound")?.addEventListener("click", () => { notFoundPanel.hidden = true; });

  // City lookup + current weather from Open-Meteo; no secret API key is needed.
  const weatherForm = document.getElementById("weatherForm");
  const cityInput = document.getElementById("cityInput");
  const weatherResult = document.getElementById("weatherResult");
  const weatherPlace = document.getElementById("weatherPlace");
  const weatherSummary = document.getElementById("weatherSummary");
  const weatherTemp = document.getElementById("weatherTemp");
  const weatherFeels = document.getElementById("weatherFeels");
  const weatherWind = document.getElementById("weatherWind");
  const weatherHumidity = document.getElementById("weatherHumidity");
  const weatherIcon = document.getElementById("weatherIcon");

  const descriptions = {
    0: ["Clear sky", "☀"], 1: ["Mainly clear", "🌤"], 2: ["Partly cloudy", "⛅"], 3: ["Overcast", "☁"],
    45: ["Fog", "🌫"], 48: ["Rime fog", "🌫"], 51: ["Light drizzle", "🌦"], 53: ["Drizzle", "🌦"],
    55: ["Dense drizzle", "🌧"], 56: ["Freezing drizzle", "🌧"], 57: ["Freezing drizzle", "🌧"],
    61: ["Light rain", "🌦"], 63: ["Rain", "🌧"], 65: ["Heavy rain", "🌧"], 66: ["Freezing rain", "🌧"],
    67: ["Heavy freezing rain", "🌧"], 71: ["Light snow", "🌨"], 73: ["Snow", "🌨"], 75: ["Heavy snow", "❄"],
    77: ["Snow grains", "🌨"], 80: ["Rain showers", "🌦"], 81: ["Rain showers", "🌧"], 82: ["Heavy showers", "⛈"],
    85: ["Snow showers", "🌨"], 86: ["Heavy snow showers", "❄"], 95: ["Thunderstorm", "⛈"],
    96: ["Thunderstorm with hail", "⛈"], 99: ["Thunderstorm with hail", "⛈"]
  };

  async function getWeather(city) {
    const requestedCity = city.trim();
    if (!requestedCity) { weatherResult.textContent = "Please enter a city."; return; }
    weatherResult.textContent = "Finding city and loading current weather…";
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(requestedCity)}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);
      if (!geoResponse.ok) throw new Error("City lookup failed.");
      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];
      if (!place) { weatherResult.textContent = "City not found. Check the spelling and try again."; return; }

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
      const weatherResponse = await fetch(weatherUrl);
      if (!weatherResponse.ok) throw new Error("Weather lookup failed.");
      const weatherData = await weatherResponse.json();
      const current = weatherData.current;
      const [description, icon] = descriptions[current.weather_code] || ["Current conditions", "🌡"];

      weatherPlace.textContent = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
      weatherSummary.textContent = description;
      weatherTemp.textContent = `${Math.round(current.temperature_2m)}°C`;
      weatherFeels.textContent = `${Math.round(current.apparent_temperature)}°C`;
      weatherWind.textContent = `${Math.round(current.wind_speed_10m)} km/h`;
      weatherHumidity.textContent = `${current.relative_humidity_2m}%`;
      weatherIcon.textContent = icon;
      weatherResult.textContent = `Updated ${new Date(current.time).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}. Weather data by Open-Meteo.`;
    } catch (error) {
      weatherResult.textContent = "Unable to fetch weather right now. Check your internet connection and try again.";
      console.error(error);
    }
  }
  weatherForm?.addEventListener("submit", (event) => { event.preventDefault(); getWeather(cityInput.value); });
  document.getElementById("jaipurButton")?.addEventListener("click", () => { cityInput.value = "Jaipur"; getWeather("Jaipur"); });

  // Local portfolio FAQ assistant. It is not a generative AI/API connection.
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const chatStatus = document.getElementById("chatStatus");

  function addMessage(text, type) {
    const item = document.createElement("div");
    item.className = `message ${type}-message`;
    item.textContent = text;
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  function answerQuestion(question) {
    const q = question.toLowerCase();
    if (/(project|work|built|repository|github)/.test(q)) {
      return "Three projects are listed: Python Program Collection (GitHub), Code with AI Quiz, and Book Reading List Application. Open a project card to visit its repository or live website.";
    }
    if (/(skill|technology|html|css|c\\+\\+|\\bc\\b|programming)/.test(q)) {
      return "The listed skills are C, C++, HTML and CSS. HTML and CSS are linked to the listed web projects. C and C++ currently have no matching project in this portfolio, so selecting either shows “Project not found”.";
    }
    if (/(contact|email|reach|github)/.test(q)) {
      return "You can contact Himanshu at hy171745@gmail.com or visit the GitHub profile at github.com/hy171745-byte.";
    }
    if (/(weather|temperature|rain|wind)/.test(q)) {
      return "Use the Weather section to enter a city name, then press Get weather. You can also use the Jaipur shortcut.";
    }
    if (/(about|who are you|himanshu|student|education)/.test(q)) {
      return "Himanshu Yadav is a B.Tech Computer Science Engineering student interested in software development, web technologies and problem-solving.";
    }
    if (/(hello|hi|hey)/.test(q)) return "Hi! Ask me about the listed projects, skills, weather tool or contact details.";
    return "I can help with questions about the portfolio, projects, skills, weather and contact details. Try “What projects are available?”";
  }
  chatForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = userInput.value.trim();
    if (!question) return;
    addMessage(question, "user");
    userInput.value = "";
    addMessage(answerQuestion(question), "assistant");
    chatStatus.textContent = "Answered by the local portfolio demo.";
  });
  document.querySelectorAll("[data-prompt]").forEach((button) => button.addEventListener("click", () => {
    userInput.value = button.dataset.prompt;
    userInput.focus();
  }));
});
