import ForecastChart from "./ForecastChart";

import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState("");

  const API_KEY = "9e46b955a0f706096ceb2a74c477d3db";

  const updateBodyBackground = (type) => {
    const body = document.body;
    body.className = "";
    body.classList.add(type.toLowerCase());
  };

  useEffect(() => {
    if (weather) {
      updateBodyBackground(weather.weather[0].main);
    }
  }, [weather]);

  const getLocalTime = (offset) => {
    const localDate = new Date(new Date().getTime() + offset * 1000);
    return localDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const speakWeather = () => {
    if (!weather) return;

    const synth = window.speechSynthesis;
    const description = weather.weather[0].description;
    const temp = Math.round(weather.main.temp);
    const humidity = weather.main.humidity;
    const wind = weather.wind.speed;

    const message = `The weather in ${weather.name} is ${description}. 
      The temperature is ${temp} degrees Celsius. 
      Humidity is ${humidity} percent, and wind speed is ${wind} meters per second.`;

    const utterance = new SpeechSynthesisUtterance(message);
    synth.speak(utterance);
  };

  const getWeatherByCity = () => {
    if (!city) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    )
      .then((res) => {
        if (!res.ok) throw new Error("City not found");
        return res.json();
      })
      .then((data) => {
        setWeather(data);
        setError("");

        fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
        )
          .then((res) => res.json())
          .then((data) => {
            const daily = data.list.filter((item) =>
              item.dt_txt.includes("12:00:00")
            );
            setForecast(daily);
          });
      })
      .catch((err) => {
        setWeather(null);
        setForecast([]);
        setError(err.message);
      });
  };

  const getWeatherByLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        )
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch location weather");
            return res.json();
          })
          .then((data) => {
            setWeather(data);
            setError("");
            setCity("");

            fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            )
              .then((res) => res.json())
              .then((data) => {
                const daily = data.list.filter((item) =>
                  item.dt_txt.includes("12:00:00")
                );
                setForecast(daily);
              });
          })
          .catch((err) => {
            setWeather(null);
            setForecast([]);
            setError(err.message);
          });
      },
      () => {
        setError("Permission denied or location unavailable");
      }
    );
  };

  return (
    <div className="app">
      <h1>🌤️ Weather App</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeatherByCity}>Search</button>
        <button onClick={getWeatherByLocation}>📍 Use Current Location</button>
      </div>

      <div className="weather-result">
        {error && <p style={{ color: "red" }}>{error}</p>}

        {weather && (
          <div className="weather-card">
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <p>🕒 Local Time: {getLocalTime(weather.timezone)}</p>
            <img
              src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
            <h3>{weather.main.temp}°C</h3>
            <p>{weather.weather[0].description}</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>🌬️ Wind: {weather.wind.speed} m/s</p>
            <button onClick={speakWeather}>🔊 Speak Weather</button>
          </div>
        )}
        {forecast.length > 0 && <ForecastChart forecast={forecast} />}

        {forecast.length > 0 && (
          <div className="forecast-container">
            <h3>5-Day Forecast</h3>
            <div className="forecast-cards">
              {forecast.map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>
                    {new Date(item.dt_txt).toLocaleDateString(undefined, {
                      weekday: "short",
                    })}
                  </p>
                  <img
                    src={`http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                    alt={item.weather[0].description}
                  />
                  <p>{Math.round(item.main.temp)}°C</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
