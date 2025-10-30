/**
 * 🎮 Game 클래스
 *
 * 게임의 모든 것을 관리하는 메인 클래스입니다.
 * 캐릭터 생성, 판정, 점수 계산, 타이머 등
 */

import { GAME_DURATION, DEFAULT_BPM, MAX_CHARACTERS, STAGE_DURATIONS } from '../config/settings.js';
import { Character } from './Character.js';
import { getJudgment, calculateFinalScore, getJudgmentColor, getJudgmentSize, isCorrectAction } from './scoring.js';
import { render } from '../visuals/renderer.js';
import { updateEffects, createParticles, createFloatingText, createRing, createFlash, effects } from '../visuals/effects.js';
import { updateAnimations, triggerHammer, triggerRobotArm, animations } from '../visuals/animations.js';
import { getRandomCharacter, playSound, playMusic, stopMusic, resetMusic, resources } from '../resources/loader.js';

export class Game {
  constructor(ui) {
    this.ui = ui;

    // 게임 상태
    this.bpm = DEFAULT_BPM;
    this.running = false;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;

    // 캐릭터 배열
    this.characters = [];

    // 타이머
    this.timeRemaining = GAME_DURATION;
    this.rafId = null;
    this.lastTime = 0;
    this.startTime = 0;
  }

  /**
   * 게임 시작
   */
  start() {
    if (this.running) return;

    // 음악 선택 및 재생
    const song = resources.currentSong;
    if (song) {
      this.bpm = song.bpm;
      this.ui.$bpm.value = this.bpm;

      // 기존 캐릭터들의 BPM 업데이트
      this.updateAllCharactersBPM(this.bpm);
    }

    this.running = true;
    this.startTime = performance.now() / 1000;
    this.lastTime = this.startTime;

    // 캐릭터가 없으면 생성 (보통은 reset에서 이미 생성됨)
    if (this.characters.length === 0) {
      this.fillCharacters();
    }

    playMusic();
    this.gameLoop(performance.now());

    console.log(`🎮 Game started! BPM: ${this.bpm}`);
  }

  /**
   * 게임 정지
   */
  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    stopMusic();
  }

  /**
   * 게임 리셋
   */
  reset() {
    this.stop();

    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.timeRemaining = GAME_DURATION;
    this.startTime = 0;
    this.lastTime = 0;
    this.characters = [];

    // 초기 캐릭터 생성 (시간 0 기준)
    this.fillCharactersAtTime(0);

    // UI 업데이트
    this.updateHUD();
    this.ui.$resultScreen.classList.remove('active');

    // 초기 렌더링
    render(this.characters, 0);

    resetMusic();
  }

  /**
   * 게임 종료
   */
  end() {
    this.stop();

    // 결과 화면 표시
    this.ui.$finalScore.textContent = this.score;
    this.ui.$maxCombo.textContent = this.maxCombo;
    this.ui.$resultScreen.classList.add('active');

    console.log(`🏁 Game ended! Score: ${this.score}, Max Combo: ${this.maxCombo}`);
  }

  /**
   * 캐릭터 배열 채우기 (MAX_CHARACTERS까지)
   */
  fillCharacters() {
    const currentTime = this.getNowSec();
    this.fillCharactersAtTime(currentTime);
  }

  /**
   * 특정 시간 기준으로 캐릭터 채우기
   */
  fillCharactersAtTime(spawnTime) {
    while (this.characters.length < MAX_CHARACTERS) {
      const color = Math.random() < 0.5 ? 'red' : 'blue';
      const charData = getRandomCharacter(color);
      const position = this.characters.length;

      const character = new Character(
        color,
        charData.characterType,
        spawnTime,
        position,
        this.bpm,
        charData.images
      );

      this.characters.push(character);
    }
  }

  /**
   * 모든 캐릭터의 BPM 업데이트 (타이밍 재계산)
   */
  updateAllCharactersBPM(newBpm) {
    for (const char of this.characters) {
      char.bpm = newBpm;

      // 타이밍 재계산
      const beatDuration = 60 / newBpm;
      char.stage1EndTime = char.spawnTime + (STAGE_DURATIONS.stage1 * beatDuration);
      char.stage2EndTime = char.stage1EndTime + (STAGE_DURATIONS.stage2 * beatDuration);
      char.stage3EndTime = char.stage2EndTime + (STAGE_DURATIONS.stage3 * beatDuration);
    }
  }

  /**
   * BPM 변경
   */
  updateTempo(newBpm) {
    this.bpm = newBpm;
    console.log(`🎵 BPM changed: ${this.bpm}`);
  }

  /**
   * 플레이어 액션 처리 (approve 또는 reject)
   */
  handleAction(action) {
    if (!this.running || this.characters.length === 0) return;

    const currentTime = this.getNowSec();

    // 첫 번째 캐릭터 (가장 위)를 판정
    const character = this.characters[0];

    if (character.judged) return;

    // 현재 단계 확인
    const stage = character.getStage(currentTime);

    // 올바른 액션인지 확인
    const correct = isCorrectAction(character.color, action);

    // 판정 계산
    const judgment = getJudgment(stage, correct);

    // 판정 결과 저장
    character.judged = true;
    character.result = judgment;

    // 점수 계산
    const finalScore = calculateFinalScore(judgment, this.combo);

    // 콤보 업데이트
    if (judgment !== 'MISS') {
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
    } else {
      this.combo = 0;
    }

    // 점수 추가
    this.score += finalScore;

    // 이펙트 발동
    const x = this.ui.canvas.clientWidth * 0.5;
    const y = 100; // 첫 번째 캐릭터 위치
    const color = getJudgmentColor(judgment);

    createParticles(x, y, judgment, character.color);
    createFlash(color);
    createRing(color);

    // 판정 텍스트
    const scoreText = finalScore > 0 ? `${judgment} +${finalScore}` : judgment;
    createFloatingText(x, y, scoreText, color, getJudgmentSize(judgment));

    // 애니메이션
    if (character.color === 'red') {
      triggerHammer(x, y);
    } else {
      triggerRobotArm(x, y);
    }

    // 사운드
    if (correct) {
      playSound(action === 'approve' ? 'approve_success' : 'reject_success');
    } else {
      playSound(action === 'approve' ? 'approve_fail' : 'reject_fail');
    }

    // UI 업데이트
    this.updateHUD();
    this.showJudgment(judgment);

    // 캐릭터 제거 및 새로 추가 (약간 지연)
    setTimeout(() => {
      this.characters.shift(); // 첫 번째 제거
      this.fillCharacters(); // 새로 추가
    }, 200);
  }

  /**
   * 게임 루프
   */
  gameLoop(timestamp) {
    if (!this.running) return;

    const currentTime = this.getNowSec();
    const dt = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // 타이머 업데이트
    const elapsed = currentTime - this.startTime;
    this.timeRemaining = Math.max(0, GAME_DURATION - elapsed);

    // 시간 종료 체크
    if (this.timeRemaining <= 0) {
      this.end();
      return;
    }

    // 제거해야 할 캐릭터 체크 (시간 초과)
    this.characters = this.characters.filter(char => !char.shouldRemove(currentTime));

    // 캐릭터가 부족하면 채우기
    if (this.characters.length < MAX_CHARACTERS) {
      this.fillCharacters();
    }

    // 이펙트 및 애니메이션 업데이트
    updateEffects(dt);
    updateAnimations(dt);

    // 렌더링
    render(this.characters, currentTime);

    // HUD 업데이트
    this.updateHUD();

    // 다음 프레임
    this.rafId = requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  /**
   * HUD 업데이트
   */
  updateHUD() {
    this.ui.$score.textContent = this.score;
    this.ui.$combo.textContent = `${this.combo} COMBO`;

    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = Math.floor(this.timeRemaining % 60);
    this.ui.$timer.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * 판정 표시
   */
  showJudgment(judgment) {
    this.ui.$judge.textContent = judgment;
    this.ui.$judge.className = `judge ${judgment.toLowerCase()}`;

    setTimeout(() => {
      this.ui.$judge.textContent = '';
      this.ui.$judge.className = 'judge';
    }, 500);
  }

  /**
   * 현재 시간 (초)
   */
  getNowSec() {
    return performance.now() / 1000;
  }
}
