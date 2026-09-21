function youtubeId(url: string) {
  try { const u = new URL(url); if (u.hostname.includes("youtu.be")) return u.pathname.slice(1); if (u.hostname.includes("youtube.com")) return u.searchParams.get("v") || u.pathname.split("/").pop(); } catch {} return null;
}
function vimeoId(url: string) { try { const u = new URL(url); if (u.hostname.includes("vimeo.com")) return u.pathname.split("/").filter(Boolean).pop() || null; } catch {} return null; }

export function VideoEmbed({ video }: { video: any }) {
  const youtube = youtubeId(video.url || "");
  const vimeo = vimeoId(video.url || "");
  if (youtube) return <iframe src={`https://www.youtube.com/embed/${youtube}`} title={video.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="h-full w-full" />;
  if (vimeo) return <iframe src={`https://player.vimeo.com/video/${vimeo}`} title={video.title} loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full" />;
  return <video src={video.url} poster={video.thumbnailUrl || undefined} controls preload="metadata" className="h-full w-full" />;
}
