const apiKey = "58d1f06f5a82b2d8b76936dac7e96291"; // Your OpenWeather API key
const searchButton = document.getElementById("searchButton");
const cityInput = document.getElementById("cityInput");
const weatherContainer = document.getElementById("weatherContainer");
const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const conditions = document.getElementById("conditions");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const weatherIcon = document.getElementById("weatherIcon");
const forecastContainer = document.getElementById("forecastContainer");
const recentCities = document.getElementById("recentCities");

// Array to store recent searches
let recentSearches = [];

async function fetchWeather(city) {
    try {
        // Fetch current weather data for the city
        const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        const weatherData = await weatherResponse.json();

        if (weatherResponse.ok) {
            displayCurrentWeather(weatherData);
            cityInput.value = ""; // Clear the input field after search

            // Fetch 5-day forecast data
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
            );
            const forecastData = await forecastResponse.json();

            if (forecastResponse.ok) {
                displayForecast(forecastData);
                updateRecentCities(city); // Update recent cities list
            } else {
                console.error(forecastData.message);
            }
        } else {
            alert("City not found! Please check the city name and try again.");
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function displayCurrentWeather(data) {
    weatherContainer.classList.remove("hidden");
    cityName.textContent = data.name;
    temperature.textContent = `${data.main.temp}°C`;
    conditions.textContent = data.weather[0].description;
    humidity.textContent = `Humidity: ${data.main.humidity}%`;
    wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
}

function displayForecast(data) {
    forecastContainer.classList.remove("hidden");
    forecastContainer.innerHTML = ""; // Clear previous forecast cards

    const dailyForecast = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
    );

    dailyForecast.forEach((item) => {
        const card = document.createElement("div");
        card.className = "p-4 bg-blue-100 rounded-lg shadow-md text-center";

        card.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png" alt="Weather Icon" class="w-12 h-12 mx-auto mb-2">
            <p class="text-lg font-bold text-blue-600">${Math.round(item.main.temp)}°C</p>
            <p class="text-gray-500">${item.weather[0].description}</p>
            <p class="text-sm text-gray-400">${new Date(item.dt_txt).toLocaleDateString()}</p>
        `;

        forecastContainer.appendChild(card);
    });
}

function updateRecentCities(city) {
    // Avoid duplicates in recent searches
    if (!recentSearches.includes(city)) {
        recentSearches.unshift(city); // Add to the top
        if (recentSearches.length > 5) recentSearches.pop(); // Limit to 5 cities

        renderRecentCities(); // Update recent cities dropdown
    }
}

function renderRecentCities() {
    recentCities.innerHTML = `<option disabled selected>Select a recent city</option>`;
    recentSearches.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        recentCities.appendChild(option);
    });
}

// Handle recent city selection
recentCities.addEventListener("change", () => {
    const selectedCity = recentCities.value;
    cityInput.value = selectedCity; // Set the input value to the selected city
    fetchWeather(selectedCity);
});

// Handle search button click
searchButton.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
    } else {
        alert("Please enter a city name!");
    }
});

// Ensure city input remains visible and functional
cityInput.addEventListener("input", () => {
    // Ensure the search bar is never hidden or reset incorrectly
    weatherContainer.classList.add("hidden");
    forecastContainer.classList.add("hidden");
});

// Fix for ensuring the input stays visible while typing
window.addEventListener('focus', () => {
    cityInput.style.visibility = 'visible'; // Ensure the input field is visible when focused
});

