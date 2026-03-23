export interface VideoCreator {
  name: string;
  role: string;
}

export interface VideoStat {
  label: string;
  value: string;
}

export interface VideoEntry {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  category: string;
  tags: string[];
  duration: string;
  year: string;
  accent: string;
  poster: string;
  posterPosition?: string;
  featured?: boolean;
  videoSrc?: string;
  createdAt: string;
  creator: VideoCreator;
  stats?: VideoStat[];
}

export interface CreateVideoInput {
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  videoSrc: string;
  poster?: string;
}
