/**
 * 렌더링 모듈
 * 캔버스에 게임을 그립니다
 */

import { CONFIG } from './config.js';
import { animations } from './animations.js';

// 캔버스와 컨텍스트
let canvas = null;
let ctx = null;

// 유틸리티 함수
const W = () => canvas.clientWidth || 480;
const H = () => canvas.clientHeight || 720;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.max(0, Math.min(1, x));

/**
 * 캔버스 초기화
 */
export function initRenderer(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d', { alpha: true });

  // DPR 대응
  fitCanvas();
  new ResizeObserver(fitCanvas).observe(canvas);
  window.addEventListener('orientationchange', fitCanvas);
  window.addEventListener('load', fitCanvas);

  return { canvas, ctx };
}

/**
 * 캔버스 크기 조정
 */
function fitCanvas() {
  const rectW = canvas.clientWidth;
  const rectH = canvas.clientHeight;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, CONFIG.MAX_DPR));
  canvas.width = Math.round(rectW * dpr);
  canvas.height = Math.round(rectH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * 게임 렌더링
 */
export function render(gameState, now) {
  fitCanvas();
  const w = W();
  const h = H();
  const hitY = h - CONFIG.HIT_LINE_OFFSET;
  const laneX = w * 0.5;

  ctx.clearRect(0, 0, w, h);

  // 배경 그라데이션
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,255,255,0.03)');
  g.addColorStop(1, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 라인 플래시
  if (animations.hitFlash.a > 0) {
    ctx.save();
    ctx.globalAlpha = animations.hitFlash.a * 0.45;
    ctx.fillStyle = animations.hitFlash.color;
    ctx.fillRect(0, hitY - 4, w, 8);
    ctx.restore();
  }

  // 판정 라인
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, hitY);
  ctx.lineTo(w, hitY);
  ctx.stroke();

  // 타겟 가이드 박스
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 3;
  roundRectStroke(laneX - CONFIG.NOTE_SIZE/2 - 8, hitY - CONFIG.NOTE_SIZE/2 - 8,
                   CONFIG.NOTE_SIZE + 16, CONFIG.NOTE_SIZE + 16, 10);

  // 확산 링
  if (animations.ring.a > 0) {
    ctx.save();
    ctx.globalAlpha = animations.ring.a * 0.9;
    ctx.strokeStyle = animations.ring.color;
    ctx.lineWidth = 2.5;
    roundRectStroke(
      laneX - (CONFIG.NOTE_SIZE/2 + 8 + animations.ring.r/2),
      hitY - (CONFIG.NOTE_SIZE/2 + 8 + animations.ring.r/2),
      CONFIG.NOTE_SIZE + 16 + animations.ring.r,
      CONFIG.NOTE_SIZE + 16 + animations.ring.r,
      14
    );
    ctx.restore();
  }

  // 노트 렌더링
  renderNotes(gameState.notes, now, laneX, hitY);

  // 파티클 렌더링
  renderParticles();

  // 플로팅 텍스트 렌더링
  renderFloatTexts();

  // 망치 애니메이션
  renderHammer(w, hitY);

  // 기계팔 애니메이션
  renderRobotArm(w, hitY);
}

/**
 * 노트 렌더링
 */
function renderNotes(notes, now, laneX, hitY) {
  for (const n of notes) {
    const t = clamp01((now - n.spawnT) / n.approachTime);
    const y = lerp(CONFIG.NOTE_START_Y, hitY, t);

    const baseColor = n.color === 'red' ? CONFIG.COLORS.red : CONFIG.COLORS.blue;
    ctx.save();

    const timeToHit = Math.abs((now - n.hitT) * 1000);
    const pulse = timeToHit < 80 ? 1 + (80 - timeToHit) / 400 : 1;
    const size = CONFIG.NOTE_SIZE * pulse;

    // 캐릭터 이미지가 있으면 이미지 렌더링
    if (n.characterImg) {
      ctx.shadowColor = n.color === 'red' ? 'rgba(229,57,80,0.45)' : 'rgba(43,120,255,0.45)';
      ctx.shadowBlur = 18;

      const imgWidth = 64 * pulse;
      const imgHeight = 48 * pulse;
      ctx.drawImage(n.characterImg, laneX - imgWidth/2, y - imgHeight/2, imgWidth, imgHeight);
    } else {
      // 기본 박스
      ctx.shadowColor = n.color === 'red' ? 'rgba(229,57,80,0.45)' : 'rgba(43,120,255,0.45)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = baseColor;
      roundRectFill(laneX - size/2, y - size/2, size, size, 10);

      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      roundRectStroke(laneX - size/2, y - size/2, size, size, 10);
    }

    // 판정된 노트 페이드
    if (n.judged) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.25;
      if (n.characterImg) {
        const imgWidth = 64 * pulse;
        const imgHeight = 48 * pulse;
        ctx.fillRect(laneX - imgWidth/2, y - imgHeight/2, imgWidth, imgHeight);
      } else {
        roundRectFill(laneX - size/2, y - size/2, size, size, 10);
      }
    }
    ctx.restore();
  }
}

/**
 * 파티클 렌더링
 */
function renderParticles() {
  for (const p of animations.particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, p.a));
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * 플로팅 텍스트 렌더링
 */
function renderFloatTexts() {
  for (const t of animations.floatTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, t.a));
    ctx.fillStyle = t.color;
    ctx.font = `900 ${t.size}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

/**
 * 망치 애니메이션 렌더링
 */
function renderHammer(w, hitY) {
  if (!animations.hammer.active) return;

  ctx.save();
  const progress = Math.min(1, animations.hammer.progress);
  const easeProgress = progress < 0.5
    ? 2 * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  const hammerY = animations.hammer.y - 80 + (easeProgress * 80);
  const hammerX = animations.hammer.x;

  ctx.globalAlpha = 1 - progress * 0.3;

  // 망치 손잡이
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hammerX, hammerY - 30);
  ctx.lineTo(hammerX, hammerY + 10);
  ctx.stroke();

  // 망치 머리
  ctx.fillStyle = '#666';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  roundRectFill(hammerX - 20, hammerY - 50, 40, 20, 4);

  ctx.restore();
}

/**
 * 기계팔 애니메이션 렌더링
 */
function renderRobotArm(w, hitY) {
  if (!animations.robotArm.active) return;

  ctx.save();
  const progress = Math.min(1, animations.robotArm.progress);

  const armX = w + 50 - (progress * (w * 0.3 + 50));
  const armY = animations.robotArm.y;

  ctx.globalAlpha = 1 - progress * 0.5;

  // 기계팔 몸통
  ctx.strokeStyle = '#2b78ff';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w, armY - 20);
  ctx.lineTo(armX + 30, armY - 20);
  ctx.stroke();

  // 기계팔 집게
  ctx.strokeStyle = '#1440a6';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(armX + 30, armY - 30);
  ctx.lineTo(armX + 20, armY - 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(armX + 30, armY - 10);
  ctx.lineTo(armX + 20, armY - 30);
  ctx.stroke();

  // 기계팔 관절
  ctx.fillStyle = '#2b78ff';
  ctx.shadowColor = 'rgba(43,120,255,0.6)';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(armX + 30, armY - 20, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 둥근 사각형 그리기 유틸리티
 */
function roundRectFill(x, y, w, h, r) {
  ctx.beginPath();
  roundedPath(x, y, w, h, r);
  ctx.fill();
}

function roundRectStroke(x, y, w, h, r) {
  ctx.beginPath();
  roundedPath(x, y, w, h, r);
  ctx.stroke();
}

function roundedPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
