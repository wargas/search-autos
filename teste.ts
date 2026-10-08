import { elastic } from "./lib/elastic";

await elastic.index({ index: "teste", body: {} })