/**
 * 입력 처리 모듈
 * 키보드 및 버튼 입력을 처리합니다
 */

import { gameState, startGame, stopGame, resetGame, handleAction, getNowSec, updateTempo } from './game.js';

/**
 * 입력 초기화
 */
export function initInput(ui) {
  // 키보드 입력
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState.running) {
        stopGame();
      } else {
        startGame();
      }
    } else if (e.code === 'KeyF') {
      if (gameState.running) {
        handleAction('reject', getNowSec());
      }
    } else if (e.code === 'KeyJ') {
      if (gameState.running) {
        handleAction('approve', getNowSec());
      }
    }
  });

  // 버튼 입력
  ui.$reject.addEventListener('click', () => {
    if (gameState.running) {
      handleAction('reject', getNowSec());
    }
  });

  ui.$approve.addEventListener('click', () => {
    if (gameState.running) {
      handleAction('approve', getNowSec());
    }
  });

  ui.$start.addEventListener('click', () => {
    startGame();
  });

  ui.$reset.addEventListener('click', () => {
    resetGame();
  });

  ui.$restartBtn.addEventListener('click', () => {
    resetGame();
  });

  // BPM 입력
  ui.$bpm.addEventListener('change', () => {
    updateTempo(parseFloat(ui.$bpm.value));
  });
}
