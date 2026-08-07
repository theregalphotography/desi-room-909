"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { formatEventMeta, type EventGallery } from "@/lib/contentful";

const PAGE_SIZE = 8;

interface LightboxState {
  albumIndex: number;
  photoIndex: number;
}

export default function GalleryAlbums({ albums }: { albums: EventGallery[] }) {
  const [shownCounts, setShownCounts] = useState<Record<string, number>>({});
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);
  const [downloading, setDownloading] = useState(false);

  const activeAlbum = lightbox ? albums[lightbox.albumIndex] : null;
  const activePhoto = activeAlbum ? activeAlbum.photos[lightbox!.photoIndex] : null;

  const step = useCallback(
    (direction: number) => {
      setLightbox((current) => {
        if (!current) return current;
        const album = albums[current.albumIndex];
        const length = album.photos.length;
        return {
          albumIndex: current.albumIndex,
          photoIndex: (current.photoIndex + direction + length) % length,
        };
      });
    },
    [albums]
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, step]);

  async function handleDownload() {
    if (!activePhoto || downloading) return;
    setDownloading(true);
    try {
      const res = await fetch(activePhoto.url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = activePhoto.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(activePhoto.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
        {albums.map((album, albumIndex) => {
          const shown = shownCounts[album.id] ?? PAGE_SIZE;
          const visible = album.photos.slice(0, shown);
          const hasMore = shown < album.photos.length;

          return (
            <div key={album.id} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 38, lineHeight: 1 }}>
                  {album.title}
                </div>
                <div style={{ fontSize: 12, letterSpacing: "0.25em", color: "var(--color-lime)", whiteSpace: "nowrap" }}>
                  {formatEventMeta(album.eventDate)}
                </div>
                <div style={{ flex: 1, height: 1, background: "var(--color-cream-a20)", minWidth: 40 }} />
                <div style={{ fontSize: 12, letterSpacing: "0.2em", color: "var(--color-cream-a55)", whiteSpace: "nowrap" }}>
                  {album.photos.length} PHOTOS
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                {visible.map((photo, photoIndex) => (
                  <button
                    key={photo.id}
                    type="button"
                    className="photo-tile"
                    onClick={() => setLightbox({ albumIndex, photoIndex })}
                    aria-label={`View ${photo.fileName} from ${album.title}`}
                    style={{
                      position: "relative",
                      aspectRatio: "1",
                      background: "#181818",
                      cursor: "pointer",
                      padding: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                      style={{ objectFit: "cover" }}
                      loading="lazy"
                    />
                    <div
                      className="photo-tile-overlay"
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        padding: 12,
                        background: "linear-gradient(180deg,transparent 60%,rgba(0,0,0,0.65))",
                      }}
                    >
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", color: "var(--color-cream-a70)" }}>
                        {photo.fileName}
                      </div>
                      <div
                        style={{
                          background: "var(--color-lime)",
                          color: "var(--color-bg)",
                          borderRadius: 999,
                          padding: "6px 12px",
                          fontSize: 10,
                          letterSpacing: "0.15em",
                          fontWeight: 600,
                        }}
                      >
                        VIEW
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {hasMore && (
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={() =>
                    setShownCounts((prev) => ({
                      ...prev,
                      [album.id]: Math.min(shown + PAGE_SIZE, album.photos.length),
                    }))
                  }
                  style={{
                    alignSelf: "center",
                    background: "none",
                    border: "1.5px solid",
                    padding: "14px 34px",
                    borderRadius: 999,
                    fontSize: 12,
                    letterSpacing: "0.22em",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  SHOW MORE FROM THIS NIGHT ({album.photos.length - shown} LEFT)
                </button>
              )}
            </div>
          );
        })}
      </div>

      {lightbox && activeAlbum && activePhoto && (
        <div
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo from ${activeAlbum.title}`}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 44,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: "min(1100px, 92vw)" }}
          >
            <Image
              src={activePhoto.url}
              alt="Event photo"
              width={activePhoto.width}
              height={activePhoto.height}
              sizes="92vw"
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                border: "1px solid rgba(242,233,221,0.3)",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22 }}>
                  {activeAlbum.title}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.15em", color: "var(--color-cream-a55)", marginTop: 4 }}>
                  {activePhoto.fileName}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  className="lightbox-btn"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  style={{ background: "none", border: "1.5px solid", width: 46, height: 46, borderRadius: 999, fontSize: 16, cursor: "pointer" }}
                >
                  ←
                </button>
                <button
                  type="button"
                  className="lightbox-btn"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  style={{ background: "none", border: "1.5px solid", width: 46, height: 46, borderRadius: 999, fontSize: 16, cursor: "pointer" }}
                >
                  →
                </button>
                <button
                  type="button"
                  className="lightbox-download"
                  onClick={handleDownload}
                  disabled={downloading}
                  style={{
                    border: "none",
                    padding: "15px 32px",
                    borderRadius: 999,
                    fontSize: 12,
                    letterSpacing: "0.22em",
                    fontWeight: 600,
                    cursor: downloading ? "default" : "pointer",
                  }}
                >
                  {downloading ? "DOWNLOADING…" : "DOWNLOAD"}
                </button>
                <button
                  type="button"
                  className="lightbox-close"
                  onClick={() => setLightbox(null)}
                  aria-label="Close"
                  style={{ background: "none", border: "none", fontSize: 13, letterSpacing: "0.2em", cursor: "pointer", padding: 10 }}
                >
                  CLOSE ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
