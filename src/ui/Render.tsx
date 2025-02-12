import Parser from "rss-parser";
import weatherCodes from "../lib/weatherCodes";
import { renderToString } from "react-dom/server";
import React from "react";
import Main, { tasksData, weatherData, wotdData } from "./Main";

let rssParser = new Parser();
const removeMd = require("remove-markdown");

let lastTaskData: tasksData;
let lastWeatherData: weatherData;
let lastWotdData: wotdData;
async function getHtml() {
  const now = new Date()
  const UTCHours =  now.getUTCHours()
  let feedIndex = 0
  if(UTCHours == 5 || UTCHours == 6){
    feedIndex = 1
  }
  try {
    //Word of the day
    const feed = await rssParser.parseURL(
      "https://www.merriam-webster.com/wotd/feed/rss2"
    );
    const wotd = feed.items[feedIndex];
    const definition = removeMd(
      /is:.+?\n(.+?)\n/.exec(wotd.itunes.summary)![1]
    );
    const partOfSpeech = /\\ (.+?)  \n/.exec(wotd.itunes.summary)![1];
    const wotdData = { definition, part: partOfSpeech, word: wotd.title || "" };
    lastWotdData = wotdData;
  } catch (e) {
    console.error(e);
  }
  try {
    //weather
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${process.env.LAT}&longitude=${process.env.LONG}&current=temperature_2m,apparent_temperature&daily=precipitation_probability_max,weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FDenver&forecast_days=1`;
    const response = await fetch(url);
    const weatherJSON: any = await response.json();

    const weatherData = {
      minTemp: Math.round(weatherJSON.daily.temperature_2m_min[0]),
      maxTemp: Math.round(weatherJSON.daily.temperature_2m_max[0]),
      weatherCodes: weatherCodes[weatherJSON.daily.weather_code[0]],
      temp: Math.round(weatherJSON.current.temperature_2m),
      precipitation: Math.round(
        weatherJSON.daily.precipitation_probability_max[0]
      ),
    };
    lastWeatherData = weatherData;
  } catch (e) {
    console.error(e);
  }

  try {
    //todoist
    const taskResponse = await fetch("https://api.todoist.com/rest/v2/tasks?filter=today | overdue | no date", {
      headers: { Authorization: `Bearer ${process.env.TODOIST_API_KEY}` },
    });
    const taskData: any = (await taskResponse.text());
    try {
      lastTaskData = JSON.parse(taskData) || [];
    } catch (e) {
      console.error(JSON.stringify({taskData: taskData}));
      console.error(e);
    }
  } catch (e) {
    console.error(e);
  }

  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Emoji:wght@300..700&family=Roboto+Serif:ital,opsz,wdth,wght,GRAD@0,8..144,50..150,100..900,-50..100;1,8..144,50..150,100..900,-50..100&family=Roboto:ital,wdth,wght@0,75..100,100..900;1,75..100,100..900&display=swap" rel="stylesheet">
<script src="https://unpkg.com/@tailwindcss/browser@4"></script>
<style>* {
  font-family: "Roboto", serif;
  font-optical-sizing: auto;
}
  .noto {
  font-family: "Noto Emoji", serif;
  font-optical-sizing: auto;
}</style>${renderToString(
    <Main wotd={lastWotdData} weather={lastWeatherData} tasks={lastTaskData} />
  )}`;
}
export default getHtml;
