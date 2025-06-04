<template>
  <div :class="['min-h-screen flex flex-col', theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'sepia' ? 'bg-sepia-100 text-sepia-900' : 'bg-white text-gray-900']">
    <!-- Camera View -->
    <div v-if="!capturedImage" class="relative flex-1">
      <video ref="video" autoplay playsinline muted :class="['w-full h-full object-cover', { 'invert': isInverted }]"></video>
      <div class="absolute inset-0 flex flex-col justify-center items-center gap-12">
        <div class="w-[60vw] h-[1px] bg-gray-400 opacity-40 transition-opacity duration-300"></div>
        <div class="w-[60vw] h-[1px] bg-gray-400 opacity-40 transition-opacity duration-300"></div>
      </div>
      <button @click="toggleInvert" class="absolute top-4 right-4 w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v10a4 4 0 01-4 4H7zM12 3v18"/>
        </svg>
      </button>
      <button @click="captureImage" class="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg">
        <svg class="w-8 h-8" fill="none" stroke="black" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
        </svg>
      </button>
    </div>

    <!-- Fullscreen Results Overlay -->
    <div v-if="capturedImage" class="fixed inset-0 overflow-y-auto p-6 flex flex-col" :class="theme === 'dark' ? 'bg-gray-900' : theme === 'sepia' ? 'bg-sepia-100' : 'bg-white'">
      <!-- Theme Toggle -->
      <div class="flex justify-end mb-4">
        <select v-model="theme" @change="saveTheme" class="p-2 rounded bg-transparent border" :class="theme === 'dark' ? 'border-gray-600' : 'border-gray-300'">
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="sepia">Sepia</option>
        </select>
      </div>

      <!-- Cropped Image Download -->
      <div class="mb-4">
        <a :href="capturedImage" download="cropped-verse.png" class="inline-flex items-center gap-2 p-2 rounded bg-green-500 text-white hover:bg-green-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span>Download Cropped Image</span>
        </a>
      </div>

      <!-- Verse Display -->
      <div v-if="verseData" class="mb-6">
        <h2 class="text-2xl font-semibold mb-2 text-right leading-relaxed">{{ verseData.surahName }} ({{ verseData.surahTransliteration }}) - آية {{ verseData.verseId }}</h2>
        <p class="text-xl mb-4 text-right leading-relaxed font-arabic">{{ verseData.verseText }}</p>
        <button @click="toggleAudio" class="flex items-center gap-2 p-2 rounded bg-blue-500 text-white hover:bg-blue-600">
          <svg v-if="!isPlaying" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <span>{{ isPlaying ? 'إيقاف' : 'تشغيل' }}</span>
        </button>
      </div>

      <!-- Separator -->
      <hr class="my-4 border-t" :class="theme === 'dark' ? 'border-gray-600' : 'border-gray-300'">

 <!-- Tafsir Section - Fixed -->
  <div v-if="tafsirData?.length" class="flex-1 space-y-4">
    <draggable 
      v-model="tafsirOrder" 
      item-key="index"
      @end="saveTafsirOrder"
      class="space-y-4"
    >
      <template #item="{ element: index }">
        <div 
          v-if="index < tafsirData.length"
          class="border rounded-lg p-4"
          :class="theme === 'dark' ? 'border-gray-600' : 'border-gray-300'"
        >
          <div class="flex justify-between items-center cursor-pointer" @click="toggleTafsir(index)">
            <h3 class="text-lg font-medium text-right">
              {{ tafsirData[index].edition.name }} ({{ tafsirData[index].edition.englishName }})
            </h3>
            <span>{{ collapsedTafsir[index] ? '➕' : '➖' }}</span>
          </div>
          <p 
            v-if="!collapsedTafsir[index]" 
            class="mt-2 text-right text-lg leading-relaxed font-arabic"
          >
            {{ tafsirData[index].text }}
          </p>
        </div>
      </template>
    </draggable>
  </div>

  <!-- Fallback when no tafsir data -->
  <div v-else-if="tafsirData" class="text-center py-8 text-gray-500">
    No tafsir data available for this verse
  </div>

      <!-- New Picture Button -->
      <button @click="resetCamera" class="fixed bottom-4 right-4 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h3l3-3h4l3 3h3a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import draggable from 'vuedraggable';
import { createWorker } from 'tesseract.js';

const TESSERACT_CONFIG = {
  workerPath: 'https://unpkg.com/tesseract.js@4.0.2/dist/worker.min.js',
  corePath: 'https://unpkg.com/tesseract.js-core@3.0.2/tesseract-core.wasm.js',
  langPath: 'https://tessdata.projectnaptha.com/4.0.0',
};

let worker;

async function initOCR() {
  worker = await createWorker(TESSERACT_CONFIG);
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789', // Restrict to Latin digits
    tessedit_pageseg_mode: '6', // Single uniform block of text
    preserve_interword_spaces: '0',
  });
}

async function terminateOCR() {
  if (worker) await worker.terminate();
  worker = null;
}

// State
const video = ref(null);
const capturedImage = ref(null);
const verseData = ref(null);
const tafsirData = ref([]);
const isPlaying = ref(false);
const audio = ref(new Audio());
const theme = ref(localStorage.getItem('theme') || 'system');
const tafsirOrder = ref(JSON.parse(localStorage.getItem('tafsirOrder') || '[]'));
const collapsedTafsir = ref(JSON.parse(localStorage.getItem('collapsedTafsir') || '{}'));
const text = ref('');
const loading = ref(false);
const isInverted = ref(false);

const tafsirEditions = [
  'ar.muyassar',
  'ar.jalalayn',
  'ar.qurtubi',
  'ar.miqbas',
  'ar.waseet',
  'ar.baghawi',
];

// Handle capture and OCR
async function handleCapture(imageData) {
  loading.value = true;
  text.value = '';

  if (!worker) await initOCR();

  try {
    const { data: { text } } = await worker.recognize(imageData, 'eng');
    const detectedNumber = text.replace(/[^\d]/g, ''); // Keep only Latin digits
    text.value = detectedNumber;

    alert(detectedNumber); // Alert the detected number (e.g., "01123")

    if (detectedNumber) {
      // Select a random verse from Surah 2 (Al-Baqarah, verses 1–286)
      const randomVerseId = Math.floor(Math.random() * 286) + 1;
      await fetchVerse(2, randomVerseId);
    } else {
      alert('No valid number detected. Please try again with a clearer image.');
    }
  } catch (err) {
    console.error('OCR error:', err);
    alert('OCR error: ' + err.message);
  } finally {
    loading.value = false;
  }
}

// Fetch a specific verse from Quran API
async function fetchVerse(surahId, verseId) {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahId}:${verseId}`);
    const data = await response.json();
    if (data.status === 'OK') {
      verseData.value = {
        surahId,
        surahName: data.data.surah.name,
        surahTransliteration: data.data.surah.transliteration,
        verseId,
        verseText: data.data.text,
      };
      await fetchTafsir(surahId, verseId);
    } else {
      alert('Failed to fetch verse data.');
    }
  } catch (err) {
    console.error('Verse fetch error:', err);
    alert('Failed to fetch verse: ' + err.message);
  }
}

// Initialize camera
const initCamera = async () => {
  try {
    const constraints = [
      { video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } },
      { video: { facingMode: 'environment' } },
      { video: true },
    ];

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        if (video.value) {
          video.value.srcObject = stream;
          await video.value.play();
        }
        return;
      } catch {
        continue;
      }
    }

    alert('Camera not accessible. Please ensure camera permissions are granted and the app is served over HTTPS.');
  } catch (err) {
    console.error('initCamera error:', err);
  }
};

// Capture and crop image
const captureImage = async () => {
  if (!video.value) return;
  loading.value = true;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.value.videoWidth;
    canvas.height = video.value.videoHeight;
    const ctx = canvas.getContext('2d');

    if (video.value.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      ctx.drawImage(video.value, 0, 0, canvas.width, canvas.height);

      if (isInverted.value) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]; // R
          data[i + 1] = 255 - data[i + 1]; // G
          data[i + 2] = 255 - data[i + 2]; // B
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const lineGap = canvas.height * 0.2;
      const topLineY = canvas.height / 2 - lineGap / 2;
      const cropHeight = lineGap;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = canvas.width;
      cropCanvas.height = cropHeight;
      cropCanvas.getContext('2d').drawImage(
        canvas,
        0, topLineY, canvas.width, cropHeight,
        0, 0, canvas.width, cropHeight
      );

      capturedImage.value = cropCanvas.toDataURL('image/jpeg', 0.9);
      await handleCapture(cropCanvas); // Pass canvas directly for OCR
    } else {
      console.warn('Video not ready for capture');
      setTimeout(captureImage, 100);
    }
  } catch (err) {
    console.error('Capture error:', err);
    alert('Failed to capture image. Please try again.');
  } finally {
    loading.value = false;
  }
};

// Initialize tafsir state
const initializeTafsirState = () => {
  tafsirOrder.value = Array.from({ length: tafsirData.value.length }, (_, i) => i);
  collapsedTafsir.value = tafsirOrder.value.reduce((acc, i) => {
    acc[i] = true;
    return acc;
  }, {});
};

// Fetch tafsir
const fetchTafsir = async (surah, verse) => {
  tafsirData.value = [];
  try {
    const promises = tafsirEditions.map(edition =>
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${verse}/${edition}`)
        .then(res => res.json())
        .catch(() => null)
    );
    const results = await Promise.all(promises);
    tafsirData.value = results.filter(r => r?.status === 'OK').map(r => r.data);
    if (tafsirData.value.length > 0) {
      initializeTafsirState();
      saveTafsirOrder();
    }
  } catch (err) {
    console.error('Tafsir fetch error:', err);
  }
};

// Save tafsir order
const saveTafsirOrder = () => {
  if (tafsirData.value?.length) {
    localStorage.setItem('tafsirOrder', JSON.stringify(tafsirOrder.value));
    localStorage.setItem('collapsedTafsir', JSON.stringify(collapsedTafsir.value));
  }
};

// Audio playback
const toggleAudio = async () => {
  if (!verseData.value) return;
  if (isPlaying.value) {
    audio.value.pause();
    isPlaying.value = false;
    return;
  }

  try {
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseData.value.surahId}:${verseData.value.verseId}/ar.minshawi`);
    const data = await response.json();
    if (data.status === 'OK') {
      audio.value.src = data.data.audio;
      audio.value.play();
      isPlaying.value = true;
      audio.value.onended = () => {
        isPlaying.value = false;
      };
    }
  } catch (err) {
    console.error('Audio API error:', err);
    alert('Failed to load audio.');
  }
};

// Theme management
const saveTheme = () => {
  localStorage.setItem('theme', theme.value);
};

// Tafsir collapse and order
const toggleTafsir = (index) => {
  collapsedTafsir.value[index] = !collapsedTafsir.value[index];
  localStorage.setItem('collapsedTafsir', JSON.stringify(collapsedTafsir.value));
};

// Toggle invert
const toggleInvert = () => {
  isInverted.value = !isInverted.value;
};

// Reset camera
const resetCamera = async () => {
  capturedImage.value = null;
  verseData.value = null;
  tafsirData.value = null;
  isPlaying.value = false;
  audio.value.pause();
  text.value = '';
  loading.value = false;
  await initCamera();
};

// Lifecycle hooks
onMounted(async () => {
  if (theme.value === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  await initCamera();
  await initOCR();
});

onUnmounted(() => {
  if (video.value && video.value.srcObject) {
    video.value.srcObject.getTracks().forEach(track => track.stop());
  }
  audio.value.pause();
  terminateOCR();
});
</script>
<style>

.bg-sepia-100 { background-color: #f4ecd8; }
.text-sepia-900 { color: #5c4b38; }
.bg-sepia-200 { background-color: #e6d8b5; }

@font-face {
  font-family: 'Amiri Quran';
  src: url('https://cdn.jsdelivr.net/npm/amiri@0.117/AmiriQuran-Regular.woff2') format('woff2');
}
.font-arabic {
  font-family: 'Amiri Quran', serif;
}

.invert {
  filter: invert(1);
}

/* Ensure video fills container on mobile */
video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Fix for iOS Safari */
@supports (-webkit-touch-callout: none) {
  video {
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>