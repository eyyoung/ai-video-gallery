import { GalleryHome } from "@/components/gallery-home";
import { readVideos } from "@/lib/video-store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const videos = await readVideos();
  return <GalleryHome videos={videos} />;
}
