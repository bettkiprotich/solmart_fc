import { useState } from "react";
import { AnyRecord, cardClass, inputClass, api, upload, uploadVideo, slugPreview } from "./shared";
import { toast } from "sonner";
import Image from "next/image";

export function MediaTab({ galleries, videos, mutate }: { galleries: AnyRecord[]; videos: AnyRecord[]; mutate: any }) {
  const [v, setV] = useState({ title: "", url: "", published: false });
  const [g, setG] = useState({ title: "", description: "", published: false });
  const [selected, setSelected] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [editingG, setEditingG] = useState<AnyRecord | null>(null);
  const [editingV, setEditingV] = useState<AnyRecord | null>(null);

  const createGallery = async (e: any) => {
    e.preventDefault();
    try {
      if (editingG) {
        await mutate(`/api/admin/media?id=${editingG.id}`, "PATCH", { ...g, id: editingG.id, type: "gallery" });
        toast.success("Gallery updated!");
        setEditingG(null);
      } else {
        await mutate("/api/admin/media", "POST", { ...g, type: "gallery" });
        toast.success("Gallery created!");
      }
      setG({ title: "", description: "", published: false });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save gallery.");
    }
  };

  const addImages = async () => {
    if (!selected || files.length === 0) return;
    try {
      const gal = galleries.find((x) => x.id === selected);
      const sortOrder = gal?.images?.length || 0;
      for (let i = 0; i < files.length; i++) {
        const url = await upload(files[i], "galleries");
        await api("/api/admin/gallery-images", {
          method: "POST",
          body: JSON.stringify({ galleryId: selected, url, altText: files[i].name.replace(/\.[^.]+$/, ""), sortOrder: sortOrder + i }),
        });
      }
      setFiles([]);
      mutate();
      toast.success("Images added successfully!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to add gallery images.");
    }
  };

  const addVideo = async (e: any) => {
    e.preventDefault();
    try {
      let url = v.url;
      if (videoFile) url = await uploadVideo(videoFile);
      if (editingV) {
        await mutate(`/api/admin/media?id=${editingV.id}`, "PATCH", { id: editingV.id, type: "video", title: v.title, url, published: v.published });
        toast.success("Video updated!");
        setEditingV(null);
      } else {
        await mutate("/api/admin/media", "POST", { type: "video", title: v.title, url, published: v.published });
        toast.success("Video added!");
      }
      setV({ title: "", url: "", published: false });
      setVideoFile(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save video.");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className={cardClass}>
        <h2 className="text-xl font-black">{editingG ? "Edit Gallery Details" : "Galleries"}</h2>
        <p className="mt-1 text-sm text-black/50">{editingG ? "Update the gallery title, description, or visibility." : "Create galleries, upload multiple photos, preview them, and remove individual images."}</p>
        <form className="mt-4 space-y-3" onSubmit={createGallery}>
          <input className={inputClass} placeholder="Gallery title" required value={g.title} onChange={(e) => setG({ ...g, title: e.target.value })} />
          <div className="rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-black/60">
            <span className="font-black text-black/70">URL preview:</span> <span className="font-mono">/media/{slugPreview(g.title)}</span>
          </div>
          <textarea className={inputClass} placeholder="Description" value={g.description} onChange={(e) => setG({ ...g, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={g.published} onChange={(e) => setG({ ...g, published: e.target.checked })} /> Publish gallery
          </label>
          <div className="flex gap-2">
            <button className="rounded-xl bg-red-600 px-4 py-3 font-black text-white">{editingG ? "Save changes" : "Create gallery"}</button>
            {editingG && (
              <button type="button" className="rounded-xl border px-4 py-3 font-black" onClick={() => { setEditingG(null); setG({ title: "", description: "", published: false }); }}>Cancel edit</button>
            )}
          </div>
        </form>
        <div className="mt-5 space-y-5">
          {galleries.map((x) => (
            <div key={x.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <b>{x.title}</b>
                  <span className="ml-2 text-xs text-black/50">{x.published ? "Published" : "Draft"}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => { setEditingG(x); setG({ title: x.title, description: x.description || "", published: x.published }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
                  <button type="button" className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => { if (confirm(`Delete gallery ${x.title}?`)) mutate(`/api/admin/media?id=${x.id}&type=gallery`, "DELETE", {}) }}>Delete</button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {x.images?.map((im: any) => (
                  <div key={im.id} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
                    <Image src={im.url} alt={im.altText} width={150} height={150} className="h-full w-full object-cover" />
                    <button type="button" className="absolute right-1 top-1 rounded-full bg-black px-2 py-1 text-xs font-black text-white" onClick={() => mutate(`/api/admin/gallery-images?id=${im.id}`, "DELETE", {})}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <select className={inputClass} value={selected === x.id ? x.id : ""} onChange={(e) => setSelected(e.target.value)}>
                  <option value="">Manage photos</option>
                  <option value={x.id}>{x.title}</option>
                </select>
                {selected === x.id && (
                  <>
                    <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                    {files.length > 0 && <p className="text-xs text-black/50">{files.length} photo(s) selected</p>}
                    <button type="button" disabled={!files.length} onClick={addImages} className="rounded-lg bg-black px-3 py-2 text-xs font-black text-white disabled:opacity-50">
                      Upload photo(s)
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={cardClass}>
        <h2 className="text-xl font-black">{editingV ? "Edit Video" : "Videos"}</h2>
        <p className="mt-1 text-sm text-black/50">Upload MP4 or WebM videos, or add a YouTube/Vimeo URL.</p>
        <form className="mt-4 space-y-3" onSubmit={addVideo}>
          <input className={inputClass} placeholder="Video title" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
          <label className="rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-bold block cursor-pointer">
            {editingV ? "Upload new video (optional)" : "Upload video"}
            <input className="mt-2 block w-full text-sm hidden" type="file" accept="video/mp4,video/webm" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
            {videoFile && <span className="block mt-2 font-normal text-xs">{videoFile.name}</span>}
          </label>
          <div className="text-center text-xs font-bold text-black/40">OR</div>
          <input className={inputClass} placeholder="External video URL (optional if uploading)" type="url" value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} />
          <label className="flex items-center gap-2 text-sm font-bold">
            <input type="checkbox" checked={v.published} onChange={(e) => setV({ ...v, published: e.target.checked })} /> Publish video
          </label>
          <div className="flex gap-2">
            <button disabled={!videoFile && !v.url && !editingV} className="rounded-xl bg-red-600 px-4 py-3 font-black text-white disabled:opacity-50">
              {editingV ? "Save changes" : "Add video"}
            </button>
            {editingV && (
              <button type="button" className="rounded-xl border px-4 py-3 font-black" onClick={() => { setEditingV(null); setV({ title: "", url: "", published: false }); setVideoFile(null); }}>Cancel</button>
            )}
          </div>
        </form>
        <div className="mt-5 space-y-2">
          {videos.map((x) => (
            <div key={x.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <b>{x.title}</b>
                <p className="max-w-xs truncate text-xs text-black/50">{x.url}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => { setEditingV(x); setV({ title: x.title, url: x.url, published: x.published }); }}>Edit</button>
                <button type="button" className="rounded-lg border px-3 py-2 text-xs font-bold" onClick={() => { if (confirm(`Delete video?`)) mutate(`/api/admin/media?id=${x.id}&type=video`, "DELETE", {}) }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
