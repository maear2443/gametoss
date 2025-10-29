/**
 * 🔨 애니메이션 시스템
 *
 * 망치와 기계팔 애니메이션을 관리합니다.
 * 속도를 바꾸려면 settings.js의 ANIMATION_SPEED를 수정하세요!
 */

import { ANIMATION_SPEED } from '../config/settings.js';

// 애니메이션 상태
export const animations = {
  hammer: {
    active: false,
    progress: 0,
    x: 0,
    y: 0
  },
  robotArm: {
    active: false,
    progress: 0,
    x: 0,
    y: 0
  }
};

/**
 * 망치 애니메이션 시작 (거절 시)
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 */
export function startHammer(x, y) {
  animations.hammer.active = true;
  animations.hammer.progress = 0;
  animations.hammer.x = x;
  animations.hammer.y = y;
}

/**
 * 기계팔 애니메이션 시작 (승인 시)
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 */
export function startRobotArm(x, y) {
  animations.robotArm.active = true;
  animations.robotArm.progress = 0;
  animations.robotArm.x = x;
  animations.robotArm.y = y;
}

/**
 * 애니메이션 업데이트
 * @param {number} dt - 델타 타임 (초)
 */
export function updateAnimations(dt) {
  // 망치 애니메이션
  if (animations.hammer.active) {
    animations.hammer.progress += dt * ANIMATION_SPEED.HAMMER;
    if (animations.hammer.progress >= 1) {
      animations.hammer.active = false;
    }
  }

  // 기계팔 애니메이션
  if (animations.robotArm.active) {
    animations.robotArm.progress += dt * ANIMATION_SPEED.ROBOT_ARM;
    if (animations.robotArm.progress >= 1) {
      animations.robotArm.active = false;
    }
  }
}

/**
 * 애니메이션 리셋
 */
export function resetAnimations() {
  animations.hammer.active = false;
  animations.robotArm.active = false;
}
