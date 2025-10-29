/**
 * 🎚️ 게임 설정 파일
 *
 * 여기서 숫자를 바꾸면 게임이 달라집니다!
 * 예: 판정을 쉽게 하려면 WINDOWS_MS 숫자를 키우세요
 */

// ⏱️ 게임 기본 설정
export const GAME_DURATION = 60;  // 게임 시간 (초)
export const DEFAULT_BPM = 120;   // 기본 템포
export const MIN_BPM = 40;        // 최소 템포
export const MAX_BPM = 240;       // 최대 템포

// 📦 노트 설정
export const NOTE_SIZE = 48;           // 노트 크기 (픽셀)
export const NOTE_START_Y = -100;      // 노트 시작 위치 (위로 더 올라가면 잘림 방지)
export const HIT_LINE_OFFSET = 140;    // 판정 라인 위치 (하단에서부터)
export const APPROACH_BEATS = 4;       // 노트가 떨어지는 비트 수
export const SPAWN_PROBABILITY = 0.8;  // 노트 생성 확률 (0~1)

// ⚖️ 판정 윈도우 (밀리초) - 숫자가 클수록 쉬워짐!
export const WINDOWS_MS = {
  perfect: 50,   // ±50ms 이내 = PERFECT
  great: 100,    // ±100ms 이내 = GREAT
  good: 150      // ±150ms 이내 = GOOD
};

// 💯 점수 설정
export const SCORES = {
  PERFECT: 300,  // PERFECT 판정 점수
  GREAT: 200,    // GREAT 판정 점수
  GOOD: 100,     // GOOD 판정 점수
  MISS: 0        // MISS는 0점
};

// 🔥 콤보 보너스
export const COMBO_BONUS_INTERVAL = 10;       // 몇 콤보마다?
export const COMBO_BONUS_PER_INTERVAL = 10;   // 얼마나 추가?
// 예: 10콤보 = +10점, 20콤보 = +20점

// 🎨 색상
export const COLORS = {
  red: '#e53950',    // 거절 노트 (빨강)
  blue: '#2b78ff'    // 승인 노트 (파랑)
};

// 🎨 판정 색상
export const JUDGE_COLORS = {
  PERFECT: '#ffea7a',  // 노란색
  GREAT: '#9cffd7',    // 민트색
  GOOD: '#b0c7ff',     // 하늘색
  MISS: '#999'         // 회색
};

// ✨ 파티클 개수
export const PARTICLE_COUNT = {
  PERFECT: 24,  // PERFECT 판정 시 파티클 개수
  GREAT: 18,    // GREAT 판정 시
  GOOD: 12      // GOOD 판정 시
};

// 🔨 애니메이션 속도
export const ANIMATION_SPEED = {
  HAMMER: 6,      // 망치 속도 (클수록 빠름)
  ROBOT_ARM: 4    // 기계팔 속도
};

// 🌍 물리 설정
export const GRAVITY = 900;  // 파티클 중력 (px/s²)

// 🔊 사운드 설정
export const SOUND_VOLUME = 0.3;   // 효과음 볼륨 (0~1)
export const MUSIC_VOLUME = 0.5;   // 음악 볼륨 (0~1)

// 📱 캔버스 설정
export const MAX_DPR = 2;  // 최대 화면 해상도 배율

// 📂 파일 경로
export const PATHS = {
  CHARACTERS_JSON: 'assets/images/characters.json',
  PLAYLIST_JSON: 'assets/music/playlist.json',
  SOUNDS_JSON: 'assets/sounds/sounds.json',
  IMAGES_RED: 'assets/images/red/',
  IMAGES_BLUE: 'assets/images/blue/',
  MUSIC: 'assets/music/',
  SOUNDS: 'assets/sounds/'
};
