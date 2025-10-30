/**
 * 📦 리소스 로더
 *
 * 이미지, 사운드, 음악 파일을 불러옵니다.
 * AI한테 "음악 볼륨 바꿔줘" 하면 여기 보면 됨!
 */

import { PATHS, SOUND_VOLUME, MUSIC_VOLUME } from '../config/settings.js';

// 캐릭터 종류
const CHARACTER_TYPES = ['bear', 'cat', 'rabbit', 'dog', 'fox'];

// 리소스 저장소
export const resources = {
  charactersData: null,
  playlistData: null,
  soundsData: null,
  // 새로운 구조: color -> characterType -> stage -> image
  characterImages: {
    red: {},
    blue: {}
  },
  soundEffects: {},
  currentAudio: null,
  currentSong: null
};

/**
 * 모든 리소스 로드
 */
export async function loadAllResources() {
  try {
    const [charactersRes, playlistRes, soundsRes] = await Promise.all([
      fetch(PATHS.CHARACTERS_JSON),
      fetch(PATHS.PLAYLIST_JSON),
      fetch(PATHS.SOUNDS_JSON)
    ]);

    resources.charactersData = await charactersRes.json();
    resources.playlistData = await playlistRes.json();
    resources.soundsData = await soundsRes.json();

    await preloadImages();
    await preloadSounds();

    console.log('✅ All resources loaded');
    return true;
  } catch (error) {
    console.error('❌ Failed to load resources:', error);
    return false;
  }
}

async function preloadImages() {
  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`⚠️  Failed: ${src}`);
        resolve(null);
      };
      img.src = src;
    });
  };

  // 각 캐릭터, 색상, 단계별로 이미지 로드
  for (const color of ['red', 'blue']) {
    for (const charType of CHARACTER_TYPES) {
      resources.characterImages[color][charType] = {
        stage1: null,
        stage2: null,
        stage3: null
      };

      for (const stage of [1, 2, 3]) {
        const path = `${PATHS[`IMAGES_${color.toUpperCase()}`]}${charType}_stage${stage}.png`;
        resources.characterImages[color][charType][`stage${stage}`] = await loadImage(path);
      }
    }
  }

  console.log('✅ Character images loaded');
}

async function preloadSounds() {
  if (!resources.soundsData) return;

  const loadSound = (name, file) => {
    return new Promise((resolve) => {
      const audio = new Audio(`${PATHS.SOUNDS}${file}`);
      audio.volume = SOUND_VOLUME;
      audio.onerror = () => {
        console.warn(`⚠️  Failed: ${file}`);
        resolve(null);
      };
      audio.oncanplaythrough = () => resolve(audio);
    });
  };

  const soundPromises = Object.entries(resources.soundsData).map(([name, file]) =>
    loadSound(name, file).then(audio => ({ name, audio }))
  );

  const results = await Promise.all(soundPromises);
  results.forEach(({ name, audio }) => {
    if (audio) resources.soundEffects[name] = audio;
  });
}

/**
 * 효과음 재생
 */
export function playSound(soundName) {
  const sound = resources.soundEffects[soundName];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.warn(`⚠️  Sound failed: ${soundName}`, e));
  }
}

/**
 * 랜덤 캐릭터 데이터 (타입 + stage 이미지들)
 * @param {string} color - 'red' 또는 'blue'
 * @returns {Object} { characterType, images: { stage1, stage2, stage3 } }
 */
export function getRandomCharacter(color) {
  const randomType = CHARACTER_TYPES[Math.floor(Math.random() * CHARACTER_TYPES.length)];
  const images = resources.characterImages[color][randomType];

  return {
    characterType: randomType,
    images: images
  };
}

/**
 * 랜덤 음악 선택
 */
export function selectRandomSong() {
  if (!resources.playlistData || !resources.playlistData.songs || resources.playlistData.songs.length === 0) {
    console.warn('⚠️  No songs available');
    return null;
  }

  const randomIndex = Math.floor(Math.random() * resources.playlistData.songs.length);
  resources.currentSong = resources.playlistData.songs[randomIndex];

  if (resources.currentAudio) {
    resources.currentAudio.pause();
    resources.currentAudio.currentTime = 0;
  }

  resources.currentAudio = new Audio(`${PATHS.MUSIC}${resources.currentSong.file}`);
  resources.currentAudio.volume = MUSIC_VOLUME;
  resources.currentAudio.onerror = () => {
    console.warn(`⚠️  Failed: ${resources.currentSong.file}`);
  };

  console.log(`🎵 Selected: ${resources.currentSong.name} (${resources.currentSong.bpm} BPM)`);
  return resources.currentSong;
}

/**
 * 음악 재생
 */
export function playMusic() {
  if (resources.currentAudio) {
    resources.currentAudio.play().catch(e => console.warn('⚠️  Music play failed:', e));
  }
}

/**
 * 음악 정지
 */
export function stopMusic() {
  if (resources.currentAudio) {
    resources.currentAudio.pause();
  }
}

/**
 * 음악 초기화
 */
export function resetMusic() {
  if (resources.currentAudio) {
    resources.currentAudio.pause();
    resources.currentAudio.currentTime = 0;
  }
}
