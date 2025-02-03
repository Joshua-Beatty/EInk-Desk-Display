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
  tasks: any[];
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
    <div className="bg-white w-screen h-screen p-2 gap-2 flex flex-row antialiased">
      <div className="gap-2 flex flex-col w-[40%] justify-center items-center">
        <div className="w-full border-4 p-2 rounded-2xl border-neutral-400   flex flex-col justify-center items-center">
          <div className="text-5xl font-bold text-neutral-700">{day}</div>
          <div className="text-6xl font-bold">{time}</div>
        </div>
        <div className="border-neutral-400 border-4 w-full rounded-2xl p-2 h-full flex flex-col items-center">
          <div className="font-semibold text-4xl flex flex-col items-center pt-4">
            <h1>{data.weather.weatherCodes.text}</h1>
            <div>
              {data.weather.temp}°F
              <span className="text-lg pl-4">
                {data.weather.maxTemp}°F/{data.weather.minTemp}°F
              </span>
            </div>
          </div>
          <img
            src={data.weather.weatherCodes.img}
            className="w-70 h-70 -mt-10 -mb-30"
          />
        </div>
      </div>
      <div className="w-[60%] h-full flex flex-col gap-2">
        <div className="w-full border-4 p-3 rounded-2xl border-neutral-400 min-h-[10rem]">
          <div className="text-3xl font-bold pb-2">
            {data.wotd.word}{" "}
            <span className="text-lg font-semibold italic">
              {data.wotd.part}
            </span>
          </div>
          <hr className="" />
          <div className="text-lg font-semibold pt-2">
            <div>{data.wotd.definition}</div>
          </div>
        </div>
        <div className="border-neutral-400 border-4 rounded-2xl w-full h-full p-3">
          <div className="text-4xl font-bold pb-2">Tasks</div>
          <div className="text-2xl">
            <ul>
              {data.tasks.map((x) => (
                <li key={x.id}>
                  <div className="flex flex-row justify-start items-center gap-2">
                    <div className="w-2.5 h-2.5 border-black border-1" />
                    {x.content}{x.due ? ` - ${x.due.string}`: ""}
                  </div>
                </li>
              ))}
            </ul>
          </div>
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
    `https://api.open-meteo.com/v1/forecast?latitude=${process.env.LAT}&longitude=${process.env.LONG}&current=temperature_2m,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,rain_sum,showers_sum,snowfall_sum&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FDenver&forecast_days=1`
  );
  const weatherData: any = await response.json();

  //todoist
  const taskResponse = await fetch("https://api.todoist.com/rest/v2/tasks", {
    headers: { Authorization: `Bearer ${process.env.TODOIST_API_KEY}` },
  });
  const taskData: any = (await taskResponse.json()) || [];
  console.log(taskData);
  data.tasks = taskData;

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
