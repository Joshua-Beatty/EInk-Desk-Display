import React from "react";
import { twj } from "tw-to-css";
import { renderToString } from "react-dom/server";
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
      <div className="gap-2 flex flex-row h-1/3">
        <div className="w-2/5 h-full border-4 p-2 rounded-2xl border-neutral-400">
          <div className="text-5xl font-bold text-neutral-700">{day}</div>
          <div className="text-6xl font-bold">{time}</div>
        </div>
        <div className="w-3/5 h-full border-4 p-2 rounded-2xl border-neutral-400">
          <div className="text-4xl font-bold">presage</div>
          <div className="text-xl font-semibold">
            <div>noun: a sign of something about to happen</div>
            <div>verb: indicate, as with a sign or an omen</div>
          </div>
        </div>
      </div>
      <div className="w-full h-2/3 border-4 p-2 rounded-2xl border-neutral-400"></div>
    </div>
  );
}

async function getHtml() {
  return (
    (await `<script src="https://unpkg.com/@tailwindcss/browser@4"></script>`) +
    renderToString(<Index />)
  );
}
export default getHtml;
