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

// 📦 캐릭터 설정
export const CHARACTER_SIZE = 48;          // 캐릭터 크기 (픽셀)
export const MAX_CHARACTERS = 7;           // 화면에 표시될 최대 캐릭터 수
export const CHARACTER_SPACING = 80;       // 캐릭터 간격 (픽셀)

// ⏱️ 단계 타이밍 (비트 단위) - BPM에 따라 자동 계산
export const STAGE_DURATIONS = {
  stage1: 2,  // 1단계 지속 시간 (2비트)
  stage2: 2,  // 2단계 지속 시간 (2비트)
  stage3: 2   // 3단계 지속 시간 (2비트)
};
// 총 6비트 = BPM 120일 때 3초

// 💯 점수 설정 (단계별)
export const SCORES = {
  PERFECT: 300,  // stage3에서 판정
  GOOD: 200,     // stage2에서 판정
  NOTBAD: 100,   // stage1에서 판정
  MISS: 0        // 잘못된 버튼 or 시간 초과
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
  PERFECT: '#ffea7a',  // 노란색 (stage3)
  GOOD: '#9cffd7',     // 민트색 (stage2)
  NOTBAD: '#b0c7ff',   // 하늘색 (stage1)
  MISS: '#999'         // 회색
};

// ✨ 파티클 개수
export const PARTICLE_COUNT = {
  PERFECT: 24,  // PERFECT 판정 시 파티클 개수 (stage3)
  GOOD: 18,     // GOOD 판정 시 (stage2)
  NOTBAD: 12    // NOTBAD 판정 시 (stage1)
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
