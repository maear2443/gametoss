/**
 * 🚀 메인 진입점
 *
 * 모든 모듈을 초기화하고 연결합니다.
 * 게임을 시작하려면 여기부터 보세요!
 */

import { loadAllResources } from './resources/loader.js';
import { initCanvas } from './visuals/renderer.js';
import { Game } from './game/Game.js';
import { setupInput } from './input.js';

/**
 * 애플리케이션 초기화
 */
async function init() {
  console.log('🎮 게임을 초기화하는 중...');

  // 1️⃣ UI 요소 가져오기
  const ui = {
    canvas: document.getElementById('game'),
    $score: document.querySelector('.score'),
    $combo: document.querySelector('.combo'),
    $judge: document.querySelector('.judge'),
    $timer: document.querySelector('.timer'),
    $startBtn: document.getElementById('startBtn'),
    $resetBtn: document.getElementById('resetBtn'),
    $bpm: document.getElementById('bpmInput'),
    $rejectBtn: document.getElementById('rejectBtn'),
    $approveBtn: document.getElementById('approveBtn'),
    $resultScreen: document.getElementById('resultScreen'),
    $finalScore: document.getElementById('finalScore'),
    $maxCombo: document.getElementById('maxCombo'),
    $restartBtn: document.getElementById('restartBtn')
  };

  // 2️⃣ 캔버스 초기화
  initCanvas(ui.canvas);

  // 3️⃣ 리소스 로드 (이미지, 음악, 효과음)
  console.log('📦 리소스를 로드하는 중...');
  await loadAllResources();

  // 4️⃣ 게임 인스턴스 생성
  const game = new Game(ui);

  // 5️⃣ 입력 시스템 초기화
  setupInput(game, ui);

  // 6️⃣ 초기 리셋으로 준비 완료
  game.reset();

  console.log('✅ 게임 준비 완료!');
  console.log('Start 버튼을 누르거나 Space 키를 눌러 시작하세요');
}

// DOM이 로드되면 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
