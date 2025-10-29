/**
 * 🎹 입력 처리
 *
 * 키보드와 버튼 입력을 관리합니다.
 * F키 = 거절, J키 = 승인, Space = 일시정지
 */

/**
 * 입력 시스템 초기화
 * @param {Game} game - 게임 인스턴스
 * @param {Object} ui - UI 요소들
 */
export function setupInput(game, ui) {
  // 키보드 입력
  document.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (game.running) {
        game.stop();
        ui.$startBtn.textContent = 'Start';
      } else {
        game.start();
        ui.$startBtn.textContent = 'Stop';
      }
    } else if (e.code === 'KeyF') {
      if (game.running) {
        game.handleAction('reject');
        flashButton(ui.$rejectBtn);
      }
    } else if (e.code === 'KeyJ') {
      if (game.running) {
        game.handleAction('approve');
        flashButton(ui.$approveBtn);
      }
    }
  });

  // 버튼 클릭
  ui.$rejectBtn.addEventListener('click', () => {
    if (game.running) {
      game.handleAction('reject');
      flashButton(ui.$rejectBtn);
    }
  });

  ui.$approveBtn.addEventListener('click', () => {
    if (game.running) {
      game.handleAction('approve');
      flashButton(ui.$approveBtn);
    }
  });

  // Start 버튼
  ui.$startBtn.addEventListener('click', () => {
    if (!game.running) {
      game.start();
      ui.$startBtn.textContent = 'Stop';
    } else {
      game.stop();
      ui.$startBtn.textContent = 'Start';
    }
  });

  // Reset 버튼
  ui.$resetBtn.addEventListener('click', () => {
    game.reset();
    ui.$startBtn.textContent = 'Start';
  });

  // Restart 버튼 (결과 화면)
  ui.$restartBtn.addEventListener('click', () => {
    game.reset();
    ui.$startBtn.textContent = 'Start';
  });

  // BPM 입력
  ui.$bpm.addEventListener('change', () => {
    const newBpm = parseInt(ui.$bpm.value, 10);
    game.updateTempo(newBpm);
  });
}

/**
 * 버튼 플래시 효과
 * @param {HTMLElement} btn - 버튼 요소
 */
function flashButton(btn) {
  btn.classList.add('active');
  setTimeout(() => btn.classList.remove('active'), 100);
}
