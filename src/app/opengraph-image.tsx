import { ImageResponse } from "next/og";

export const alt = "Aromatarius: olejki eteryczne BIO z analizą każdej partii";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG image par défaut (fond marque). Les OG produit dynamiques arrivent en semaine 3. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#fbf9f4",
          color: "#1f3d2b",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#4c8a5f" }}>Aromatarius</div>
        <div style={{ fontSize: 68, marginTop: 24, lineHeight: 1.1 }}>Olejki eteryczne BIO z analizą każdej partii</div>
        <div style={{ fontSize: 30, marginTop: 32, color: "#5c5b57", fontFamily: "sans-serif" }}>
          Analiza GC/MS · Certyfikat BIO · Chemotyp na etykiecie · InPost 24h
        </div>
      </div>
    ),
    size,
  );
}
