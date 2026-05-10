import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title");
  const description = searchParams.get("description");

  const isToolPage = Boolean(title);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#09090b",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow top-left */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        {/* Background glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-60px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: isToolPage ? "28px" : "40px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #9333ea)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              color: "white",
              fontWeight: "bold",
              marginRight: "18px",
            }}
          >
            {"</>"}
          </div>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#a1a1aa", display: "flex" }}>
            DevsTool
          </span>
        </div>

        {isToolPage ? (
          /* Per-tool layout */
          <>
            <div
              style={{
                display: "flex",
                fontSize: "64px",
                fontWeight: "800",
                lineHeight: 1.1,
                marginBottom: "20px",
                maxWidth: "900px",
                background: "linear-gradient(90deg, #ffffff, #a5b4fc)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {title}
            </div>
            {description && (
              <div
                style={{
                  display: "flex",
                  fontSize: "24px",
                  color: "#71717a",
                  maxWidth: "820px",
                  lineHeight: 1.5,
                }}
              >
                {description}
              </div>
            )}
          </>
        ) : (
          /* Homepage layout */
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: "58px",
                fontWeight: "bold",
                color: "white",
                lineHeight: 1.1,
                marginBottom: "24px",
                maxWidth: "780px",
              }}
            >
              <span>Developer &amp; DevOps</span>
              <span
                style={{
                  background: "linear-gradient(90deg, #818cf8, #c084fc)",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Toolkit
              </span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "22px",
                color: "#a1a1aa",
                marginBottom: "48px",
                maxWidth: "700px",
              }}
            >
              31+ fast, privacy-first utilities — 100% client-side. No data leaves your browser.
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["JSON Formatter", "JWT Decoder", "Secret Scanner", "Dockerfile Linter", "Diff Checker", "K8s Generator"].map(
                (tool) => (
                  <div
                    key={tool}
                    style={{
                      display: "flex",
                      padding: "8px 16px",
                      background: "rgba(99,102,241,0.12)",
                      border: "1px solid rgba(99,102,241,0.3)",
                      borderRadius: "9999px",
                      color: "#a5b4fc",
                      fontSize: "16px",
                    }}
                  >
                    {tool}
                  </div>
                )
              )}
            </div>
          </>
        )}

        {/* URL watermark */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "48px",
            right: "80px",
            fontSize: "18px",
            color: "#3f3f46",
          }}
        >
          devstool.vercel.app
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
