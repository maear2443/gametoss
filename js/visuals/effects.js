/**
 * ✨ 이펙트 시스템
 *
 * 파티클, 플래시, 링, 플로팅 텍스트 등
 * 화려한 시각 효과를 여기서 관리!
 */

import { GRAVITY, PARTICLE_COUNT } from '../config/settings.js';

// 이펙트 저장소
export const effects = {
  hitFlash: { a: 0, color: '#ffffff' },  // 라인 플래시
  ring: { a: 0, r: 0, color: '#ffffff' }, // 확산 링
  particles: [],      // 파티클 배열
  floatTexts: []      // 플로팅 텍스트 배열
};

/**
 * 히트 플래시 시작
 * @param {string} color - 색상
 */
export function startHitFlash(color) {
  effects.hitFlash.a = 0.6;
  effects.hitFlash.color = color;
}

/**
 * 확산 링 시작
 * @param {string} color - 색상
 */
export function startRing(color) {
  effects.ring.a = 1.0;
  effects.ring.r = 0;
  effects.ring.color = color;
}

/**
 * 파티클 생성
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {string} judgment - 판정 ('PERFECT', 'GREAT', 'GOOD')
 * @param {string} color - 색상
 */
export function createParticles(x, y, judgment, color) {
  const count = PARTICLE_COUNT[judgment] || 12;

  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 180 + Math.random() * 200; // px/s

    effects.particles.push({
      x,
      y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd - 120,
      life: 0.7 + Math.random() * 0.5,
      a: 1,
      color
    });
  }
}

/**
 * 플로팅 텍스트 생성
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {string} text - 텍스트
 * @param {string} color - 색상
 * @param {number} size - 크기
 */
export function createFloatText(x, y, text, color, size) {
  effects.floatTexts.push({
    x,
    y,
    vy: -60, // px/s
    life: 0.85,
    a: 1,
    text,
    color,
    size
  });
}

/**
 * 모든 이펙트 업데이트
 * @param {number} dt - 델타 타임 (초)
 */
export function updateEffects(dt) {
  // 히트 플래시 페이드
  if (effects.hitFlash.a > 0) {
    effects.hitFlash.a = Math.max(0, effects.hitFlash.a - dt * 2.5);
  }

  // 확산 링
  if (effects.ring.a > 0) {
    effects.ring.r += dt * 260;
    effects.ring.a = Math.max(0, effects.ring.a - dt * 2.0);
  }

  // 파티클 업데이트
  for (let i = effects.particles.length - 1; i >= 0; i--) {
    const p = effects.particles[i];
    p.life -= dt;
    p.a = Math.max(0, p.life / 1.0);
    p.vy += GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (p.life <= 0) {
      effects.particles.splice(i, 1);
    }
  }

  // 플로팅 텍스트 업데이트
  for (let i = effects.floatTexts.length - 1; i >= 0; i--) {
    const t = effects.floatTexts[i];
    t.life -= dt;
    t.a = Math.max(0, t.life / 0.85);
    t.y += t.vy * dt;

    if (t.life <= 0) {
      effects.floatTexts.splice(i, 1);
    }
  }
}

/**
 * 모든 이펙트 리셋
 */
export function resetEffects() {
  effects.hitFlash.a = 0;
  effects.ring.a = 0;
  effects.ring.r = 0;
  effects.particles.length = 0;
  effects.floatTexts.length = 0;
}
