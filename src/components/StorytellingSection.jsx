import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES_DATA } from '../data/servicesData';
import {
  ArrowUpRight,
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 23;
const FRAME_PATHS = Array.from({ length: TOTAL_FRAMES }, (_, i) => {
  const pad = String(i + 1).padStart(3, '0');
  return `/robot-frames/ezgif-frame-${pad}.png`;
});

export const StorytellingSection = () => {
  const sectionRef = useRef(null);
  const pinContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const imagesRef = useRef([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // State for content presentation
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [activeProjectIndex, setActiveProjectIndex] = useState(-1);
  const [projectProgress, setProjectProgress] = useState(0); // 0 to 1 reveal for Project 01 in Phase B
  const [introOpacity, setIntroOpacity] = useState(1);
  const [introTranslateX, setIntroTranslateX] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [panelOpacity, setPanelOpacity] = useState(1);
  const [panelTranslateY, setPanelTranslateY] = useState(0);
  const [panelScale, setPanelScale] = useState(1);

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

        /* =========================================================================
           SCROLL PROGRESS DIVISION:
           Phase A (p: 0.00 -> 0.18): Frames 1 -> 17 (Intro visible, Character turns)
           Phase B (p: 0.18 -> 0.28): Frames 18 -> 23 (Character turns, Project 01 reveals)
           Phase C (p: 0.28 -> 1.00): Frame 23 LOCKED (Character stays fixed, Projects 1-8 cycle)
           ========================================================================= */

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
          setProjectProgress(phaseProgress); // 0 to 1
          setPanelOpacity(phaseProgress);
          setPanelTranslateY((1 - phaseProgress) * 30);
          setPanelScale(0.95 + phaseProgress * 0.05);
        } else {
          // PHASE C: After Frame 23 -> LOCKED AT FRAME 23
          setCurrentFrameIndex(23);
          drawFrame(23);

          setIntroOpacity(0);
          setProjectProgress(1);

          // Projects 01 -> 08 mapping (8 projects)
          const phaseProgress = (p - 0.28) / 0.72; // 0 to 1
          const totalProjects = SERVICES_DATA.length; // 8

          const rawIndex = phaseProgress * totalProjects;
          const projectIdx = Math.min(totalProjects - 1, Math.max(0, Math.floor(rawIndex)));
          const itemOffset = rawIndex - projectIdx; // 0.0 to 1.0 within the current project

          setActiveProjectIndex(projectIdx);

          // Continuous scroll interpolation for smooth page transitions
          let op = 1;
          let ty = 0;
          let sc = 1;

          if (itemOffset < 0.18 && projectIdx > 0) {
            // Smooth entrance from below
            const enterP = itemOffset / 0.18;
            op = enterP;
            ty = (1 - enterP) * 32;
            sc = 0.94 + enterP * 0.06;
          } else if (itemOffset > 0.82 && projectIdx < totalProjects - 1) {
            // Smooth exit gliding up
            const exitP = (itemOffset - 0.82) / 0.18;
            op = 1 - exitP;
            ty = -exitP * 32;
            sc = 1 + exitP * 0.04;
          }

          setPanelOpacity(op);
          setPanelTranslateY(ty);
          setPanelScale(sc);
        }
      }
    });

    return () => {
      st.kill();
    };
  }, []);

  const activeProject = activeProjectIndex >= 0 ? SERVICES_DATA[activeProjectIndex] : null;

  return (
    <section className="storytelling-wrapper" ref={sectionRef} id="story-section">
      <div className="storytelling-pin" ref={pinContainerRef}>
        {/* Full-size Fixed Background Image (Zero scroll, full display, sharp) */}
        <img
          src="/images/71a06d45-b769-4910-b039-e4d1fb3ca484.png"
          alt="DUDI Background"
          className="story-bg-image-fixed"
        />

        {/* Global Journey Progress Bar */}
        <div className="story-progress-indicator">
          <div className="story-progress-fill" style={{ width: `${overallProgress * 100}%` }}></div>
        </div>

        <div className="story-inner-full">
          {/* Main 2-Column Split: LEFT = HERO ROBOT (TOÀN MÀN HÌNH BÊN TRÁI), RIGHT = NỘI DUNG NỬA BÊN PHẢI */}
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

              {/* STATE 2 & 3: PHASE B & C - 8 PROJECTS SHOWCASE */}
              {activeProject && (
                <div
                  key={activeProject.id}
                  className="story-project-panel active"
                  style={{
                    opacity: panelOpacity,
                    transform: `translateY(${panelTranslateY}px) scale(${panelScale})`,
                    transformOrigin: 'center center',
                    willChange: 'transform, opacity'
                  }}
                >
                  {/* Top Header Banner Above Card */}
                  <div className="project-top-banner animate-enter-1">
                    <div className="project-step-header">
                      <span className="project-counter-pill">
                        <span className="counter-current">{String(activeProjectIndex + 1).padStart(2, '0')}</span>
                        <span className="counter-sep">/</span>
                        <span className="counter-total">{String(SERVICES_DATA.length).padStart(2, '0')}</span>
                      </span>
                      {activeProject.categoryName && (
                        <span className="project-category-badge">
                          <Sparkles size={11} className="cat-sparkle-icon" />
                          {activeProject.categoryName}
                        </span>
                      )}
                      {activeProject.badge && (
                        <span className="project-price-badge">
                          {activeProject.badge}
                        </span>
                      )}
                    </div>

                    {/* Project Headline / Title */}
                    <h2 className="project-headline">
                      {activeProject.title}
                    </h2>
                  </div>

                  {/* 2-Column Split Glassmorphic Preview Card */}
                  <div className="project-split-card animate-enter-2">
                    
                    {/* LEFT HALF: Image Preview */}
                    <div className="card-left-media">
                      <div className="card-image-wrap">
                        <img
                          src={activeProject.image}
                          alt={activeProject.title}
                          className="card-preview-img"
                          style={{
                            objectPosition: activeProject.imagePosition || 'center'
                          }}
                          onError={(e) => {
                            if (activeProject.fallbackImage) {
                              e.currentTarget.src = activeProject.fallbackImage;
                            }
                          }}
                        />
                        <div className="card-image-overlay"></div>

                        {/* Floating Red Arrow Button (Top Right of Image) */}
                        <a
                          href={activeProject.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="preview-float-arrow-btn"
                          aria-label="Truy cập trang web"
                        >
                          <ArrowUpRight size={18} />
                        </a>
                      </div>
                    </div>

                    {/* RIGHT HALF: Website & Service Information */}
                    <div className="card-right-info">
                      {/* Description */}
                      <p className="card-desc-text">
                        {activeProject.description}
                      </p>

                      {/* Key Features Bullets */}
                      {activeProject.features && activeProject.features.length > 0 && (
                        <div className="card-features-box">
                          {activeProject.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="card-feature-row">
                              <CheckCircle2 size={13} className="feature-check-icon" />
                              <span>{feat.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* CTA Actions (Below the Card) */}
                  <div className="project-actions-row animate-enter-4">
                    <a
                      href={activeProject.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-project-primary"
                    >
                      <span>Truy Cập Trang Web</span>
                      <ExternalLink size={15} />
                    </a>
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
