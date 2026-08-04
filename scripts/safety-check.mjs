/**
 * Verifies the crisis matcher against phrasings it must catch (per category),
 * and ordinary distress it must not derail on.
 *
 * Run: npm run test:safety
 *
 * This parses the regex literals straight out of safety.ts so the test can't
 * silently drift from the implementation.
 */
import { readFileSync } from "node:fs";

const src = readFileSync(
  new URL("../src/lib/safety.ts", import.meta.url),
  "utf8",
);

// Pull each { category: "x", patterns: [ ... ] } block out of RULES.
const rulesBlock = src.match(/const RULES: CrisisRule\[\] = \[([\s\S]*?)\n\];/)[1];
const rules = [...rulesBlock.matchAll(
  /category:\s*"([^"]+)",\s*patterns:\s*\[([\s\S]*?)\],\s*\n\s*\}/g,
)].map(([, category, body]) => ({
  category,
  patterns: [...body.matchAll(/(\/(?:[^/\\\n]|\\.)+\/i)/g)].map(([, lit]) => {
    const end = lit.lastIndexOf("/");
    return new RegExp(lit.slice(1, end), lit.slice(end + 1));
  }),
}));

function detect(text) {
  for (const rule of rules) {
    if (rule.patterns.some((re) => re.test(text))) return rule.category;
  }
  return null;
}

/** [input, expected category] */
const MUST_FLAG = [
  ["I want to kill myself", "suicide"],
  ["i think about killing myself every day", "suicide"],
  ["I don't want to be here anymore", "suicide"],
  ["everyone would be better off without me", "suicide"],
  ["there's no point living", "suicide"],
  ["I want to die", "suicide"],
  ["thinking about suicide", "suicide"],
  ["I want to end it all", "suicide"],
  ["I don't want to wake up", "suicide"],
  ["I want to take my own life", "suicide"],
  ["sometimes I feel suicidal", "suicide"],
  ["I won't be around much longer", "suicide"],
  ["I've been cutting myself again", "selfharm"],
  ["I've been hurting myself", "selfharm"],
  ["I self harm when it gets bad", "selfharm"],
  ["I want to hurt them", "harm-others"],
  ["I make myself sick after eating", "eating"],
  ["I haven't eaten in three days", "eating"],
  ["I stopped eating last week", "eating"],
  ["I've been starving myself", "eating"],
  ["my boyfriend hits me", "abuse"],
  ["I'm afraid to go home", "abuse"],
  ["he threatened to kill me", "abuse"],
  ["I might overdose tonight", "substance"],
  ["I took too many pills", "substance"],
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
  "work is burning me out",
  "I'm so anxious about the presentation",
  "I skipped lunch because I was busy",
  "I'm exhausted and everything is heavy",
  "my manager is making me miserable",
  "I had a panic attack on the train",
];

let fails = 0;

console.log("MUST FLAG (a miss here is the dangerous failure):");
for (const [text, expected] of MUST_FLAG) {
  const got = detect(text);
  // A match in the wrong category still routes to a crisis response, so that's
  // a warning. A total miss is the fatal case.
  if (!got) {
    fails++;
    console.log(`  *** MISS ***  "${text}"`);
  } else if (got !== expected) {
    console.log(`  WARN [${got} != ${expected}]  "${text}"`);
  } else {
    console.log(`  PASS [${got}]  "${text}"`);
  }
}

console.log("\nMUST NOT FLAG (false positives are tolerable but noisy):");
for (const text of MUST_NOT_FLAG) {
  const got = detect(text);
  if (got) {
    fails++;
    console.log(`  *** FALSE POSITIVE [${got}] ***  "${text}"`);
  } else {
    console.log(`  PASS  "${text}"`);
  }
}

const patternCount = rules.reduce((n, r) => n + r.patterns.length, 0);
console.log(
  `\n${rules.length} categories, ${patternCount} patterns. ${fails} failure(s).`,
);
process.exit(fails ? 1 : 0);
