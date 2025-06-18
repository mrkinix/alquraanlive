<template>
  <div :class="['min-h-screen flex flex-col', theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'sepia' ? 'bg-sepia-100 text-sepia-900' : 'bg-white text-gray-900']">


  
    <!-- Fullscreen Results Overlay -->
    <div v-if="!verseSelection" class="fixed inset-0 overflow-y-auto p-6 flex flex-col" :class="theme === 'dark' ? 'bg-gray-900' : theme === 'sepia' ? 'bg-sepia-100' : 'bg-white'">
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
          :delay="200"
          :delay-on-touch-only="true"
          :move="checkMove"
          class="space-y-4"
        >
          <template #item="{ element: tafsir }">
            <div
              class="border rounded-lg p-4"
              :class="theme === 'dark' ? 'border-gray-600' : 'border-gray-300'"
            >
              <div class="flex justify-between items-center cursor-pointer" @click="toggleTafsir(tafsir.edition.identifier)">
                <h3 class="text-lg font-medium text-right">
                  {{ tafsir.edition.name }} ({{ tafsir.edition.englishName }})
                </h3>
                <span>{{ tafsirCollapseStates[tafsir.edition.identifier] ? '➕' : '➖' }}</span>
              </div>
              <p
                v-if="!tafsirCollapseStates[tafsir.edition.identifier]"
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

     
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import draggable from 'vuedraggable';
import { surah } from './data.js';
const emit = defineEmits(['close']);
const props = defineProps({ surah: Number, verse: Number }); // <--- Accept as props

const verseData = ref(null);
const tafsirData = ref([]);
const isPlaying = ref(false);
const audio = ref(new Audio());
const theme = ref(localStorage.getItem('theme') || 'system');
const tafsirCollapseStates = ref(JSON.parse(localStorage.getItem('tafsirCollapseStatesById') || '{}'));

const tafsirEditions = [
  'ar.muyassar', 'ar.jalalayn', 'ar.qurtubi', 'ar.miqbas', 'ar.waseet', 'ar.baghawi'
];

const closeFassarliMode = () => emit('close');


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
 let fetchedTafsirs = results.filter(r => r?.status === 'OK').map(r => r.data);

    if (fetchedTafsirs.length > 0) {
      const savedOrderIdentifiers = JSON.parse(localStorage.getItem('tafsirOrderByIdentifiers') || 'null');
      if (savedOrderIdentifiers && Array.isArray(savedOrderIdentifiers)) {
        const tafsirMap = new Map(fetchedTafsirs.map(t => [t.edition.identifier, t]));
        const orderedTafsirs = [];
        savedOrderIdentifiers.forEach(id => {
          if (tafsirMap.has(id)) {
            orderedTafsirs.push(tafsirMap.get(id));
            tafsirMap.delete(id);
          }
        });
        orderedTafsirs.push(...tafsirMap.values()); // Add any new/unsorted tafsirs
        tafsirData.value = orderedTafsirs;
      } else {
        tafsirData.value = fetchedTafsirs;
      }

      // Initialize or confirm collapse states for all tafsirs
      let statesChanged = false;
      tafsirData.value.forEach(tafsir => {
        const identifier = tafsir.edition.identifier;
        if (tafsirCollapseStates.value[identifier] === undefined) {
          tafsirCollapseStates.value[identifier] = true; // Default to collapsed
          statesChanged = true;
        }
      });
   if (statesChanged) {
        localStorage.setItem('tafsirCollapseStatesById', JSON.stringify(tafsirCollapseStates.value));
      }    }
  } catch (err) {
    console.error('Tafsir fetch error:', err);
  }
};

// Save tafsir order
const saveTafsirOrder = () => {
  if (tafsirData.value?.length) {
  const order = tafsirData.value.map(tafsir => tafsir.edition.identifier);
    localStorage.setItem('tafsirOrderByIdentifiers', JSON.stringify(order));
    localStorage.setItem('tafsirCollapseStatesById', JSON.stringify(tafsirCollapseStates.value));
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
const toggleTafsir = (identifier) => {
  tafsirCollapseStates.value[identifier] = !tafsirCollapseStates.value[identifier];
  localStorage.setItem('tafsirCollapseStatesById', JSON.stringify(tafsirCollapseStates.value));
};



// Check if a tafsir item can be moved (dragged)
const checkMove = (evt) => {
    const identifier = evt.draggedContext.element.edition.identifier;

  // Allow dragging only if the tafsir item is collapsed
  return tafsirCollapseStates.value[identifier];
};
onMounted(async () => {
  if (theme.value === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.value = prefersDark ? 'dark' : 'light';
  }
  // Fetch verse and tafsir using props
  if (props.surah && props.verse) {
    await fetchVerse(props.surah, props.verse);
  }
});

onUnmounted(async () => {
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