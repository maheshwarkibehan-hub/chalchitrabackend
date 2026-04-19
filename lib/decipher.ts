type PlayerCacheEntry = {
  fetchedAt: number;
  playerUrl: string;
  script: string;
};

const PLAYER_CACHE_TTL = 1000 * 60 * 30;
let cache: PlayerCacheEntry | null = null;

type CipherParts = {
  url: string;
  s?: string;
  sp?: string;
};

function parseCipher(signatureCipher: string): CipherParts {
  const params = new URLSearchParams(signatureCipher);
  return {
    url: params.get("url") || "",
    s: params.get("s") || undefined,
    sp: params.get("sp") || "signature",
  };
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function fetchPlayerScript(videoId: string): Promise<PlayerCacheEntry> {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < PLAYER_CACHE_TTL) {
    return cache;
  }

  const watchHtml = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  }).then((res) => res.text());

  const urlMatch =
    watchHtml.match(/"jsUrl":"([^"]+)"/) ||
    watchHtml.match(/"PLAYER_JS_URL":"([^"]+)"/) ||
    watchHtml.match(/"js":\s*"([^"]+)"/);

  if (!urlMatch?.[1]) {
    throw new Error("Unable to locate player script URL");
  }

  const playerUrl = urlMatch[1].startsWith("http")
    ? urlMatch[1]
    : `https://www.youtube.com${safeDecode(urlMatch[1]).replace(/\\\//g, "/")}`;

  const script = await fetch(playerUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  }).then((res) => res.text());

  cache = {
    fetchedAt: now,
    playerUrl,
    script,
  };

  return cache;
}

function locateSignatureFunctionName(script: string): string | null {
  const patterns = [
    /\.sig\|\|([a-zA-Z0-9$]+)\(/,
    /signature",([a-zA-Z0-9$]+)\(/,
  ];

  for (const pattern of patterns) {
    const match = script.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFunctionBody(script: string, fnName: string): string | null {
  const escapedName = escapeRegex(fnName);
  const patterns = [
    new RegExp(`${escapedName}=function\\(([^)]*)\\)\\{([\\s\\S]*?)\\}`),
    new RegExp(`function ${escapedName}\\(([^)]*)\\)\\{([\\s\\S]*?)\\}`),
  ];

  for (const pattern of patterns) {
    const match = script.match(pattern);
    if (match?.[2]) return match[2];
  }

  return null;
}

function extractHelperObjectName(functionBody: string): string | null {
  const match = functionBody.match(/;([A-Za-z0-9$]{2})\.[A-Za-z0-9$]{2}\(a,\d+\)/);
  if (match?.[1]) return match[1];

  const matchAlt = functionBody.match(/([A-Za-z0-9$]{2})\.[A-Za-z0-9$]{2}\(a,\d+\)/);
  return matchAlt?.[1] ?? null;
}

function extractHelperObject(script: string, helperName: string): string | null {
  const escapedName = escapeRegex(helperName);
  const pattern = new RegExp(`(?:var|const|let) ${escapedName}=\\{([\\s\\S]*?)\\};`);
  const match = script.match(pattern);
  return match?.[1] ?? null;
}

function resolveOperationType(operationSource: string): "reverse" | "splice" | "swap" {
  if (operationSource.includes("reverse")) return "reverse";
  if (operationSource.includes("splice")) return "splice";
  return "swap";
}

function buildHelperOperationMap(helperSource: string): Record<string, "reverse" | "splice" | "swap"> {
  const result: Record<string, "reverse" | "splice" | "swap"> = {};
  const methodRegex = /([A-Za-z0-9$]{2}):function\([^)]*\)\{([^}]*)\}/g;

  const matches = Array.from(helperSource.matchAll(methodRegex));
  for (const match of matches) {
    const method = match[1];
    const source = match[2];
    result[method] = resolveOperationType(source);
  }

  return result;
}

function decipherSignature(signature: string, script: string): string {
  const fnName = locateSignatureFunctionName(script);
  if (!fnName) return signature;

  const fnBody = extractFunctionBody(script, fnName);
  if (!fnBody) return signature;

  const helperName = extractHelperObjectName(fnBody);
  if (!helperName) return signature;

  const helperSource = extractHelperObject(script, helperName);
  if (!helperSource) return signature;

  const helperOps = buildHelperOperationMap(helperSource);
  const calls = Array.from(
    fnBody.matchAll(new RegExp(`${escapeRegex(helperName)}\\.([A-Za-z0-9$]{2})\\(a,(\\d+)\\)`, "g")),
  );

  let chars = signature.split("");
  for (const call of calls) {
    const method = call[1];
    const arg = Number(call[2]);
    const op = helperOps[method];

    if (op === "reverse") {
      chars = chars.reverse();
      continue;
    }
    if (op === "splice") {
      chars.splice(0, arg);
      continue;
    }

    const index = arg % chars.length;
    const first = chars[0];
    chars[0] = chars[index];
    chars[index] = first;
  }

  return chars.join("");
}

export async function decipherStreamUrl(
  videoId: string,
  stream: { url?: string; signatureCipher?: string; cipher?: string },
): Promise<string | null> {
  if (stream.url) return stream.url;

  const rawCipher = stream.signatureCipher || stream.cipher;
  if (!rawCipher) return null;

  const cipher = parseCipher(rawCipher);
  if (!cipher.url) return null;

  if (!cipher.s) {
    return safeDecode(cipher.url);
  }

  try {
    const player = await fetchPlayerScript(videoId);
    const signature = decipherSignature(cipher.s, player.script);

    const url = new URL(safeDecode(cipher.url));
    url.searchParams.set(cipher.sp || "signature", signature);
    return url.toString();
  } catch {
    const url = new URL(safeDecode(cipher.url));
    url.searchParams.set(cipher.sp || "signature", cipher.s);
    return url.toString();
  }
}

export function clearDecipherCache() {
  cache = null;
}
