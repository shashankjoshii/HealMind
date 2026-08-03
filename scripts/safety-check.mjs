// Verifies the crisis matcher against phrasings it must catch, and phrasings
// it must not derail on. Run: node safety-check.mjs
import { readFileSync } from "node:fs";

const src = readFileSync("C:/HealthMe/src/lib/safety.ts", "utf8");
const block = src.match(/const CRISIS_PATTERNS[\s\S]*?\n\];/)[0];
const patterns = [...block.matchAll(/^\s*(\/.*\/i),\s*$/gm)].map(([, lit]) => {
  const end = lit.lastIndexOf("/");
  return new RegExp(lit.slice(1, end), lit.slice(end + 1));
});

const detect = (t) => patterns.some((re) => re.test(t));

const MUST_FLAG = [
  "I want to kill myself",
  "i think about killing myself every day",
  "I don't want to be here anymore",
  "everyone would be better off without me",
  "I've been cutting myself again",
  "there's no point living",
  "I want to die",
  "thinking about suicide",
  "I might overdose tonight",
  "I want to end it all",
  "I don't want to wake up",
  "I've been hurting myself",
  "I want to take my own life",
  "sometimes I feel suicidal",
];

const MUST_NOT_FLAG = [
  "I miss them so much it hurts",
  "I can't sleep and I feel awful",
  "I feel like I wasted three years",
  "this breakup is destroying me",
  "I cried at work again today",
  "I feel numb and empty",
  "I hate myself for staying so long",
  "my heart is broken",
];

let fails = 0;

console.log("MUST FLAG (missing one of these is the dangerous failure):");
for (const t of MUST_FLAG) {
  const hit = detect(t);
  if (!hit) fails++;
  console.log(`  ${hit ? "PASS" : "*** MISS ***"}  "${t}"`);
}

console.log("\nMUST NOT FLAG (false positives are tolerable but noisy):");
for (const t of MUST_NOT_FLAG) {
  const hit = detect(t);
  if (hit) fails++;
  console.log(`  ${hit ? "*** FALSE POSITIVE ***" : "PASS"}  "${t}"`);
}

console.log(`\n${patterns.length} patterns loaded. ${fails} failure(s).`);
process.exit(fails ? 1 : 0);
