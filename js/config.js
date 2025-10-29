/**
 * 게임 설정 및 상수
 */

// 게임 설정
export const CONFIG = {
  // 게임 시간
  GAME_DURATION: 60, // 초

  // 노트 관련
  HIT_LINE_OFFSET: 140, // 판정 라인 위치 (하단에서)
  NOTE_SIZE: 48, // 노트 기본 크기
  APPROACH_BEATS: 4, // 노트가 떨어지는 비트 수
  SPAWN_PROBABILITY: 0.8, // 노트 생성 확률
  NOTE_START_Y: -100, // 노트 시작 위치 (이미지 잘림 방지)

  // 판정 윈도우 (밀리초)
  WINDOWS_MS: {
    perfect: 50,
    great: 100,
    good: 150
  },

  // 점수
  SCORES: {
    PERFECT: 300,
    GREAT: 200,
    GOOD: 100,
    MISS: 0
  },

  // 콤보 보너스 (10콤보마다 10점)
  COMBO_BONUS_INTERVAL: 10,
  COMBO_BONUS_PER_INTERVAL: 10,

  // 템포
  DEFAULT_BPM: 120,
  MIN_BPM: 40,
  MAX_BPM: 240,

  // 색상
  COLORS: {
    red: '#e53950',
    blue: '#2b78ff'
  },

  // 판정 색상
  JUDGE_COLORS: {
    PERFECT: '#ffea7a',
    GREAT: '#9cffd7',
    GOOD: '#b0c7ff',
    MISS: '#999'
  },

  // 이펙트
  PARTICLE_COUNT: {
    PERFECT: 24,
    GREAT: 18,
    GOOD: 12
  },

  // 애니메이션 속도
  ANIMATION_SPEED: {
    HAMMER: 6, // 망치 애니메이션 속도
    ROBOT_ARM: 4 // 기계팔 애니메이션 속도
  },

  // 물리
  GRAVITY: 900, // px/s^2

  // 사운드
  SOUND_VOLUME: 0.3,
  MUSIC_VOLUME: 0.5,

  // 캔버스 DPR 제한
  MAX_DPR: 2
};

// 리소스 경로
export const PATHS = {
  CHARACTERS_JSON: 'assets/images/characters.json',
  PLAYLIST_JSON: 'assets/music/playlist.json',
  SOUNDS_JSON: 'assets/sounds/sounds.json',
  IMAGES_RED: 'assets/images/red/',
  IMAGES_BLUE: 'assets/images/blue/',
  MUSIC: 'assets/music/',
  SOUNDS: 'assets/sounds/'
};
