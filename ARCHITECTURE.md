# 🎮 게임 아키텍처 설계 문서

## 📋 목차
1. [게임 개요](#게임-개요)
2. [핵심 게임 메카닉](#핵심-게임-메카닉)
3. [프로젝트 구조](#프로젝트-구조)
4. [모듈 상세 설명](#모듈-상세-설명)
5. [게임 플로우](#게임-플로우)
6. [데이터 흐름](#데이터-흐름)
7. [주요 클래스](#주요-클래스)
8. [설정 값](#설정-값)

---

## 게임 개요

### 게임 타입
**단계 진화 타이밍 게임** (Stage Evolution Timing Game)

### 게임 컨셉
- 인형 공장 품질 관리 테마
- 캐릭터들이 세로로 쌓여있는 상태에서 시작
- 각 캐릭터가 시간에 따라 3단계로 진화
- 플레이어는 적절한 타이밍에 승인/거절 버튼을 눌러 판정

### 핵심 차별점
- ❌ 기존 리듬게임: 노트가 떨어지며 타이밍 라인에서 판정
- ✅ 현재 게임: 캐릭터가 고정된 위치에서 단계 진화, 단계별 판정

---

## 핵심 게임 메카닉

### 1. 캐릭터 진화 시스템
```
Stage 1 (2비트) → Stage 2 (2비트) → Stage 3 (2비트) → MISS
   어두움           중간 밝기         밝음/글로우      시간 초과
```

**BPM 기반 타이밍**:
- BPM 120 기준: 1비트 = 0.5초
- Stage 1: 1초 지속
- Stage 2: 1초 지속
- Stage 3: 1초 지속
- 총 3초 후 자동 MISS

### 2. 판정 시스템
| 단계 | 판정 | 점수 | 설명 |
|------|------|------|------|
| Stage 3 + 정답 | PERFECT | 300점 | 최고 타이밍 |
| Stage 2 + 정답 | GOOD | 200점 | 양호 |
| Stage 1 + 정답 | NOTBAD | 100점 | 나쁘지 않음 |
| 오답 or 시간초과 | MISS | 0점 | 콤보 초기화 |

### 3. 콤보 보너스
- 10콤보마다 +10점 추가
- 예: 20콤보에서 PERFECT = 300 + 20 = 320점

### 4. 캐릭터 타입
- **5가지 동물**: bear, cat, rabbit, dog, fox
- **2가지 색상**: red (거절), blue (승인)
- **3단계 이미지**: stage1, stage2, stage3

---

## 프로젝트 구조

```
gametoss/
├── index.html                 # 메인 HTML (ES6 모듈 로드)
├── css/
│   └── styles.css            # 전체 스타일시트
│
├── js/                        # 모듈식 JavaScript
│   ├── main.js               # 🚀 진입점 (초기화)
│   ├── input.js              # 🎹 입력 처리
│   │
│   ├── config/               # ⚙️ 설정
│   │   └── settings.js       # 모든 게임 상수
│   │
│   ├── game/                 # 🎮 게임 로직
│   │   ├── Game.js           # 게임 메인 컨트롤러
│   │   ├── Character.js      # 캐릭터 클래스
│   │   └── scoring.js        # 점수 계산
│   │
│   ├── visuals/              # 🎨 렌더링
│   │   ├── renderer.js       # 캔버스 렌더링
│   │   ├── effects.js        # 파티클, 플래시 등
│   │   └── animations.js     # 망치, 기계팔
│   │
│   ├── resources/            # 📦 리소스
│   │   └── loader.js         # 이미지/사운드 로딩
│   │
│   └── old_backup/           # 🗄️ 이전 버전 백업
│
├── assets/
│   ├── images/
│   │   ├── red/              # 거절용 캐릭터
│   │   │   ├── bear_stage1.png
│   │   │   ├── bear_stage2.png
│   │   │   ├── bear_stage3.png
│   │   │   └── ... (5 캐릭터 × 3 단계)
│   │   ├── blue/             # 승인용 캐릭터
│   │   │   └── ... (5 캐릭터 × 3 단계)
│   │   └── characters.json   # 캐릭터 메타데이터
│   │
│   ├── music/
│   │   ├── song1.mp3
│   │   ├── song2.mp3
│   │   ├── song3.mp3
│   │   └── playlist.json     # 곡 정보 (BPM 포함)
│   │
│   └── sounds/
│       ├── approve_success.wav
│       ├── reject_success.wav
│       ├── approve_fail.wav
│       ├── reject_fail.wav
│       └── sounds.json
│
├── generate_images.py         # 테스트 이미지 생성 스크립트
├── generate_sounds.py         # 테스트 사운드 생성 스크립트
└── README.md                  # 사용자 가이드
```

---

## 모듈 상세 설명

### 1. main.js - 진입점
**역할**: 애플리케이션 초기화 및 모듈 연결

**플로우**:
```javascript
1. UI 요소 수집
2. 캔버스 초기화
3. 리소스 로드 (이미지, 음악, 효과음)
4. 랜덤 음악 선택
5. Game 인스턴스 생성
6. 입력 시스템 연결
7. reset() 호출 → 초기 캐릭터 생성
```

### 2. config/settings.js - 게임 설정
**역할**: 모든 숫자 상수 중앙 관리

**주요 설정**:
```javascript
// 게임 기본
GAME_DURATION: 60           // 게임 시간 (초)
DEFAULT_BPM: 120            // 기본 BPM
MAX_CHARACTERS: 7           // 화면 캐릭터 수

// 캐릭터
CHARACTER_SIZE: 48          // 캐릭터 크기
CHARACTER_SPACING: 80       // 간격

// 단계 타이밍 (비트)
STAGE_DURATIONS: {
  stage1: 2,
  stage2: 2,
  stage3: 2
}

// 점수
SCORES: {
  PERFECT: 300,
  GOOD: 200,
  NOTBAD: 100,
  MISS: 0
}

// 콤보
COMBO_BONUS_INTERVAL: 10    // 10콤보마다
COMBO_BONUS_PER_INTERVAL: 10 // +10점
```

### 3. game/Character.js - 캐릭터 클래스
**역할**: 개별 캐릭터의 생명주기 관리

**주요 메서드**:
```javascript
constructor(color, characterType, spawnTime, position, bpm, images)
  // 캐릭터 생성 및 타이밍 계산

getStage(currentTime)
  // 현재 단계 반환 (1, 2, 3, 4)

getImage(currentTime)
  // 현재 단계에 맞는 이미지 반환

getPulse(currentTime)
  // 펄스 효과 (단계별 강도 다름)

draw(ctx, currentTime, x, y)
  // 캔버스에 캐릭터 그리기

shouldRemove(currentTime)
  // 제거 조건 체크
```

**상태 변수**:
```javascript
{
  color: 'red' | 'blue',
  characterType: 'bear' | 'cat' | ...,
  spawnTime: number,          // 생성 시간
  position: number,           // 화면 위치 (0-6)
  bpm: number,                // 현재 BPM
  images: {                   // 3단계 이미지
    stage1: Image,
    stage2: Image,
    stage3: Image
  },
  stage1EndTime: number,      // 1단계 종료 시간
  stage2EndTime: number,      // 2단계 종료 시간
  stage3EndTime: number,      // 3단계 종료 시간
  judged: boolean,            // 판정 여부
  result: string | null       // 판정 결과
}
```

### 4. game/Game.js - 게임 컨트롤러
**역할**: 게임의 모든 것을 관리하는 메인 클래스

**주요 메서드**:
```javascript
start()
  // 게임 시작
  // - 음악 재생
  // - 게임 루프 시작
  // - BPM 적용

stop()
  // 게임 정지
  // - 음악 정지
  // - 루프 취소

reset()
  // 게임 리셋
  // - 점수/콤보 초기화
  // - 캐릭터 7개 생성 (시간 0 기준)
  // - 초기 렌더링

end()
  // 게임 종료
  // - 결과 화면 표시

handleAction(action: 'approve' | 'reject')
  // 플레이어 입력 처리
  // - 첫 번째 캐릭터 판정
  // - 점수 계산
  // - 이펙트 발동
  // - 사운드 재생
  // - 캐릭터 교체

gameLoop(timestamp)
  // 매 프레임 실행
  // - 타이머 업데이트
  // - 제거할 캐릭터 체크
  // - 이펙트 업데이트
  // - 렌더링
  // - HUD 업데이트

fillCharacters()
fillCharactersAtTime(spawnTime)
  // 캐릭터 배열을 MAX_CHARACTERS까지 채우기

updateAllCharactersBPM(newBpm)
  // BPM 변경 시 모든 캐릭터 타이밍 재계산
```

**게임 상태**:
```javascript
{
  bpm: number,                // 현재 BPM
  running: boolean,           // 게임 진행 중?
  score: number,              // 현재 점수
  combo: number,              // 현재 콤보
  maxCombo: number,           // 최대 콤보
  characters: Character[],    // 캐릭터 배열 (최대 7개)
  timeRemaining: number,      // 남은 시간
  rafId: number | null,       // requestAnimationFrame ID
  lastTime: number,           // 이전 프레임 시간
  startTime: number           // 게임 시작 시간
}
```

### 5. game/scoring.js - 점수 계산
**역할**: 판정 및 점수 계산 로직

**함수**:
```javascript
getJudgment(stage, isCorrectAction)
  // 단계 + 정답 여부 → 판정
  // stage 3 + correct = PERFECT
  // stage 2 + correct = GOOD
  // stage 1 + correct = NOTBAD
  // wrong = MISS

getBaseScore(judgment)
  // 판정 → 기본 점수

getComboBonus(combo)
  // 콤보 수 → 보너스 점수
  // floor(combo / 10) * 10

calculateFinalScore(judgment, combo)
  // 기본 점수 + 콤보 보너스

getJudgmentColor(judgment)
  // 판정 → CSS 색상

getJudgmentSize(judgment)
  // 판정 → 폰트 크기

isCorrectAction(noteColor, action)
  // 색상 + 액션 → 정답 여부
  // red + reject = true
  // blue + approve = true
```

### 6. visuals/renderer.js - 렌더링
**역할**: 캔버스에 모든 것을 그리기

**주요 함수**:
```javascript
initCanvas(canvasElement)
  // 캔버스 초기화 및 리사이즈 이벤트 등록

render(characters, currentTime)
  // 메인 렌더 함수
  // 1. 배경 그라데이션
  // 2. 플래시 효과
  // 3. 캐릭터들 (세로 배치)
  // 4. 파티클
  // 5. 플로팅 텍스트
  // 6. 망치/기계팔 애니메이션

renderHammer(w)
  // 망치 애니메이션 렌더링

renderRobotArm(w)
  // 기계팔 애니메이션 렌더링
```

**렌더링 순서** (Z-index):
```
배경 (맨 아래)
  ↓
플래시 효과
  ↓
캐릭터들
  ↓
파티클
  ↓
플로팅 텍스트
  ↓
애니메이션 (맨 위)
```

### 7. visuals/effects.js - 이펙트
**역할**: 시각 효과 관리

**이펙트 타입**:
```javascript
effects = {
  hitFlash: { a, color },     // 화면 플래시
  ring: { a, r, color },      // 확산 링 (미사용)
  particles: [],              // 파티클 배열
  floatTexts: []              // 플로팅 텍스트
}
```

**함수**:
```javascript
startHitFlash(color)
  // 플래시 시작

startRing(color)
  // 링 시작 (현재 미사용)

createParticles(x, y, judgment, color)
  // 파티클 생성 (판정별 개수 다름)

createFloatText(x, y, text, color, size)
  // "PERFECT +320" 같은 텍스트 생성

updateEffects(dt)
  // 모든 이펙트 업데이트 (페이드, 이동)
```

### 8. visuals/animations.js - 애니메이션
**역할**: 망치/기계팔 애니메이션 관리

**애니메이션 데이터**:
```javascript
animations = {
  hammer: {
    active: boolean,
    progress: number,         // 0.0 ~ 1.0
    x: number,
    y: number
  },
  robotArm: {
    active: boolean,
    progress: number,
    x: number,
    y: number
  }
}
```

**함수**:
```javascript
triggerHammer(x, y)
  // 망치 애니메이션 시작 (red 캐릭터용)

triggerRobotArm(x, y)
  // 기계팔 애니메이션 시작 (blue 캐릭터용)

updateAnimations(dt)
  // progress 업데이트 (자동 종료)
```

### 9. resources/loader.js - 리소스 로더
**역할**: 이미지, 음악, 효과음 로딩

**리소스 구조**:
```javascript
resources = {
  charactersData: null,       // characters.json
  playlistData: null,         // playlist.json
  soundsData: null,           // sounds.json
  characterImages: {
    red: {
      bear: { stage1, stage2, stage3 },
      cat: { stage1, stage2, stage3 },
      ...
    },
    blue: { ... }
  },
  soundEffects: {
    approve_success: Audio,
    reject_success: Audio,
    approve_fail: Audio,
    reject_fail: Audio
  },
  currentAudio: Audio | null,
  currentSong: { name, file, bpm }
}
```

**함수**:
```javascript
loadAllResources()
  // 모든 리소스 비동기 로딩

getRandomCharacter(color)
  // 랜덤 캐릭터 타입 + 이미지 반환
  // { characterType, images: { stage1, stage2, stage3 } }

selectRandomSong()
  // 플레이리스트에서 랜덤 선택
  // Audio 객체 생성 및 BPM 반환

playSound(soundName)
  // 효과음 재생

playMusic()
stopMusic()
resetMusic()
  // 음악 제어
```

### 10. input.js - 입력 처리
**역할**: 키보드/버튼 입력 연결

**키 바인딩**:
```
F키 = reject (거절)
J키 = approve (승인)
Space = start/stop (일시정지)
```

**함수**:
```javascript
setupInput(game, ui)
  // 모든 입력 이벤트 등록
  // - 키보드 이벤트
  // - 버튼 클릭 이벤트
  // - BPM 입력 이벤트
```

---

## 게임 플로우

### 1. 초기화 단계
```
페이지 로드
  ↓
main.js 실행
  ↓
UI 요소 수집
  ↓
캔버스 초기화 (initCanvas)
  ↓
리소스 로딩 (loadAllResources)
  ├─ characters.json 로드
  ├─ playlist.json 로드
  ├─ sounds.json 로드
  ├─ 이미지 프리로드 (30개)
  └─ 효과음 프리로드 (4개)
  ↓
랜덤 음악 선택 (selectRandomSong)
  ↓
Game 인스턴스 생성
  ↓
입력 시스템 연결 (setupInput)
  ↓
reset() 호출
  ├─ 점수/콤보 = 0
  ├─ 캐릭터 7개 생성 (시간 0 기준)
  └─ 초기 렌더링
  ↓
✅ 준비 완료 (캐릭터 7개 보임)
```

### 2. 게임 시작
```
플레이어가 Start 버튼 클릭
  ↓
start() 호출
  ├─ BPM 적용 (음악 선택)
  ├─ 기존 캐릭터들 BPM 업데이트
  ├─ running = true
  ├─ startTime 기록
  └─ 음악 재생
  ↓
gameLoop() 시작
```

### 3. 게임 루프 (매 프레임)
```
gameLoop(timestamp)
  ↓
현재 시간 계산
  ↓
타이머 업데이트 (1분 카운트다운)
  ↓
시간 초과 캐릭터 제거
  ↓
부족한 캐릭터 채우기 (항상 7개 유지)
  ↓
이펙트 업데이트 (파티클, 플래시, 텍스트)
  ↓
애니메이션 업데이트 (망치, 기계팔)
  ↓
render() 호출
  ├─ 배경 그리기
  ├─ 플래시 효과
  ├─ 캐릭터 7개 그리기 (각자 단계별 이미지)
  ├─ 파티클
  ├─ 플로팅 텍스트
  └─ 애니메이션
  ↓
HUD 업데이트 (점수, 콤보, 타이머)
  ↓
requestAnimationFrame() → 다음 프레임
```

### 4. 플레이어 입력
```
F키 또는 J키 입력
  ↓
handleAction('reject' | 'approve')
  ↓
첫 번째 캐릭터 가져오기
  ↓
현재 단계 확인 (getStage)
  ↓
정답 여부 확인 (isCorrectAction)
  ↓
판정 계산 (getJudgment)
  ├─ stage3 + 정답 = PERFECT
  ├─ stage2 + 정답 = GOOD
  ├─ stage1 + 정답 = NOTBAD
  └─ 오답 = MISS
  ↓
점수 계산 (calculateFinalScore)
  ├─ 기본 점수
  └─ 콤보 보너스
  ↓
콤보 업데이트
  ├─ 성공: combo++
  └─ MISS: combo = 0
  ↓
이펙트 발동
  ├─ 파티클 생성
  ├─ 플래시
  └─ 플로팅 텍스트
  ↓
애니메이션 발동
  ├─ red: 망치
  └─ blue: 기계팔
  ↓
효과음 재생
  ├─ approve_success / approve_fail
  └─ reject_success / reject_fail
  ↓
판정 UI 표시 (0.5초)
  ↓
200ms 후 캐릭터 교체
  ├─ 첫 번째 제거
  └─ 새 캐릭터 추가
```

### 5. 게임 종료
```
타이머 0초 도달
  ↓
end() 호출
  ├─ 음악 정지
  ├─ 루프 취소
  └─ 결과 화면 표시
      ├─ 최종 점수
      └─ 최대 콤보
  ↓
Restart 버튼 클릭 시 → reset()
```

---

## 데이터 흐름

### 캐릭터 생성 흐름
```
reset() or fillCharacters()
  ↓
getRandomCharacter(color)
  ├─ 랜덤 캐릭터 타입 선택
  └─ resources에서 3단계 이미지 가져오기
  ↓
new Character(...)
  ├─ spawnTime 저장
  ├─ BPM 기반 타이밍 계산
  │   ├─ stage1EndTime
  │   ├─ stage2EndTime
  │   └─ stage3EndTime
  └─ 이미지 저장 { stage1, stage2, stage3 }
  ↓
characters 배열에 추가
```

### 렌더링 데이터 흐름
```
gameLoop()
  ↓
render(characters, currentTime)
  ↓
for each character:
  ├─ getStage(currentTime) → 현재 단계
  ├─ getImage(currentTime) → 단계별 이미지
  ├─ getPulse(currentTime) → 펄스 효과
  └─ draw(ctx, currentTime, x, y)
      ├─ 글로우 효과 (단계별 강도)
      ├─ 이미지 또는 fallback 박스
      └─ 단계 번호 표시
```

### 점수 계산 흐름
```
handleAction(action)
  ↓
character.getStage(currentTime)
  ↓
isCorrectAction(character.color, action)
  ↓
getJudgment(stage, isCorrect)
  ↓
calculateFinalScore(judgment, combo)
  ├─ getBaseScore(judgment)
  └─ getComboBonus(combo)
  ↓
score += finalScore
```

---

## 주요 클래스

### Character 클래스
```javascript
class Character {
  // 속성
  color: 'red' | 'blue'
  characterType: string
  spawnTime: number
  position: number
  bpm: number
  images: { stage1, stage2, stage3 }
  stage1EndTime: number
  stage2EndTime: number
  stage3EndTime: number
  judged: boolean
  result: string | null

  // 메서드
  constructor(color, characterType, spawnTime, position, bpm, images)
  getStage(currentTime): 1 | 2 | 3 | 4
  getImage(currentTime): Image
  getStageProgress(currentTime): number
  getPulse(currentTime): number
  draw(ctx, currentTime, x, y): void
  shouldRemove(currentTime): boolean
}
```

### Game 클래스
```javascript
class Game {
  // 속성
  ui: Object
  bpm: number
  running: boolean
  score: number
  combo: number
  maxCombo: number
  characters: Character[]
  timeRemaining: number
  rafId: number | null
  lastTime: number
  startTime: number

  // 메서드
  constructor(ui)
  start(): void
  stop(): void
  reset(): void
  end(): void
  handleAction(action: 'approve' | 'reject'): void
  gameLoop(timestamp): void
  fillCharacters(): void
  fillCharactersAtTime(spawnTime): void
  updateAllCharactersBPM(newBpm): void
  updateTempo(newBpm): void
  updateHUD(): void
  showJudgment(judgment): void
  getNowSec(): number
}
```

---

## 설정 값

### 타이밍 설정
```javascript
STAGE_DURATIONS = {
  stage1: 2,  // 2비트
  stage2: 2,  // 2비트
  stage3: 2   // 2비트
}

// BPM 120 기준 실제 시간
// 1비트 = 60/120 = 0.5초
// stage1: 1초
// stage2: 1초
// stage3: 1초
// 총: 3초
```

### 점수 설정
```javascript
SCORES = {
  PERFECT: 300,
  GOOD: 200,
  NOTBAD: 100,
  MISS: 0
}

COMBO_BONUS_INTERVAL = 10      // 10콤보마다
COMBO_BONUS_PER_INTERVAL = 10  // +10점
```

### 화면 설정
```javascript
CHARACTER_SIZE = 48         // 기본 크기
CHARACTER_SPACING = 80      // 세로 간격
MAX_CHARACTERS = 7          // 화면 최대 개수
```

### 애니메이션 설정
```javascript
ANIMATION_SPEED = {
  HAMMER: 6,      // 빠르게
  ROBOT_ARM: 4    // 부드럽게
}

PARTICLE_COUNT = {
  PERFECT: 24,
  GOOD: 18,
  NOTBAD: 12
}
```

---

## 수정 가이드

### BPM을 바꾸고 싶다면
→ `config/settings.js`의 `DEFAULT_BPM` 수정

### 단계 지속 시간을 바꾸고 싶다면
→ `config/settings.js`의 `STAGE_DURATIONS` 수정

### 점수를 바꾸고 싶다면
→ `config/settings.js`의 `SCORES` 수정

### 화면 캐릭터 수를 바꾸고 싶다면
→ `config/settings.js`의 `MAX_CHARACTERS` 수정

### 새 캐릭터를 추가하고 싶다면
1. `assets/images/red/newchar_stage1~3.png` 추가
2. `assets/images/blue/newchar_stage1~3.png` 추가
3. `resources/loader.js`의 `CHARACTER_TYPES` 배열에 추가

### 새 음악을 추가하고 싶다면
1. `assets/music/newsong.mp3` 추가
2. `assets/music/playlist.json`에 곡 정보 추가:
```json
{
  "name": "새 곡",
  "file": "newsong.mp3",
  "bpm": 140
}
```

---

## 트러블슈팅

### 캐릭터가 안 보인다
1. 콘솔에서 `Reset: Created 7 characters` 확인
2. 이미지 로딩 실패 시 fallback 박스가 표시되어야 함
3. `Character.js`의 `img.complete` 체크 확인

### 타이밍이 안 맞다
1. BPM 확인 (`ui.$bpm` 값)
2. `STAGE_DURATIONS` 확인
3. `updateAllCharactersBPM()` 호출 여부 확인

### 점수가 이상하다
1. `scoring.js`의 `calculateFinalScore()` 로그 확인
2. 콤보 보너스 계산 확인
3. `SCORES` 설정 확인

---

## 최종 체크리스트

✅ 모듈식 구조 (10개 파일)
✅ 단계 기반 게임 메카닉
✅ BPM 기반 타이밍 시스템
✅ 3단계 이미지 시스템
✅ 콤보 보너스 시스템
✅ 파티클 & 애니메이션
✅ 효과음 시스템
✅ 초보자 친화적 주석
✅ AI 친화적 구조

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-10-30
**게임 버전**: Stage Evolution v2.0
