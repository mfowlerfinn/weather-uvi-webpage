let weather;
let uvi;
let sum;
let lat = 0;
let lng = 0;
let latD = 38.603174;
let lngD = -90.253981;
const ID_openweather = "9bde3a8b4a80eadc72e0300a4aa07691";
const ID_openuvi = "8e4383ca593b4e109f3d637574540c73";

const list = document.querySelector("ul");
const loc = document.querySelector(".location");

function getLocation() {
  function getUrlVars() {
    let vars = {};
    let parts = window.location.href.replace(
      /[?&]+([^=&]+)=([^&]*)/gi,
      function(m, key, value) {
        vars[key] = value;
      }
    );
    return vars;
  }

  function getUrlParam(parameter, defaultvalue) {
    let urlparameter = defaultvalue;
    if (window.location.href.indexOf(parameter) > -1) {
      urlparameter = getUrlVars()[parameter];
    }
    return urlparameter;
  }

  const latArg = getUrlParam("lat", null);
  const lonArg = getUrlParam("lon", null);

  if (latArg === null || lonArg === null) {
    alert('Please set location... now using default');
    lat = latD;
    lng = lngD;
  } else {
    lat = latArg;
    lng = lonArg;
  }
  loc.innerHTML = `
    <div class="coord-container">
        <div class="coord">lat:${lat}</div>
        <div class="coord">lon:${lng}</div>
    </div>
    `;
  getData();
}

function setLocation() {
  document.getElementById("lat").value = latD;
  document.getElementById("lon").value = lngD;
  document.getElementById("locForm").submit();
}

function getData() {
  list.innerHTML = `Fetching data...`;
  getWeather();

  function getWeather() {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&APPID=${ID_openweather}&units=imperial`
    )
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        weather = jsonCopy(myJson);
        // console.log(weather);
      })
      .then(() => getUVI());
  }

  function getUVI() {
    fetch(`https://api.openuv.io/api/v1/uv?lat=${lat}&lng=${lng}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "x-access-token": `${ID_openuvi}`
      }
    })
      .then(function(response) {
        return response.json();
      })
      .then(function(myJson) {
        uvi = jsonCopy(myJson);
        // console.log(uvi);
      })
      .then(() => updatePage());
    }
}

function jsonCopy(src) {
  return JSON.parse(JSON.stringify(src));
}

function updatePage() {
  var solarNoon = new Date(uvi.result.sun_info.sun_times.solarNoon);
  loc.innerHTML = `
        <div class="loc-name">${weather.name}</div>
        <div class="coord-container">
            <div class="coord">lat:${lat}</div>
            <div class="coord">lon:${lng}</div>
        </div>
        `;
  list.innerHTML = `
        <li>Temp now: <div class="value">${weather.main.temp}F</div></li>
        <li>RH now: ${weather.main.humidity}%</li>
        <li>Current UVI: ${uvi.result.uv}</li>
        <li>Max UVI today: ${uvi.result.uv_max}</li>
        <li>Solar Noon: ${solarNoon}</li>
        `;

  // Object.keys(uvi).forEach(function(item) {
  //   console.log(item); // key
  //   console.log(uvi[item]); // value
  // });
  setColor();
}

function setColor() {
  let current = uvi.result.uv;
  let max = uvi.result.uv_max;
  let topHue, topLight, botHue, botLight, textColor;
  const map = (value, x1, y1, x2, y2) =>
    Math.floor(((value - x1) * (y2 - x2)) / (y1 - x1) + x2);
  const uvMax = 11;
  const uvMin = 0;
  const twilight = 0.1;

  if (current > twilight) {
    topLight = 50;
    topHue = map(current, uvMin, uvMax, 100, 0);
    botHue = map(max, uvMin, uvMax, 100, 0);
    botLight = 60;
  } else {
    topHue = map(current, uvMin, twilight, 238, 180);
    topLight = map(current, uvMin, twilight, 10, 50);
    botHue = map(current, uvMin, twilight, 220, 180);
    botLight = map(current, uvMin, twilight, 30, 60);
  }
  topLight < 40 ? (textColor = "white") : (textColor = "black");
  document.documentElement.style.setProperty("--color-text", textColor);
  document.documentElement.style.setProperty("--color-top-h", topHue);
  document.documentElement.style.setProperty("--color-top-l", `${topLight}%`);
  document.documentElement.style.setProperty("--color-bot-h", botHue);
  document.documentElement.style.setProperty("--color-bot-l", `${botLight}%`);
}

getLocation();
