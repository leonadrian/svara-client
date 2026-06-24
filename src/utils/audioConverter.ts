import * as lamejs from '@breezystack/lamejs';

/**
 * Mengonversi Blob audio berformat WebM (atau format media apa pun yang didukung browser)
 * menjadi Blob audio MP3 Mono berkecepatan 64kbps.
 */
export async function convertWebmToMp3(webmBlob: Blob): Promise<Blob> {
  const arrayBuffer = await webmBlob.arrayBuffer();

  // Buat AudioContext untuk mendekode bytes audio menjadi PCM AudioBuffer
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    await audioCtx.close();
  }

  const sampleRate = audioBuffer.sampleRate;
  const channels = 1; // Konversi ke mono karena sangat cocok untuk suara percakapan
  const kbps = 64; // Bitrate 64kbps mono MP3 sangat jernih dan berukuran kecil

  const float32Samples = audioBuffer.getChannelData(0); // Ambil saluran kiri saja (mono)
  const int16Samples = convertFloat32ToInt16(float32Samples);

  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
  const mp3Data: Int8Array[] = [];

  // Enkode dalam blok berukuran 1152 sampel (ukuran blok standar LAME)
  const sampleBlockSize = 1152;
  for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
    const chunk = int16Samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) {
      mp3Data.push(new Int8Array(mp3buf));
    }
  }

  const mp3bufFlush = mp3encoder.flush();
  if (mp3bufFlush.length > 0) {
    mp3Data.push(new Int8Array(mp3bufFlush));
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * Mengonversi PCM Float32 (rentang -1.0 s/d 1.0) menjadi PCM Int16 (rentang -32768 s/d 32767).
 */
function convertFloat32ToInt16(buffer: Float32Array): Int16Array {
  let l = buffer.length;
  const buf = new Int16Array(l);
  while (l--) {
    const s = Math.max(-1, Math.min(1, buffer[l]));
    buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return buf;
}
