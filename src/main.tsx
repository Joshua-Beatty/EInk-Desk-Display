import React from "react";
import { renderToString } from "react-dom/server";
let data: {
  wotd: { word: string; definition: string; part: string };
  weather: {
    minTemp: number;
    maxTemp: number;
    weatherCodes: { text: string; img: string };
    temp: number;
  };
};
function Index() {
  const currDate = new Date();
  const dateOptions = { month: "long", day: "numeric" } as const;
  const timeOptions = {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  } as const;

  let day = currDate.toLocaleString("en-US", dateOptions);
  let time = currDate.toLocaleString("en-US", timeOptions);
  return (
    <div className="bg-white w-screen h-screen p-2 gap-2 flex flex-col antialiased">
      <div className="gap-2 flex flex-row h-[45%]">
        <div className="w-2/5 h-full border-4 p-2 rounded-2xl border-neutral-400">
          <div className="text-5xl font-bold text-neutral-700">{day}</div>
          <div className="text-6xl font-bold">{time}</div>
        </div>
        <div className="w-3/5 h-full border-4 p-2 rounded-2xl border-neutral-400">
          <div className="text-2xl font-bold">
            {data.wotd.word}{" "}
            <span className="text-base font-semibold italic">
              {data.wotd.part}
            </span>
          </div>
          <div className="text-md font-semibold">
            <div>{data.wotd.definition}</div>
          </div>
        </div>
      </div>
      <div className="w-full h-full flex flex-row gap-2">
        <div className="border-neutral-400 border-4 rounded-2xl p-2">
          <div className="font-semibold text-4xl">
            <h1>{data.weather.weatherCodes.text}</h1>
            <div>
              {data.weather.temp}°F
              <span className="text-lg pl-4">
                {data.weather.maxTemp}°F/{data.weather.minTemp}°F
              </span>
            </div>
          </div>
          <img src={data.weather.weatherCodes.img} className="w-70 h-70 -mt-10 -mb-30" />
        </div>
        <div className="border-neutral-400 border-4 rounded-2xl w-full p-2">

        </div>
      </div>
    </div>
  );
}
import Parser from "rss-parser";
let parser = new Parser();
const removeMd = require("remove-markdown");
import fetch from "node-fetch";
import weatherCodes from "./lib/weatherCodes";

async function getHtml() {
  data = {} as any;

  //Word of the day
  const feed = await parser.parseURL(
    "https://www.merriam-webster.com/wotd/feed/rss2"
  );
  const wotd = feed.items[0];
  const definition = removeMd(/is:.+?\n(.+?)\n/.exec(wotd.itunes.summary)![1]);
  const partOfSpeech = /\\ (.+?)  \n/.exec(wotd.itunes.summary)![1];
  data.wotd = { definition, part: partOfSpeech, word: wotd.title || "" };

  //weather
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=40.56&longitude=-112&current=temperature_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,rain_sum,showers_sum,snowfall_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FDenver&forecast_days=1"
  );
  const weatherData: any = await response.json();

  data.weather = {
    minTemp: Math.round(weatherData.daily.temperature_2m_min[0]),
    maxTemp: Math.round(weatherData.daily.temperature_2m_max[0]),
    weatherCodes: weatherCodes[weatherData.daily.weather_code[0]],
    temp: Math.round(weatherData.current.temperature_2m),
  };
  console.log(data.weather);

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
}</style>${renderToString(<Index />)}`;
}
export default getHtml;
