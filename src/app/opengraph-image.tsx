import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { EVENT } from "@/config/event";

export const alt = `${EVENT.hostName} · Aniversário ${EVENT.dateShort}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  let background: string | null = null;

  try {
    const file = await readFile(
      join(process.cwd(), "public", "images", "og-base.jpg"),
    );
    background = `data:image/jpeg;base64,${file.toString("base64")}`;
  } catch {
    background = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#030605",
          color: "#eae2d1",
          fontFamily: "sans-serif",
        }}
      >
        {background ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={background}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(90deg, rgba(3,6,5,0.98) 0%, rgba(3,6,5,0.92) 44%, rgba(3,6,5,0.28) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(3,6,5,0.55) 0%, rgba(3,6,5,0) 30%, rgba(3,6,5,0.7) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "60px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 62,
                height: 62,
                borderRadius: 999,
                border: "1px solid rgba(234,226,209,0.35)",
                color: "#eae2d1",
                fontSize: 24,
              }}
            >
              {EVENT.monogram}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 18,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                  color: "#eae2d1",
                }}
              >
                {EVENT.hostName}
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  fontSize: 13,
                  letterSpacing: 5,
                  textTransform: "uppercase",
                  color: "#95a69e",
                }}
              >
                Convite digital · {EVENT.year}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 20,
                letterSpacing: 7,
                textTransform: "uppercase",
                color: "#5affc8",
              }}
            >
              Aniversário · Sábado
            </div>
            <div
              style={{
                marginTop: 18,
                fontSize: 108,
                lineHeight: 0.95,
                letterSpacing: -4,
                fontWeight: 700,
              }}
            >
              Arthur Alves
            </div>
            <div
              style={{
                marginTop: 22,
                fontSize: 36,
                color: "#c8ffe9",
                fontWeight: 500,
              }}
            >
              07 NOV 2026 · A PARTIR DAS 17H
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 24,
                letterSpacing: 1,
                color: "#95a69e",
              }}
            >
              Piscina · Churrasco · Boa companhia
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 20,
              color: "#95a69e",
            }}
          >
            <div style={{ display: "flex" }}>Aparecida de Goiânia — GO</div>
            <div
              style={{
                display: "flex",
                backgroundColor: "#5affc8",
                color: "#04110c",
                padding: "13px 24px",
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              CONFIRME SUA PRESENÇA
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
