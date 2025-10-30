/**
 * 🚀 메인 엔트리 포인트
 *
 * 모든 모듈을 초기화하고 연결합니다.
 */

import { loadResources, resources } from './resources/loader.js';
import { initCanvas } from './visuals/renderer.js';
import { Game } from './game/Game.js';
import { setupInput } from './input.js';

/**
 * 앱 초기화
 */
async function init() {
  console.log('🚀 Initializing GameToss...');

  // UI 요소 가져오기
  const ui = {
    canvas: document.getElementById('gameCanvas'),
    $score: document.getElementById('score'),
    $combo: document.getElementById('combo'),
    $timer: document.getElementById('timer'),
    $judge: document.getElementById('judge'),
    $bpm: document.getElementById('bpm'),
    $bpmValue: document.getElementById('bpmValue'),
    $startBtn: document.getElementById('startBtn'),
    $stopBtn: document.getElementById('stopBtn'),
    $resetBtn: document.getElementById('resetBtn'),
    $rejectBtn: document.getElementById('rejectBtn'),
    $approveBtn: document.getElementById('approveBtn'),
    $resultScreen: document.getElementById('resultScreen'),
    $finalScore: document.getElementById('finalScore'),
    $maxCombo: document.getElementById('maxCombo'),
    $restartBtn: document.getElementById('restartBtn'),
    $loadingScreen: document.getElementById('loadingScreen'),
    $loadingText: document.getElementById('loadingText')
  };

  // 로딩 화면 표시
  ui.$loadingScreen.classList.add('active');
  ui.$loadingText.textContent = 'Loading resources...';

  try {
    // 리소스 로딩
    console.log('📦 Loading resources...');
    await loadResources((progress) => {
      ui.$loadingText.textContent = `Loading... ${Math.round(progress * 100)}%`;
    });
    console.log('✅ Resources loaded!');

    // 캔버스 초기화
    console.log('🎨 Initializing canvas...');
    initCanvas(ui.canvas);
    console.log('✅ Canvas initialized!');

    // 게임 인스턴스 생성
    console.log('🎮 Creating game instance...');
    const game = new Game(ui);
    console.log('✅ Game instance created!');

    // 입력 시스템 설정
    console.log('⌨️ Setting up input...');
    setupInput(game, ui);
    console.log('✅ Input system ready!');

    // 초기 리셋 (캐릭터 미리 생성)
    console.log('🔄 Initial reset...');
    game.reset();
    console.log('✅ Game ready!');

    // 로딩 화면 숨기기
    ui.$loadingScreen.classList.remove('active');

    // 전역에 game 인스턴스 노출 (디버깅용)
    window.game = game;
    window.resources = resources;

    console.log('🎉 GameToss initialized successfully!');
    console.log('Press SPACE to start, F to reject, J to approve');

  } catch (error) {
    console.error('❌ Initialization failed:', error);
    ui.$loadingText.textContent = `Error: ${error.message}`;
  }
}

// DOM 로드 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
