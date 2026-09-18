import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES_DATA } from '../data/servicesData';
import { SpaceMotifs } from './SpaceMotifs';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 23;
const FRAME_PATHS = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const pad = String(i + 1).padStart(3, '0');
  return `/robot-frames/ezgif-frame-${pad}.png`;
});

const PROJECT_THEMES = [
  {
    bgGradient: 'linear-gradient(165deg, #c084fc 0%, #8b5cf6 45%, #6b21a8 100%)',
    accentColor: '#8b5cf6',
    cardShadow: '0 24px 55px rgba(139, 92, 246, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  },
  {
    bgGradient: 'linear-gradient(165deg, #38bdf8 0%, #0284c7 45%, #0369a1 100%)',
    accentColor: '#0284c7',
    cardShadow: '0 24px 55px rgba(2, 132, 199, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  },
  {
    bgGradient: 'linear-gradient(165deg, #34d399 0%, #059669 45%, #047857 100%)',
    accentColor: '#059669',
    cardShadow: '0 24px 55px rgba(5, 150, 105, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  },
  {
    bgGradient: 'linear-gradient(165deg, #fb923c 0%, #ea580c 45%, #c2410c 100%)',
    accentColor: '#ea580c',
    cardShadow: '0 24px 55px rgba(234, 88, 12, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  },
  {
    bgGradient: 'linear-gradient(165deg, #fb7185 0%, #e11d48 45%, #be123c 100%)',
    accentColor: '#e11d48',
    cardShadow: '0 24px 55px rgba(225, 29, 72, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  },
  {
    bgGradient: 'linear-gradient(165deg, #818cf8 0%, #4f46e5 45%, #3730a3 100%)',
    accentColor: '#4f46e5',
    cardShadow: '0 24px 55px rgba(79, 70, 229, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  },
  {
    bgGradient: 'linear-gradient(165deg, #facc15 0%, #d97706 45%, #b45309 100%)',
    accentColor: '#d97706',
    cardShadow: '0 24px 55px rgba(217, 119, 6, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  },
  {
    bgGradient: 'linear-gradient(165deg, #2dd4bf 0%, #0d9488 45%, #115e59 100%)',
    accentColor: '#0d9488',
    cardShadow: '0 24px 55px rgba(13, 148, 136, 0.5), 0 8px 24px rgba(0, 0, 0, 0.35)'
  }
];

export const StorytellingSection = () => {
  const sectionRef = useRef(null);
  const pinContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // State for content presentation
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [activeProjectIndex, setActiveProjectIndex] = useState(-1);
  const [cardDeckScrollPos, setCardDeckScrollPos] = useState(0); // 0.0 to 7.0 continuous float
  const [projectProgress, setProjectProgress] = useState(0); // 0 to 1 reveal for Project 01 in Phase B
  const [introOpacity, setIntroOpacity] = useState(1);
  const [introTranslateX, setIntroTranslateX] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [panelOpacity, setPanelOpacity] = useState(1);

  // 1. High-performance canvas drawing
  const drawFrame = (frameNum) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgIndex = Math.min(Math.max(frameNum - 1, 0), TOTAL_FRAMES - 1);
    const img = imagesRef.current[imgIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Resize canvas to match display size * DPR for crisp retina rendering
    const targetWidth = Math.round(rect.width * dpr);
    const targetHeight = Math.round(rect.height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate aspect ratio with ~20% scale reduction so robot fits perfectly within viewport
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = canvas.width / canvas.height;

    let baseWidth, baseHeight;

    if (canvasAspect > imgAspect) {
      baseWidth = canvas.width;
      baseHeight = baseWidth / imgAspect;
    } else {
      baseHeight = canvas.height;
      baseWidth = baseHeight * imgAspect;
    }

    // Scale down to fit character portrait perfectly without clipping ears/head
    const scale = 0.62;
    const drawWidth = baseWidth * scale;
    const drawHeight = baseHeight * scale;
    const drawX = (canvas.width - drawWidth) / 2;
    // Align flush to bottom: zero gap at bottom edge
    const drawY = canvas.height - drawHeight;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  };

  // 2. Preload 23 frames
  useEffect(() => {
    let loadedCount = 0;
    const images = [];
    imagesRef.current = images;

    FRAME_PATHS.forEach((src, idx) => {
      const img = new Image();
      img.src = src;
      images[idx] = img;

      img.onload = () => {
        loadedCount++;
        if (idx === 0) {
          // Draw Frame 1 immediately when ready
          setImagesLoaded(true);
          requestAnimationFrame(() => drawFrame(1));
        }
        if (loadedCount === TOTAL_FRAMES) {
          setImagesLoaded(true);
          requestAnimationFrame(() => drawFrame(currentFrameIndex));
        }
      };
    });
  }, []);

  // Re-draw on resize
  useEffect(() => {
    const handleResize = () => {
      drawFrame(currentFrameIndex);
      ScrollTrigger.refresh();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentFrameIndex]);

  // 3. ScrollTrigger Setup
  useEffect(() => {
    if (!sectionRef.current || !pinContainerRef.current) return;

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=6000', // Pinned scroll depth
      pin: pinContainerRef.current,
      pinSpacing: true,
      scrub: 0.5,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress; // 0 to 1
        setOverallProgress(p);

        if (p < 0.18) {
          // PHASE A: Frame 1 to 17
          const phaseProgress = p / 0.18; // 0 to 1
          const frame = Math.min(17, Math.max(1, Math.floor(1 + phaseProgress * 16.99)));

          setCurrentFrameIndex(frame);
          drawFrame(frame);

          // Intro fades out as we approach frame 16-17
          const introFade = phaseProgress > 0.7 ? 1 - (phaseProgress - 0.7) / 0.3 : 1;
          setIntroOpacity(Math.max(0, introFade));
          setIntroTranslateX(-phaseProgress * 25);

          setActiveProjectIndex(-1);
          setCardDeckScrollPos(0);
          setProjectProgress(0);
          setPanelOpacity(0);
        } else if (p >= 0.18 && p < 0.28) {
          // PHASE B: Frame 18 to 23 + Project 01 Reveal
          const phaseProgress = (p - 0.18) / 0.10; // 0 to 1
          const frame = Math.min(23, Math.max(18, Math.floor(18 + phaseProgress * 5.99)));

          setCurrentFrameIndex(frame);
          drawFrame(frame);

          setIntroOpacity(0);
          setActiveProjectIndex(0); // Project 01
          setCardDeckScrollPos(0);
          setProjectProgress(phaseProgress); // 0 to 1
          setPanelOpacity(phaseProgress);
        } else {
          // PHASE C: After Frame 23 -> LOCKED AT FRAME 23 (HORIZONTAL STACKED CARDS SLIDE)
          setCurrentFrameIndex(23);
          drawFrame(23);

          setIntroOpacity(0);
          setProjectProgress(1);
          setPanelOpacity(1);

          // Projects 01 -> 08 mapping (8 projects)
          const phaseProgress = (p - 0.28) / 0.72; // 0 to 1
          const totalProjects = SERVICES_DATA.length; // 8

          // Smooth continuous float from 0.0 to 7.0
          const continuousScroll = Math.min(totalProjects - 1, Math.max(0, phaseProgress * (totalProjects - 1)));
          setCardDeckScrollPos(continuousScroll);

          const projectIdx = Math.min(totalProjects - 1, Math.max(0, Math.round(continuousScroll)));
          setActiveProjectIndex(projectIdx);
        }
      }
    });

    return () => {
      st.kill();
    };
  }, []);

  const scrollToProject = (targetIndex) => {
    if (!sectionRef.current) return;
    const totalProjects = SERVICES_DATA.length;
    // Map project index (0..7) to overall scroll progress in StorytellingSection
    // Phase C runs from p = 0.28 to 1.0 (range 0.72)
    const targetProgress = 0.28 + (targetIndex / (totalProjects - 1)) * 0.72;
    
    // Calculate page scroll position
    const sectionTop = sectionRef.current.offsetTop;
    const sectionScrollLength = 6000; // end: '+=6000'
    const targetScrollY = sectionTop + targetProgress * sectionScrollLength;
    
    window.scrollTo({
      top: targetScrollY,
      behavior: 'smooth'
    });
  };

  const activeProject = activeProjectIndex >= 0 ? SERVICES_DATA[activeProjectIndex] : null;
  const currentTheme = activeProjectIndex >= 0 ? PROJECT_THEMES[activeProjectIndex % PROJECT_THEMES.length] : PROJECT_THEMES[0];

  return (
    <section className="storytelling-wrapper" ref={sectionRef} id="story-section">
      <div className="storytelling-pin" ref={pinContainerRef}>
        {/* Modern Tech Background Ambient Effects */}
        <div className="tech-bg-canvas">
          <div className="tech-grid-mesh"></div>
          <div className="tech-glow-orb tech-glow-left"></div>
          <div className="tech-glow-orb tech-glow-right"></div>
          <div className="tech-glow-orb tech-glow-bottom"></div>
          <SpaceMotifs />
        </div>

        {/* Global Journey Progress Bar */}
        <div className="story-progress-indicator">
          <div className="story-progress-fill" style={{ width: `${overallProgress * 100}%` }}></div>
        </div>

        <div className="story-inner-full">
          {/* Main 2-Column Split: LEFT = HERO ROBOT, RIGHT = CONTENT */}
          <div className="story-split-grid">

            {/* LEFT HALF: Hero Robot Character Full-Screen Canvas */}
            <div className="story-hero-left-col">
              <div className="robot-canvas-stage">
                {/* Instant fallback frame placeholder */}
                <img
                  src={`/robot-frames/ezgif-frame-${String(currentFrameIndex).padStart(3, '0')}.png`}
                  alt="DUDI Robot"
                  className="robot-img-fallback"
                  style={{ display: imagesLoaded ? 'none' : 'block' }}
                />

                {/* Full-size Frame Canvas */}
                <canvas
                  ref={canvasRef}
                  className="robot-hero-canvas"
                />
              </div>
            </div>

            {/* RIGHT HALF: Content Area (Intro & 8 Projects) */}
            <div className="story-content-right-col">

              {/* STATE 1: PHASE A - DUDI COMPANY INTRODUCTION */}
              <div
                className={`story-intro-panel ${activeProjectIndex === -1 ? 'active' : 'inactive'}`}
                style={{
                  opacity: introOpacity,
                  transform: `translateX(${introTranslateX}px)`,
                  pointerEvents: activeProjectIndex === -1 ? 'auto' : 'none',
                  display: activeProjectIndex === -1 ? 'flex' : 'none'
                }}
              >
                <h2 className="story-title">
                  Kiến Tạo Hệ Sinh Thái <br />
                  <span className="gradient-tech-text">Phần Mềm & Số Hóa Toàn Diện</span>
                </h2>

                <p className="story-desc">
                  DUDI Software đồng hành cùng doanh nghiệp từ thiết kế website, landing page tối ưu chuyển đổi
                  đến bảo trì hệ thống và SEO kỹ thuật chuyên sâu. Mỗi giải pháp được tối ưu để mang lại
                  hiệu quả kinh doanh thực chiến cao nhất.
                </p>
              </div>

              {/* STATE 2 & 3: PHASE B & C - 8 STACKED HORIZONTAL SLIDING CARDS */}
              {activeProject && (
                <div
                  className="story-project-panel active"
                  style={{
                    opacity: panelOpacity,
                    willChange: 'transform, opacity'
                  }}
                >
                  {/* Horizontal Stacked Card Deck */}
                  <div className="stacked-deck-container">
                    {SERVICES_DATA.map((project, idx) => {
                      const theme = PROJECT_THEMES[idx % PROJECT_THEMES.length];
                      const delta = idx - cardDeckScrollPos; // relative offset to current scroll position

                      // 3D Horizontal Stacked Slider calculations
                      let tx = 0;
                      let ty = 0;
                      let sc = 1;
                      let op = 1;
                      let rot = 0;
                      let zIdx = 100 - idx;
                      let filter = 'none';
                      let isClickable = false;

                      if (delta < -0.05) {
                        // Past card: slides out smoothly to the left
                        tx = delta * 450;
                        ty = Math.abs(delta) * 10;
                        sc = Math.max(0.74, 1 + delta * 0.12);
                        rot = delta * 6;
                        op = Math.max(0, 1 + delta * 1.5);
                        zIdx = 50 + idx;
                        filter = `brightness(${Math.max(0.7, 1 + delta * 0.3)})`;
                        isClickable = delta > -1.2;
                      } else if (delta <= 0.05) {
                        // Active foreground card
                        tx = delta * 450;
                        ty = 0;
                        sc = 1;
                        rot = delta * 6;
                        op = 1;
                        zIdx = 100;
                        filter = 'brightness(1)';
                        isClickable = true;
                      } else {
                        // Upcoming stacked cards: layered to the right behind the active card
                        const stackDist = Math.min(delta, 3.2);
                        tx = stackDist * 46; // prominent horizontal stack offset to right
                        ty = -stackDist * 6; // slightly stepped up for clean stacking
                        sc = Math.max(0.76, 1 - stackDist * 0.068); // progressively scaled down
                        rot = stackDist * 2.2; // subtle fan-out rotation
                        op = delta > 3.2 ? 0 : Math.max(0, 1 - stackDist * 0.22); // smooth fade for deep stack
                        zIdx = 100 - idx;
                        filter = `brightness(${Math.max(0.72, 1 - stackDist * 0.09)})`;
                        isClickable = delta < 2.5;
                      }

                      if (op <= 0.01) return null;

                      return (
                        <div
                          key={project.id}
                          className={`hero-app-sample-card stacked-deck-card ${idx === activeProjectIndex ? 'is-active' : 'is-stacked'}`}
                          style={{
                            background: theme.bgGradient,
                            boxShadow: theme.cardShadow,
                            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${sc}) rotate(${rot}deg)`,
                            opacity: op,
                            zIndex: zIdx,
                            filter,
                            cursor: idx !== activeProjectIndex && isClickable ? 'pointer' : 'default',
                            pointerEvents: isClickable ? 'auto' : 'none'
                          }}
                          onClick={() => {
                            if (idx !== activeProjectIndex && isClickable) {
                              scrollToProject(idx);
                            }
                          }}
                        >
                          {/* Top Half: Full-Width Image Stage with Curved Arc Bottom */}
                          <div className="card-top-image-stage">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="stage-cover-img"
                              style={{
                                objectPosition: project.imagePosition || 'center'
                              }}
                              onError={(e) => {
                                if (project.fallbackImage) {
                                  e.currentTarget.src = project.fallbackImage;
                                }
                              }}
                            />

                            <div className="stage-theme-overlay"></div>

                            <div className="stage-radar-overlay">
                              <div className="stage-ring ring-3"></div>
                              <div className="stage-ring ring-2"></div>
                              <div className="stage-ring ring-1"></div>
                            </div>
                          </div>

                          {/* Bottom Half: Clean White Content Sheet */}
                          <div className="card-bottom-sheet">
                            <div className="sheet-info">
                              <h3 className="sheet-title">{project.title}</h3>
                              <p className="sheet-subtitle">
                                {project.badge || '32MB'}
                              </p>
                            </div>

                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="sheet-install-btn"
                              style={{
                                background: theme.accentColor,
                                boxShadow: `0 4px 15px ${theme.accentColor}66`
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>Truy cập trang web</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
