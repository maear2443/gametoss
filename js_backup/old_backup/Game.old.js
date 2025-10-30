/**
 * 🎮 Game 클래스
 *
 * 게임의 모든 것을 관리하는 핵심 클래스!
 * 시작, 정지, 리셋, 노트 생성, 판정 등
 */

import { GAME_DURATION, DEFAULT_BPM, MIN_BPM, MAX_BPM, APPROACH_BEATS, SPAWN_PROBABILITY, WINDOWS_MS, HIT_LINE_OFFSET } from '../config/settings.js';
import { Note } from './Note.js';
import { getJudgment, calculateFinalScore, getJudgmentColor, getJudgmentSize, isCorrectAction } from './scoring.js';
import { getRandomCharacterImage, selectRandomSong, playMusic, stopMusic, resetMusic, playSound } from '../resources/loader.js';
import { startHitFlash, startRing, createParticles, createFloatText, updateEffects, resetEffects } from '../visuals/effects.js';
import { startHammer, startRobotArm, updateAnimations, resetAnimations } from '../visuals/animations.js';
import { render } from '../visuals/renderer.js';

export class Game {
  constructor(ui) {
    this.ui = ui;

    // 템포
    this.bpm = DEFAULT_BPM;
    this.beatDur = 60 / DEFAULT_BPM;
    this.approachTime = APPROACH_BEATS * (60 / DEFAULT_BPM);

    // 상태
    this.running = false;
    this.lastT = 0;
    this.nextBeatT = 0;
    this.gameStartTime = 0;
    this.remainingTime = GAME_DURATION;

    // 점수
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;

    // 판정
    this.judgeText = '';
    this.judgeTextTimer = 0;

    // 노트
    this.notes = [];

    // 현재 시간 (입력용)
    this.currentTime = 0;
  }

  /**
   * 게임 시작
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.lastT = 0;
    this.nextBeatT = 0;
    this.gameStartTime = 0;

    playMusic();
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  /**
   * 게임 정지
   */
  stop() {
    this.running = false;
    stopMusic();
  }

  /**
   * 게임 리셋
   */
  reset() {
    this.notes.length = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.judgeText = '';
    this.judgeTextTimer = 0;
    this.remainingTime = GAME_DURATION;
    this.gameStartTime = 0;

    resetEffects();
    resetAnimations();
    resetMusic();

    const song = selectRandomSong();
    if (song) {
      this.updateTempo(song.bpm);
      if (this.ui.$bpm) this.ui.$bpm.value = song.bpm;
    }

    this.syncHUD();
    if (this.ui.$resultScreen) {
      this.ui.$resultScreen.classList.remove('show');
    }

    render(this.notes, 0);
  }

  /**
   * 게임 종료
   */
  end() {
    this.stop();
    if (this.ui) {
      this.ui.$finalScore.textContent = `Score: ${this.score}`;
      this.ui.$maxCombo.textContent = `Max Combo: ${this.maxCombo}`;
      this.ui.$resultScreen.classList.add('show');
    }
  }

  /**
   * 템포 업데이트
   */
  updateTempo(newBpm) {
    this.bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(newBpm || this.bpm)));
    this.beatDur = 60 / this.bpm;
    this.approachTime = APPROACH_BEATS * this.beatDur;
  }

  /**
   * 노트 생성 시도
   */
  trySpawn(now) {
    if (Math.random() <= SPAWN_PROBABILITY) {
      const color = Math.random() < 0.5 ? 'red' : 'blue';
      const hitT = now + this.approachTime;
      const spawnT = now;
      const characterImg = getRandomCharacterImage(color);
      const note = new Note(color, spawnT, hitT, characterImg, this.approachTime);
      this.notes.push(note);
    }
  }

  /**
   * 액션 처리 (F키 거절, J키 승인)
   */
  handleAction(action) {
    const now = this.currentTime;

    // 가장 가까운 노트 찾기
    let best = null;
    let bestAbs = Infinity;
    for (const n of this.notes) {
      if (n.judged) continue;
      const abs = n.checkTiming(now);
      if (abs < bestAbs) {
        best = n;
        bestAbs = abs;
      }
    }

    if (!best) {
      this.setJudge('MISS', getJudgmentColor('MISS'));
      this.combo = 0;
      this.triggerMissFX();
      this.syncHUD();
      return;
    }

    const correct = isCorrectAction(best.color, action);
    const judgment = getJudgment(bestAbs, correct);

    if (judgment === 'MISS') {
      this.combo = 0;
      this.setJudge('MISS', getJudgmentColor('MISS'));
      this.triggerMissFX();

      // 실패 효과음
      if (best.color === 'blue' && action === 'reject') {
        playSound('approve_fail');
      } else if (best.color === 'red' && action === 'approve') {
        playSound('reject_fail');
      }
    } else {
      best.hit = true;
      best.judged = true;
      best.result = judgment;
      this.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.combo);

      const totalScore = calculateFinalScore(judgment, this.combo);
      this.score += totalScore;

      this.setJudge(judgment, getJudgmentColor(judgment));
      this.triggerHitFX(judgment, best.color, totalScore);

      // 성공 효과음 + 애니메이션
      const w = this.ui.canvas.clientWidth || 480;
      const h = this.ui.canvas.clientHeight || 720;
      const hitY = h - HIT_LINE_OFFSET;

      if (action === 'approve') {
        playSound('approve_success');
        startRobotArm(w * 0.5, hitY);
      } else {
        playSound('reject_success');
        startHammer(w * 0.5, hitY);
      }
    }
    this.syncHUD();
  }

  setJudge(text, color) {
    this.judgeText = text;
    this.judgeTextTimer = 0.75;
    if (this.ui && this.ui.$judge) {
      this.ui.$judge.style.color = color || '#fff';
    }
  }

  triggerHitFX(judgment, noteColor, addScore) {
    const w = this.ui.canvas.clientWidth || 480;
    const h = this.ui.canvas.clientHeight || 720;
    const hitY = h - HIT_LINE_OFFSET;
    const laneX = w * 0.5;

    const color = noteColor === 'red' ? 'rgba(229,57,80,1)' : 'rgba(43,120,255,1)';
    startHitFlash(color);
    startRing(color);
    createParticles(laneX, hitY, judgment, color);

    const textColor = getJudgmentColor(judgment);
    const textSize = getJudgmentSize(judgment);
    createFloatText(laneX, hitY - 10, `${judgment} +${addScore}`, textColor, textSize);
  }

  triggerMissFX() {
    const w = this.ui.canvas.clientWidth || 480;
    const h = this.ui.canvas.clientHeight || 720;
    const hitY = h - HIT_LINE_OFFSET;
    const laneX = w * 0.5;

    startHitFlash('rgba(160,160,160,1)');
    startRing('rgba(160,160,160,1)');
    createFloatText(laneX, hitY - 6, 'MISS', '#cccccc', 16);
  }

  /**
   * 게임 루프
   */
  gameLoop(ts) {
    if (!this.running) return;

    const now = ts / 1000;
    this.currentTime = now;

    if (this.lastT === 0) {
      this.lastT = now;
      this.nextBeatT = now + this.beatDur;
      this.gameStartTime = now;
    }

    const dt = Math.min(0.033, Math.max(0, now - this.lastT));
    this.lastT = now;

    // 타이머
    const elapsed = now - this.gameStartTime;
    this.remainingTime = Math.max(0, GAME_DURATION - elapsed);

    if (this.remainingTime <= 0) {
      this.end();
      return;
    }

    // 노트 생성
    while (now >= this.nextBeatT) {
      this.trySpawn(this.nextBeatT);
      this.nextBeatT += this.beatDur;
    }

    // 타이밍 초과 판정
    for (const n of this.notes) {
      if (!n.judged && now - n.hitTime > WINDOWS_MS.good / 1000) {
        n.judged = true;
        n.result = 'MISS';
        this.combo = 0;
        this.setJudge('MISS', getJudgmentColor('MISS'));
        this.triggerMissFX();
      }
    }

    // 오래된 노트 제거
    for (let i = this.notes.length - 1; i >= 0; i--) {
      if (this.notes[i].shouldRemove(now)) {
        this.notes.splice(i, 1);
      }
    }

    // 판정 텍스트 수명
    if (this.judgeTextTimer > 0) {
      this.judgeTextTimer -= dt;
      if (this.judgeTextTimer <= 0) {
        this.judgeText = '';
      }
    }

    // 이펙트 & 애니메이션 업데이트
    updateEffects(dt);
    updateAnimations(dt);

    // 렌더링
    render(this.notes, now);

    // HUD 업데이트
    this.syncHUD();

    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  syncHUD() {
    if (!this.ui) return;

    if (this.ui.$score) this.ui.$score.textContent = `Score: ${this.score}`;
    if (this.ui.$combo) this.ui.$combo.textContent = `Combo: ${this.combo}`;
    if (this.ui.$judge) this.ui.$judge.textContent = this.judgeText;

    if (this.ui.$timer) {
      const minutes = Math.floor(this.remainingTime / 60);
      const seconds = Math.floor(this.remainingTime % 60);
      this.ui.$timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }
}
