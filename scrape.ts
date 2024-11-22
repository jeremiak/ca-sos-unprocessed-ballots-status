import _ from "npm:lodash@4.17";
import * as d3 from "npm:d3-dsv@latest";
import { parse } from "https://deno.land/std@0.182.0/flags/mod.ts";
import {
  DOMParser,
  Element,
  HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";


const data = []
console.log(`Fetching`);
const url = `https://electionresults.sos.ca.gov/unprocessed-ballots-status`
const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
  }
})
const status: number = response.status;
console.log(`Returned ${status}`)
const html = await response.text();
const document: HTMLDocument | null = new DOMParser().parseFromString(
  html,
  "text/html",
);
const table = document.querySelectorAll('table')[1]
const rows = table.querySelectorAll('tbody tr')
rows.forEach((n, i) => {
  const node = n as Element;
  const cells = node.querySelectorAll("td");
  const county = cells[0] as Element;
  const cumulativeTotalOfProcessedBallots = cells[1] as Element;
  const estimatedTotalBallotsRemaining = cells[9] as Element;

  if (county.innerText.includes("STATEWIDE")) return

  const d = {
    County: county.innerText.trim(),
    'Cumulative Total of Processed Ballots': +cumulativeTotalOfProcessedBallots.innerText.replaceAll(',', ''),
    'Estimated Total Ballots Remaining': +estimatedTotalBallotsRemaining.innerText.replaceAll(',', '')
  }
  data.push(d)
})

console.log(`Saving`);
const filePath = `./unprocessed-ballots-status.csv`;
const text = d3.csvFormat(data);
await Deno.writeTextFile(filePath, text);
console.log(`All done`);
