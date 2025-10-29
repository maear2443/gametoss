/**
 * 게임 로직 모듈
 * 게임 상태, 노트 생성, 판정, 업데이트 루프를 관리합니다
 */

import { CONFIG } from './config.js';
import { getRandomCharacterImage, playSound, selectRandomSong, playMusic, stopMusic, resetMusic } from './resources.js';
import { animations, updateAnimations, resetAnimations, startHammerAnimation, startRobotArmAnimation, startHitFlash, startRing, createParticles, createFloatText } from './animations.js';
import { render } from './renderer.js';

// 게임 상태
export const gameState = {
  // 템포
  bpm: CONFIG.DEFAULT_BPM,
  beatDur: 60 / CONFIG.DEFAULT_BPM,
  approachTime: CONFIG.APPROACH_BEATS * (60 / CONFIG.DEFAULT_BPM),

  // 상태
  running: false,
  lastT: 0,
  nextBeatT: 0,
  gameStartTime: 0,
  remainingTime: CONFIG.GAME_DURATION,

  // 점수
  score: 0,
  combo: 0,
  maxCombo: 0,

  // 판정 텍스트
  judgeText: '',
  judgeTextTimer: 0,

  // 노트
  notes: []
};

// UI 요소
let ui = null;

/**
 * 게임 초기화
 */
export function initGame(uiElements) {
  ui = uiElements;
  resetGame();
}

/**
 * 템포 업데이트
 */
export function updateTempo(newBpm) {
  gameState.bpm = Math.max(CONFIG.MIN_BPM, Math.min(CONFIG.MAX_BPM, Math.round(newBpm || gameState.bpm)));
  gameState.beatDur = 60 / gameState.bpm;
  gameState.approachTime = CONFIG.APPROACH_BEATS * gameState.beatDur;
}

/**
 * 게임 리셋
 */
export function resetGame() {
  gameState.notes.length = 0;
  gameState.score = 0;
  gameState.combo = 0;
  gameState.maxCombo = 0;
  gameState.judgeText = '';
  gameState.judgeTextTimer = 0;
  gameState.remainingTime = CONFIG.GAME_DURATION;
  gameState.gameStartTime = 0;

  resetAnimations();
  resetMusic();

  // 랜덤 곡 선택
  const song = selectRandomSong();
  if (song) {
    updateTempo(song.bpm);
    if (ui && ui.$bpm) ui.$bpm.value = song.bpm;
  }

  syncHUD();
  if (ui && ui.$resultScreen) {
    ui.$resultScreen.classList.remove('show');
  }
}

/**
 * 게임 시작
 */
export function startGame() {
  if (gameState.running) return;
  gameState.running = true;
  gameState.lastT = 0;
  gameState.nextBeatT = 0;
  gameState.gameStartTime = 0;

  playMusic();
  requestAnimationFrame(gameLoop);
}

/**
 * 게임 정지
 */
export function stopGame() {
  gameState.running = false;
  stopMusic();
}

/**
 * 게임 종료
 */
export function endGame() {
  stopGame();
  if (ui) {
    ui.$finalScore.textContent = `Score: ${gameState.score}`;
    ui.$maxCombo.textContent = `Max Combo: ${gameState.maxCombo}`;
    ui.$resultScreen.classList.add('show');
  }
}

/**
 * 노트 생성 시도
 */
function trySpawn(now) {
  if (Math.random() <= CONFIG.SPAWN_PROBABILITY) {
    const color = Math.random() < 0.5 ? 'red' : 'blue';
    const hitT = now + gameState.approachTime;
    const spawnT = now;
    const characterImg = getRandomCharacterImage(color);
    gameState.notes.push({
      color,
      spawnT,
      hitT,
      hit: false,
      judged: false,
      result: null,
      characterImg,
      approachTime: gameState.approachTime
    });
  }
}

/**
 * 판정 텍스트 설정
 */
function setJudge(text, color) {
  gameState.judgeText = text;
  gameState.judgeTextTimer = 0.75;
  if (ui && ui.$judge) {
    ui.$judge.style.color = color || '#fff';
  }
}

/**
 * 히트 이펙트 트리거
 */
function triggerHitFX(result, noteColor, addScore) {
  const w = ui.canvas.clientWidth || 480;
  const h = ui.canvas.clientHeight || 720;
  const hitY = h - CONFIG.HIT_LINE_OFFSET;
  const laneX = w * 0.5;

  const color = noteColor === 'red' ? 'rgba(229,57,80,1)' : 'rgba(43,120,255,1)';
  startHitFlash(color);
  startRing(color);

  const particleCount = CONFIG.PARTICLE_COUNT[result] || 12;
  createParticles(laneX, hitY, particleCount, color);

  const textColor = CONFIG.JUDGE_COLORS[result] || '#b0c7ff';
  const textSize = result === 'PERFECT' ? 22 : 18;
  createFloatText(laneX, hitY - 10, `${result} +${addScore}`, textColor, textSize);
}

/**
 * 미스 이펙트 트리거
 */
function triggerMissFX() {
  const w = ui.canvas.clientWidth || 480;
  const h = ui.canvas.clientHeight || 720;
  const hitY = h - CONFIG.HIT_LINE_OFFSET;
  const laneX = w * 0.5;

  startHitFlash('rgba(160,160,160,1)');
  startRing('rgba(160,160,160,1)');
  createFloatText(laneX, hitY - 6, 'MISS', '#cccccc', 16);
}

/**
 * 액션 처리 (거절/승인)
 */
export function handleAction(action, now) {
  // 가장 가까운 노트 찾기
  let best = null;
  let bestAbs = Infinity;
  for (const n of gameState.notes) {
    if (n.judged) continue;
    const dt = (now - n.hitT) * 1000;
    const abs = Math.abs(dt);
    if (abs < bestAbs) {
      best = n;
      bestAbs = abs;
    }
  }

  if (!best) {
    setJudge('MISS', CONFIG.JUDGE_COLORS.MISS);
    gameState.combo = 0;
    triggerMissFX();
    syncHUD();
    return;
  }

  const correct = (best.color === 'blue' && action === 'approve') || (best.color === 'red' && action === 'reject');
  const w = ui.canvas.clientWidth || 480;
  const h = ui.canvas.clientHeight || 720;
  const hitY = h - CONFIG.HIT_LINE_OFFSET;

  let result = 'MISS';
  let add = 0;
  if (correct) {
    if (bestAbs <= CONFIG.WINDOWS_MS.perfect) {
      result = 'PERFECT';
      add = CONFIG.SCORES.PERFECT;
    } else if (bestAbs <= CONFIG.WINDOWS_MS.great) {
      result = 'GREAT';
      add = CONFIG.SCORES.GREAT;
    } else if (bestAbs <= CONFIG.WINDOWS_MS.good) {
      result = 'GOOD';
      add = CONFIG.SCORES.GOOD;
    }
  }

  if (result === 'MISS') {
    gameState.combo = 0;
    setJudge('MISS', CONFIG.JUDGE_COLORS.MISS);
    triggerMissFX();

    // 실패 효과음
    if (best.color === 'blue' && action === 'reject') {
      playSound('approve_fail');
    } else if (best.color === 'red' && action === 'approve') {
      playSound('reject_fail');
    }
  } else {
    best.hit = true;
    best.judged = true;
    best.result = result;
    gameState.combo += 1;
    gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);

    // 콤보 보너스
    const comboBonus = Math.floor(gameState.combo / CONFIG.COMBO_BONUS_INTERVAL) * CONFIG.COMBO_BONUS_PER_INTERVAL;
    const totalAdd = add + comboBonus;

    gameState.score += totalAdd;
    setJudge(result, CONFIG.JUDGE_COLORS[result]);
    triggerHitFX(result, best.color, totalAdd);

    // 성공 효과음 + 애니메이션
    if (action === 'approve') {
      playSound('approve_success');
      startRobotArmAnimation(w * 0.5, hitY);
    } else {
      playSound('reject_success');
      startHammerAnimation(w * 0.5, hitY);
    }
  }
  syncHUD();
}

/**
 * 게임 루프
 */
let _nowSec = 0;
function gameLoop(ts) {
  if (!gameState.running) return;

  const now = ts / 1000;
  _nowSec = now;

  if (gameState.lastT === 0) {
    gameState.lastT = now;
    gameState.nextBeatT = now + gameState.beatDur;
    gameState.gameStartTime = now;
  }

  const dt = Math.min(0.033, Math.max(0, now - gameState.lastT));
  gameState.lastT = now;

  // 타이머 업데이트
  const elapsed = now - gameState.gameStartTime;
  gameState.remainingTime = Math.max(0, CONFIG.GAME_DURATION - elapsed);

  if (gameState.remainingTime <= 0) {
    endGame();
    return;
  }

  // 박자 스폰
  while (now >= gameState.nextBeatT) {
    trySpawn(gameState.nextBeatT);
    gameState.nextBeatT += gameState.beatDur;
  }

  // 타이밍 초과 판정
  for (const n of gameState.notes) {
    if (!n.judged && now - n.hitT > CONFIG.WINDOWS_MS.good / 1000) {
      n.judged = true;
      n.result = 'MISS';
      gameState.combo = 0;
      setJudge('MISS', CONFIG.JUDGE_COLORS.MISS);
      triggerMissFX();
    }
  }

  // 오래된 노트 정리
  for (let i = gameState.notes.length - 1; i >= 0; i--) {
    if (now - gameState.notes[i].hitT > 1.5) {
      gameState.notes.splice(i, 1);
    }
  }

  // 판정 텍스트 수명
  if (gameState.judgeTextTimer > 0) {
    gameState.judgeTextTimer -= dt;
    if (gameState.judgeTextTimer <= 0) {
      gameState.judgeText = '';
    }
  }

  // 애니메이션 업데이트
  updateAnimations(dt);

  // 렌더링
  render(gameState, now);

  // HUD 업데이트
  syncHUD();

  requestAnimationFrame(gameLoop);
}

/**
 * HUD 동기화
 */
function syncHUD() {
  if (!ui) return;

  if (ui.$score) ui.$score.textContent = `Score: ${gameState.score}`;
  if (ui.$combo) ui.$combo.textContent = `Combo: ${gameState.combo}`;
  if (ui.$judge) ui.$judge.textContent = gameState.judgeText;

  if (ui.$timer) {
    const minutes = Math.floor(gameState.remainingTime / 60);
    const seconds = Math.floor(gameState.remainingTime % 60);
    ui.$timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

/**
 * 현재 시간 가져오기 (입력 처리용)
 */
export function getNowSec() {
  return _nowSec;
}
