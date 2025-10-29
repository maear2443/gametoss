/**
 * 리소스 로딩 모듈
 * 이미지, 사운드, 음악 파일을 프리로드합니다
 */

import { PATHS, CONFIG } from './config.js';

// 리소스 저장소
export const resources = {
  charactersData: null,
  playlistData: null,
  soundsData: null,
  characterImages: { red: [], blue: [] },
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

    // 이미지 프리로드
    await preloadImages();

    // 효과음 프리로드
    await preloadSounds();

    console.log('✅ All resources loaded successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to load resources:', error);
    return false;
  }
}

/**
 * 이미지 프리로드
 */
async function preloadImages() {
  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`⚠️  Failed to load image: ${src}, using fallback`);
        resolve(null);
      };
      img.src = src;
    });
  };

  if (resources.charactersData) {
    const redPromises = resources.charactersData.red.map(file =>
      loadImage(`${PATHS.IMAGES_RED}${file}`)
    );
    const bluePromises = resources.charactersData.blue.map(file =>
      loadImage(`${PATHS.IMAGES_BLUE}${file}`)
    );

    resources.characterImages.red = await Promise.all(redPromises);
    resources.characterImages.blue = await Promise.all(bluePromises);

    console.log(`📦 Loaded ${resources.characterImages.red.length} red + ${resources.characterImages.blue.length} blue character images`);
  }
}

/**
 * 효과음 프리로드
 */
async function preloadSounds() {
  if (!resources.soundsData) return;

  const loadSound = (name, file) => {
    return new Promise((resolve) => {
      const audio = new Audio(`${PATHS.SOUNDS}${file}`);
      audio.volume = CONFIG.SOUND_VOLUME;
      audio.onerror = () => {
        console.warn(`⚠️  Failed to load sound: ${file}`);
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

  console.log(`🔊 Loaded ${Object.keys(resources.soundEffects).length} sound effects`);
}

/**
 * 효과음 재생
 */
export function playSound(soundName) {
  const sound = resources.soundEffects[soundName];
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.warn(`⚠️  Sound play failed: ${soundName}`, e));
  }
}

/**
 * 랜덤 캐릭터 이미지 가져오기
 */
export function getRandomCharacterImage(color) {
  const images = resources.characterImages[color];
  if (!images || images.length === 0) return null;

  const validImages = images.filter(img => img !== null);
  if (validImages.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * validImages.length);
  return validImages[randomIndex];
}

/**
 * 랜덤 음악 선택
 */
export function selectRandomSong() {
  if (!resources.playlistData || !resources.playlistData.songs || resources.playlistData.songs.length === 0) {
    console.warn('⚠️  No songs available, using default BPM');
    return null;
  }

  const randomIndex = Math.floor(Math.random() * resources.playlistData.songs.length);
  resources.currentSong = resources.playlistData.songs[randomIndex];

  // 음악 로드
  if (resources.currentAudio) {
    resources.currentAudio.pause();
    resources.currentAudio.currentTime = 0;
  }

  resources.currentAudio = new Audio(`${PATHS.MUSIC}${resources.currentSong.file}`);
  resources.currentAudio.volume = CONFIG.MUSIC_VOLUME;
  resources.currentAudio.onerror = () => {
    console.warn(`⚠️  Failed to load audio: ${resources.currentSong.file}`);
  };

  console.log(`🎵 Selected song: ${resources.currentSong.name} (${resources.currentSong.bpm} BPM)`);
  return resources.currentSong;
}

/**
 * 음악 재생
 */
export function playMusic() {
  if (resources.currentAudio) {
    resources.currentAudio.play().catch(e => console.warn('⚠️  Audio play failed:', e));
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
