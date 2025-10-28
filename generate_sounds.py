#!/usr/bin/env python3
"""
Generate placeholder sound effects for the rhythm game
Note: This generates simple beep sounds. Replace with your own sound effects for better quality.
"""

import wave
import struct
import math

def generate_beep(filename, frequency, duration, volume=0.5):
    """Generate a simple beep sound"""
    sample_rate = 44100
    num_samples = int(sample_rate * duration)

    # Generate samples
    samples = []
    for i in range(num_samples):
        # Simple sine wave
        t = i / sample_rate
        # Add envelope (fade in/out) to avoid clicks
        envelope = 1.0
        fade_samples = int(sample_rate * 0.01)  # 10ms fade
        if i < fade_samples:
            envelope = i / fade_samples
        elif i > num_samples - fade_samples:
            envelope = (num_samples - i) / fade_samples

        value = math.sin(2 * math.pi * frequency * t) * volume * envelope
        # Convert to 16-bit integer
        sample = int(value * 32767)
        samples.append(sample)

    # Write to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)

        # Pack samples as binary data
        packed_samples = struct.pack('<' + 'h' * len(samples), *samples)
        wav_file.writeframes(packed_samples)

def generate_chord(filename, frequencies, duration, volume=0.3):
    """Generate a chord (multiple frequencies)"""
    sample_rate = 44100
    num_samples = int(sample_rate * duration)

    samples = []
    for i in range(num_samples):
        t = i / sample_rate

        # Envelope
        envelope = 1.0
        fade_samples = int(sample_rate * 0.01)
        if i < fade_samples:
            envelope = i / fade_samples
        elif i > num_samples - fade_samples:
            envelope = (num_samples - i) / fade_samples

        # Mix multiple frequencies
        value = 0
        for freq in frequencies:
            value += math.sin(2 * math.pi * freq * t)
        value = value / len(frequencies) * volume * envelope

        sample = int(value * 32767)
        samples.append(sample)

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        packed_samples = struct.pack('<' + 'h' * len(samples), *samples)
        wav_file.writeframes(packed_samples)

def main():
    import os
    os.makedirs('assets/sounds', exist_ok=True)

    print("Generating sound effects...")

    # 승인 성공 - 밝고 긍정적인 소리 (C major chord)
    generate_chord('assets/sounds/approve_success.wav', [523, 659, 784], 0.2, 0.25)
    print("Created: assets/sounds/approve_success.wav")

    # 거절 성공 - 단호한 소리 (low tone)
    generate_beep('assets/sounds/reject_success.wav', 200, 0.15, 0.3)
    print("Created: assets/sounds/reject_success.wav")

    # 승인 실패 - 불협화음 (dissonant)
    generate_chord('assets/sounds/approve_fail.wav', [300, 315], 0.25, 0.2)
    print("Created: assets/sounds/approve_fail.wav")

    # 거절 실패 - 낮은 불협화음
    generate_chord('assets/sounds/reject_fail.wav', [200, 210], 0.25, 0.2)
    print("Created: assets/sounds/reject_fail.wav")

    print("\nAll sound effects created successfully!")
    print("Note: These are simple placeholder sounds. Replace with professional sound effects for better quality.")
    print("\nTo use MP3 format instead of WAV, you can:")
    print("1. Convert these WAV files to MP3 using ffmpeg or online converters")
    print("2. Or add your own MP3 files directly to assets/sounds/")

if __name__ == '__main__':
    main()
