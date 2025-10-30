/**
 * 🎨 렌더링 시스템
 *
 * 화면에 모든 것을 그립니다.
 * 노트, 이펙트, 애니메이션 등!
 */

import { CHARACTER_SIZE, CHARACTER_SPACING, MAX_DPR } from '../config/settings.js';
import { effects } from './effects.js';
import { animations } from './animations.js';

let canvas = null;
let ctx = null;

const W = () => canvas.clientWidth || 480;
const H = () => canvas.clientHeight || 720;

/**
 * 캔버스 초기화
 */
export function initCanvas(canvasElement) {
  canvas = canvasElement;
  ctx = canvas.getContext('2d', { alpha: true });

  fitCanvas();
  new ResizeObserver(fitCanvas).observe(canvas);
  window.addEventListener('orientationchange', fitCanvas);
  window.addEventListener('load', fitCanvas);

  return { canvas, ctx };
}

// 별칭
export const initRenderer = initCanvas;

/**
 * 캔버스 크기 조정
 */
function fitCanvas() {
  const rectW = canvas.clientWidth;
  const rectH = canvas.clientHeight;
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, MAX_DPR));
  canvas.width = Math.round(rectW * dpr);
  canvas.height = Math.round(rectH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * 메인 렌더 함수
 * @param {Array} characters - 캐릭터 배열
 * @param {number} currentTime - 현재 시간
 */
export function render(characters, currentTime) {
  fitCanvas();
  const w = W();
  const h = H();
  const centerX = w * 0.5;

  ctx.clearRect(0, 0, w, h);

  // 배경
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(255,255,255,0.03)');
  g.addColorStop(1, 'rgba(255,255,255,0.00)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // 플래시 효과
  if (effects.hitFlash.a > 0) {
    ctx.save();
    ctx.globalAlpha = effects.hitFlash.a * 0.3;
    ctx.fillStyle = effects.hitFlash.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 캐릭터들 (한 줄로 배치)
  const startY = 100; // 시작 Y 위치
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    const y = startY + (i * CHARACTER_SPACING);
    character.draw(ctx, currentTime, centerX, y);
  }

  // 파티클
  for (const p of effects.particles) {
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

  // 플로팅 텍스트
  for (const t of effects.floatTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, t.a));
    ctx.fillStyle = t.color;
    ctx.font = `900 ${t.size}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }

  // 망치
  if (animations.hammer.active) {
    renderHammer(w);
  }

  // 기계팔
  if (animations.robotArm.active) {
    renderRobotArm(w);
  }
}

function renderHammer(w) {
  const anim = animations.hammer;
  ctx.save();
  const progress = Math.min(1, anim.progress);
  const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

  const hammerY = anim.y - 80 + (easeProgress * 80);
  const hammerX = anim.x;
  ctx.globalAlpha = 1 - progress * 0.3;

  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hammerX, hammerY - 30);
  ctx.lineTo(hammerX, hammerY + 10);
  ctx.stroke();

  ctx.fillStyle = '#666';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  roundRectFill(hammerX - 20, hammerY - 50, 40, 20, 4);
  ctx.restore();
}

function renderRobotArm(w) {
  const anim = animations.robotArm;
  ctx.save();
  const progress = Math.min(1, anim.progress);
  const armX = w + 50 - (progress * (w * 0.3 + 50));
  const armY = anim.y;
  ctx.globalAlpha = 1 - progress * 0.5;

  ctx.strokeStyle = '#2b78ff';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(w, armY - 20);
  ctx.lineTo(armX + 30, armY - 20);
  ctx.stroke();

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

  ctx.fillStyle = '#2b78ff';
  ctx.shadowColor = 'rgba(43,120,255,0.6)';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(armX + 30, armY - 20, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

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
