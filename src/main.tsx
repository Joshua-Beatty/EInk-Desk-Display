import React from "react";
import { renderToString } from "react-dom/server";
let data: {wotd: {word: string, definition: string, part: string}}
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
          <div className="text-2xl font-bold">{data.wotd.word} <span className="text-base font-semibold italic">{data.wotd.part}</span></div>
          <div className="text-md font-semibold">
            <div>{data.wotd.definition}</div>
          </div>
        </div>
      </div>
      <div className="w-full h-full border-4 p-2 rounded-2xl border-neutral-400"></div>
    </div>
  );
}
import Parser from "rss-parser"
let parser = new Parser();
const removeMd = require('remove-markdown');

async function getHtml() {
    data = {} as any

    const feed = await parser.parseURL("https://www.merriam-webster.com/wotd/feed/rss2")
    const wotd = feed.items[0]
    const definition = removeMd(/is:.+?\n(.+?)\n/.exec(wotd.itunes.summary)![1])
    const partOfSpeech = /\\ (.+?)  \n/.exec(wotd.itunes.summary)![1]
    data.wotd = {definition, part: partOfSpeech, word: wotd.title || ""}

  return `<script src="https://unpkg.com/@tailwindcss/browser@4"></script>${renderToString(
    <Index />
  )}`;
}
export default getHtml;
