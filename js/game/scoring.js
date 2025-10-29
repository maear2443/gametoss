/**
 * 💯 점수 계산 시스템
 *
 * 점수, 콤보, 판정을 계산합니다.
 * AI한테 "점수 계산 바꿔줘" 하면 여기만 보면 됨!
 */

import { WINDOWS_MS, SCORES, COMBO_BONUS_INTERVAL, COMBO_BONUS_PER_INTERVAL, JUDGE_COLORS } from '../config/settings.js';

/**
 * 타이밍 차이로 판정 결정
 * @param {number} timingDiff - 시간 차이 (밀리초)
 * @param {boolean} isCorrectAction - 올바른 액션인가?
 * @returns {string} 'PERFECT', 'GREAT', 'GOOD', 'MISS'
 */
export function getJudgment(timingDiff, isCorrectAction) {
  // 틀린 액션이면 무조건 MISS
  if (!isCorrectAction) {
    return 'MISS';
  }

  // 타이밍으로 판정
  if (timingDiff <= WINDOWS_MS.perfect) {
    return 'PERFECT';
  } else if (timingDiff <= WINDOWS_MS.great) {
    return 'GREAT';
  } else if (timingDiff <= WINDOWS_MS.good) {
    return 'GOOD';
  } else {
    return 'MISS';
  }
}

/**
 * 판정에 따른 기본 점수
 * @param {string} judgment - 'PERFECT', 'GREAT', 'GOOD', 'MISS'
 * @returns {number} 점수
 */
export function getBaseScore(judgment) {
  return SCORES[judgment] || 0;
}

/**
 * 콤보 보너스 계산
 * @param {number} combo - 현재 콤보
 * @returns {number} 보너스 점수
 */
export function getComboBonus(combo) {
  // 10콤보마다 +10점
  // 예: 15콤보 = 10점, 25콤보 = 20점
  return Math.floor(combo / COMBO_BONUS_INTERVAL) * COMBO_BONUS_PER_INTERVAL;
}

/**
 * 최종 점수 계산 (기본 점수 + 콤보 보너스)
 * @param {string} judgment - 판정
 * @param {number} combo - 현재 콤보
 * @returns {number} 최종 점수
 */
export function calculateFinalScore(judgment, combo) {
  const baseScore = getBaseScore(judgment);
  const bonus = getComboBonus(combo);
  return baseScore + bonus;
}

/**
 * 판정 색상 가져오기
 * @param {string} judgment - 판정
 * @returns {string} CSS 색상
 */
export function getJudgmentColor(judgment) {
  return JUDGE_COLORS[judgment] || '#fff';
}

/**
 * 판정 텍스트 크기 가져오기
 * @param {string} judgment - 판정
 * @returns {number} 폰트 크기 (픽셀)
 */
export function getJudgmentSize(judgment) {
  return judgment === 'PERFECT' ? 22 : 18;
}

/**
 * 올바른 액션인지 체크
 * @param {string} noteColor - 노트 색상 ('red' 또는 'blue')
 * @param {string} action - 플레이어 액션 ('approve' 또는 'reject')
 * @returns {boolean}
 */
export function isCorrectAction(noteColor, action) {
  return (noteColor === 'blue' && action === 'approve') ||
         (noteColor === 'red' && action === 'reject');
}
