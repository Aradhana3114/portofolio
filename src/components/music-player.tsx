"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ListMusic, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { getYouTubeId, playlist } from "@/data/music";
import { cn } from "@/lib/utils";

type YTPlayerInstance = {
  playVideo(): void;
  pauseVideo(): void;
  cueVideoById(videoId: string): void;
  loadVideoById(videoId: string): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  mute(): void;
  unMute(): void;
  destroy(): void;
};

type YTPlayerEvent = { data?: number };

// Each playlist row hovers in its own pastel, cycled by index. Written out as
// literal strings so Tailwind's scanner can see every variant. `border-brutal-ink`
// on hover keeps the 3px outline readable once the fill turns pastel in dark mode.
const PLAYLIST_HOVER_TONES = [
  "hover:bg-brutal-yellow hover:text-brutal-ink hover:border-brutal-ink",
  "hover:bg-brutal-blue hover:text-brutal-ink hover:border-brutal-ink",
  "hover:bg-brutal-pink hover:text-brutal-ink hover:border-brutal-ink",
  "hover:bg-brutal-green hover:text-brutal-ink hover:border-brutal-ink",
  "hover:bg-brutal-orange hover:text-brutal-ink hover:border-brutal-ink",
  "hover:bg-brutal-purple hover:text-brutal-ink hover:border-brutal-ink",
] as const;

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    options: {
      videoId?: string;
      playerVars?: Record<string, number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    }
  ) => YTPlayerInstance;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT) resolve(window.YT);
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

const YT_STATE_ENDED = 0;
const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;

const AUTOPLAY_KEY = "music-autoplay";
const INDEX_KEY = "music-index";

export function MusicPlayer() {
  const pathname = usePathname();
  if (pathname?.split("/").includes("admin")) return null;
  return <MusicPlayerInner />;
}

function MusicPlayerInner() {
  const t = useTranslations();
  const audioRef = useRef<HTMLAudioElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const ytHostRef = useRef<HTMLDivElement>(null);
  const ytRef = useRef<YTPlayerInstance | null>(null);
  const playingRef = useRef(false);
  const loadingRef = useRef(false);
  const indexRef = useRef(0);
  const failures = useRef(0);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [overflow, setOverflow] = useState(0);
  const [ytReady, setYtReady] = useState(false);

  const hasTracks = playlist.length > 0;
  const track = hasTracks ? playlist[index] : undefined;
  const ytTrackId = track ? getYouTubeId(track.url) : null;

  const setPlayState = (value: boolean) => {
    playingRef.current = value;
    setPlaying(value);
  };

  const rememberAutoplay = (value: boolean) => {
    try {
      localStorage.setItem(AUTOPLAY_KEY, value ? "1" : "0");
    } catch {}
  };

  const startPlayback = () => {
    rememberAutoplay(true);
    setPlayState(true);
  };

  const togglePlayback = () => {
    if (!track) return;
    const next = !playingRef.current;
    rememberAutoplay(next);
    setPlayState(next);
  };

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (!playing) return;
    try {
      localStorage.setItem(INDEX_KEY, String(index));
    } catch {}
  }, [playing, index]);

  const isCurrentYtTrack = () => {
    const item = playlist[indexRef.current];
    return !!item && !!getYouTubeId(item.url);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.muted = muted;
    const yt = ytRef.current;
    if (yt && ytReady) {
      if (muted) yt.mute();
      else yt.unMute();
    }
  }, [muted, ytReady]);

  useEffect(() => {
    setCurrent(0);
    setDuration(0);
    measure();
    const yt = ytRef.current;
    if (!yt || !ytReady) return;
    if (ytTrackId) {
      loadingRef.current = true;
      if (playingRef.current) yt.loadVideoById(ytTrackId);
      else yt.cueVideoById(ytTrackId);
    } else {
      yt.pauseVideo();
    }
  }, [index, ytTrackId, ytReady]);

  useEffect(() => {
    if (ytTrackId) {
      audioRef.current?.pause();
      const yt = ytRef.current;
      if (yt && ytReady) {
        if (playing) yt.playVideo();
        else yt.pauseVideo();
      }
      return;
    }
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (playing) {
      const promise = audio.play();
      if (promise) {
        promise.catch(() => {
          playingRef.current = false;
          setPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [playing, index, track, ytTrackId, ytReady]);

  useEffect(() => {
    if (!ytTrackId || !ytReady) return;
    const timer = window.setInterval(() => {
      const yt = ytRef.current;
      if (!yt) return;
      const time = yt.getCurrentTime();
      setCurrent((prev) => (Math.abs(prev - time) > 0.25 ? time : prev));
      const total = yt.getDuration();
      if (total) setDuration((prev) => (total !== prev ? total : prev));
    }, 500);
    return () => window.clearInterval(timer);
  }, [index, ytTrackId, ytReady]);

  useEffect(() => {
    if (!playlist.some((item) => getYouTubeId(item.url))) return;
    let cancelled = false;
    const host = document.createElement("div");
    ytHostRef.current?.appendChild(host);
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        ytRef.current = new YT.Player(host, {
          playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onReady: () => {
              if (!cancelled) setYtReady(true);
            },
            onStateChange: (event) => {
              if (cancelled) return;
              if (event.data === YT_STATE_PLAYING) {
                loadingRef.current = false;
                failures.current = 0;
                if (isCurrentYtTrack()) setPlayState(true);
                return;
              }
              if (event.data === YT_STATE_ENDED) {
                loadingRef.current = false;
                if (isCurrentYtTrack()) setIndex((prev) => (prev + 1) % playlist.length);
                return;
              }
              if (event.data === YT_STATE_PAUSED) {
                if (loadingRef.current) return;
                if (isCurrentYtTrack()) setPlayState(false);
              }
            },
            onError: () => {
              if (cancelled || !isCurrentYtTrack()) return;
              failures.current += 1;
              if (failures.current >= playlist.length) {
                setPlayState(false);
                return;
              }
              setIndex((prev) => (prev + 1) % playlist.length);
            },
          },
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      try {
        ytRef.current?.destroy();
      } catch {}
      ytRef.current = null;
      setYtReady(false);
    };
  }, []);

  const goTo = (next: number) => {
    if (hasTracks) setIndex((next + playlist.length) % playlist.length);
  };

  const skip = (delta: number) => {
    if (!track) return;
    startPlayback();
    goTo(index + delta);
  };

  const handleError = () => {
    failures.current += 1;
    if (failures.current >= playlist.length) {
      setPlayState(false);
      return;
    }
    goTo(index + 1);
  };

  const handleSeek = (event: MouseEvent<HTMLButtonElement>) => {
    if (!duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    if (ytTrackId) {
      const yt = ytRef.current;
      if (!yt) return;
      yt.seekTo(ratio * duration, true);
      setCurrent(ratio * duration);
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = ratio * duration;
    setCurrent(ratio * duration);
  };

  const measure = () => {
    const box = boxRef.current;
    const seg = titleRef.current;
    if (box && seg) setOverflow(Math.max(0, seg.offsetWidth - box.clientWidth));
  };

  useEffect(() => {
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(() => measure());
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!playlist.length) return;
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const target = event.target;
      if (target instanceof Element) {
        if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        const next = !playingRef.current;
        rememberAutoplay(next);
        setPlayState(next);
        return;
      }
      if (event.code === "KeyA") {
        setOpen((value) => !value);
        return;
      }
      if (event.code === "KeyM") {
        setMuted((value) => !value);
        return;
      }
      if (event.code === "KeyD" || event.code === "KeyS") {
        const delta = event.code === "KeyD" ? 1 : -1;
        startPlayback();
        setIndex((prev) => (prev + delta + playlist.length) % playlist.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    let autoplay = false;
    try {
      autoplay = localStorage.getItem(AUTOPLAY_KEY) === "1";
      const saved = Number(localStorage.getItem(INDEX_KEY));
      if (autoplay && Number.isInteger(saved) && saved > 0 && saved < playlist.length) {
        setIndex(saved);
      }
    } catch {
      return;
    }
    if (!autoplay || !playlist.length) return;

    const stop = () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
      window.removeEventListener("touchstart", start);
    };
    const start = () => {
      stop();
      queueMicrotask(() => {
        if (!playingRef.current) setPlayState(true);
      });
    };
    window.addEventListener("pointerdown", start);
    window.addEventListener("keydown", start);
    window.addEventListener("touchstart", start);
    return stop;
  }, []);

  const progress = duration ? (current / duration) * 100 : 0;
  const label = track ? `${track.artist} – ${track.title}` : t("music.empty");
  const marqueeDuration = Math.max(8, label.length * 0.18);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:left-auto sm:right-6">
      <div ref={ytHostRef} aria-hidden="true" className="pointer-events-none fixed bottom-0 left-0 h-px w-px overflow-hidden opacity-0" />

      {track && !ytTrackId && (
        <audio
          ref={audioRef}
          src={track.url}
          preload="metadata"
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
          onPlaying={() => {
            failures.current = 0;
          }}
          onEnded={() => skip(1)}
          onError={handleError}
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-full border-[3px] border-border bg-background p-2 shadow-brutal-lg sm:w-[22rem]"
          >
            <div className="mb-2 flex items-center justify-between gap-2 border-[3px] border-border bg-brutal-pink px-3 py-2">
              <p className="font-display text-caption font-extrabold uppercase tracking-widest text-brutal-ink">
                {t("music.playlist")}
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("music.close")}
                className="flex h-7 w-7 items-center justify-center rounded-sm border-[3px] border-border bg-brutal-ink text-brutal-yellow transition-transform hover:rotate-90"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto pr-1">
              {hasTracks ? playlist.map((item, i) => (
                <li key={item.id} className={cn(i > 0 && "mt-2")}>
                  <button
                    onClick={() => {
                      goTo(i);
                      startPlayback();
                      setOpen(false);
                    }}
                    aria-current={i === index}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-sm border-[3px] border-border bg-muted px-3 py-2 text-left transition-all duration-150 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-sm",
                      PLAYLIST_HOVER_TONES[i % PLAYLIST_HOVER_TONES.length],
                      i === index && "bg-brutal-blue text-brutal-ink shadow-brutal-sm"
                    )}
                  >
                    <span className="w-4 shrink-0 text-metadata font-bold">
                      {i === index && playing ? (
                        <span className="flex h-3 items-end gap-[2px]">
                          {[0, 1, 2].map((bar) => (
                            <span
                              key={bar}
                              className="animate-music-bar w-[3px] bg-current"
                              style={{ height: "100%", animationDelay: `${bar * 0.15}s` }}
                            />
                          ))}
                        </span>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-caption font-bold">{item.title}</span>
                      <span className="block truncate text-metadata opacity-60">{item.artist}</span>
                    </span>
                    {i === index && <Play size={13} strokeWidth={3} className="shrink-0" />}
                  </button>
                </li>
              )) : (
                <li className="px-3 py-6 text-center text-caption text-foreground/50">{t("music.empty")}</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-2 rounded-sm border-[3px] border-border bg-background px-3 pb-4 pt-2 shadow-brutal-md sm:gap-2.5 sm:px-3.5">
        <span className="flex items-center gap-[3px]" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={cn("h-2 w-2 border-[2px] border-border bg-brutal-pink", playing && "animate-music-dot")}
              style={{ animationDelay: `${dot * 0.18}s` }}
            />
          ))}
        </span>

        <div ref={boxRef} className="w-24 min-w-0 overflow-hidden sm:w-36">
          <span
            className={cn(
              "inline-block whitespace-nowrap text-caption font-bold select-none",
              overflow > 0 && "animate-marquee"
            )}
            style={
              {
                "--marquee-duration": `${marqueeDuration}s`,
              } as CSSProperties
            }
          >
            <span ref={titleRef} className="mr-8 inline-block">
              {label}
            </span>
            {overflow > 0 && (
              <span aria-hidden="true" className="mr-8 inline-block">
                {label}
              </span>
            )}
          </span>
        </div>

        <span className="hidden h-7 w-[3px] shrink-0 bg-border sm:block" aria-hidden="true" />

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => skip(-1)}
            disabled={!hasTracks}
            aria-label={t("music.previous")}
            className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-background transition-all duration-150 hover:bg-brutal-yellow hover:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-30"
          >
            <SkipBack size={15} strokeWidth={3} />
          </button>
          <button
            onClick={togglePlayback}
            disabled={!hasTracks}
            aria-label={playing ? t("music.pause") : t("music.play")}
            className="flex h-10 w-10 items-center justify-center rounded-sm border-[3px] border-border bg-foreground text-background transition-all duration-150 hover:bg-brutal-green hover:text-brutal-ink hover:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-30"
          >
            {playing ? <Pause size={16} strokeWidth={3} /> : <Play size={16} strokeWidth={3} className="ml-0.5" />}
          </button>
          <button
            onClick={() => skip(1)}
            disabled={!hasTracks}
            aria-label={t("music.next")}
            className="flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-background transition-all duration-150 hover:bg-brutal-yellow hover:shadow-brutal-sm disabled:cursor-not-allowed disabled:opacity-30"
          >
            <SkipForward size={15} strokeWidth={3} />
          </button>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={t("music.playlist")}
          aria-expanded={open}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border transition-all duration-150 hover:shadow-brutal-sm",
            open ? "bg-brutal-orange text-brutal-ink" : "bg-background hover:bg-brutal-orange hover:text-brutal-ink"
          )}
        >
          <ListMusic size={15} strokeWidth={3} />
        </button>

        <button
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? t("music.unmute") : t("music.mute")}
          className="hidden h-9 w-9 items-center justify-center rounded-sm border-[3px] border-border bg-background transition-all duration-150 hover:bg-brutal-purple hover:text-brutal-ink hover:shadow-brutal-sm sm:flex"
        >
          {muted ? <VolumeX size={15} strokeWidth={3} /> : <Volume2 size={15} strokeWidth={3} />}
        </button>

        <button
          type="button"
          onClick={handleSeek}
          aria-label={t("music.seek")}
          className="absolute inset-x-3 bottom-1.5 h-2.5 cursor-pointer"
        >
          <span className="absolute inset-0 border-[3px] border-border bg-muted" />
          <span
            className="absolute inset-y-[3px] left-[3px] bg-brutal-blue"
            style={{ width: `calc(${progress}% - 3px)` }}
          />
        </button>
      </div>
    </div>
  );
}
