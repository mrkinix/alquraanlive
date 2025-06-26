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
        <h3 class="text-lg font-medium text-right flex items-center gap-2">
          {{ tafsir.edition.name }} ({{ tafsir.edition.englishName }})
          <button
     @click.stop="chooseTafsir(tafsir)"
  class="ml-2 p-1 rounded hover:bg-gray-200"

            :title="`عرض ${tafsir.edition.name}`"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" fill-rule="evenodd" d="M4.2 1h-.023c-.308 0-.573 0-.79.02a1.5 1.5 0 0 0-.67.201a1.5 1.5 0 0 0-.496.495a1.5 1.5 0 0 0-.2.67C2 2.604 2 2.87 2 3.177v8.646c0 .308 0 .573.02.79c.023.231.071.459.201.67a1.5 1.5 0 0 0 .495.496c.212.13.44.178.67.2c.218.021.483.021.791.021h6.646c.308 0 .573 0 .79-.02c.231-.023.459-.071.67-.201a1.5 1.5 0 0 0 .496-.495c.13-.212.178-.44.2-.67c.021-.218.021-.483.021-.791V3.177c0-.308 0-.573-.02-.79a1.5 1.5 0 0 0-.201-.67a1.5 1.5 0 0 0-.495-.496a1.5 1.5 0 0 0-.67-.2A9 9 0 0 0 10.823 1zm-.961 1.074c.028-.018.085-.043.242-.058C3.645 2.001 3.863 2 4.2 2h6.6c.337 0 .555 0 .72.016c.156.015.213.04.241.058a.5.5 0 0 1 .165.165c.018.028.043.085.058.242c.015.164.016.382.016.719v8.6c0 .337 0 .555-.016.72c-.015.156-.04.213-.058.241a.5.5 0 0 1-.165.165c-.028.018-.085.043-.242.058A9 9 0 0 1 10.8 13H4.2c-.337 0-.555 0-.72-.016c-.156-.015-.213-.04-.241-.058a.5.5 0 0 1-.165-.165c-.018-.028-.043-.085-.058-.242A9 9 0 0 1 3 11.8V3.2c0-.337 0-.555.016-.72c.015-.156.04-.213.058-.241a.5.5 0 0 1 .165-.165M5 10a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zm-.5-2.5A.5.5 0 0 1 5 7h5a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 4a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1z" clip-rule="evenodd"/></svg>
          </button>
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

<!-- Modal or overlay for selected tafsir book -->
<div v-if="selectedTafsir" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
    <button @click="closeTafsirBook" class="absolute top-2 left-2 p-2 rounded bg-red-500 text-white hover:bg-red-600">✕</button>
    <h2 class="text-xl font-bold mb-4 text-right">{{ selectedTafsir.edition.name }}</h2>
    <div class="text-right text-lg leading-relaxed font-arabic whitespace-pre-line">
      {{ selectedTafsir.text }}
    </div>
  </div>
</div>
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

const emit = defineEmits(['close', 'choose-tafsir']);


const closeFassarliMode = () => emit('close');

const selectedTafsir = ref(null);

function showTafsirBook(tafsir) {
  selectedTafsir.value = tafsir;
}
function closeTafsirBook() {
  selectedTafsir.value = null;
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
// Fetch tafsir
const fetchTafsir = async (surah, verse) => {
  tafsirData.value = [];
  try {
    // 1. Fetch from alquran.cloud
    const cloudPromises = tafsirEditions.map(edition =>
      fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${verse}/${edition}`)
        .then(res => res.json())
        .catch(() => null)
    );

    // 2. Fetch from quran-tafseer.com (السعدي: id=3, ابن كثير: id=4)
    const extraTafsirIds = [
      { id: 3, name: "تفسير السعدي" },
      { id: 4, name: "تفسير ابن كثير" }
    ];
    const extraPromises = extraTafsirIds.map(t => // Use the proxy path
      fetch(`/api/tafseer/${t.id}/${surah}/${verse}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => data && {
          text: data.text,
          edition: {
            identifier: `qtafsir-${t.id}`,
            name: t.name,
            englishName: t.name,
            language: 'ar'
          }
        })
        .catch(() => null)
    );

    // 3. Wait for all
    const results = await Promise.all([...cloudPromises, ...extraPromises]);

    // 4. Normalize and filter
    let fetchedTafsirs = results
      .filter(r => r && (r.status === 'OK' || r.text))
      .map(r => r.status === 'OK' ? r.data : r);

    // 5. Order and store
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
      }
    }
  } catch (err) {
    console.error('Tafsir fetch error:', err);
  }
};



function chooseTafsir(tafsir) {
  emit('choose-tafsir', tafsir.edition.identifier);
  emit('close');
}

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