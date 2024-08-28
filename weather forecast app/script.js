const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardsDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const cityInput = document.querySelector(".city-input");

const API_KEY = "6e1105bf5413a798362635c600650424";

const  creatWeatherCard = (cityName, weatherItem , index)=>{
        if(index === 0){ // HTML for the main weather 

            return `<div class="current-weather">
                    <div class="details">
                        <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                        <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C<h4>
                        <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                    </div>
                    <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="">
                    <h4>${weatherItem.weather[0].description}</h4>
        </div>`;

        }else{  // HTML for other 5 days
            return ` <li class="card">
            <h3> (${weatherItem.dt_txt.split(" ")[0]})<h3>
            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt=""> 
            <h4>Temperature : ${(weatherItem.main.temp - 273.15).toFixed(2)}°C<h4>
            <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
            <h4>Humidity: ${weatherItem.main.humidity}%</h4>
       </li>`;
        }
    
}

getWeatherDetails = (cityName, lat, lon)=>{
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {

    // filtering the forecast to get only one forecast per day

        const uniqueForecastDays = [];

       const fiveDaysForecast = data.list.filter(forecast =>{
            const forecastDate = new Date(forecast.dt_txt).getDate();

            if(!uniqueForecastDays.includes(forecastDate)) {
              return  uniqueForecastDays.push(forecastDate);
            }
        });
        //clearing  previous weather data
        
        cityInput.value = "";
        weatherCardsDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";

        //creating weather cards and adding to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
                if(index === 0 ){
                    currentWeatherDiv.insertAdjacentHTML("beforeend", creatWeatherCard(cityName, weatherItem, index));
                }else {
                    weatherCardsDiv.insertAdjacentHTML("beforeend", creatWeatherCard(cityName, weatherItem, index));
                }
        });
    }).catch(() => {
        alert("An error occured while fetching the weather forecast");
    });
};

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();// get user enter city name and remove extra spaces
    if (!cityName) return; // Return if city name is empty
    

    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // get entered city coordinates (latitude, longitude, name) from the API response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        
        if(!data.length) return  alert(`no coordinates found for ${cityName}`);

        const { name, lat, lon } = data[0];
        getWeatherDetails(name, lat, lon);

    }).catch(() => {
        alert("An error occured by fetching the coordinates!");
    });
}
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(

        position => {
            const {latitude, longitude} = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //get city name from cordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
        
                const { name } = data[0];
                getWeatherDetails(name, latitude, longitude);
        
            }).catch(() => {
                alert("An error occured by fetching the city!");
            });

        },

        error => {
           if(error.code=== error.PERMISSION_DENIED){
            alert("Geolocation access deined.")
           }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
