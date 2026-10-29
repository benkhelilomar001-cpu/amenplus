import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AmenPlus";

const TAGLINE: Record<string, string> = {
  fr: "Mobilier en bois · Sur mesure · La Soukra, Tunisie",
  ar: "Wooden furniture · Made to measure · La Soukra, Tunisia",
  en: "Wooden furniture · Made to measure · La Soukra, Tunisia",
};

// Share image: monogram + wordmark on ivory (Latin text only, as the default OG font has no Arabic glyphs).
export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#F3EEE5",
          color: "#292A27",
        }}
      >
        <svg width="240" height="200" viewBox="0 0 120 100">
          <polygon points="4,98 30,98 60,46.6 60,2" fill="#A47D58" />
          <polygon points="60,2 116,98 90,98 60,46.6" fill="#292A27" />
          <polygon points="33,60 78,60 72,70 27,70" fill="#A47D58" />
          <polygon points="52,78 101,78 107,88 46,88" fill="#292A27" />
        </svg>
        <div style={{ marginTop: 40, fontSize: 64, letterSpacing: 22 }}>AMENPLUS</div>
        <div style={{ marginTop: 24, fontSize: 28, color: "#7A5634" }}>{TAGLINE[locale] ?? TAGLINE.fr}</div>
      </div>
    ),
    size,
  );
}
