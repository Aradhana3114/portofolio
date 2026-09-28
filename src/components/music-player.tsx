"use client";

import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
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

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (!playing) return;
    try {
      localStorage.setItem(AUTOPLAY_KEY, "1");
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
    setPlayState(true);
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
        setPlayState(!playingRef.current);
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
        setPlayState(true);
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
            className="mb-2 w-full rounded-3xl border border-border bg-background/95 p-2 shadow-xl shadow-black/10 backdrop-blur-xl sm:w-80"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-caption font-semibold uppercase tracking-widest text-foreground/50">
                {t("music.playlist")}
              </p>
              <button
                onClick={() => setOpen(false)}
                aria-label={t("music.close")}
                className="rounded-full p-1 text-foreground/50 transition-colors hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto pr-1">
              {hasTracks ? playlist.map((item, i) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      goTo(i);
                      setPlayState(true);
                      setOpen(false);
                    }}
                    aria-current={i === index}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-muted",
                      i === index && "bg-muted"
                    )}
                  >
                    <span className="w-4 shrink-0 text-metadata text-foreground/40">
                      {i === index && playing ? (
                        <span className="flex h-3 items-end gap-[2px]">
                          {[0, 1, 2].map((bar) => (
                            <span
                              key={bar}
                              className="animate-music-bar w-[2px] rounded-full bg-foreground"
                              style={{ height: "100%", animationDelay: `${bar * 0.15}s` }}
                            />
                          ))}
                        </span>
                      ) : (
                        i + 1
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body">{item.title}</span>
                      <span className="block truncate text-metadata text-foreground/50">{item.artist}</span>
                    </span>
                    {i === index && <Play size={13} className="shrink-0 text-foreground/60" />}
                  </button>
                </li>
              )) : (
                <li className="px-3 py-6 text-center text-caption text-foreground/50">{t("music.empty")}</li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-2 rounded-full border border-foreground/20 bg-background/95 px-3 py-2 shadow-lg shadow-black/20 backdrop-blur-xl sm:gap-3 sm:px-4">
        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-accent-secondary sm:block">
          {t("music.label")}
        </span>

        <span className="flex items-center gap-[3px]" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className={cn("h-1.5 w-1.5 rounded-full bg-accent-secondary", playing && "animate-music-dot")}
              style={{ animationDelay: `${dot * 0.18}s` }}
            />
          ))}
        </span>

        <div ref={boxRef} className="w-32 min-w-0 overflow-hidden sm:w-56">
          <span
            className={cn(
              "inline-block whitespace-nowrap text-caption text-foreground/80 select-none",
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

        <span className="h-6 w-px bg-border" aria-hidden="true" />

        <div className="flex items-center gap-1">
          <button
            onClick={() => skip(-1)}
            disabled={!hasTracks}
            aria-label={t("music.previous")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button
            onClick={() => track && setPlayState(!playing)}
            disabled={!hasTracks}
            aria-label={playing ? t("music.pause") : t("music.play")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-30"
          >
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          <button
            onClick={() => skip(1)}
            disabled={!hasTracks}
            aria-label={t("music.next")}
            className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <SkipForward size={16} fill="currentColor" />
          </button>
        </div>

        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={t("music.playlist")}
          aria-expanded={open}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-muted",
            open ? "text-foreground" : "text-foreground/60 hover:text-foreground"
          )}
        >
          <ListMusic size={16} />
        </button>

        <button
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? t("music.unmute") : t("music.mute")}
          className="hidden h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-muted hover:text-foreground sm:flex"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <button
          type="button"
          onClick={handleSeek}
          aria-label={t("music.seek")}
          className="absolute inset-x-7 bottom-1 h-1.5 cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full bg-muted/70" />
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-accent-secondary"
            style={{ width: `${progress}%` }}
          />
        </button>
      </div>
    </div>
  );
}
