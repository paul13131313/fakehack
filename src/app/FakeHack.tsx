"use client";
import { useState, useEffect, useCallback, useRef } from "react";

const PHASES = {
  LP: "lp",
  CLOSING: "closing",
  HOME: "home",
  INFECTING: "infecting",
  TERMINAL: "terminal",
  MESSAGES: "messages",
  REVEAL: "reveal",
  AWARENESS: "awareness",
} as const;

type Phase = (typeof PHASES)[keyof typeof PHASES];

const SCARY_MESSAGES = [
  { icon: "🏦", text: "全財産を凍結しています...", sub: "¥12,847,293 → ¥0" },
  { icon: "📋", text: "全個人情報を取得しました", sub: "氏名・住所・電話番号・マイナンバー・口座情報" },
  { icon: "📡", text: "隠し事を全世界に投稿中...", sub: "SNS 14アカウント + ニュース編集部 247社" },
  { icon: "💀", text: "あなたの人生、詰みました。", sub: "" },
];

interface AppInfo {
  name: string;
  emoji: string;
  bg: string;
  badge: number;
  fg?: string;
  text?: string;
}

const HOME_APPS: AppInfo[] = [
  { name: "メッセージ", emoji: "💬", bg: "#32D74B", badge: 3 },
  { name: "カメラ", emoji: "📷", bg: "#65656B", badge: 0 },
  { name: "写真", emoji: "🌸", bg: "linear-gradient(135deg,#FF6F91,#FF9671,#FFC75F,#58D68D)", badge: 0 },
  { name: "マップ", emoji: "🗺️", bg: "linear-gradient(180deg,#6DD400,#007AFF)", badge: 0 },
  { name: "時計", emoji: "🕐", bg: "#1C1C1E", badge: 0 },
  { name: "天気", emoji: "🌤", bg: "linear-gradient(180deg,#5AC8FA,#007AFF)", badge: 0 },
  { name: "メモ", emoji: "📝", bg: "linear-gradient(180deg,#FFDE57,#FFCC02)", badge: 0 },
  { name: "リマインダー", emoji: "📋", bg: "#fff", fg: "#007AFF", badge: 12 },
  { name: "設定", emoji: "⚙️", bg: "#8E8E93", badge: 1 },
  { name: "LINE", emoji: "", text: "LINE", bg: "#06C755", badge: 48 },
  { name: "X", emoji: "𝕏", bg: "#000", badge: 0 },
  { name: "Instagram", emoji: "", text: "📷", bg: "linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)", badge: 0 },
  { name: "YouTube", emoji: "▶", bg: "#FF0000", badge: 0 },
  { name: "Safari", emoji: "🧭", bg: "linear-gradient(180deg,#5AC8FA,#007AFF)", badge: 0 },
  { name: "PayPay", emoji: "", text: "¥", bg: "#FF0033", badge: 0 },
  { name: "楽天", emoji: "", text: "R", bg: "#BF0000", badge: 5 },
  { name: "Amazon", emoji: "", text: "a", bg: "#232F3E", badge: 0 },
  { name: "銀行", emoji: "🏦", bg: "#003366", badge: 0 },
  { name: "カレンダー", emoji: "", text: new Date().getDate().toString(), bg: "#fff", fg: "#FF3B30", badge: 0 },
  { name: "ミュージック", emoji: "♫", bg: "linear-gradient(135deg,#FC3C44,#FF2D55)", badge: 0 },
];

interface DockApp {
  name: string;
  emoji: string;
  bg: string;
}

const DOCK_APPS: DockApp[] = [
  { name: "電話", emoji: "📞", bg: "#32D74B" },
  { name: "メール", emoji: "✉️", bg: "#007AFF" },
  { name: "Safari", emoji: "🧭", bg: "linear-gradient(180deg,#5AC8FA,#007AFF)" },
  { name: "ミュージック", emoji: "♫", bg: "linear-gradient(135deg,#FC3C44,#FF2D55)" },
];

export default function FakeHack() {
  const [phase, setPhase] = useState<Phase>(PHASES.LP);
  const [msgIndex, setMsgIndex] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const [scanLine, setScanLine] = useState(0);
  const [progressWidth, setProgressWidth] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [showSkull, setShowSkull] = useState(false);
  const [infectedApps, setInfectedApps] = useState<Set<number>>(new Set());
  const [showInitBanner, setShowInitBanner] = useState(false);
  const [allInfected, setAllInfected] = useState(false);
  const [wallpaperGlitch, setWallpaperGlitch] = useState(0);
  const [showNotif, setShowNotif] = useState<{ title: string; body: string } | null>(null);
  const [dockInfected, setDockInfected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sounds = useRef<Record<string, HTMLAudioElement>>({});

  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${"日月火水木金土"[now.getDay()]}曜日`;

  const initSounds = () => {
    const files: Record<string, string> = {
      shutdown: "/sounds/sound1.mp3",
      notification: "/sounds/sound2.mp3",
      static: "/sounds/sound3.mp3",
      siren: "/sounds/sound4.mp3",
      typing: "/sounds/sound5.mp3",
      impact: "/sounds/sound6.mp3",
      gameover: "/sounds/sound7.mp3",
      reveal: "/sounds/sound8.mp3",
    };
    Object.entries(files).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto";
      audio.load();
      sounds.current[key] = audio;
    });
  };

  const playSound = (name: string, loop = false) => {
    const s = sounds.current[name];
    if (!s) return;
    s.loop = loop;
    s.currentTime = 0;
    s.play().catch(() => {});
  };

  const stopSound = (name: string) => {
    const s = sounds.current[name];
    if (!s) return;
    s.pause();
    s.currentTime = 0;
  };

  const stopAll = () => {
    Object.values(sounds.current).forEach((s) => {
      s.pause();
      s.currentTime = 0;
      s.loop = false;
    });
  };

  const tryFullscreen = useCallback(() => {
    const el = containerRef.current as HTMLElement & { webkitRequestFullscreen?: () => void };
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el?.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }, []);

  const startSequence = useCallback(() => {
    initSounds();
    tryFullscreen();

    setPhase(PHASES.CLOSING);
    playSound("shutdown");

    setTimeout(() => setPhase(PHASES.HOME), 1800);

    setTimeout(() => {
      playSound("notification");
      setShowNotif({ title: "⚠️ セキュリティ警告", body: "不正なアクセスを検出しました" });
    }, 3000);
    setTimeout(() => setShowNotif(null), 5800);

    setTimeout(() => {
      setPhase(PHASES.INFECTING);
      playSound("static", true);
      setGlitchActive(true);
    }, 6200);
  }, [tryFullscreen]);

  // Infection spread
  useEffect(() => {
    if (phase !== PHASES.INFECTING) return;
    const totalApps = HOME_APPS.length;
    let count = 0;
    const intv = setInterval(() => {
      if (count >= totalApps) {
        clearInterval(intv);
        setAllInfected(true);
        setDockInfected(true);
        stopSound("static");
        playSound("siren");
        setTimeout(() => setShowInitBanner(true), 600);
        setTimeout(() => {
          stopSound("siren");
          setPhase(PHASES.TERMINAL);
          playSound("typing", true);
        }, 3800);
        return;
      }
      setInfectedApps((prev) => {
        const uninfected: number[] = [];
        for (let i = 0; i < totalApps; i++) {
          if (!prev.has(i)) uninfected.push(i);
        }
        if (uninfected.length === 0) return prev;
        const pick = uninfected[Math.floor(Math.random() * uninfected.length)];
        return new Set(prev).add(pick);
      });
      setWallpaperGlitch((g) => Math.min(g + 5, 100));
      count++;
    }, 180);
    return () => clearInterval(intv);
  }, [phase]);

  // Terminal typewriter
  useEffect(() => {
    if (phase !== PHASES.TERMINAL) return;
    const lines = [
      "root@target:~# establishing backdoor...",
      "BYPASS FIREWALL ████████████ OK",
      "DUMPING contacts.db ████████ OK",
      "DUMPING photos/ █████████ OK",
      "DUMPING bank_credentials.enc OK",
      "DECRYPTING AES-256 ████████ OK",
      "UPLOADING → darknet node [TOR]...",
      "BROADCASTING personal_data.tar.gz...",
      "",
      "=============================",
      "  ALL DATA COMPROMISED.",
      "  DEVICE FULLY CONTROLLED.",
      "=============================",
    ];
    let lineIdx = 0,
      charIdx = 0;
    const intv = setInterval(() => {
      if (lineIdx >= lines.length) {
        clearInterval(intv);
        stopSound("typing");
        setTimeout(() => {
          setPhase(PHASES.MESSAGES);
          setMsgIndex(0);
        }, 1200);
        return;
      }
      charIdx++;
      if (charIdx <= lines[lineIdx].length) {
        setTypedText(
          lines.slice(0, lineIdx).join("\n") +
            (lineIdx > 0 ? "\n" : "") +
            lines[lineIdx].substring(0, charIdx)
        );
      } else {
        lineIdx++;
        charIdx = 0;
      }
    }, 30);
    let p = 0;
    const pIntv = setInterval(() => {
      p += Math.random() * 6;
      if (p >= 100) {
        p = 100;
        clearInterval(pIntv);
      }
      setProgressWidth(p);
    }, 80);
    return () => {
      clearInterval(intv);
      clearInterval(pIntv);
    };
  }, [phase]);

  // Messages
  useEffect(() => {
    if (phase !== PHASES.MESSAGES) return;
    if (msgIndex >= SCARY_MESSAGES.length) {
      playSound("gameover");
      setShowSkull(true);
      setTimeout(() => {
        setPhase(PHASES.REVEAL);
        setShowSkull(false);
        setGlitchActive(false);
      }, 3000);
      return;
    }
    if (msgIndex > 0) {
      playSound("impact");
    }
    const t = setTimeout(() => setMsgIndex((i) => i + 1), 2500);
    return () => clearTimeout(t);
  }, [phase, msgIndex]);

  // Reveal → Awareness
  useEffect(() => {
    if (phase === PHASES.REVEAL) {
      stopAll();
      playSound("reveal");
      const t = setTimeout(() => setPhase(PHASES.AWARENESS), 4500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Scan line
  useEffect(() => {
    if (!glitchActive) return;
    const intv = setInterval(() => setScanLine((s) => (s + 2) % 100), 25);
    return () => clearInterval(intv);
  }, [glitchActive]);

  const reset = () => {
    stopAll();
    setPhase(PHASES.LP);
    setMsgIndex(0);
    setGlitchActive(false);
    setProgressWidth(0);
    setTypedText("");
    setShowSkull(false);
    setInfectedApps(new Set());
    setShowInitBanner(false);
    setAllInfected(false);
    setWallpaperGlitch(0);
    setShowNotif(null);
    setDockInfected(false);
  };

  const renderAppIcon = (app: AppInfo, index: number, isInfected: boolean, size = 58) => {
    const isGrad = app.bg?.startsWith?.("linear");
    return (
      <div
        key={index}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          position: "relative",
          transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
          transform: isInfected
            ? `rotate(${(index % 2 === 0 ? 1 : -1) * (2 + (index % 3))}deg) scale(0.92)`
            : "none",
          filter: isInfected ? "saturate(0) brightness(0.35)" : "none",
          opacity: isInfected ? 0.85 : 1,
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.22,
            background: isInfected ? "#1a0000" : isGrad ? app.bg : app.bg,
            border: isInfected ? "1.5px solid rgba(255,0,0,0.5)" : "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: size * 0.43,
            position: "relative",
            overflow: "hidden",
            boxShadow: isInfected
              ? "0 0 16px rgba(255,0,0,0.35), inset 0 0 12px rgba(255,0,0,0.2)"
              : "0 2px 6px rgba(0,0,0,0.25)",
            color: app.fg || "#fff",
            fontWeight: 700,
            transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
          }}
        >
          {isInfected ? (
            <span style={{ fontSize: size * 0.38, filter: "saturate(1) brightness(1)" }}>
              {["💀", "⛔", "☠️", "🔓", "❌", "🚫", "💣", "🔴"][index % 8]}
            </span>
          ) : (
            app.emoji || (
              <span
                style={{
                  fontFamily: "-apple-system,'SF Pro Display',sans-serif",
                  fontSize: size * 0.36,
                }}
              >
                {app.text}
              </span>
            )
          )}
          {isInfected && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,0,0,0.2)",
                animation: "infectFlash 0.6s ease-out",
              }}
            />
          )}
        </div>
        {!isInfected && app.badge > 0 && (
          <div
            style={{
              position: "absolute",
              top: -3,
              right: 4,
              background: "#FF3B30",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "-apple-system,sans-serif",
              borderRadius: 12,
              minWidth: 20,
              height: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "0 5px",
            }}
          >
            {app.badge}
          </div>
        )}
        <span
          style={{
            color: isInfected ? "#ff4444" : "#fff",
            fontSize: 11,
            fontWeight: isInfected ? 600 : 400,
            fontFamily: isInfected
              ? "'Share Tech Mono',monospace"
              : "-apple-system,'Hiragino Sans',sans-serif",
            textShadow: isInfected
              ? "0 0 8px rgba(255,0,0,0.5)"
              : "0 1px 3px rgba(0,0,0,0.7)",
            maxWidth: size + 14,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
            transition: "all 0.3s",
          }}
        >
          {isInfected ? "HACKED" : app.name}
        </span>
      </div>
    );
  };

  const ScanOverlay = ({ color = "0,255,0", opacity = 0.03 }: { color?: string; opacity?: number }) => (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 90,
        background: `repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(${color},${opacity}) 2px,rgba(${color},${opacity}) 4px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 3,
          background: `rgba(${color},0.18)`,
          top: `${scanLine}%`,
          boxShadow: `0 0 30px rgba(${color},0.35)`,
        }}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100dvh",
        overflow: "hidden",
        position: "relative",
        fontFamily: "-apple-system,'Hiragino Sans','Hiragino Kaku Gothic ProN',sans-serif",
        background: "#000",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Dela+Gothic+One&display=swap');
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        @keyframes flicker{0%,100%{opacity:1}50%{opacity:.8}52%{opacity:.12}54%{opacity:.9}56%{opacity:.25}58%{opacity:1}}
        @keyframes shake{0%,100%{transform:translate(0)}10%{transform:translate(-5px,3px)}20%{transform:translate(5px,-3px)}30%{transform:translate(-3px,5px)}40%{transform:translate(3px,-5px)}50%{transform:translate(-5px,-3px)}60%{transform:translate(5px,3px)}70%{transform:translate(-3px,-5px)}80%{transform:translate(3px,5px)}90%{transform:translate(-5px,3px)}}
        @keyframes fadeSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes skullPulse{0%{transform:scale(.3);opacity:0}50%{transform:scale(1.3);opacity:1}100%{transform:scale(1);opacity:1}}
        @keyframes redPulse{0%,100%{box-shadow:0 0 20px rgba(255,0,0,.2)}50%{box-shadow:0 0 60px rgba(255,0,0,.7)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes infectFlash{0%{background:rgba(255,0,0,0.5)}100%{background:rgba(255,0,0,0)}}
        @keyframes slideDown{from{transform:translateY(-120%);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes bannerReveal{0%{transform:scale(0.8);opacity:0}100%{transform:scale(1);opacity:1}}
        @keyframes wallGlitch{0%,100%{filter:hue-rotate(0deg) saturate(1)}33%{filter:hue-rotate(90deg) saturate(2.5)}66%{filter:hue-rotate(200deg) saturate(0.2)}}
        @keyframes rgbSplit{0%,100%{text-shadow:2px 0 #ff0000,-2px 0 #00ff00}50%{text-shadow:-2px 0 #ff0000,2px 0 #0000ff}}
        .lp-btn{display:block;width:100%;padding:22px 20px;border:none;border-radius:16px;font-family:'Dela Gothic One',sans-serif;font-size:17px;color:#fff;cursor:pointer;transition:all .15s;position:relative;overflow:hidden;letter-spacing:.5px}
        .lp-btn:active{transform:scale(.96);filter:brightness(1.1)}
        .lp-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.18)0%,transparent 50%);pointer-events:none}
      `}</style>

      {/* ===== LP ===== */}
      {phase === PHASES.LP && (
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 24px",
            background: "linear-gradient(160deg,#0a0a0a 0%,#1a0a2e 50%,#0a0a0a 100%)",
            animation: "fadeSlideUp 0.5s ease-out",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
              style={{
                fontSize: 13,
                color: "#ff4444",
                fontFamily: "'Share Tech Mono',monospace",
                marginBottom: 14,
                letterSpacing: 4,
                animation: "blink 1.5s infinite",
              }}
            >
              ⚠ CONFIDENTIAL ⚠
            </div>
            <h1
              style={{
                fontFamily: "'Dela Gothic One',sans-serif",
                fontSize: 28,
                color: "#fff",
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              あなたの人生を
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#FFD700,#FF6B00,#FF0050)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientShift 3s linear infinite",
                }}
              >
                変えるチャンス
              </span>
            </h1>
            <p style={{ color: "#888", fontSize: 13, marginTop: 12 }}>
              🔒 本日限定・残り
              <span style={{ color: "#FF0050", fontWeight: "bold" }}> 3枠</span>
            </p>
          </div>
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[
              {
                label: "💰 めちゃめちゃ儲かる",
                sub: "月収300万円を3日で実現する方法",
                bg: "linear-gradient(135deg,#FFD700,#FF8C00)",
                shadow: "rgba(255,140,0,.4)",
              },
              {
                label: "🔞 すんごいエロい",
                sub: "今すぐ無料で全部見れます",
                bg: "linear-gradient(135deg,#FF1493,#FF0050)",
                shadow: "rgba(255,0,80,.4)",
              },
              {
                label: "🚀 圧倒的爆神成長できる",
                sub: "IQ+50、年収10倍を保証します",
                bg: "linear-gradient(135deg,#7B2FF7,#00D4FF)",
                shadow: "rgba(123,47,247,.4)",
              },
            ].map((btn, i) => (
              <button
                key={i}
                className="lp-btn"
                style={{ background: btn.bg, boxShadow: `0 4px 20px ${btn.shadow}` }}
                onClick={startSequence}
              >
                {btn.label}
                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.85,
                    marginTop: 4,
                    fontFamily: "sans-serif",
                    fontWeight: 400,
                  }}
                >
                  {btn.sub}
                </div>
              </button>
            ))}
          </div>
          <div
            style={{
              marginTop: 28,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#555",
              fontSize: 11,
            }}
          >
            <span>⭐⭐⭐⭐⭐</span>
            <span>利用者 2,847,291人</span>
          </div>
        </div>
      )}

      {/* ===== CLOSING ===== */}
      {phase === PHASES.CLOSING && (
        <div
          style={{
            height: "100%",
            background: "#000",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            paddingBottom: 10,
          }}
        >
          <div style={{ width: 36, height: 5, background: "#333", borderRadius: 3 }} />
        </div>
      )}

      {/* ===== HOME / INFECTING ===== */}
      {(phase === PHASES.HOME || phase === PHASES.INFECTING) && (
        <div
          style={{
            height: "100%",
            position: "relative",
            overflow: "hidden",
            animation: phase === PHASES.INFECTING ? "shake 0.25s infinite" : "none",
          }}
        >
          {/* Wallpaper */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 0,
              background: allInfected
                ? "linear-gradient(180deg,#1a0000 0%,#330000 50%,#0a0000 100%)"
                : `linear-gradient(180deg,
                    hsl(${240 - wallpaperGlitch * 2.4},${60 - wallpaperGlitch * 0.3}%,${18 - wallpaperGlitch * 0.08}%) 0%,
                    hsl(${270 - wallpaperGlitch * 2.7},${40 - wallpaperGlitch * 0.2}%,${22 - wallpaperGlitch * 0.1}%) 50%,
                    hsl(${230 - wallpaperGlitch * 2.3},${50 - wallpaperGlitch * 0.3}%,${14 - wallpaperGlitch * 0.06}%) 100%)`,
              transition: "background 0.3s",
              animation: wallpaperGlitch > 50 ? "wallGlitch 0.4s infinite" : "none",
            }}
          />
          {glitchActive && <ScanOverlay color="255,0,0" opacity={0.04} />}

          {/* iOS Status Bar */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 28px 0",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "-apple-system,sans-serif",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {timeStr}
            </span>
            {/* Dynamic Island */}
            <div
              style={{
                width: 126,
                height: 36,
                background: "#000",
                borderRadius: 20,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: "#0a0a0a",
                  top: 8,
                  left: 36,
                  boxShadow: "inset 0 0 2px rgba(50,50,80,0.5)",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
                <rect x="0" y="9" width="3" height="3" rx="0.5" fill="rgba(255,255,255,0.4)" />
                <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="rgba(255,255,255,0.6)" />
                <rect x="9" y="3" width="3" height="9" rx="0.5" fill="rgba(255,255,255,0.8)" />
                <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#fff" />
              </svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff" opacity="0.95">
                <path
                  d="M8 10.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"
                  transform="translate(0,-2)"
                />
                <path
                  d="M4.7 8.8a4.5 4.5 0 016.6 0"
                  stroke="#fff"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  transform="translate(0,-2)"
                />
                <path
                  d="M2 6a8 8 0 0112 0"
                  stroke="#fff"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  transform="translate(0,-2)"
                />
              </svg>
              <div
                style={{
                  width: 25,
                  height: 12,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  borderRadius: 3.5,
                  position: "relative",
                  marginLeft: 2,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 2,
                    left: 2,
                    bottom: 2,
                    width: "62%",
                    background: "#32D74B",
                    borderRadius: 1.5,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: -4,
                    top: 3.5,
                    width: 1.5,
                    height: 5,
                    background: "rgba(255,255,255,0.4)",
                    borderRadius: "0 1px 1px 0",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Date + Lock */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              textAlign: "center",
              padding: "16px 0 2px",
            }}
          >
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>🔒</div>
            <div
              style={{
                color: "#fff",
                fontSize: 13,
                fontWeight: 400,
                opacity: 0.7,
                fontFamily: "-apple-system,sans-serif",
              }}
            >
              {dateStr}
            </div>
          </div>

          {/* App Grid */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: "20px 0",
              padding: "18px 20px 16px",
              maxWidth: 400,
              margin: "0 auto",
            }}
          >
            {HOME_APPS.map((app, i) => renderAppIcon(app, i, infectedApps.has(i)))}
          </div>

          {/* Page dots */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              padding: "6px 0",
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.8)",
              }}
            />
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
              }}
            />
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
              }}
            />
          </div>

          {/* Dock */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              padding: "14px 36px 28px",
              background: "rgba(30,30,30,0.5)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              borderRadius: "24px 24px 0 0",
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            {DOCK_APPS.map((app, i) => {
              const inf = dockInfected;
              const isGrad = app.bg?.startsWith?.("linear");
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    filter: inf ? "saturate(0) brightness(0.35)" : "none",
                    transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
                    transform: inf ? `rotate(${i % 2 === 0 ? 2 : -2}deg)` : "none",
                  }}
                >
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 14,
                      background: inf ? "#1a0000" : isGrad ? app.bg : app.bg,
                      border: inf ? "1.5px solid rgba(255,0,0,0.5)" : "none",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 26,
                      boxShadow: inf
                        ? "0 0 16px rgba(255,0,0,0.35), inset 0 0 12px rgba(255,0,0,0.2)"
                        : "0 2px 6px rgba(0,0,0,0.25)",
                      transition: "all 0.4s cubic-bezier(.4,0,.2,1)",
                    }}
                  >
                    {inf ? ["💀", "⛔", "☠️", "🔓"][i] : app.emoji}
                  </div>
                </div>
              );
            })}
          </div>

          {/* iOS Notification */}
          {showNotif && (
            <div
              style={{
                position: "absolute",
                top: 56,
                left: 10,
                right: 10,
                zIndex: 80,
                background: "rgba(50,50,52,0.9)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                borderRadius: 18,
                padding: "14px 16px",
                display: "flex",
                gap: 12,
                alignItems: "center",
                animation: "slideDown 0.35s cubic-bezier(.2,0,.2,1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#FF3B30,#FF6B6B)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                🔓
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    marginBottom: 2,
                    fontFamily: "-apple-system,sans-serif",
                  }}
                >
                  {showNotif.title}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    fontFamily: "-apple-system,sans-serif",
                  }}
                >
                  {showNotif.body}
                </div>
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 12,
                  flexShrink: 0,
                  fontFamily: "-apple-system,sans-serif",
                }}
              >
                今
              </div>
            </div>
          )}

          {/* INIT BANNER */}
          {showInitBanner && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 70,
                background: "rgba(0,0,0,0.88)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  border: "2px solid #ff0000",
                  borderRadius: 12,
                  padding: "30px 24px",
                  background: "rgba(20,0,0,0.96)",
                  textAlign: "center",
                  width: "88%",
                  maxWidth: 330,
                  animation: "bannerReveal 0.4s cubic-bezier(.2,0,.2,1)",
                  boxShadow: "0 0 60px rgba(255,0,0,0.2), 0 0 120px rgba(255,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: 11,
                    color: "#ff4444",
                    letterSpacing: 4,
                    marginBottom: 14,
                    animation: "blink 0.8s infinite",
                  }}
                >
                  ⚠ SYSTEM OVERRIDE ⚠
                </div>
                <div
                  style={{
                    fontFamily: "'Dela Gothic One',sans-serif",
                    fontSize: 22,
                    color: "#ff0000",
                    lineHeight: 1.6,
                    marginBottom: 14,
                    animation: "rgbSplit 0.3s infinite",
                  }}
                >
                  オール初期化
                  <br />
                  セキュリティ解除完了
                </div>
                <div
                  style={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: 12,
                    color: "#ff6666",
                    lineHeight: 2,
                    textAlign: "left",
                    padding: "0 8px",
                  }}
                >
                  {`> 20/20 apps compromised`}
                  <br />
                  {`> firewall: DISABLED`}
                  <br />
                  {`> encryption: REMOVED`}
                  <br />
                  {`> root access: GRANTED`}
                  <br />
                  {`> location: TRACKING`}
                </div>
                <div
                  style={{
                    marginTop: 16,
                    height: 3,
                    background: "#220000",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: "100%",
                      background: "linear-gradient(90deg,#ff0000,#ff4400,#ff0000)",
                      backgroundSize: "200% auto",
                      animation: "gradientShift 0.8s linear infinite",
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== TERMINAL ===== */}
      {phase === PHASES.TERMINAL && (
        <div
          style={{
            height: "100%",
            background: "#050505",
            padding: "44px 18px 24px",
            display: "flex",
            flexDirection: "column",
            animation: "shake 0.2s infinite",
          }}
        >
          {glitchActive && <ScanOverlay color="0,255,0" opacity={0.03} />}
          <div
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: 12,
              color: "#00ff00",
              whiteSpace: "pre-wrap",
              lineHeight: 1.9,
              flex: 1,
              overflow: "hidden",
              position: "relative",
              zIndex: 10,
            }}
          >
            {typedText}
            <span style={{ animation: "blink 0.4s infinite" }}>█</span>
          </div>
          <div style={{ position: "relative", zIndex: 10, marginTop: 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "#ff0000",
                fontSize: 12,
                fontFamily: "'Share Tech Mono',monospace",
                marginBottom: 6,
              }}
            >
              <span>DATA EXTRACTION</span>
              <span>{Math.round(progressWidth)}%</span>
            </div>
            <div
              style={{
                height: 5,
                background: "#1a1a1a",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressWidth}%`,
                  background: "linear-gradient(90deg,#ff0000,#ff4400)",
                  borderRadius: 3,
                  transition: "width 0.08s",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ===== MESSAGES ===== */}
      {phase === PHASES.MESSAGES && (
        <div
          style={{
            height: "100%",
            background: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 20px",
            animation: "shake 0.15s infinite",
          }}
        >
          <ScanOverlay color="255,0,0" opacity={0.03} />
          <div style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 10 }}>
            {SCARY_MESSAGES.slice(0, msgIndex).map((msg, i) => (
              <div
                key={i}
                style={{
                  background:
                    i === msgIndex - 1 ? "rgba(255,0,0,.12)" : "rgba(255,0,0,.04)",
                  border: `1px solid ${i === msgIndex - 1 ? "rgba(255,0,0,.6)" : "rgba(255,0,0,.12)"}`,
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 12,
                  animation: i === msgIndex - 1 ? "fadeSlideUp 0.4s ease-out" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 30 }}>{msg.icon}</span>
                  <div>
                    <div
                      style={{
                        fontFamily: "'Dela Gothic One',sans-serif",
                        fontSize: 15,
                        color: "#ff0000",
                        animation: i === msgIndex - 1 ? "flicker 0.3s infinite" : "none",
                      }}
                    >
                      {msg.text}
                    </div>
                    {msg.sub && (
                      <div
                        style={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: 11,
                          color: "#ff6666",
                          marginTop: 5,
                        }}
                      >
                        {msg.sub}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showSkull && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,.95)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 200,
              }}
            >
              <div style={{ fontSize: 120, animation: "skullPulse 0.5s ease-out" }}>💀</div>
              <div
                style={{
                  fontFamily: "'Dela Gothic One',sans-serif",
                  fontSize: 32,
                  color: "#ff0000",
                  marginTop: 20,
                  animation: "flicker 0.15s infinite",
                }}
              >
                GAME OVER
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== REVEAL ===== */}
      {phase === PHASES.REVEAL && (
        <div
          style={{
            height: "100%",
            background: "#000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
            animation: "fadeSlideUp 0.8s ease-out",
          }}
        >
          <div style={{ fontSize: 90, marginBottom: 28 }}>🎬</div>
          <div
            style={{
              fontFamily: "'Dela Gothic One',sans-serif",
              fontSize: 28,
              color: "#fff",
              textAlign: "center",
              lineHeight: 1.5,
            }}
          >
            ぜんぶ
            <br />
            <span
              style={{
                background: "linear-gradient(90deg,#00ff88,#00ccff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: 42,
              }}
            >
              ウソ
            </span>
            <br />
            でした。
          </div>
          <div
            style={{
              color: "#888",
              fontSize: 14,
              marginTop: 20,
              textAlign: "center",
              lineHeight: 1.8,
            }}
          >
            これはセキュリティ啓発のための
            <br />
            フェイク演出です。
            <br />
            <span style={{ fontSize: 12, color: "#555" }}>
              あなたのデータには一切アクセスしていません。
            </span>
          </div>
        </div>
      )}

      {/* ===== AWARENESS ===== */}
      {phase === PHASES.AWARENESS && (
        <div
          style={{
            height: "100%",
            background: "linear-gradient(180deg,#0a1628 0%,#0d2137 50%,#0a1628 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "30px 24px",
            animation: "fadeSlideUp 0.8s ease-out",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#00ff88,#00ccff)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 36,
              marginBottom: 24,
            }}
          >
            🛡️
          </div>
          <h2
            style={{
              fontFamily: "'Dela Gothic One',sans-serif",
              fontSize: 22,
              color: "#fff",
              textAlign: "center",
              margin: "0 0 14px",
              lineHeight: 1.5,
            }}
          >
            でも、本物だったら？
          </h2>
          <p
            style={{
              color: "#8899aa",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 1.8,
              maxWidth: 320,
              margin: "0 0 10px",
            }}
          >
            「めちゃめちゃ儲かる」
            <br />
            「すんごいエロい」
            <br />
            「圧倒的に成長できる」
          </p>
          <p
            style={{
              color: "#aabbcc",
              fontSize: 14,
              textAlign: "center",
              lineHeight: 1.8,
              maxWidth: 320,
              margin: "0 0 30px",
            }}
          >
            こんなリンク、タップしていませんか？
            <br />
            <strong style={{ color: "#fff" }}>その1タップが、人生を壊します。</strong>
          </p>
          <div
            style={{
              background: "rgba(0,204,255,.06)",
              border: "1px solid rgba(0,204,255,.15)",
              borderRadius: 16,
              padding: "18px 24px",
              textAlign: "center",
              width: "100%",
              maxWidth: 340,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily: "'Dela Gothic One',sans-serif",
                fontSize: 13,
                color: "#00ccff",
                marginBottom: 8,
              }}
            >
              セキュリティ意識を高めよう
            </div>
            <div style={{ color: "#8899aa", fontSize: 12, lineHeight: 1.6 }}>
              フィッシング詐欺・マルウェア・個人情報漏洩…
              <br />
              あなたのリテラシーをチェック！
            </div>
          </div>
          <a
            href="https://www.soumu.go.jp/main_sosiki/cybersecurity/kokumin/index.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              width: "100%",
              maxWidth: 340,
              padding: "16px 20px",
              background: "linear-gradient(135deg,#00ccff,#00ff88)",
              borderRadius: 14,
              textAlign: "center",
              fontFamily: "'Dela Gothic One',sans-serif",
              fontSize: 15,
              color: "#0a1628",
              textDecoration: "none",
              marginBottom: 16,
            }}
          >
            🔐 セキュリティ意識テスト 2026
          </a>
          <button
            onClick={reset}
            style={{
              background: "none",
              border: "1px solid #334",
              borderRadius: 10,
              padding: "10px 24px",
              color: "#667",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            もう一度体験する
          </button>
          <div style={{ marginTop: 28, color: "#334", fontSize: 10, textAlign: "center" }}>
            FAKE HACK — セキュリティ啓発プロジェクト
            <br />※ このサイトは実際のハッキングは一切行っていません
          </div>
        </div>
      )}
    </div>
  );
}
