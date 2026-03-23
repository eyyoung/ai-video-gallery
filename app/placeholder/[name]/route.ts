import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface PlaceholderTheme {
  bg: string;
  fg: string;
  accent: string;
  label: string;
}

const themes: Record<string, PlaceholderTheme> = {
  home:   { bg: "#0c0a1a", fg: "#b6a0ff", accent: "#7c5cfc", label: "Gallery" },
  detail: { bg: "#050d14", fg: "#00e3fd", accent: "#0080aa", label: "Detail" },
  admin:  { bg: "#140a10", fg: "#ff6c95", accent: "#aa2050", label: "Admin" },
  login:  { bg: "#141008", fg: "#ffb86c", accent: "#aa7030", label: "Login" },
};

function generateSvg(theme: PlaceholderTheme): string {
  const { bg, fg, accent, label } = theme;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${accent}"/>
    </linearGradient>
    <radialGradient id="g2" cx="70%" cy="30%" r="60%">
      <stop offset="0%" stop-color="${fg}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g3" cx="20%" cy="80%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${bg}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#g1)"/>
  <rect width="1280" height="720" fill="url(#g2)"/>
  <rect width="1280" height="720" fill="url(#g3)"/>
  <circle cx="900" cy="200" r="180" fill="${fg}" opacity="0.04"/>
  <circle cx="350" cy="550" r="120" fill="${accent}" opacity="0.06"/>
  <line x1="0" y1="360" x2="1280" y2="360" stroke="${fg}" stroke-opacity="0.06" stroke-width="1"/>
  <line x1="640" y1="0" x2="640" y2="720" stroke="${fg}" stroke-opacity="0.06" stroke-width="1"/>
  <text x="640" y="340" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="500" letter-spacing="6" fill="${fg}" opacity="0.25">${label.toUpperCase()}</text>
  <rect x="604" y="360" width="72" height="2" rx="1" fill="${fg}" opacity="0.15"/>
</svg>`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const key = name.replace(/\.svg$/, "");
  const theme = themes[key];

  if (!theme) {
    return new NextResponse("Not found", { status: 404 });
  }

  const svg = generateSvg(theme);

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
