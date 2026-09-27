export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return parsed.pathname.slice(1).split("/")[0] || null;
    if (host === "music.youtube.com" || host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const match = parsed.pathname.match(/\/(shorts|embed)\/([^/?#]+)/);
      if (match) return match[2];
    }
    return null;
  } catch {
    return null;
  }
}

export const playlist: Track[] = [
  {
    id: "about-you",
    title: "About You",
    artist: "The 1975",
    url: "https://music.youtube.com/watch?v=tGv7CUutzqU&si=tZeMofWTZaXWB5_v",
  },
  {
    id: "i-lay-my-love-on-you",
    title: "I Lay My Love on You (Remix)",
    artist: "Westlife",
    url: "https://music.youtube.com/watch?v=0Cawb8dj2s8&si=Y0x4_iWjK3ACqJWZ",
  },
  {
    id: "merry-christmas-please-dont-call",
    title: "Merry Christmas, Please Don't Call",
    artist: "Bleachers",
    url: "https://music.youtube.com/watch?v=aMqOtlVwQYM&si=KP4VcM1PF277szr5",
  },
  {
    id: "what-if-i-call",
    title: "What If I Call",
    artist: "Alex Crichton",
    url: "https://music.youtube.com/watch?v=F2PsSZKweTc&si=CujRSV8XFdEfqP59",
  },
  {
    id: "love-story-taylors-version",
    title: "Love Story",
    artist: "Taylor Swift",
    url: "https://music.youtube.com/watch?v=e7yg0A-PCTI&si=aynexqDM7YfrmUIk2",
  },
  {
    id: "Night-Changes",
    title: "Night Changes",
    artist: "One Direction",
    url: "https://music.youtube.com/watch?v=8BiLurrzFRw&si=XdCUa1wqqMuvmHn8",
  },
];

