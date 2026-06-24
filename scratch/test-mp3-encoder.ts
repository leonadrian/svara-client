import * as fs from 'fs';
import * as path from 'path';
import * as lamejs from '@breezystack/lamejs';

// Buat wave sinus sintetis sebagai simulasi suara audio
function generateSineWave(durationSeconds: number, sampleRate: number, frequency: number): Float32Array {
  const numSamples = durationSeconds * sampleRate;
  const buffer = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    buffer[i] = Math.sin(2 * Math.PI * frequency * (i / sampleRate));
  }
  return buffer;
}

// Konversi Float32 PCM ke Int16 PCM
function convertFloat32ToInt16(buffer: Float32Array): Int16Array {
  let l = buffer.length;
  const buf = new Int16Array(l);
  while (l--) {
    const s = Math.max(-1, Math.min(1, buffer[l]));
    buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return buf;
}

async function testEncoder() {
  console.log("=== Testing lamejs MP3 Encoder ===");

  const duration = 2; // 2 detik
  const sampleRate = 44100;
  const frequency = 440; // Nada A4 (440Hz)
  const channels = 1; // Mono
  const kbps = 64; // 64kbps

  console.log(`Generating a ${duration} second sine wave at ${frequency}Hz (sample rate: ${sampleRate}Hz)...`);
  const float32Samples = generateSineWave(duration, sampleRate, frequency);
  const int16Samples = convertFloat32ToInt16(float32Samples);

  console.log("Initializing Mp3Encoder...");
  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
  const mp3Data: Buffer[] = [];

  const sampleBlockSize = 1152;
  console.log("Encoding PCM samples to MP3...");
  for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
    const chunk = int16Samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) {
      mp3Data.push(Buffer.from(new Int8Array(mp3buf)));
    }
  }

  const mp3bufFlush = mp3encoder.flush();
  if (mp3bufFlush.length > 0) {
    mp3Data.push(Buffer.from(new Int8Array(mp3bufFlush)));
  }

  const finalBuffer = Buffer.concat(mp3Data);
  console.log(`Encoding completed! MP3 Size: ${finalBuffer.length} bytes`);

  const outputDir = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'test-sine.mp3');
  fs.writeFileSync(outputPath, finalBuffer);
  console.log(`Successfully wrote MP3 to: ${outputPath}`);
  console.log("=== Test Succeeded ===");
}

testEncoder().catch(err => {
  console.error("Test failed with error:", err);
});
