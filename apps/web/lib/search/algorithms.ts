// Pure-TS search primitives. OLX-inspired, zero external deps.
//
//   normalize(s)       lowercase + strip punctuation + collapse whitespace
//   tokenize(s)        split on whitespace after normalize
//   levenshtein(a, b)  classic edit distance with early-exit cap
//   doubleMetaphone(s) phonetic key (primary code only, good enough here)
//   recencyBoost       OLX formula: weight / (1 + log(days_since))
//   scoreTerm          OLX composite: freq + views + recency
//   generateNgrams     "iphone 15 pro" -> ["iphone","iphone 15","iphone 15 pro",...]

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(input: string): string[] {
  const n = normalize(input);
  return n ? n.split(" ") : [];
}

// Levenshtein with an early-exit cap. If the cheapest edit distance already
// exceeds `cap`, returns cap + 1 so callers can drop the candidate fast.
export function levenshtein(a: string, b: string, cap = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > cap) return cap + 1;
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

// Double Metaphone — simplified primary-code implementation. Not as faithful
// as Lawrence Philips' original C++ 400-line version, but it captures the
// common English + Indian-name cases we care about (phone/fone, x/ks, etc.)
// and is stable enough for a vocabulary-bucket key.
export function doubleMetaphone(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return "";

  let out = "";
  let i = 0;
  const n = w.length;

  const at = (pos: number, s: string) =>
    pos >= 0 && pos + s.length <= n && w.substring(pos, pos + s.length) === s;
  const vowel = (c: string) => /[aeiouy]/.test(c);

  // Strip silent leading pairs
  if (at(0, "kn") || at(0, "gn") || at(0, "pn") || at(0, "wr") || at(0, "ps")) i = 1;
  if (at(0, "x")) { out += "s"; i = 1; }

  while (i < n && out.length < 8) {
    const c = w[i];
    const next = w[i + 1] || "";

    switch (c) {
      case "a": case "e": case "i": case "o": case "u":
        if (i === 0) out += "a";
        i += 1;
        break;
      case "b":
        out += "p";
        i += w[i + 1] === "b" ? 2 : 1;
        break;
      case "c":
        if (at(i, "cia")) { out += "x"; i += 3; break; }
        if (at(i, "ch")) { out += "x"; i += 2; break; }
        if (at(i, "ck") || at(i, "cq") || at(i, "cc")) { out += "k"; i += 2; break; }
        if (next === "e" || next === "i" || next === "y") { out += "s"; i += 1; break; }
        out += "k";
        i += 1;
        break;
      case "d":
        if (at(i, "dg") && (w[i + 2] === "e" || w[i + 2] === "i" || w[i + 2] === "y")) {
          out += "j"; i += 3; break;
        }
        out += "t";
        i += w[i + 1] === "d" || w[i + 1] === "t" ? 2 : 1;
        break;
      case "f":
        out += "f";
        i += w[i + 1] === "f" ? 2 : 1;
        break;
      case "g":
        if (at(i, "gh") && (i === 0 || !vowel(w[i - 1]))) { out += "k"; i += 2; break; }
        if (at(i, "gn")) { out += "k"; i += 2; break; }
        if (next === "e" || next === "i" || next === "y") { out += "j"; i += 1; break; }
        out += "k";
        i += w[i + 1] === "g" ? 2 : 1;
        break;
      case "h":
        if (i === 0 || vowel(w[i + 1] || "")) out += "h";
        i += 1;
        break;
      case "j":
        out += "j";
        i += 1;
        break;
      case "k":
        out += "k";
        i += w[i + 1] === "k" ? 2 : 1;
        break;
      case "l":
        out += "l";
        i += w[i + 1] === "l" ? 2 : 1;
        break;
      case "m":
        out += "m";
        i += w[i + 1] === "m" ? 2 : 1;
        break;
      case "n":
        out += "n";
        i += w[i + 1] === "n" ? 2 : 1;
        break;
      case "p":
        if (next === "h") { out += "f"; i += 2; break; }
        out += "p";
        i += w[i + 1] === "p" ? 2 : 1;
        break;
      case "q":
        out += "k";
        i += 1;
        break;
      case "r":
        out += "r";
        i += w[i + 1] === "r" ? 2 : 1;
        break;
      case "s":
        if (at(i, "sh")) { out += "x"; i += 2; break; }
        if (at(i, "sch")) { out += "x"; i += 3; break; }
        out += "s";
        i += w[i + 1] === "s" ? 2 : 1;
        break;
      case "t":
        if (at(i, "th")) { out += "0"; i += 2; break; }
        if (at(i, "tch") || at(i, "tio") || at(i, "tia")) { out += "x"; i += 3; break; }
        out += "t";
        i += w[i + 1] === "t" ? 2 : 1;
        break;
      case "v":
        out += "f";
        i += 1;
        break;
      case "w":
        if (vowel(w[i + 1] || "")) out += "w";
        i += 1;
        break;
      case "x":
        out += "ks";
        i += 1;
        break;
      case "y":
        if (vowel(w[i + 1] || "")) out += "y";
        i += 1;
        break;
      case "z":
        out += "s";
        i += w[i + 1] === "z" ? 2 : 1;
        break;
      default:
        i += 1;
    }
  }
  return out.slice(0, 8);
}

// OLX recency boost: weight / (1 + log(days_since_last_search)).
// days=0 gives the full weight, days=9 gives ~weight/3.2, days=365 gives ~weight/6.9.
export function recencyBoost(lastSearchedAt: Date | null, weight = 10): number {
  if (!lastSearchedAt) return 0;
  const days = (Date.now() - lastSearchedAt.getTime()) / (1000 * 60 * 60 * 24);
  return weight / (1 + Math.log(1 + Math.max(0, days)));
}

export interface ScoreInputs {
  searchFrequency: number;
  viewCount: number;
  lastSearchedAt: Date | null;
}

// OLX composite: score = search_frequency + view_count + recency_boost.
// Views get a 2x bump because a click is a stronger signal than a typed query.
export function scoreTerm({ searchFrequency, viewCount, lastSearchedAt }: ScoreInputs): number {
  return searchFrequency + viewCount * 2 + recencyBoost(lastSearchedAt);
}

// Generate progressive n-grams for catalog phrases so a user typing the first
// word still gets the full suggestion: "iphone 15 pro max" ->
// ["iphone","iphone 15","iphone 15 pro","iphone 15 pro max"].
export function generateNgrams(phrase: string): string[] {
  const tokens = tokenize(phrase);
  const out: string[] = [];
  for (let i = 1; i <= tokens.length; i++) {
    out.push(tokens.slice(0, i).join(" "));
  }
  return out;
}
