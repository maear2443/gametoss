/**
 * ⌨️ 입력 처리 시스템
 *
 * 키보드와 버튼 입력을 게임에 연결합니다.
 */

/**
 * 입력 시스템 초기화
 * @param {Game} game - 게임 인스턴스
 * @param {Object} ui - UI 요소들
 */
export function setupInput(game, ui) {
  // 키보드 입력
  document.addEventListener('keydown', (e) => {
    // F: 빨강 거절 (reject)
    if (e.code === 'KeyF') {
      game.handleAction('reject');
      e.preventDefault();
    }

    // J: 파랑 승인 (approve)
    if (e.code === 'KeyJ') {
      game.handleAction('approve');
      e.preventDefault();
    }

    // Space: 시작/정지
    if (e.code === 'Space') {
      if (!game.running) {
        game.start();
      } else {
        game.stop();
      }
      e.preventDefault();
    }

    // R: 리셋
    if (e.code === 'KeyR') {
      game.reset();
      e.preventDefault();
    }
  });

  // 버튼 클릭
  ui.$rejectBtn.addEventListener('click', () => {
    game.handleAction('reject');
  });

  ui.$approveBtn.addEventListener('click', () => {
    game.handleAction('approve');
  });

  ui.$startBtn.addEventListener('click', () => {
    game.start();
  });

  ui.$stopBtn.addEventListener('click', () => {
    game.stop();
  });

  ui.$resetBtn.addEventListener('click', () => {
    game.reset();
  });

  ui.$restartBtn.addEventListener('click', () => {
    game.reset();
  });

  // BPM 슬라이더
  ui.$bpm.addEventListener('input', (e) => {
    const newBpm = parseInt(e.target.value);
    game.updateTempo(newBpm);
    ui.$bpmValue.textContent = newBpm;
  });

  console.log('⌨️ Input system initialized');
}
