/**
 * 🎚️ 게임 설정
 *
 * 모든 숫자 값을 여기서 관리합니다.
 * 게임 밸런스를 조정하려면 이 파일만 수정하세요!
 */

// ⏱️ 게임 기본 설정
export const GAME_DURATION = 60;      // 게임 시간 (초)
export const DEFAULT_BPM = 120;       // 기본 BPM
export const MIN_BPM = 40;            // 최소 BPM
export const MAX_BPM = 240;           // 최대 BPM

// 📦 캐릭터 설정
export const CHARACTER_SIZE = 48;     // 캐릭터 기본 크기 (픽셀)
export const CHARACTER_SPACING = 80;  // 캐릭터 간 세로 간격 (픽셀)
export const MAX_CHARACTERS = 7;      // 화면에 표시할 최대 캐릭터 수

// ⏱️ 단계 타이밍 (비트 단위)
// BPM 120 기준: 1비트 = 0.5초
export const STAGE_DURATIONS = {
  stage1: 2,  // Stage 1: 2비트 = 1초
  stage2: 2,  // Stage 2: 2비트 = 1초
  stage3: 2   // Stage 3: 2비트 = 1초
};
// 총 6비트 = 3초 후 자동 MISS

// 💯 점수 설정
export const SCORES = {
  PERFECT: 300,  // Stage 3에서 정답
  GOOD: 200,     // Stage 2에서 정답
  NOTBAD: 100,   // Stage 1에서 정답
  MISS: 0        // 오답 또는 시간 초과
};

// 🔥 콤보 보너스
export const COMBO_BONUS_INTERVAL = 10;       // 몇 콤보마다 보너스?
export const COMBO_BONUS_PER_INTERVAL = 10;   // 보너스 점수
// 예: 10콤보 = +10점, 20콤보 = +20점, 30콤보 = +30점

// 🎨 색상
export const COLORS = {
  red: '#e53950',   // 거절 캐릭터 (빨강)
  blue: '#2b78ff'   // 승인 캐릭터 (파랑)
};

// 🎨 판정 색상
export const JUDGE_COLORS = {
  PERFECT: '#ffea7a',  // 노란색 (Stage 3)
  GOOD: '#9cffd7',     // 민트색 (Stage 2)
  NOTBAD: '#b0c7ff',   // 하늘색 (Stage 1)
  MISS: '#999'         // 회색
};

// ✨ 파티클 개수 (판정별)
export const PARTICLE_COUNT = {
  PERFECT: 24,  // Stage 3: 많이!
  GOOD: 18,     // Stage 2: 중간
  NOTBAD: 12    // Stage 1: 적게
};

// 🔨 애니메이션 속도
export const ANIMATION_SPEED = {
  HAMMER: 6,      // 망치 속도 (클수록 빠름)
  ROBOT_ARM: 4    // 기계팔 속도 (부드럽게)
};

// 🌍 물리 설정
export const GRAVITY = 900;  // 파티클 중력 (px/s²)

// 🔊 사운드 설정
export const SOUND_VOLUME = 0.3;   // 효과음 볼륨 (0~1)
export const MUSIC_VOLUME = 0.5;   // 음악 볼륨 (0~1)

// 📱 캔버스 설정
export const MAX_DPR = 2;  // 최대 Device Pixel Ratio

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
