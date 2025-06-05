<template>
  <div :class="['min-h-screen flex flex-col', theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'sepia' ? 'bg-sepia-100 text-sepia-900' : 'bg-white text-gray-900']">
    <!-- Camera View -->
    <div v-if="!capturedImage && !verseSelection" class="relative flex-1">
      <video ref="video" autoplay playsinline muted :class="['w-full h-full object-cover', { 'invert': isInverted }]"></video>
      <div class="absolute inset-0 flex justify-center items-center">
        <div class="w-[250px] h-[50px] bg-transparent border-2 border-red-500"></div>
      </div>
      
         <button @click="closeFassarliMode" class=" absolute top-4 right-4 p-2 rounded bg-red-500 text-white hover:bg-red-600">
          ✕ Close
        </button>
      <button @click="captureImage" class="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg">
        <svg class="w-8 h-8" fill="none" stroke="black" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke-width="1.5"/>
        </svg>
      </button>
    </div>

    <!-- Verse Selection Overlay -->
    <div v-if="verseSelection" class="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-opacity-90" :class="theme === 'dark' ? 'bg-gray-900' : theme === 'sepia' ? 'bg-sepia-100' : 'bg-white'">
      <h2 class="text-2xl font-semibold mb-4">Select a Verse (Page {{ pageNumber }})</h2>
      <div class="flex gap-4 flex-wrap justify-center">
        <button
          v-for="verse in verseRange"
          :key="verse"
          @click="selectVerse(verse)"
          class="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-md hover:bg-blue-600"
        >
          {{ verse }}
        </button>
      </div>
      <button @click="resetCamera" class="mt-4 text-blue-500 underline">Back to Camera</button>
    </div>

    <!-- Fullscreen Results Overlay -->
    <div v-if="capturedImage && !verseSelection" class="fixed inset-0 overflow-y-auto p-6 flex flex-col" :class="theme === 'dark' ? 'bg-gray-900' : theme === 'sepia' ? 'bg-sepia-100' : 'bg-white'">
      <!-- Theme Toggle -->
      <div class="flex justify-end mb-4">
   

             <!-- Close Button -->
      <div class="flex justify-start mb-4">
        <button @click="closeFassarliMode" class="p-2 rounded bg-red-500 text-white hover:bg-red-600">
          ✕ Close
        </button>
      </div>
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

      <!-- Tafsir Section -->
      <div v-if="tafsirData?.length" class="flex-1 space-y-4">
        <draggable
          v-model="tafsirData"
          item-key="edition.identifier"
          @end="saveTafsirOrder"
          class="space-y-4"
        >
          <template #item="{ element: tafsir, index }">
            <div
              class="border rounded-lg p-4"
              :class="theme === 'dark' ? 'border-gray-600' : 'border-gray-300'"
            >
              <div class="flex justify-between items-center cursor-pointer" @click="toggleTafsir(index)">
                <h3 class="text-lg font-medium text-right">
                  {{ tafsir.edition.name }} ({{ tafsir.edition.englishName }})
                </h3>
                <span>{{ collapsedTafsir[index] ? '➕' : '➖' }}</span>
              </div>
              <p
                v-if="!collapsedTafsir[index]"
                class="mt-2 text-right text-lg leading-relaxed font-arabic"
              >
                {{ tafsir.text }}
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
import Tesseract from 'tesseract.js'
import { surah } from './data.js';
import { quranPageVerses } from './info.js';

// State
const video = ref(null);
const capturedImage = ref(null);
const verseData = ref(null);
const tafsirData = ref([]);
const matches = ref([]);
const isPlaying = ref(false);
const audio = ref(new Audio());
const theme = ref(localStorage.getItem('theme') || 'system');
const collapsedTafsir = ref(JSON.parse(localStorage.getItem('collapsedTafsir') || '{}'));
const text = ref('');
const loading = ref(false);
const isInverted = ref(false);
const verseSelection = ref(false);
const verseRange = ref([]);
const pageNumber = ref(null);

const tafsirEditions = [
  'ar.muyassar',
  'ar.jalalayn',
  'ar.qurtubi',
  'ar.miqbas',
  'ar.waseet',
  'ar.baghawi'
];
// Define emits
const emit = defineEmits(['close']);

const closeFassarliMode = () => {
  emit('close');
};
// Initialize camera
const initCamera = async () => {
  try {
    if (video.value?.srcObject) {
      video.value.srcObject.getTracks().forEach(track => track.stop());
    }

    const constraints = [
      { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
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
    alert('Camera error: ' + err.message);
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

      // Define the capture area (5x larger than before)
      const captureWidth = 250; // 50px * 5
      const captureHeight = 50; // 10px * 5
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate the crop area
      const cropX = centerX - (captureWidth / 2);
      const cropY = centerY - (captureHeight / 2);
      
      // Create a new canvas for the cropped image
      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = captureWidth;
      cropCanvas.height = captureHeight;
      const cropCtx = cropCanvas.getContext('2d');
      
      // Draw the cropped area
      cropCtx.drawImage(
        canvas,
        cropX, cropY, captureWidth, captureHeight,
        0, 0, captureWidth, captureHeight
      );

      capturedImage.value = cropCanvas.toDataURL('image/jpeg', 0.9);
      await handleCapture(cropCanvas);
    } else {
      console.warn('Video not ready for capture');
      setTimeout(captureImage, 100);
    }
  } catch (err) {
    console.error('Capture error:', err);
    alert('Failed to capture image: ' + err.message);
  } finally {
    loading.value = false;
  }
};

// Fetch a specific verse from Quran API
async function fetchVerse(surahId, verseId) {
  try {
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${surahId}:${verseId}`);
    const data = await response.json();
    if (data.status === 'OK') {
      verseData.value = {
        surahId,
        surahName: data.data.surah.name,
        surahTransliteration: data.data.surah.englishName,
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
      // Initialize collapsed state for each tafsir
      collapsedTafsir.value = {};
      tafsirData.value.forEach((_, index) => {
        collapsedTafsir.value[index] = true;
      });
      saveTafsirOrder();
    }
  } catch (err) {
    console.error('Tafsir fetch error:', err);
  }
};

// Save tafsir order
const saveTafsirOrder = () => {
  if (tafsirData.value?.length) {
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
  tafsirData.value = [];
  isPlaying.value = false;
  audio.value.pause();
  audio.value.src = '';
  text.value = '';
  loading.value = false;
  verseSelection.value = false;
  await initCamera();
};

async function handleCapture(canvas) {
  loading.value = true;
  text.value = '';
  matches.value = [];

  try {
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const { data: { text: result } } = await Tesseract.recognize(imageDataUrl, 'eng', {
      tessedit_char_whitelist: '٠١٢٣٤٥٦٧٨٩0123456789',
      tessedit_do_invert: true,
      preserve_interword_spaces: 1,
      logger: m => console.log(m),
    });

    text.value = result;

    const arabicNumbers = result.match(/[٠١٢٣٤٥٦٧٨٩]+/g)?.join('') || '';
    const westernNumbers = result.match(/[0-9]+/g)?.join('') || '';

    const numberMap = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };
    const detectedNumber = arabicNumbers
      ? arabicNumbers.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => numberMap[d])
      : westernNumbers;

    text.value = detectedNumber;

    if (detectedNumber) {
      pageNumber.value = parseInt(detectedNumber);
      if (pageNumber.value >= 1 && pageNumber.value <= 604) {
        const [firstVerse, lastVerse] = quranPageVerses[pageNumber.value - 1] || [1, 1];
        verseRange.value = Array.from({ length: lastVerse - firstVerse + 1 }, (_, i) => firstVerse + i);
        verseSelection.value = true;
      } else {
        alert('Invalid page number. Please try again.');
      }
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

// Determine Surah from page number
function getSurahFromPage(page) {
  for (let i = 0; i < surah.length; i++) {
    if (page <= surah[i]) {
      return i + 1; // Surah numbers are 1-based
    }
  }
  return 2; // Default to Surah 2 if not found
}

// Select verse from range
async function selectVerse(verseId) {
  verseSelection.value = false;
  const surahId = getSurahFromPage(pageNumber.value);
  await fetchVerse(surahId, verseId);
}

onMounted(async () => {
  if (theme.value === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  await initCamera();
});

onUnmounted(async () => {
  if (video.value && video.value.srcObject) {
    video.value.srcObject.getTracks().forEach(track => track.stop());
  }
  audio.value.pause();
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
  font-size: 1.5rem;
  line-height: 2.5rem;
}

.invert {
  filter: invert(1);
}

video {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

@supports (-webkit-touch-callout: none) {
  video {
    position: absolute;
    top: 0;
    left: 0;
  }
}

.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
</style>