/**
 * 🎭 Character 클래스
 *
 * 변화하는 인형 캐릭터를 나타냅니다.
 * 1단계 → 2단계 → 3단계로 변화하며, 각 단계마다 다른 이미지를 표시합니다.
 */

import { CHARACTER_SIZE, STAGE_DURATIONS, COLORS } from '../config/settings.js';

export class Character {
  /**
   * 캐릭터 생성
   * @param {string} color - 'red' 또는 'blue'
   * @param {string} characterType - 캐릭터 종류 ('bear', 'cat', etc)
   * @param {number} spawnTime - 생성 시간 (초)
   * @param {number} position - 화면에서의 위치 (0-6)
   * @param {number} bpm - 현재 BPM
   * @param {Object} images - 이미지 객체 {stage1, stage2, stage3}
   */
  constructor(color, characterType, spawnTime, position, bpm, images) {
    this.color = color;                 // 'red' 또는 'blue'
    this.characterType = characterType; // 'bear', 'cat', etc
    this.spawnTime = spawnTime;         // 생성 시간
    this.position = position;           // 위치 (0-6)
    this.bpm = bpm;                     // BPM

    // 이미지
    this.images = images || { stage1: null, stage2: null, stage3: null };

    // 단계 타이밍 계산 (비트 → 초)
    const beatDuration = 60 / this.bpm;
    this.stage1EndTime = spawnTime + (STAGE_DURATIONS.stage1 * beatDuration);
    this.stage2EndTime = this.stage1EndTime + (STAGE_DURATIONS.stage2 * beatDuration);
    this.stage3EndTime = this.stage2EndTime + (STAGE_DURATIONS.stage3 * beatDuration);

    // 상태
    this.judged = false;  // 판정되었나?
    this.result = null;   // 판정 결과
  }

  /**
   * 현재 단계 계산
   * @param {number} currentTime - 현재 시간 (초)
   * @returns {number} 1, 2, 3, 또는 4 (4는 시간 초과)
   */
  getStage(currentTime) {
    if (currentTime < this.stage1EndTime) {
      return 1;
    } else if (currentTime < this.stage2EndTime) {
      return 2;
    } else if (currentTime < this.stage3EndTime) {
      return 3;
    } else {
      return 4; // 시간 초과 (MISS 처리)
    }
  }

  /**
   * 현재 이미지 가져오기
   * @param {number} currentTime - 현재 시간
   * @returns {Image|null}
   */
  getImage(currentTime) {
    const stage = this.getStage(currentTime);
    if (stage === 1) return this.images.stage1;
    if (stage === 2) return this.images.stage2;
    if (stage === 3) return this.images.stage3;
    return this.images.stage3; // 시간 초과도 stage3 이미지
  }

  /**
   * 단계 진행률 (펄스 효과용)
   * @param {number} currentTime - 현재 시간
   * @returns {number} 0.0 ~ 1.0
   */
  getStageProgress(currentTime) {
    const stage = this.getStage(currentTime);
    let startTime, endTime;

    if (stage === 1) {
      startTime = this.spawnTime;
      endTime = this.stage1EndTime;
    } else if (stage === 2) {
      startTime = this.stage1EndTime;
      endTime = this.stage2EndTime;
    } else if (stage === 3) {
      startTime = this.stage2EndTime;
      endTime = this.stage3EndTime;
    } else {
      return 1.0;
    }

    return Math.min(1, (currentTime - startTime) / (endTime - startTime));
  }

  /**
   * 펄스 효과 (단계가 바뀔 때 강조)
   * @param {number} currentTime - 현재 시간
   * @returns {number} 1.0 ~ 1.15
   */
  getPulse(currentTime) {
    const progress = this.getStageProgress(currentTime);
    const stage = this.getStage(currentTime);

    // stage3일 때 더 강하게 펄스
    if (stage === 3) {
      return 1 + Math.sin(progress * Math.PI * 8) * 0.1;
    } else if (stage === 2) {
      return 1 + Math.sin(progress * Math.PI * 6) * 0.07;
    } else {
      return 1 + Math.sin(progress * Math.PI * 4) * 0.05;
    }
  }

  /**
   * 캐릭터 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} currentTime - 현재 시간
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   */
  draw(ctx, currentTime, x, y) {
    const pulse = this.getPulse(currentTime);
    const stage = this.getStage(currentTime);
    const img = this.getImage(currentTime);

    ctx.save();

    // 단계별 글로우 효과
    if (stage === 3) {
      ctx.shadowColor = this.color === 'red' ? 'rgba(229,57,80,0.7)' : 'rgba(43,120,255,0.7)';
      ctx.shadowBlur = 25;
    } else if (stage === 2) {
      ctx.shadowColor = this.color === 'red' ? 'rgba(229,57,80,0.45)' : 'rgba(43,120,255,0.45)';
      ctx.shadowBlur = 18;
    } else {
      ctx.shadowColor = this.color === 'red' ? 'rgba(229,57,80,0.25)' : 'rgba(43,120,255,0.25)';
      ctx.shadowBlur = 12;
    }

    // 이미지 그리기
    if (img) {
      const imgWidth = 64 * pulse;
      const imgHeight = 48 * pulse;
      ctx.drawImage(img, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
    } else {
      // 이미지 없으면 기본 박스
      const size = CHARACTER_SIZE * pulse;
      const baseColor = COLORS[this.color];

      ctx.fillStyle = baseColor;
      this._roundRectFill(ctx, x - size / 2, y - size / 2, size, size, 10);

      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      this._roundRectStroke(ctx, x - size / 2, y - size / 2, size, size, 10);
    }

    // 단계 표시 (작은 숫자)
    if (!this.judged && stage <= 3) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stage, x, y);
    }

    // 판정된 캐릭터는 페이드 아웃
    if (this.judged) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.3;
      const size = CHARACTER_SIZE * pulse;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
    }

    ctx.restore();
  }

  /**
   * 시간 초과로 제거되어야 하나?
   * @param {number} currentTime - 현재 시간
   * @returns {boolean}
   */
  shouldRemove(currentTime) {
    // 판정되거나, 3단계가 끝나고 1초 후
    return this.judged || (currentTime > this.stage3EndTime + 1);
  }

  // 내부 헬퍼 함수들
  _roundRectFill(ctx, x, y, w, h, r) {
    ctx.beginPath();
    this._roundedPath(ctx, x, y, w, h, r);
    ctx.fill();
  }

  _roundRectStroke(ctx, x, y, w, h, r) {
    ctx.beginPath();
    this._roundedPath(ctx, x, y, w, h, r);
    ctx.stroke();
  }

  _roundedPath(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
}
