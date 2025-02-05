import React from "react";
import Card from "./Card";

type data = {
  wotd: { word: string; definition: string; part: string };
  weather: {
    minTemp: number;
    maxTemp: number;
    weatherCodes: { text: string; img: string };
    temp: number;
    precipitation: number;
  };
  tasks: any[];
};
type wotdData = data["wotd"]
type weatherData = data["weather"]
type tasksData = data["tasks"]
function Main(data: data) {
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
    <div className="bg-white w-screen h-screen p-0 gap-2 flex flex-row antialiased">
      <div className="gap-2 flex flex-col w-[40%] justify-center items-center">
        <Card className="justify-center items-center">
          <div className="text-5xl font-bold text-neutral-700">{day}</div>
          <div className="text-6xl font-bold">{time}</div>
        </Card>
        <Card className="items-center h-full">
          <div className="font-semibold text-4xl flex flex-col items-center pt-4">
            <h1>
              {data.weather.weatherCodes.text} {data.weather.temp}°F
            </h1>
            <div>
              <span className="text-lg pl-4">
                {data.weather.maxTemp}°/{data.weather.minTemp}°{" "}
                {data.weather.precipitation}%
              </span>
            </div>
          </div>
          <img
            src={data.weather.weatherCodes.img}
            className="w-70 h-70 -mt-10 -mb-30"
          />
        </Card>
      </div>
      <div className="w-[60%] h-full flex flex-col gap-2">
        <Card className="min-h-[35%]">
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
        </Card>
        <Card className="h-full">
          <div className="text-4xl font-bold pb-2">Tasks</div>
          <div className="text-2xl">
            <ul>
              {data.tasks.map((x) => (
                <li key={x.id}>
                  <div className="flex flex-row justify-start items-center gap-2">
                    <div className="w-2.5 h-2.5 border-black border-1" />
                    {x.content}
                    {x.due ? ` - ${x.due.string}` : ""}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default Main;
export type { data, weatherData, tasksData, wotdData };
