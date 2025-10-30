/**
 * 📦 Note 클래스
 *
 * 노트 하나를 나타냅니다.
 * 생성, 판정, 그리기 등 노트 관련 모든 것을 여기서 처리!
 */

import { NOTE_SIZE, NOTE_START_Y, HIT_LINE_OFFSET, APPROACH_BEATS, COLORS } from '../config/settings.js';

export class Note {
  /**
   * 노트 생성
   * @param {string} color - 'red' 또는 'blue'
   * @param {number} spawnTime - 생성 시간 (초)
   * @param {number} hitTime - 판정 시간 (초)
   * @param {Image} characterImg - 캐릭터 이미지
   * @param {number} approachTime - 떨어지는 시간
   */
  constructor(color, spawnTime, hitTime, characterImg, approachTime) {
    this.color = color;           // 'red' 또는 'blue'
    this.spawnTime = spawnTime;   // 언제 생성?
    this.hitTime = hitTime;       // 언제 판정?
    this.characterImg = characterImg;  // 어떤 이미지?
    this.approachTime = approachTime;  // 얼마나 걸려 떨어지나?

    // 상태
    this.judged = false;  // 판정되었나?
    this.hit = false;     // 히트했나?
    this.result = null;   // 판정 결과 ('PERFECT', 'GREAT', etc)
  }

  /**
   * 현재 Y 위치 계산
   * @param {number} currentTime - 현재 시간 (초)
   * @returns {number} Y 좌표
   */
  getY(currentTime, canvasHeight) {
    const t = Math.max(0, Math.min(1, (currentTime - this.spawnTime) / this.approachTime));
    const hitY = canvasHeight - HIT_LINE_OFFSET;
    return NOTE_START_Y + (hitY - NOTE_START_Y) * t;
  }

  /**
   * 판정 라인에 근접했는지 (펄스 효과용)
   * @param {number} currentTime - 현재 시간 (초)
   * @returns {number} 펄스 배율 (1.0 ~ 1.2)
   */
  getPulse(currentTime) {
    const timeToHit = Math.abs((currentTime - this.hitTime) * 1000);
    return timeToHit < 80 ? 1 + (80 - timeToHit) / 400 : 1;
  }

  /**
   * 노트 그리기
   * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
   * @param {number} currentTime - 현재 시간
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   */
  draw(ctx, currentTime, x, y) {
    const pulse = this.getPulse(currentTime);
    const baseColor = COLORS[this.color];

    ctx.save();

    // 캐릭터 이미지가 있으면 이미지 그리기
    if (this.characterImg) {
      ctx.shadowColor = this.color === 'red' ? 'rgba(229,57,80,0.45)' : 'rgba(43,120,255,0.45)';
      ctx.shadowBlur = 18;

      const imgWidth = 64 * pulse;
      const imgHeight = 48 * pulse;
      ctx.drawImage(this.characterImg, x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
    } else {
      // 이미지 없으면 기본 박스
      const size = NOTE_SIZE * pulse;

      ctx.shadowColor = this.color === 'red' ? 'rgba(229,57,80,0.45)' : 'rgba(43,120,255,0.45)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = baseColor;
      this._roundRectFill(ctx, x - size / 2, y - size / 2, size, size, 10);

      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      this._roundRectStroke(ctx, x - size / 2, y - size / 2, size, size, 10);
    }

    // 판정된 노트는 페이드 아웃
    if (this.judged) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = 0.25;

      if (this.characterImg) {
        const imgWidth = 64 * pulse;
        const imgHeight = 48 * pulse;
        ctx.fillRect(x - imgWidth / 2, y - imgHeight / 2, imgWidth, imgHeight);
      } else {
        const size = NOTE_SIZE * pulse;
        this._roundRectFill(ctx, x - size / 2, y - size / 2, size, size, 10);
      }
    }

    ctx.restore();
  }

  /**
   * 판정 체크 - 얼마나 정확한지
   * @param {number} currentTime - 현재 시간
   * @returns {number} 시간 차이 (밀리초)
   */
  checkTiming(currentTime) {
    return Math.abs((currentTime - this.hitTime) * 1000);
  }

  /**
   * 이 노트가 제거되어야 하나?
   * @param {number} currentTime - 현재 시간
   * @returns {boolean}
   */
  shouldRemove(currentTime) {
    return currentTime - this.hitTime > 1.5;
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
