<template>
  <div :class="['min-h-screen flex flex-col', theme === 'dark' ? 'bg-gray-900 text-white' : theme === 'sepia' ? 'bg-sepia-100 text-sepia-900' : 'bg-white text-gray-900']">
    <div v-if="!verseSelection" class="fixed inset-0 overflow-y-auto p-6 flex flex-col" :class="theme === 'dark' ? 'bg-gray-900' : theme === 'sepia' ? 'bg-sepia-100' : 'bg-white'">
      <div class="flex items-end justify-end mb-4">
        <button @click="closeFassarliMode" class="p-2 rounded bg-red-500 text-white hover:bg-red-600">
          ✕ Close
        </button>
      </div>

      <div v-if="verseData" class="mb-6 ">
        <h2 class="text-2xl font-semibold mb-2 text-right leading-relaxed">{{ verseData.surahName }} ({{ verseData.surahTransliteration }}) - آية {{ verseData.verseId }}</h2>
        <p class="text-xl mb-4 text-right leading-relaxed font-arabic" :style="{ fontSize: fontSize + 'rem' }">{{ verseData.verseText }}</p>

        <div class="mb-6 flex flex-row gap-2 justify-end">
          <button @click="toggleAudio" class="flex items-center gap-2 p-2 rounded bg-blue-500 text-white hover:bg-blue-600">
            <svg v-if="!isPlaying" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            <span>{{ isPlaying ? 'إيقاف' : 'تشغيل' }}</span>
          </button>
          
          <button @click="copyVerse" class="flex items-center gap-2 p-2 rounded bg-green-500 text-white hover:bg-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"/>
              <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" opacity="0.5"/>
            </svg>
            <span>نسخ الآية</span>
          </button>
          
          <div class="flex items-center gap-2">
            <button @click="decreaseFontSize" class="p-2 rounded bg-gray-500 text-white hover:bg-gray-600" title="Decrease font size">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M12 16h-1.05a.44.44 0 0 1-.29-.09a.6.6 0 0 1-.17-.22l-.7-1.84H6.2l-.7 1.84a.56.56 0 0 1-.16.21a.43.43 0 0 1-.29.1H4l3.31-8.35h1.38zm-2.57-3.13L8.28 9.82a9 9 0 0 1-.28-.9q-.06.27-.14.5l-.14.4l-1.15 3zM15 6l3-4h-6z"/></svg>
            </button>
            <button @click="increaseFontSize" class="p-2 rounded bg-gray-500 text-white hover:bg-gray-600" title="Increase font size">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M14 18h-1.57a.66.66 0 0 1-.44-.13a.9.9 0 0 1-.25-.34l-1-2.77H5.3l-1 2.77a.8.8 0 0 1-.24.32a.65.65 0 0 1-.44.15H2L7 5.47h2zm-3.85-4.7L8.42 8.72A13 13 0 0 1 8 7.37q-.1.41-.21.75t-.21.6L5.85 13.3zM15 2l3 4h-6z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <hr class="my-4 border-t" :class="theme === 'dark' ? 'border-gray-600' : 'border-gray-300'">

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
              <div class="flex justify-between items-center cursor-pointer" @click="toggleTafsir(tafsir)">
                <h3 class="text-lg font-medium text-right flex items-center gap-2">
                  {{ tafsir.edition.name }} ({{ tafsir.edition.englishName }})
                </h3>
                <div class="flex items-center gap-2">
                  <button @click.stop="copyTafsir(tafsir)" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"/>
                      <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" opacity="0.5"/>
                    </svg>
                  </button>
                  <span>{{ tafsirCollapseStates[tafsir.edition.identifier] ? '➕' : '➖' }}</span>
                </div>
              </div>
              <p
                v-if="!tafsirCollapseStates[tafsir.edition.identifier]"
                class="mt-2 text-right text-lg leading-relaxed font-arabic"
                :style="{ fontSize: fontSize + 'rem' }"
              >
                {{ tafsir.text }}
              </p>
            </div>
          </template>
        </draggable>

        <div v-if="selectedTafsir" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button @click="closeTafsirBook" class="absolute top-2 left-2 p-2 rounded bg-red-500 text-white hover:bg-red-600">✕</button>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-right">{{ selectedTafsir.edition.name }}</h2>
              <button @click="copyTafsir(selectedTafsir)" class="p-2 rounded bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 11c0-2.828 0-4.243.879-5.121C7.757 5 9.172 5 12 5h3c2.828 0 4.243 0 5.121.879C21 6.757 21 8.172 21 11v5c0 2.828 0 4.243-.879 5.121C19.243 22 17.828 22 15 22h-3c-2.828 0-4.243 0-5.121-.879C6 20.243 6 18.828 6 16z"/>
                  <path d="M6 19a3 3 0 0 1-3-3v-6c0-3.771 0-5.657 1.172-6.828S7.229 2 11 2h4a3 3 0 0 1 3 3" opacity="0.5"/>
                </svg>
                نسخ
              </button>
            </div>
            <div class="text-right text-lg leading-relaxed font-arabic whitespace-pre-line">
              {{ selectedTafsir.text }}
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="tafsirData" class="text-center py-8 text-gray-500">
        Loading...
      </div>
    </div>
    <transition name="slide-up">
  <div
    v-if="showCopiedOverlay"
    :class="[
      'fixed left-1/2 transform -translate-x-1/2 mb-8 px-6 py-3 rounded-lg shadow-lg text-white font-bold text-lg z-[999999]',
      theme === 'dark' ? 'bg-green-700' : 'bg-green-600',
      $i18n && $i18n.locale === 'ar' ? 'rtl' : 'ltr'
    ]"
    style="bottom: 0; min-width: 180px; text-align: center;"
    dir="auto"
  >
    {{ theme === 'ar' || ($i18n && $i18n.locale === 'ar') ? 'تم النسخ' : 'Copied!' }}
  </div>
</transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import draggable from 'vuedraggable';
import { surah } from './data.js'; // Ensure this path is correct if you're using it
const props = defineProps({ surah: Number, verse: Number });

const verseData = ref(null);
const tafsirData = ref([]);
const isPlaying = ref(false);
const audio = ref(new Audio());
const theme = ref(localStorage.getItem('theme') || 'system');
const fontSize = ref(parseFloat(localStorage.getItem('tafsirFontSize')) || 1.5);
const tafsirCollapseStates = ref(JSON.parse(localStorage.getItem('tafsirCollapseStatesById') || '{}'));
const showCopiedOverlay = ref(false);
let copiedOverlayTimeout = null;

function showCopiedMessage() {
  showCopiedOverlay.value = true;
  if (copiedOverlayTimeout) clearTimeout(copiedOverlayTimeout);
  copiedOverlayTimeout = setTimeout(() => {
    showCopiedOverlay.value = false;
  }, 1200);
}

// Ensure the tafsirEditions list is comprehensive.
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

function increaseFontSize() {
  fontSize.value = Math.min(fontSize.value + 0.1, 3.0); // Max size 3rem
  localStorage.setItem('tafsirFontSize', fontSize.value);
}

function decreaseFontSize() {
  fontSize.value = Math.max(fontSize.value - 0.1, 1.0); // Min size 1rem
  localStorage.setItem('tafsirFontSize', fontSize.value);
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
      console.error('Failed to fetch verse:', data.status);
    }
  } catch (err) {
    console.error('Verse fetch error:', err);
  }
}

// Fetch tafsir data, now with an optional identifier to fetch a specific one
const fetchTafsir = async (surah, verse, identifierToFetch = null) => {
  // If fetching a specific identifier, only clear that one, otherwise clear all
  if (!identifierToFetch) {
    tafsirData.value = []; // Clear current tafsir data if fetching all
  }

  try {
    const cloudPromises = tafsirEditions
      .filter(edition => !identifierToFetch || edition === identifierToFetch) // Filter if a specific one is requested
      .map(edition =>
        fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${verse}/${edition}`)
          .then(res => res.json())
          .catch(() => null)
      );

    const extraTafsirIds = [
      { id: 3, name: "تفسير السعدي" },
      { id: 4, name: "تفسير ابن كثير" },
      { id: 8, name: "تفسير الطبري" }
    ];
    const extraPromises = extraTafsirIds
      .filter(t => !identifierToFetch || `qtafsir-${t.id}` === identifierToFetch) // Filter if a specific one is requested
      .map(t =>
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

    const results = await Promise.all([...cloudPromises, ...extraPromises]);

    let fetchedTafsirs = results
      .filter(r => r && (r.status === 'OK' || r.text))
      .map(r => r.status === 'OK' ? r.data : r);

    if (fetchedTafsirs.length > 0) {
      if (identifierToFetch) {
        // If a specific tafsir was fetched, update only that one in the existing array
        const existingIndex = tafsirData.value.findIndex(t => t.edition.identifier === identifierToFetch);
        if (existingIndex !== -1) {
          tafsirData.value[existingIndex] = fetchedTafsirs[0];
        } else {
          // If for some reason it wasn't in the list, add it.
          tafsirData.value.push(fetchedTafsirs[0]);
        }
      } else {
        // If fetching all, then apply sorting and initial collapse states
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
          orderedTafsirs.push(...tafsirMap.values());
          tafsirData.value = orderedTafsirs;
        } else {
          tafsirData.value = fetchedTafsirs;
        }

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
    }
  } catch (err) {
    console.error('Tafsir fetch error:', err);
  }
};


const copyVerse = () => {
  if (!verseData.value) return;
  const textToCopy = `${verseData.value.verseText}\n${verseData.value.surahName} (${verseData.value.surahTransliteration}) - آية ${verseData.value.verseId}`;
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showCopiedMessage();
    })
    .catch(err => {
      console.error('Failed to copy verse: ', err);
    });
};
const copyTafsir = (tafsir) => {
  if (!tafsir) return;
  const textToCopy = `${tafsir.text}\n\n[${tafsir.edition.name}]`;
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      showCopiedMessage();
    })
    .catch(err => {
      console.error('Failed to copy tafsir: ', err);
    });
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
  }
};

// Theme management
const saveTheme = () => {
  localStorage.setItem('theme', theme.value);
};

// Tafsir collapse and order
const toggleTafsir = async (tafsir) => {
  const identifier = tafsir.edition.identifier;
  tafsirCollapseStates.value[identifier] = !tafsirCollapseStates.value[identifier];
  localStorage.setItem('tafsirCollapseStatesById', JSON.stringify(tafsirCollapseStates.value));

  // If expanding and tafsir text is not present, fetch it
  if (!tafsirCollapseStates.value[identifier] && !tafsir.text && verseData.value) {
    console.log(`Fetching tafsir for ${identifier} on expand...`);
    await fetchTafsir(verseData.value.surahId, verseData.value.verseId, identifier);
  }
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
  const savedFontSize = localStorage.getItem('tafsirFontSize');
  if (savedFontSize) {
    fontSize.value = parseFloat(savedFontSize);
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

.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s cubic-bezier(.4,2,.6,1);
}
.slide-up-enter-from, .slide-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 100%);
}
.slide-up-enter-to, .slide-up-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>