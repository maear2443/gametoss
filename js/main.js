/**
 * 메인 진입점
 * 모든 모듈을 초기화하고 연결합니다
 */

import { loadAllResources } from './resources.js';
import { initRenderer, render } from './renderer.js';
import { initGame, gameState } from './game.js';
import { initInput } from './input.js';

/**
 * 애플리케이션 초기화
 */
async function init() {
  console.log('🎮 Initializing rhythm game...');

  // UI 요소 가져오기
  const ui = {
    canvas: document.getElementById('game'),
    $score: document.querySelector('.score'),
    $combo: document.querySelector('.combo'),
    $judge: document.querySelector('.judge'),
    $timer: document.querySelector('.timer'),
    $start: document.getElementById('startBtn'),
    $reset: document.getElementById('resetBtn'),
    $bpm: document.getElementById('bpmInput'),
    $reject: document.getElementById('rejectBtn'),
    $approve: document.getElementById('approveBtn'),
    $resultScreen: document.getElementById('resultScreen'),
    $finalScore: document.getElementById('finalScore'),
    $maxCombo: document.getElementById('maxCombo'),
    $restartBtn: document.getElementById('restartBtn')
  };

  // 렌더러 초기화
  initRenderer(ui.canvas);

  // 리소스 로드
  console.log('📦 Loading resources...');
  await loadAllResources();

  // 게임 초기화
  initGame(ui);

  // 입력 초기화
  initInput(ui);

  // 초기 렌더링
  render(gameState, 0);

  console.log('✅ Game ready!');
  console.log('Press START or SPACE to begin');
}

// DOM이 로드되면 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
