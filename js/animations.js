/**
 * 애니메이션 모듈
 * 망치, 기계팔, 파티클, 플로팅 텍스트 등을 관리합니다
 */

import { CONFIG } from './config.js';

// 애니메이션 상태
export const animations = {
  // 망치 애니메이션 (거절 시)
  hammer: {
    active: false,
    progress: 0,
    x: 0,
    y: 0
  },

  // 기계팔 애니메이션 (승인 시)
  robotArm: {
    active: false,
    progress: 0,
    x: 0,
    y: 0
  },

  // 히트 플래시
  hitFlash: {
    a: 0,
    color: '#ffffff'
  },

  // 확산 링
  ring: {
    a: 0,
    r: 0,
    color: '#ffffff'
  },

  // 파티클
  particles: [],

  // 플로팅 텍스트
  floatTexts: []
};

/**
 * 망치 애니메이션 시작
 */
export function startHammerAnimation(x, y) {
  animations.hammer.active = true;
  animations.hammer.progress = 0;
  animations.hammer.x = x;
  animations.hammer.y = y;
}

/**
 * 기계팔 애니메이션 시작
 */
export function startRobotArmAnimation(x, y) {
  animations.robotArm.active = true;
  animations.robotArm.progress = 0;
  animations.robotArm.x = x;
  animations.robotArm.y = y;
}

/**
 * 히트 플래시 시작
 */
export function startHitFlash(color) {
  animations.hitFlash.a = 0.6;
  animations.hitFlash.color = color;
}

/**
 * 확산 링 시작
 */
export function startRing(color) {
  animations.ring.a = 1.0;
  animations.ring.r = 0;
  animations.ring.color = color;
}

/**
 * 파티클 생성
 */
export function createParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = 180 + Math.random() * 200; // px/s
    animations.particles.push({
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
 */
export function createFloatText(x, y, text, color, size) {
  animations.floatTexts.push({
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
 * 모든 애니메이션 업데이트
 */
export function updateAnimations(dt) {
  // 히트 플래시
  if (animations.hitFlash.a > 0) {
    animations.hitFlash.a = Math.max(0, animations.hitFlash.a - dt * 2.5);
  }

  // 확산 링
  if (animations.ring.a > 0) {
    animations.ring.r += dt * 260;
    animations.ring.a = Math.max(0, animations.ring.a - dt * 2.0);
  }

  // 망치 애니메이션
  if (animations.hammer.active) {
    animations.hammer.progress += dt * CONFIG.ANIMATION_SPEED.HAMMER;
    if (animations.hammer.progress >= 1) {
      animations.hammer.active = false;
    }
  }

  // 기계팔 애니메이션
  if (animations.robotArm.active) {
    animations.robotArm.progress += dt * CONFIG.ANIMATION_SPEED.ROBOT_ARM;
    if (animations.robotArm.progress >= 1) {
      animations.robotArm.active = false;
    }
  }

  // 파티클 업데이트
  for (let i = animations.particles.length - 1; i >= 0; i--) {
    const p = animations.particles[i];
    p.life -= dt;
    p.a = Math.max(0, p.life / 1.0);
    p.vy += CONFIG.GRAVITY * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.life <= 0) {
      animations.particles.splice(i, 1);
    }
  }

  // 플로팅 텍스트 업데이트
  for (let i = animations.floatTexts.length - 1; i >= 0; i--) {
    const t = animations.floatTexts[i];
    t.life -= dt;
    t.a = Math.max(0, t.life / 0.85);
    t.y += t.vy * dt;
    if (t.life <= 0) {
      animations.floatTexts.splice(i, 1);
    }
  }
}

/**
 * 모든 애니메이션 초기화
 */
export function resetAnimations() {
  animations.hammer.active = false;
  animations.robotArm.active = false;
  animations.hitFlash.a = 0;
  animations.ring.a = 0;
  animations.ring.r = 0;
  animations.particles.length = 0;
  animations.floatTexts.length = 0;
}
