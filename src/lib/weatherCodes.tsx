
const rain = "https://openmoji.org/data/black/svg/1F327.svg"
const fog = "https://openmoji.org/data/black/svg/1F32B.svg"
const snow = "https://openmoji.org/data/black/svg/1F328.svg"
const rainThunder = "https://openmoji.org/data/black/svg/26C8.svg"

const weatherCodes = {
  "0": {
    text: "Sunny",
    img: "https://openmoji.org/data/black/svg/2600.svg",
  },
  "1": {
    text: "Mainly Sunny",
    img: "https://openmoji.org/data/black/svg/1F324.svg",
  },
  "2": {
    text: "Partly Cloudy",
    img: "https://openmoji.org/data/black/svg/26C5.svg",
  },
  "3": {
    text: "Cloudy",
    img: "https://openmoji.org/data/black/svg/2601.svg",
  },
  "45": {
    text: "Foggy",
    img: fog,
  },
  "48": {
    text: "Rime Fog",
    img: fog,
  },
  "51": {
    text: "Light Drizzle",
    img: rain,
  },
  "53": {
    text: "Drizzle",
    img: rain,
  },
  "55": {
    text: "Heavy Drizzle",
    img: rain,
  },
  "56": {
    text: "Light Freezing Drizzle",
    img: rain,
  },
  "57": {
    text: "Freezing Drizzle",
    img: rain,
  },
  "61": {
    text: "Light Rain",
    img: rain,
  },
  "63": {
    text: "Rain",
    img: rain,
  },
  "65": {
    text: "Heavy Rain",
    img: rain,
  },
  "66": {
    text: "Light Freezing Rain",
    img: rain,
  },
  "67": {
    text: "Freezing Rain",
    img: rain,
  },
  "71": {
    text: "Light Snow",
    img: snow,
  },
  "73": {
    text: "Snow",
    img: snow,
  },
  "75": {
    text: "Heavy Snow",
    img: snow,
  },
  "77": {
    text: "Snow Grains",
    img: snow,
  },
  "80": {
    text: "Light Showers",
    img: rain,
  },
  "81": {
    text: "Showers",
    img: rain,
  },
  "82": {
    text: "Heavy Showers",
    img: rain,
  },
  "85": {
    text: "Light Snow Showers",
    img: snow,
  },
  "86": {
    text: "Snow Showers",
    img: snow,
  },
  "95": {
    text: "Thunderstorm",
    img: "https://openmoji.org/data/black/svg/1F329.svg",
  },
  "96": {
    text: "Light Thunderstorms With Hail",
    img: rainThunder,
  },
  "99": {
    text: "Thunderstorm With Hail",
    img: rainThunder,
  },
};

export default weatherCodes;
