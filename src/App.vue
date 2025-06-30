<template>
  <fassarli
    v-if="fassarliMode"
     @close="closeFassarli"
  @choose-tafsir="openTafsirMode"

    :verse="selectedVerse"
    :surah="currentVerseData ? currentVerseData.surah : 1"
    class="z-[9999999] fixed w-full h-full"
  />  <div
    class="app-container overflow-hidden"
    :class="[currentTheme === 'dark' ? 'dark-theme' : currentTheme === 'sepia' ? 'sepia-theme' : 'light-theme']"
    @mousedown="handleAppMouseDown"
    @mouseup="handleAppMouseUp"
    @mouseleave="handleAppMouseLeave"
    @touchstart="handleAppTouchStart"
    @touchmove="handleAppTouchMove"
    @touchend="handleAppTouchEnd"
    @touchcancel="handleAppTouchCancel"
  >
    <!-- Mushaf Selection Overlay -->
    <div
      v-if="showMushafSelection"
      class="mushaf-selection-overlay fixed inset-0 flex items-center justify-center z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
    >
      <div
        class="mushaf-selection-container bg-opacity-80 p-6 rounded-lg"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
      >
        <h2 class="text-xl mb-4 text-center">
          {{ currentLanguage === 'ar' ? 'اختر نوع المصحف' : 'Select Mushaf Type' }}
        </h2>
        <div class="flex flex-col gap-3 mt-10">
          <button
            @click.stop="selectMushaf('hafs')"
            class="p-3 rounded-lg"
            :class="currentTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ currentLanguage === 'ar' ? 'حفص عن عاصم' : 'Hafs' }}
          </button>
          <button
            @click.stop="selectMushaf('warsh')"
            class="p-3 rounded-lg"
            :class="currentTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ currentLanguage === 'ar' ? 'ورش عن نافع' : 'Warsh' }}
          </button>
          <button
            @click.stop="selectMushaf('qaloon')"
            class="p-3 rounded-lg"
            :class="currentTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ currentLanguage === 'ar' ? 'قالون عن نافع' : 'Qaloon' }}
          </button>
        </div>
      </div>
    </div>
<div
  v-if="displayMode === 'Hifdh'"
  class="fixed inset-y-0 left-0 w-1/2 z-[999998]"
  style="pointer-events: auto;"
  @click="selectVerse(false)"
></div>
<div
  v-if="displayMode === 'Hifdh'"
  class="fixed inset-y-0 right-0 w-1/2 z-[999998]"
  style="pointer-events: auto;"
  @click="selectVerse(true)"
></div>
    <!-- Full Surah Display -->
<div
  v-if="displayMode === 'full-surah' && currentSurahData"
  class="full-surah-display text-justify sm:px-[16.66%] sm:text-xl leading-relaxed select-none"
  :key="currentSurahData.id"
  ref="versesContainer"
  @scroll="handleFullSurahScroll"
>
  <h2 class="surah-title-header font-amiri cursor-pointer mb-24"
      @touchstart.stop="toggleSurahVerseMenu"
      @touchend.stop="toggleSurahVerseMenu"
      @click.stop="toggleSurahVerseMenu"
      :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'">
    <span class="title-text">
      {{ currentLanguage === 'ar' ? currentSurahData.arabicName : currentSurahData.englishName }}
    </span>
  </h2>
  <div
    v-for="verse in visibleSurahVerses"
    :key="verse.uuid"
    :data-verse-uuid="verse.uuid"
    class="verse-line flex items-center justify-start cursor-pointer py-6"
    :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
  >
    <span class="verse-text text-2xl font-amiri flex-1">
      <span
        v-for="(word, index) in verse.text.split(' ')"
        :key="`${verse.uuid}-${index}`"
        :data-word-uuid="`${verse.uuid}-${index}`"
        class="inline-block mx-1 pb-7 "
        :class="[
          { 'highlighted': isWordHighlighted(index, verse.uuid) },
          getHighlightClass(index, verse.uuid)
        ]"
        @mousedown.stop="highlightMode ? startWordSelection($event, index, verse.uuid) : null"
        @mousemove.stop="highlightMode ? updateWordSelection($event, index, verse.uuid) : null"
        @mouseup.stop="highlightMode ? endWordSelection($event) : null"
        @touchstart.stop="highlightMode ? startWordSelection($event, index, verse.uuid) : null"
        @touchmove.stop="highlightMode ? updateWordSelection($event, index, verse.uuid) : null"
        @touchend.stop="highlightMode ? endWordSelection($event) : null"
        @click.stop="highlightMode ? handleWordClick(index, verse) : handleVerseClick(verse.verse, lastSurahId)"
      >
        {{ word }}
      </span>
      <!-- Verse Number Decoration -->
      <svg
        @click.stop.prevent="openVerseNote(verse)"
        @touchend.stop
        width="26"
        height="26"
        viewBox="0 0 26 26"
        class="verse-number-svg ml-2 mr-1 decorative-number cursor-pointer inline-block align-middle"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="13" cy="13" r="11.5" stroke="currentColor" stroke-width="1.5" fill="transparent" />
        <text
          x="50%"
          y="50%"
          dominant-baseline="middle"
          text-anchor="middle"
          fill="currentColor"
          class="font-amiri"
          style="font-size: 11px;"
        >
          {{ verse.verse }}
        </text>
      </svg>
    </span>
  </div>
</div>


  
 <!-- verse Display -->
    <transition v-if="displayMode !== 'full-surah'" name="fade" mode="out-in" class="main-content-transition select-none">
      <div v-if="isLoading" class="loading-message text-xl text-center" key="loading">
        <p v-if="currentLanguage === 'ar'">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ</p>
        <p v-else>In the name of Allah, the Most Gracious, the Most Merciful.</p>
      </div>
      <div v-else-if="errorMessage" class="error-message text-xl text-center" key="error">
        <p>{{ currentLanguage === 'ar' ? 'خطأ:' : 'Error:' }}</p>
        <p>{{ errorMessage }}</p>
      </div>
      <div
        v-else-if="currentTextParts.length > 0 && currentVerseData"
        class="quran-verse-display text-center"
        :key="currentVerseData.uuid"
      >
       

        <p
          :key="currentPartIndex"
          class="quran-verse-text-content text-3xl md:text-5xl font-amiri max-w-4xl mx-auto leading-loose"
          :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
        >
          <transition-group name="word-fade" tag="span">
            <span
              v-for="(word, index) in displayedWords"
  :key="`${currentVerseData.uuid}-${currentPartIndex}-${index}`"
              class="inline-block flex-shrink mx-1.5 pulsing-word py-8"
              :class="[
    { 'highlighted': isWordHighlighted(index, currentVerseData.uuid) }, // Pass currentVerseData.uuid
    getHighlightClass(index, currentVerseData.uuid),                   // Pass currentVerseData.uuid
    { 'correct-highlight': isWordCorrect(index) },
    { 'mistake-glow': isWordMistake(index) },
    { 'opacity-40': isWordUnread(index) }
              ]"


            v-on:mousedown="displayMode === 'Hifdh' && highlightMode ? (e) => { e.stopPropagation(); startWordSelection(e, index, currentVerseData.uuid); } : null"
    v-on:mousemove="displayMode === 'Hifdh' && highlightMode ? (e) => { e.stopPropagation(); updateWordSelection(e, index, currentVerseData.uuid); } : null"
    v-on:mouseup="displayMode === 'Hifdh' && highlightMode ? (e) => { e.stopPropagation(); endWordSelection(e); } : null"
    v-on:touchstart="displayMode === 'Hifdh' && highlightMode ? (e) => { e.stopPropagation(); startWordSelection(e, index, currentVerseData.uuid); } : null"
    v-on:touchmove="displayMode === 'Hifdh' && highlightMode ? (e) => { e.stopPropagation(); updateWordSelection(e, index, currentVerseData.uuid); } : null"
    v-on:touchend="displayMode === 'Hifdh' && highlightMode ? (e) => { e.stopPropagation(); endWordSelection(e); } : null"
    v-on:click="displayMode === 'Hifdh' && highlightMode ? (e) => { e.stopPropagation(); handleWordClick(index, verse); } : null"
            >
            <!-- -->
              {{ word }}
            </span>
          </transition-group>
        </p>
      </div>
      <div v-else class="no-verse-message text-xl text-center" key="no-verse">
        {{ currentLanguage === 'ar' ? 'لا توجد آيات للعرض.' : 'No Verses to display.' }}
      </div>
    </transition>

    <!-- Bottom Information Display -->
    <div
  v-if="showBottomInfo && !isLoading && !errorMessage && currentVerseData && displayMode !== 'Hifdh'"
      class="bottom-info control-buttons-container w-auto text-sm font-amiri z-[55] fixed max-sm:bottom-16 bottom-5 px-5 rounded-md text-center cursor-pointer"
      :class="displayMode === 'full-surah' ? 'max-sm:bottom-16 bottom-5' : ''"
      :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
        @touchstart.stop="toggleSurahVerseMenu"
        @touchend.stop="toggleSurahVerseMenu"
      @click.stop="toggleSurahVerseMenu"
    >
      <p>
        <span>{{ currentLanguage === 'ar' ? currentVerseData.surahArabicName : currentVerseData.surahEnglishName }}</span>
        <span class="mx-1">-</span>
        <span>{{ currentLanguage === 'ar' ? 'الآية' : 'Verse' }} {{ currentVerseData.verse }}</span>
      </p>
    </div>

    <!-- Search Overlay -->
    <div
      v-if="showSearchOverlay"
      class="search-overlay bg-none fixed inset-0 flex flex-col items-center justify-start sm:p-[2rem] sm:pt-8 z-[100]"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      style="background-color: transparent !important;"
            @click="closeOverlay('search')"

    >
      <div
        class="search-container bg-opacity-80 rounded-lg w-full !flex !flex-col h-full max-w-2xl"
        :class="currentTheme === 'dark' ? 'bg-black/40' : 'bg-white'"
      >
        <div class="flex items-center  py-6  max-sm:flex-col z-[99]"
        :class="currentTheme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-800'">
          <input
            v-model="searchQuery"
             @click.stop
            @keyup.enter="performSearch"
            type="text"
            :placeholder="currentLanguage === 'ar' ? 'ابحث في القرآن...' : 'Search in Quran...'"
            class="flex-1 p-2  w-[88%] rounded-l-lg border border-gray-300 focus:outline-none search-input"
            :class="[currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800', currentLanguage === 'ar' ? 'text-right' : 'text-left']"
            ref="searchInput"
          />
        <div class="flex items-center mt-4 max-sm:flex-row">

          <button
            @click.stop="performSearch"
            class="mx-1 p-2   text-white rounded-2xl"
        :class="currentTheme === 'dark' ? 'text-white' : 'text-black'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-4.23c0-3.58-2.92-6.5-6.5-6.5S3 5.92 3 9.5s2.92 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button
            @click.stop="closeOverlay('search')"
            class="mx-1 p-2 0  text-white rounded-2xl"
        :class="currentTheme === 'dark' ? 'text-white' : 'text-black'"
          >
            ✕
          </button>
          </div>
        </div>
        <div v-if="isSearching" class="text-center py-4">
          {{ currentLanguage === 'ar' ? 'جاري البحث...' : 'Searching...' }}
        </div>
            <div v-else-if="searched && !isSearching && searchResults.length === 0 && searchQuery.trim().length > 0 && !errorMessage" class="text-center py-4">
          {{ currentLanguage === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found' }}
        </div>
        <div v-else class="search-results h-full overflow-y-auto">
          <div
            v-for="result in paginatedResults"
            :key="result.uuid"
            @click.stop="selectSearchResult(result)"
            class="search-result-item px-12 py-6  border-b cursor-pointer"
            :class="currentTheme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'"
          >
            <p class="text-2xl leading-loose" :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'">
              {{ result.text }}
            </p>
            <p class="text-sm opacity-80">
              {{ currentLanguage === 'ar' ? result.surahArabicName : result.surahEnglishName }}
              - {{ currentLanguage === 'ar' ? 'الآية' : 'Verse' }} {{ result.verse }}
            </p>
          </div>
          <div v-if="searchResults.length > resultsPerPage" class="pagination">
            <button
              @click.stop="searchPagination(-1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg"
              :class="currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'"
            >
              {{ currentLanguage === 'ar' ? 'السابق' : 'Previous' }}
            </button>
            <span>{{ currentPage }} / {{ Math.ceil(searchResults.length / resultsPerPage) }}</span>
            <button
              @click.stop="searchPagination(1)"
              :disabled="currentPage === Math.ceil(searchResults.length / resultsPerPage)"
              class="p-2 rounded-lg"
              :class="currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'"
            >
              {{ currentLanguage === 'ar' ? 'التالي' : 'Next' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Search Overlay -->
    <div
      v-if="showVoiceSearchOverlay"
      class="voice-search-overlay fixed inset-0 flex items-center justify-center z-[100]"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      @click.stop="closeOverlay('voice')"
    >
      <div class="voice-search-container bg-opacity-80 p-6 rounded-lg" @click.stop @touchend.stop>
        <div class="voice-animation" @click.stop="resetVoiceSearch">
          <div class="ring pulse-1"></div>
          <div class="ring pulse-2"></div>
          <div class="ring pulse-3"></div>
          <svg
            class="mic-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            :fill="iconFillColor"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </div>
        <p
          class="detected-text mt-4"
          v-if="detectedWords.length > 0"
          :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
          :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
        >
          <span
            v-for="(word, index) in detectedWords"
            :key="index"
            class="word-animation"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            {{ word }}
          </span>
        </p>
        <p v-else class="text-lg">
          {{ currentLanguage === 'ar' ? 'تحدث الآن...' : 'Speak now...' }}
        </p>
      </div>
    </div>

    <!-- Language Selection Overlay -->
    <div v-if="showLanguageSelection" class="language-selection-overlay text-white">
      <button
        v-for="lang in ['ar', 'en', 'fr', 'bn', 'tr', 'ur']"
        :key="lang"
        @click.stop="selectInitialLanguage(lang)"
        class="language-button text-xl"
      >
        {{ lang === 'ar' ? 'العربية' : langNames[lang] }}
      </button>

    </div>

    <!-- Surah and Verse Selection Overlay -->
    <div
      v-if="showSurahVerseMenu"
      class="surah-verse-overlay  fixed inset-0 flex flex-col items-center justify-start pt-8 z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      @click.stop="handleAppClick"
            @mousedown.stop
  @mouseup.stop
  @touchstart.stop
  @touchend.stop
  @keydown.stop
    >
      <div
        class="surah-verse-container  bg-opacity-80 p-6 rounded-lg w-full max-w-2xl"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
        @click.stop @touchend.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl">
            {{ currentLanguage === 'ar' ? 'اختر السورة والآية' : 'Select Surah and Verse' }}
          </h2>
          <button
            @click.stop="showSurahVerseMenu = false"
            class="p-2 bg-gray-500 text-white rounded-lg"
            :class="currentTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-400'"
          >
            ✕
          </button>
        </div>
        <div class="flex flex-col gap-4">
          <select
            v-model="selectedSurah"
            class="p-2 rounded-lg border  surah-verse-select"
            :class="currentTheme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'"
            @change="updateVerseOptions"
            ref="surahSelect"
            aria-label="Select Surah"
          >
            <option v-for="surah in SURAH_DATA" :key="surah.id" :value="surah.id">
              {{ currentLanguage === 'ar' ? surah.arabicName : surah.englishName }} ({{ surah.verses }} {{ currentLanguage === 'ar' ? 'آيات' : 'Verses' }})
            </option>
          </select>
          <select
            v-model="selectedVerse"
            class="p-2 rounded-lg border surah-verse-select"
            :class="currentTheme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'"
            ref="verseSelect"
          >
            <option v-for="verse in verseOptions" :key="verse" :value="verse">
              {{ currentLanguage === 'ar' ? 'الآية' : 'Verse' }} {{ verse }}
            </option>
          </select>
          <button
            @click.stop="selectSurahVerse"
            class="p-2 bg-blue-500 text-white rounded-lg"
            :class="currentTheme === 'dark' ? 'hover:bg-blue-600' : 'hover:bg-blue-400'"
          >
            {{ currentLanguage === 'ar' ? 'اختيار' : 'Select' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notes Overlay (Hifdh Mode) -->
    <div
      v-if="showNotesOverlay"
      class="notes-overlay fixed inset-0 flex items-center justify-center z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      @click.stop="closeNotesOverlay"
      
    >
      <div
        class="notes-container bg-opacity-80 p-6 rounded-lg w-full max-w-2xl"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
        @click.stop
        @touchend.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl">
            {{ currentLanguage === 'ar' ? 'ملاحظات الآية' : 'Verse Notes' }}
          </h2>
          <button
            @click.stop="closeNotesOverlay"
            class="p-2 bg-red-500 text-white rounded-lg"
            :class="currentTheme === 'dark' ? 'hover:bg-red-600' : 'hover:bg-red-400'"
          >
            ✕
          </button>
        </div>
        <textarea
  v-model="currentNote"
  ref="notesTextarea"
  @touchend="focusTextarea"
  @focus="notesTextareaFocused = true"
  @blur="notesTextareaFocused = false"
          class="w-full h-64 p-2 rounded-lg border"
          :class="currentTheme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'"
          :placeholder="currentLanguage === 'ar' ? 'اكتب ملاحظاتك هنا...' : 'Write your notes here...'"
        ></textarea>
      </div>
    </div>

    <!-- Loops Menu (Hifdh Mode) -->
    <div
      v-if="showLoopsMenu"
      class="loops-overlay fixed inset-0 flex items-center justify-center z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
        @click.stop="showLoopsMenu = false"
        @touchstart.stop="showLoopsMenu = false"
    >
      <div
        class="loops-container bg-opacity-80 p-6 rounded-lg"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
        @click.stop="showLoopsMenu = false"
        @touchstart.stop="startLoopSwipe"
        @touchmove="handleLoopSwipe"
        @touchend="endLoopSwipe"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl">
            {{ currentLanguage === 'ar' ? 'عدد التكرارات' : 'Number of Loops' }}
          </h2>
        </div>
        <div class="loops-picker w-full h-full p-10">
          <div class="loop-value text-2xl text-center">
            {{ HifdhLoopCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- Word Highlight Menu -->
    <div
      v-if="showHighlightMenu"
      class="highlight-menu fixed z-50"
      :style="{ top: highlightMenuPosition.top + 'px', left: highlightMenuPosition.left + 'px' }"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      @mousedown.stop
  @mouseup.stop
  @touchstart.stop
  @touchend.stop
  @click.stop
  @keydown.stop
    >
      <div
        class="highlight-container bg-opacity-80 p-4 rounded-lg flex gap-2"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
        @mousedown.stop
  @mouseup.stop
  @touchstart.stop
  @touchend.stop
  @click.stop
  @keydown.stop
      >
        <button
          v-for="color in highlightColors"
          :key="color"
          @click.stop="applyHighlight(color)"
          class="w-8 h-8 rounded-full"
          :style="{ backgroundColor: color }"
        ></button>
        <button
          @click.stop="removeHighlight"
          class="p-2 bg-red-500 text-white rounded-lg"
          :class="currentTheme === 'dark' ? 'hover:bg-red-600' : 'hover:bg-red-400'"
        >
          ✕
        </button>
      </div>
    </div>
<!-- Highlight Context Menu -->
<div
  v-if="showHighlightContextMenu"
  class="highlight-context-menu fixed z-60 p-3 rounded-lg"
  :style="{ top: highlightContextMenuPosition.top + 'px', left: highlightContextMenuPosition.left + 'px' }"
  :class="currentTheme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'"
  style="display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 10px;"
  @mousedown.stop
  @mouseup.stop
  @touchstart.stop
  @touchend.stop
  @click.stop
  @keydown.stop
>
  <!-- Delete Icon -->
  <button @click.stop="removeSingleHighlight" class="h-full">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M7.378 5.531a2.75 2.75 0 0 1 1.92-.781h10.297c.598 0 1.294.166 1.863.519c.579.358 1.11.974 1.11 1.856v9.75c0 .882-.531 1.497-1.11 1.856a3.65 3.65 0 0 1-1.863.519H9.298a2.75 2.75 0 0 1-1.92-.781l-5.35-5.216a1.75 1.75 0 0 1 0-2.506zM14.03 9.47a.75.75 0 1 0-1.06 1.06L14.44 12l-1.47 1.47a.75.75 0 1 0 1.06 1.06l1.47-1.47l1.47 1.47a.75.75 0 1 0 1.06-1.06L16.56 12l1.47-1.47a.75.75 0 1 0-1.06-1.06l-1.47 1.47z"/></svg>
  </button>
  <!-- Change Color Icon -->
  <button @click.stop="showHighlightMenuForWord">
    <span :style="{ backgroundColor: highlightContextMenu.color, width: '24px', height: '24px', borderRadius: '50%', display: 'inline-block', border: '2px solid #888' }"></span>
  </button>
  <!-- Notes Icon -->
  <button @click.stop="openVerseNoteByContext">
    <!-- Use your existing note icon SVG here -->
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M11 2a1 1 0 0 0-1 1v1H8.25A3.25 3.25 0 0 0 5 7.25v18.5A3.25 3.25 0 0 0 8.25 29h9.25v-5.75A3.25 3.25 0 0 1 20.75 20H27V7.25A3.25 3.25 0 0 0 23.75 4H22V3a1 1 0 1 0-2 0v1h-3V3a1 1 0 1 0-2 0v1h-3V3a1 1 0 0 0-1-1m15.414 20H20.75c-.69 0-1.25.56-1.25 1.25v5.616a1 1 0 0 0 .207-.159zM10 11a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m1 4h10a1 1 0 1 1 0 2H11a1 1 0 1 1 0-2m-1 6a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1"/></svg>     
  </button>
</div>


    <!-- Control Buttons Container -->
    <div   v-if="(controlMenuVisible ||  (showBottomUI && !isMobile )) || displayMode === 'Hifdh' || displayMode === 'revision'"    
    :class="['control-buttons-container', { 'fade-out': controlMenuFading }, `${controlMenuVisible ? '' :'max-sm:hidden'}`, displayMode === 'full-surah' ? '!bottom-0 bg-black/50' : '']"
  @mousedown.stop="showControlMenu"
  @touchstart.stop="showControlMenu" style="pointer-events: auto;"
class="control-buttons-container  rounded-xl p-2 max-sm:scale-90 fixed max-sm:bottom-0 bottom-5 sm:right-5 flex space-x-2 z-[999999]">
      <!-- Exit Button -->
      <button
        v-if="displayMode !== 'verse'"
        @click.stop="exit"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'الخروج من وضع الحفظ' : 'Exit Hifdh Mode'"
      >
        ✕
      </button>
      <!-- Highlight Button -->

               <button
        v-if="displayMode === 'full-surah' || displayMode === 'Hifdh'"
        @click.stop="toggleHighLight"
        class="control-button opacity-65 hover:opacity-100 "
        :class="highlightMode ? '!bg-orange-400 !text-white' : ''"
        :title="currentLanguage === 'ar' ? 'تلوين' : 'Highlight'"
      >    <span :style="{ backgroundColor: 'lightyellow', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-block', border: '2px solid #888' }"></span>
</button>
      
   <button
        v-if="displayMode === 'full-surah'"
         @click.stop="scrollToTop" 
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'وضع المراجعة' : 'Revision Mode'"
      >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M17.53 10.03a.75.75 0 0 0 0-1.06l-5-5a.75.75 0 0 0-1.06 0l-5 5a.75.75 0 1 0 1.06 1.06l3.72-3.72v8.19c0 .713-.22 1.8-.859 2.687c-.61.848-1.635 1.563-3.391 1.563a.75.75 0 0 0 0 1.5c2.244 0 3.72-.952 4.609-2.187c.861-1.196 1.141-2.61 1.141-3.563V6.31l3.72 3.72a.75.75 0 0 0 1.06 0" clip-rule="evenodd"/></svg>
      </button>

      <!-- <button
        v-if="displayMode !== 'revision' && currentLanguage === 'ar'"
         @click.stop="fassarliMode = !fassarliMode" 
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'وضع المراجعة' : 'Revision Mode'"
      >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13.925 2.504a2.25 2.25 0 0 1 1.94 1.11l.814 1.387h2.071A3.25 3.25 0 0 1 22 8.25v9.5A3.25 3.25 0 0 1 18.75 21H5.25A3.25 3.25 0 0 1 2 17.75v-9.5A3.25 3.25 0 0 1 5.25 5h2.08l.875-1.424a2.25 2.25 0 0 1 1.917-1.073zM12 8a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9m0 1.5a3 3 0 1 1 0 6a3 3 0 0 1 0-6"/></svg>      </button>
     -->



      
      <!-- Notes Button (Hifdh Mode) -->
      <button
        v-if="displayMode === 'Hifdh'"
        @click.stop="toggleNotesOverlay"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'ملاحظات' : 'Notes'"
      >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><path fill="currentColor" d="M11 2a1 1 0 0 0-1 1v1H8.25A3.25 3.25 0 0 0 5 7.25v18.5A3.25 3.25 0 0 0 8.25 29h9.25v-5.75A3.25 3.25 0 0 1 20.75 20H27V7.25A3.25 3.25 0 0 0 23.75 4H22V3a1 1 0 1 0-2 0v1h-3V3a1 1 0 1 0-2 0v1h-3V3a1 1 0 0 0-1-1m15.414 20H20.75c-.69 0-1.25.56-1.25 1.25v5.616a1 1 0 0 0 .207-.159zM10 11a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H11a1 1 0 0 1-1-1m1 4h10a1 1 0 1 1 0 2H11a1 1 0 1 1 0-2m-1 6a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1"/></svg>      </button>
      
      <!-- Complete Button (Hifdh Mode) -->
      <button
        v-if="displayMode === 'Hifdh'"
        @click.stop="toggleComplete"
        @mousedown="startCompleteHold"
        @mouseup="stopCompleteHold"
        @mouseleave="stopCompleteHold"
        class="control-button opacity-65 hover:opacity-100"
        :class="{ 'complete-active': isVerseCompleted }"
        :title="currentLanguage === 'ar' ? 'إكمال' : 'Complete'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>
      </button>
      
      <!-- Loops Button (Hifdh Mode) -->
      <button
        v-if="displayMode === 'Hifdh'"
        @click.stop="toggleLoopsMenu"
        
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'عدد التكرارات' : 'Number of Loops'"
      >
        ({{ HifdhLoopCount }})
      </button>

      <!-- Audio Button -->
      <!-- <button
        @click.stop="toggleAudio"
        @mousedown="startAudioHold"
        @mouseup="stopAudioHold"
        @touchstart="startAudioHold"
        @touchend="stopAudioHold"
        v-if="displayMode === 'verse'"
        class="control-button opacity-65 hover:opacity-100"
        :class="{ 'audio-active': isAudioPlaying }"
        :title="currentLanguage === 'ar' ? (isAudioPlaying ? 'إيقاف الصوت' : 'تشغيل الصوت') : (isAudioPlaying ? 'Stop Audio' : 'Play Audio')"
      >
        <svg v-if="!isAudioPlaying" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 7l6-5v16l-6-5H3V7h3zm6 10V7m8 6h-3m3-2h-3"/>
        </svg>
      </button> -->
      
      <!-- Search Button (Desktop Only) -->
      <button
        v-if="!isMobile"
        @click.stop="openSearchOverlay"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'بحث' : 'Search'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/>
        </svg>
      </button>
      
      <!-- Display Mode Menu -->
      <div class="relative" v-if="displayMode !== 'full-surah' && displayMode !== 'Hifdh'  && displayMode !== 'revision' && displayMode !== 'tafseer'"  >
        <button @click.stop="toggleDisplayModeMenu" class="control-button opacity-65 hover:opacity-100" :aria-label="currentLanguage === 'ar' ? 'تغيير وضع العرض' : 'Change display mode'">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" d="M4 18h16v-2H4zm0-5h16v-2H4zm0-5h16V6H4z"/>
          </svg>
        </button>
        <transition name="fade">
          <div
            v-if="showDisplayModeMenu"
            class="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col gap-3 bg-none p-3 rounded-lg z-50"
          >
      
            <button
              @click.stop="setDisplayMode('full-surah')"
              class="control-button w-16 h-16 flex items-center justify-center text-lg font-bold hover:opacity-100"
              :aria-label="currentLanguage === 'ar' ? 'عرض السورة كاملة' : 'Full Surah view'"
            >
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32">
    <path fill="currentColor" d="M5.5 4h18v21h-11a1 1 0 0 0-1 1h-.03c-.095.751-.487 1.438-1.05 2H8.5a3 3 0 0 1-3-3zm20 21V3a1 1 0 0 0-1-1h-20a1 1 0 0 0-1 1v22a5 5 0 0 0 3.305 4.705c.361.18.925.295 1.195.295h17.5v-.03A4 4 0 0 0 29 26a1 1 0 0 0-1-1zm-17-15a.5.5 0 0 0 0 1h12a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h12a.5.5 0 0 0 0-1zM8 16.5a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 0 1h-12a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z"/>
  </svg>            </button>
            <button
              @click.stop="setDisplayMode('tafseer')"
              class="control-button w-16 h-16 flex items-center justify-center text-lg font-bold hover:opacity-100"
              :aria-label="currentLanguage === 'ar' ? 'عرض التفسير' : 'Tafseer view'"
            >
 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256">
    <path fill="currentColor" d="M104 36H56a12 12 0 0 0-12 12v160a12 12 0 0 0 12 12h48a12 12 0 0 0 12-12V48a12 12 0 0 0-12-12M52 76h56v104H52Zm4-32h48a4 4 0 0 1 4 4v20H52V48a4 4 0 0 1 4-4m48 168H56a4 4 0 0 1-4-4v-20h56v20a4 4 0 0 1-4 4m123.74-16.62L194.55 37.57a12 12 0 0 0-14.25-9.3l-46.81 10.05a12.1 12.1 0 0 0-9.23 14.3l33.19 157.81a12 12 0 0 0 14.25 9.3l46.81-10.06a12.08 12.08 0 0 0 9.23-14.29m-83.21-85.27l54.63-11.73l15 71.07l-54.63 11.74Zm-6.64-31.56l54.64-11.74l5 23.74l-54.64 11.73Zm-2.71-32.4L182 36.09a4 4 0 0 1 .84-.09a3.94 3.94 0 0 1 2.14.64a4 4 0 0 1 1.76 2.58L190.88 59l-54.64 11.72L132.09 51a4.07 4.07 0 0 1 3.09-4.85m81.65 155.7L170 211.91a4 4 0 0 1-3-.55a4 4 0 0 1-1.76-2.58L161.12 189l54.64-11.73l4.15 19.73a4.07 4.07 0 0 1-3.08 4.85"/>
  </svg>            </button>
            <button
              @click.stop="setDisplayMode('Hifdh')"
              class="control-button w-16 h-16 flex items-center justify-center text-lg font-bold hover:opacity-100"
              :aria-label="currentLanguage === 'ar' ? 'وضع الحفظ' : 'Hifdh Mode'"
            >
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M17.617 6.383a7.944 7.944 0 0 1-1.748 12.568a8.028 8.028 0 0 1-11.586-5.043a8.03 8.03 0 0 1 2.095-7.517c.451-.46-.256-1.168-.707-.707a8.946 8.946 0 0 0 9.756 14.586a8.946 8.946 0 0 0 2.9-14.594c-.451-.461-1.158.247-.707.707Z"/>
    <path fill="currentColor" d="m15.355 10.6l-3 3a.5.5 0 0 1-.35.15a.5.5 0 0 1-.36-.15l-3-3a.5.5 0 0 1 .71-.71l2.14 2.14V3.555a.51.51 0 0 1 .5-.5a.5.5 0 0 1 .5.5v8.49l2.15-2.16a.5.5 0 0 1 .71.71Z"/>
  </svg>            </button>
            <!-- Revision Mode Button -->
      <button
        v-if="displayMode !== 'revision' && currentLanguage === 'ar'"
        @click.stop="toggleRevisionMode"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'وضع المراجعة' : 'Revision Mode'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512"><path fill="currentColor" d="M192 0c-53 0-96 43-96 96v160c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96M64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464h-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24h-48v-33.6c85.8-11.7 152-85.3 152-174.4v-40c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128S64 326.7 64 256z"/></svg>
      </button>
          </div>
        </transition>
      </div>
                <!-- Revision Mode Button -->
      <button
        v-if="displayMode == 'revision' && currentLanguage === 'ar'"
            :class="['control-button', isRevisionMode && speechRecognition ? 'glow-blue' : '']"
        @click.stop="toggleRevisionMode"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'وضع المراجعة' : 'Revision Mode'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 384 512"><path fill="currentColor" d="M192 0c-53 0-96 43-96 96v160c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96M64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464h-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24h-48v-33.6c85.8-11.7 152-85.3 152-174.4v-40c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128S64 326.7 64 256z"/></svg>
      </button>
      <!-- Language Menu -->
      <div  v-if="displayMode !== 'Hifdh' && displayMode !== 'revision'"  class="relative">
        <button @click.stop="toggleLanguageMenu" class="control-button opacity-65 hover:opacity-100 " :aria-label="languageToggleAriaLabel">
          {{ currentLanguage === 'ar' ? 'ع' : (currentLanguage === 'en' ? 'EN' : (currentLanguage === 'fr' ? 'FR' : (currentLanguage === 'bn' ? 'BN' : (currentLanguage === 'tr' ? 'TR' : 'UR')))) }}
        </button>
        <transition name="fade">
          <div
            v-if="showLanguageMenu"
            class="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col gap-3 bg-none p-3 rounded-lg z-50"
          >
                 <button
              @click.stop="changeMushaf"
              v-if="currentLanguage === 'ar'"
              class="control-button w-16 h-16 flex items-center justify-center text-lg font-bold opacity-65 hover:opacity-100"
              >
              ع
              </button>
            <button
              v-for="lang in otherLanguages"
              :key="lang"
              @click.stop="setLanguage(lang)"
              class="control-button w-16 h-16 flex items-center justify-center text-lg font-bold opacity-65 hover:opacity-100"
              :aria-label="'Switch to ' + langNames[lang]"
            >
              {{ lang === 'ar' ? 'ع' : lang.toUpperCase() }}
            </button>
     
          </div>
        </transition>
      </div>
      
      <!-- Shuffle Button -->
      <button
        @click.stop="toggleShuffleMode"
        v-if="displayMode === 'verse'"
        
        class="control-button opacity-65 hover:opacity-100"
        :title="isShuffleMode ? (currentLanguage === 'ar' ? 'الوضع العشوائي' : 'Shuffle Mode') : (currentLanguage === 'ar' ? 'الوضع المتسلسل' : 'Continuous Mode')"
      >
        <svg v-if="isShuffleMode" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" fill-rule="evenodd" d="M17.793 3.693a1 1 0 011.414 0l2.5 2.5a1 1 0 010 1.414l-2.5 2.5a1 1 0 11-1.414-1.414L19.586 6.9l-1.793-1.793a1 1 0 010-1.414m0 10.15a1 1 0 011.414 0l2.5 2.5a1 1 0 010 1.414l-2.5 2.5a1 1 0 11-1.414-1.414l1.793-1.793l-1.793-1.793a1 1 0 010-1.414" clip-rule="evenodd"/>
          <path fill="currentColor" fill-rule="evenodd" d="M19.054 5.913c.352.023.657.043.946.043a1 1 0 110 2c-.346 0-.776-.028-1.184-.054a37 37 0 00-.606-.037c-.614-.03-1.118-.02-1.482.065c-1.456.341-3.07 1.481-4.394 4.117c1.304 2.555 2.9 3.529 4.394 3.879c.364.085.868.094 1.482.064c.186-.009.393-.022.606-.036A19 19 0 0120 15.899a1 1 0 110 2c-.289 0-.594.02-.946.044c-.227.015-.473.032-.747.045c-.63.03-1.377.04-2.035-.115c-1.812-.424-3.549-1.493-4.972-3.634c-.553 1.02-1.177 1.822-1.927 2.427c-.978.788-2.12 1.106-3.213 1.24c-.882.108-1.81.102-2.64.096L3 18a1 1 0 110-2l.582.002c.824.005 1.593.01 2.335-.08c.892-.11 1.624-.348 2.201-.813c.687-.554 1.323-1.447 1.962-2.95l.046-.109l-.046-.109c-.651-1.53-1.303-2.495-2.015-3.103c-.56-.477-1.277-.726-2.161-.845c-.763-.102-1.562-.099-2.42-.095L3 7.899a1 1 0 110-2l.445-.001c.853-.004 1.813-.01 2.724.113c1.094.146 2.234.486 3.194 1.305c.75.64 1.375 1.481 1.93 2.52c1.408-2.187 3.136-3.421 4.979-3.853c.658-.154 1.405-.145 2.035-.115c.274.013.52.03.747.045" clip-rule="evenodd"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m16.388 3l1.003.976c.448.436.672.654.593.839C17.906 5 17.59 5 16.955 5h-7.76C5.22 5 2 8.134 2 12c0 1.487.477 2.866 1.29 4m4.322 5l-1.003-.976c-.448-.436-.672-.654-.593-.839C6.094 19 6.41 19 7.045 19h7.76C18.78 19 22 15.866 22 12a6.84 6.84 0 00-1.29-4"/>
        </svg>
      </button>
      
      <!-- Pause Button -->
      <button
        v-if="displayMode !== 'full-surah'  && displayMode !== 'revision'"
        @click.stop="togglePause"
        class="control-button opacity-65 hover:opacity-100"
        :aria-label="isPausedByPause ? 'Resume' : 'Pause'"
      >
        <svg v-if="!isPausedByPause" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5" aria-hidden="true">
          <rect x="6" y="4" width="4" height="16" rx="1"/>
          <rect x="14" y="4" width="4" height="16" rx="1"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5" aria-hidden="true">
          <polygon points="5,3 19,12 5,21"/>
        </svg>
      </button>
      
      <!-- Theme Toggle Button -->
      <button v-if="displayMode !== 'Hifdh'" @click.stop="toggleTheme" class="control-button theme-toggle-button opacity-65 hover:opacity-100" :aria-label="currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'">
        <svg v-if="currentTheme !== 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 7.758a.75.75 0 001.06-1.06L5.634 5.106a.75.75 0 00-1.06 1.06l1.59 1.591z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.362-8.528a.75.75 0 01.818.162z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
    <div   
    v-if="displayMode !== 'revision'"
    :class="displayMode === 'full-surah' ? '!bottom-0' : ''"
class="hamburg   !bg-none rounded-xl p-2 max-sm:scale-90 fixed max-sm:bottom-0 bottom-5 sm:right-5 flex space-x-2 z-50">

    <button
v-if="hamburgerMenuVisible && isMobile && displayMode !== 'Hifdh'"  class="fixed bottom-5 left-1/2 z-50 transform -translate-x-1/2 sepia-hamburger"
  style="width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;box-shadow:0 2px 8px rgba(0,0,0,0.2);"
  @click="handleHamburgerClick"
>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect y="4" width="24" height="3" rx="1.5" fill="currentColor"/>
    <rect y="10.5" width="24" height="3" rx="1.5" fill="currentColor"/>
    <rect y="17" width="24" height="3" rx="1.5" fill="currentColor"/>
  </svg>
</button>
  </div>
  </div>
</template>

<script>
import { openDB } from 'idb';
import {ratio} from 'fuzzball';
import fassarli from './components/fassarli.vue';
import { RecycleScroller } from 'vue-virtual-scroller';

const SURAH_DATA = [
  { id: 1, arabicName: "الفاتحة", englishName: "Al-Fatiha", verses: 7 },
  { id: 2, arabicName: "البقرة", englishName: "Al-Baqarah", verses: 286 },
  { id: 3, arabicName: "آل عمران", englishName: "Aal-i-Imran", verses: 200 },
  { id: 4, arabicName: "النساء", englishName: "An-Nisa", verses: 176 },
  { id: 5, arabicName: "المائدة", englishName: "Al-Ma'idah", verses: 120 },
  { id: 6, arabicName: "الأنعام", englishName: "Al-An'am", verses: 165 },
  { id: 7, arabicName: "الأعراف", englishName: "Al-A'raf", verses: 206 },
  { id: 8, arabicName: "الأنفال", englishName: "Al-Anfal", verses: 75 },
  { id: 9, arabicName: "التوبة", englishName: "At-Tawbah", verses: 129 },
  { id: 10, arabicName: "يونس", englishName: "Yunus", verses: 109 },
  { id: 11, arabicName: "هود", englishName: "Hud", verses: 123 },
  { id: 12, arabicName: "يوسف", englishName: "Yusuf", verses: 111 },
  { id: 13, arabicName: "الرعد", englishName: "Ar-Ra'd", verses: 43 },
  { id: 14, arabicName: "ابراهيم", englishName: "Ibrahim", verses: 52 },
  { id: 15, arabicName: "الحجر", englishName: "Al-Hijr", verses: 99 },
  { id: 16, arabicName: "النحل", englishName: "An-Nahl", verses: 128 },
  { id: 17, arabicName: "الإسراء", englishName: "Al-Isra", verses: 111 },
  { id: 18, arabicName: "الكهف", englishName: "Al-Kahf", verses: 110 },
  { id: 19, arabicName: "مريم", englishName: "Maryam", verses: 98 },
  { id: 20, arabicName: "طه", englishName: "Taha", verses: 135 },
  { id: 21, arabicName: "الأنبياء", englishName: "Al-Anbiya", verses: 112 },
  { id: 22, arabicName: "الحج", englishName: "Al-Hajj", verses: 78 },
  { id: 23, arabicName: "المؤمنون", englishName: "Al-Mu'minun", verses: 118 },
  { id: 24, arabicName: "النور", englishName: "An-Nur", verses: 64 },
  { id: 25, arabicName: "الفرقان", englishName: "Al-Furqan", verses: 77 },
  { id: 26, arabicName: "الشعراء", englishName: "Ash-Shu'ara", verses: 227 },
  { id: 27, arabicName: "النمل", englishName: "An-Naml", verses: 93 },
  { id: 28, arabicName: "القصص", englishName: "Al-Qasas", verses: 88 },
  { id: 29, arabicName: "العنكبوت", englishName: "Al-Ankabut", verses: 69 },
  { id: 30, arabicName: "الروم", englishName: "Ar-Rum", verses: 60 },
  { id: 31, arabicName: "لقمان", englishName: "Luqman", verses: 34 },
  { id: 32, arabicName: "السجدة", englishName: "As-Sajdah", verses: 30 },
  { id: 33, arabicName: "الأحزاب", englishName: "Al-Ahzab", verses: 73 },
  { id: 34, arabicName: "سبإ", englishName: "Saba", verses: 54 },
  { id: 35, arabicName: "فاطر", englishName: "Fatir", verses: 45 },
  { id: 36, arabicName: "يس", englishName: "Ya-Sin", verses: 83 },
  { id: 37, arabicName: "الصافات", englishName: "As-Saffat", verses: 182 },
  { id: 38, arabicName: "ص", englishName: "Sad", verses: 88 },
  { id: 39, arabicName: "الزمر", englishName: "Az-Zumar", verses: 75 },
  { id: 40, arabicName: "غافر", englishName: "Ghafir", verses: 85 },
  { id: 41, arabicName: "فصلت", englishName: "Fussilat", verses: 54 },
  { id: 42, arabicName: "الشورى", englishName: "Ash-Shuraa", verses: 53 },
  { id: 43, arabicName: "الزخرف", englishName: "Az-Zukhruf", verses: 89 },
  { id: 44, arabicName: "الدخان", englishName: "Ad-Dukhan", verses: 59 },
  { id: 45, arabicName: "الجاثية", englishName: "Al-Jathiyah", verses: 37 },
  { id: 46, arabicName: "الأحقاف", englishName: "Al-Ahqaf", verses: 35 },
  { id: 47, arabicName: "محمد", englishName: "Muhammad", verses: 38 },
  { id: 48, arabicName: "الفتح", englishName: "Al-Fath", verses: 29 },
  { id: 49, arabicName: "الحجرات", englishName: "Al-Hujurat", verses: 18 },
  { id: 50, arabicName: "ق", englishName: "Qaf", verses: 45 },
  { id: 51, arabicName: "الذاريات", englishName: "Adh-Dhariyat", verses: 60 },
  { id: 52, arabicName: "الطور", englishName: "At-Tur", verses: 49 },
  { id: 53, arabicName: "النجم", englishName: "An-Najm", verses: 62 },
  { id: 54, arabicName: "القمر", englishName: "Al-Qamar", verses: 55 },
  { id: 55, arabicName: "الرحمن", englishName: "Ar-Rahman", verses: 78 },
  { id: 56, arabicName: "الواقعة", englishName: "Al-Waqi'ah", verses: 96 },
  { id: 57, arabicName: "الحديد", englishName: "Al-Hadid", verses: 29 },
  { id: 58, arabicName: "المجادلة", englishName: "Al-Mujadila", verses: 22 },
  { id: 59, arabicName: "الحشر", englishName: "Al-Hashr", verses: 24 },
  { id: 60, arabicName: "الممتحنة", englishName: "Al-Mumtahanah", verses: 13 },
  { id: 61, arabicName: "الصف", englishName: "As-Saf", verses: 14 },
  { id: 62, arabicName: "الجمعة", englishName: "Al-Jumu'ah", verses: 11 },
  { id: 63, arabicName: "المنافقون", englishName: "Al-Munafiqun", verses: 11 },
  { id: 64, arabicName: "التغابن", englishName: "At-Taghabun", verses: 18 },
  { id: 65, arabicName: "الطلاق", englishName: "At-Talaq", verses: 12 },
  { id: 66, arabicName: "التحريم", englishName: "At-Tahrim", verses: 12 },
  { id: 67, arabicName: "الملك", englishName: "Al-Mulk", verses: 30 },
  { id: 68, arabicName: "القلم", englishName: "Al-Qalam", verses: 52 },
  { id: 69, arabicName: "الحاقة", englishName: "Al-Haqqah", verses: 52 },
  { id: 70, arabicName: "المعارج", englishName: "Al-Ma'arij", verses: 44 },
  { id: 71, arabicName: "نوح", englishName: "Nuh", verses: 28 },
  { id: 72, arabicName: "الجن", englishName: "Al-Jinn", verses: 28 },
  { id: 73, arabicName: "المزمل", englishName: "Al-Muzzammil", verses: 20 },
  { id: 74, arabicName: "المدثر", englishName: "Al-Muddaththir", verses: 56 },
  { id: 75, arabicName: "القيامة", englishName: "Al-Qiyamah", verses: 40 },
  { id: 76, arabicName: "الانسان", englishName: "Al-Insan", verses: 31 },
  { id: 77, arabicName: "المرسلات", englishName: "Al-Mursalat", verses: 50 },
  { id: 78, arabicName: "النبإ", englishName: "An-Naba", verses: 40 },
  { id: 79, arabicName: "النازعات", englishName: "An-Nazi'at", verses: 46 },
  { id: 80, arabicName: "عبس", englishName: "Abasa", verses: 42 },
  { id: 81, arabicName: "التكوير", englishName: "At-Takwir", verses: 29 },
  { id: 82, arabicName: "الإنفطار", englishName: "Al-Infitar", verses: 19 },
  { id: 83, arabicName: "المطففين", englishName: "Al-Mutaffifin", verses: 36 },
  { id: 84, arabicName: "الإنشقاق", englishName: "Al-Inshiqaq", verses: 25 },
  { id: 85, arabicName: "البروج", englishName: "Al-Buruj", verses: 22 },
  { id: 86, arabicName: "الطارق", englishName: "At-Tariq", verses: 17 },
  { id: 87, arabicName: "الأعلى", englishName: "Al-Ala", verses: 19 },
  { id: 88, arabicName: "الغاشية", englishName: "Al-Ghashiyah", verses: 26 },
  { id: 89, arabicName: "الفجر", englishName: "Al-Fajr", verses: 30 },
  { id: 90, arabicName: "البلد", englishName: "Al-Balad", verses: 20 },
  { id: 91, arabicName: "الشمس", englishName: "Ash-Shams", verses: 15 },
  { id: 92, arabicName: "الليل", englishName: "Al-Layl", verses: 21 },
  { id: 93, arabicName: "الضحى", englishName: "Ad-Duhaa", verses: 11 },
  { id: 94, arabicName: "الشرح", englishName: "Ash-Sharh", verses: 8 },
  { id: 95, arabicName: "التين", englishName: "At-Tin", verses: 8 },
  { id: 96, arabicName: "العلق", englishName: "Al-Alaq", verses: 19 },
  { id: 97, arabicName: "القدر", englishName: "Al-Qadr", verses: 5 },
  { id: 98, arabicName: "البينة", englishName: "Al-Bayyinah", verses: 8 }, // Corrected ID
  { id: 99, arabicName: "الزلزلة", englishName: "Az-Zalzalah", verses: 8 },
  { id: 100, arabicName: "العاديات", englishName: "Al-Adiyat", verses: 11 },
  { id: 101, arabicName: "القارعة", englishName: "Al-Qari'ah", verses: 11 },
  { id: 102, arabicName: "التكاثر", englishName: "At-Takathur", verses: 8 },
  { id: 103, arabicName: "العصر", englishName: "Al-Asr", verses: 3 },
  { id: 104, arabicName: "الهمزة", englishName: "Al-Humazah", verses: 9 },
  { id: 105, arabicName: "الفيل", englishName: "Al-Fil", verses: 5 },
  { id: 106, arabicName: "قريش", englishName: "Quraysh", verses: 4 },
  { id: 107, arabicName: "الماعون", englishName: "Al-Ma'un", verses: 7 },
  { id: 108, arabicName: "الكوثر", englishName: "Al-Kawthar", verses: 3 },
  { id: 109, arabicName: "الكافرون", englishName: "Al-Kafirun", verses: 6 },
  { id: 110, arabicName: "النصر", englishName: "An-Nasr", verses: 3 },
  { id: 111, arabicName: "المسد", englishName: "Al-Masad", verses: 5 },
  { id: 112, arabicName: "الإخلاص", englishName: "Al-Ikhlas", verses: 4 },
  { id: 113, arabicName: "الفلق", englishName: "Al-Falaq", verses: 5 },
  { id: 114, arabicName: "الناس", englishName: "An-Nas", verses: 6 }
];

const EDITIONS = {
  ar: 'quran-uthmani',
  en: 'en.maududi',
  fr: 'fr.hamidullah',
  bn: 'bn.hoque',
  tr: 'tr.ozturk',
  ur: 'ur.ahmedali'
};

const AUDIO_EDITION = 'ar.alafasy';
import instructions from './components/instructions.vue';

export default {
  components: {
    instructions,
    fassarli,
      RecycleScroller

  },
  data() {
    return {
      atLeastOneComplete: false,
      previousDisplayMode: null,
fullSurahScrollPosition: 0,
      // Mushaf selection
      showMushafSelection: false,
      mushafType: 'hafs', // 'hafs', 'warsh', 'qaloon'
         controlMenuVisible: false,
         
    controlMenuTimeoutId: null,
    controlMenuFading: false,
    fassarliMode: false,
    showBottomUI: true,
showBottomInfo: true,
searched: false,
currentPage: 1,
    fullSurahWindowStart: 0,
    fullSurahWindowSize: 15,
      // Revision mode
      isRevisionMode: false,
      speechRecognition: null,
      deepgramSocket: null,
      deepgramStream: null,
      deepgramRecorder: null,
      recognizedText: '',
      correctWords: [],
      mistakeWords: [],
      unreadVerses: [],
    showNavigationInstructions: false,
      ocrInstructions: false,
         showHighlightContextMenu: false,
    highlightContextMenuPosition: { top: 0, left: 0 },
    highlightContextMenu: {
      verseUuid: null,
      wordIndex: null,
      color: null,
    },
      wasScrolling: false,
      highlightMode: false,

          HifdhVerseQueue: [],
      HifdhCurrentVerseIndex: 0,
      HifdhLoopCount: 10,
      currentLoopIteration: 0, // Track current loop iteration
            activeVerseUuidForHighlighting: null,
hamburgerMenuVisible: true,
controlMenuTimeoutId: null,
      completedVerses: {}, // Track comple
      SURAH_DATA,
      // Other existing data properties
      showLanguageSelection: true,
      showLanguageMenu: false,
      isAudioPlaying: false,
      currentAudio: null,
      isContinuousAudio: false,
      completions: {},
      HifdhVerseQueue: [],
      HifdhCurrentVerseIndex: 0,
      showSurahVerseMenu: false,
      selectedSurah: 1,
      
      selectedVerse: 1,
      verseOptions: [],
      showDisplayModeMenu: false,
      displayMode: 'verse',
      showNotesOverlay: false,
      currentNote: '',
      isVerseCompleted: false,
      HifdhLoopCount: 10,
      showLoopsMenu: false,
      loopSwipeStartY: null,
      showHighlightMenu: false,
      highlightMenuPosition: { top: 0, left: 0 },
      selectedWordIndices: [],
      isSelectingWords: false,
      highlightColors: ['#ffcccb', '#d4edda', '#cce5ff', '#fff3cd', '#e2d1f9'],
      highlights: {},
      notes: {},
      completeHoldTimeout: null,
            currentSurahData: null, // Added for full-surah mode
  displayedVerses: [], // Added for full-surah mode lazy loading
      verseOptions: [], // Added for surah/verse selection
      currentLoop: 1,
 Page: 1,
      resultsPerPage: 10,
      showCopyNotification: false,
      detectedWords: [],
      iconFillColor: () => this.currentTheme === 'dark' ? '#ffffff' : '#000000',
      isShuffleMode: false,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      detectedText: '',
      originalSurah: null,
      lastTapTime: 0,
      DOUBLE_TAP_THRESHOLD: 300,
      showSearchOverlay: false,
      showVoiceSearchOverlay: false,
      recognition: null,
      silenceTimeoutId: null,
      isPausedByPause: false,
      isPausedByHold: false,
      isHoldingGlobal: false,
      hasSwiped: false,
      touchStartX: null,
      touchStartY: null,
      touchStartTime: null,
      holdStartTimeoutId: null,
      pausedPartRemainingTime: 0,
      partTimeoutStartTime: 0,
      currentActivePartDuration: 0,
      SWIPE_THRESHOLD: 30,
      SWIPE_HORIZONTAL_THRESHOLD: 80,
      SWIPE_TIME_THRESHOLD: 500,
      HOLD_THRESHOLD: 150,
      allVerses: [],
      currentVerseData: null,
      currentTextParts: [],
      currentPartIndex: 0,
      displayedWords: [],
      currentPartWords: [],
      wordIntervalId: null,
      partTimeoutId: null,
      isLoading: true,
      errorMessage: null,
      currentLanguage: 'ar',
      currentTheme: 'dark',
      // Constants
        showNotesOverlay: false, // Added notes overlay state
      highlightColors: ['#ffcccb', '#d4edda', '#cce5ff', '#fff3cd', '#e2d1f9'], // Added highlight colors
      isSelectingWords: false, 
      WORDS_PER_PART: 25,
      PART_DISPLAY_DURATION: 20000,
      WORD_ANIMATION_INTERVAL: 150,
      NEXT_VERSE_DELAY: 1000
    };
  },
  
  computed: {
    changeMushaf() {
      this.showLanguageMenu = false;
      this.showMushafSelection = true
      console.log(this.showMushafSelection)
    },
   visibleSurahVerses() {
    if (!this.displayedVerses) return [];
    // Always slice from 0
    return this.displayedVerses.slice(0, this.fullSurahWindowSize);
  },
    paginatedResults() {
            if (!this.searchResults) return [];

      const start = (this.currentPage - 1) * this.resultsPerPage;
      const end = start + this.resultsPerPage;
      return this.searchResults.slice(start, end);
    },
    otherLanguages() {
      return ['ar', 'en', 'fr', 'bn', 'tr', 'ur'].filter(lang => lang !== this.currentLanguage);
    },
    langNames() {
      return {
        ar: 'Arabic',
        en: 'English',
        fr: 'French',
        bn: 'Bengali',
        tr: 'Turkish',
        ur: 'Urdu',
      };
    },
    languageToggleAriaLabel() {
      return this.currentLanguage === 'ar' ? 'Switch language from Arabic' : `Switch language from ${this.langNames[this.currentLanguage]}`;
    },
    isMobile() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    isWordCorrect() {
      return (index) => {
    // Indices in correctWords are relative to the current part
        return this.isRevisionMode && this.correctWords.includes(index);
         };
    },
    isWordMistake() {
      return (index) => {
      // Indices in mistakeWords are relative to the current part
        return this.isRevisionMode && this.mistakeWords.includes(index);
        };
    },
    isWordUnread() {
      return (index) => {
          // Indices in unreadVerses are relative to the current part
        return this.isRevisionMode && this.unreadVerses.includes(index);
      };
    }
  },

  methods: {
async startDeepgramStreaming() {
  try {
    this.recognizedText = '';
    this.deepgramStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.deepgramRecorder = new MediaRecorder(this.deepgramStream, { mimeType: 'audio/webm' });

    const DEEPGRAM_API_KEY = 'c82459e149416df0b4825d5f1c797942b6c001ab';
    const socketUrl = `wss://api.deepgram.com/v1/listen?language=ar&model=whisper-large&interim_results=true&punctuate=false&key=${DEEPGRAM_API_KEY}`;
    this.deepgramSocket = new WebSocket(socketUrl);

    this.deepgramSocket.onopen = () => {
      console.log('Deepgram WebSocket connected.');
      this.deepgramRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0 && this.deepgramSocket.readyState === WebSocket.OPEN) {
          this.deepgramSocket.send(event.data);
        }
      });
      this.deepgramRecorder.start(250); // Send data every 250ms
    };

    this.deepgramSocket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.channel && data.channel.alternatives[0].transcript) {
        const transcript = data.channel.alternatives[0].transcript;
        this.recognizedText = transcript;
        this.matchRecitedText(transcript);
      }
    };

    this.deepgramSocket.onclose = () => {
      console.log('Deepgram WebSocket closed.');
      this.stopDeepgramStreaming();
    };

    this.deepgramSocket.onerror = (error) => {
      console.error('Deepgram WebSocket error:', error);
      this.stopDeepgramStreaming();
    };
  } catch (e) {
    this.errorMessage = "Microphone access denied or not available.";
    console.error('Error starting Deepgram streaming:', e);
  }
},
stopDeepgramStreaming() {
  if (this.deepgramRecorder && this.deepgramRecorder.state === 'recording') this.deepgramRecorder.stop();
  if (this.deepgramStream) this.deepgramStream.getTracks().forEach(track => track.stop());
  if (this.deepgramSocket && this.deepgramSocket.readyState === WebSocket.OPEN) this.deepgramSocket.close();
  this.deepgramRecorder = null;
  this.deepgramStream = null;
  this.deepgramSocket = null;
},
openTafsirMode(tafsirIdentifier) {
  if (this.displayMode === 'full-surah') {
    this.previousDisplayMode = 'full-surah';
  } else {
    this.previousDisplayMode = this.displayMode;
  }
  this.fassarliMode = false;
  this.displayMode = 'tafseer';
  this.selectedTafsirIdentifier = tafsirIdentifier;
  this.loadTafseer(this.selectedSurah, this.selectedVerse, tafsirIdentifier);
}
,
    handleVerseClick(verse, surah) {
this.selectedSurah = surah
this.selectedVerse= verse
this.fassarliMode = true
this.$forceUpdate()
},
// Replace your handleFullSurahScroll with this version:
handleFullSurahScroll() {
  const container = this.$refs.versesContainer;
  if (!container) return;

  const scrollTop = container.scrollTop;
  const clientHeight = container.clientHeight;
  const scrollHeight = container.scrollHeight;
  const totalVerses = this.displayedVerses.length;

  // Check if we're near the bottom (last 20% of scroll area)
  const scrollBottom = scrollTop + clientHeight;
  const isNearBottom = scrollBottom > (scrollHeight * 0.8);

  // Only load more if we're near the bottom AND not already showing all verses
  if (isNearBottom && this.fullSurahWindowSize < totalVerses) {
    const newSize = Math.min(this.fullSurahWindowSize + 20, totalVerses);
    if (newSize !== this.fullSurahWindowSize) {
      this.fullSurahWindowSize = newSize;
      // Optionally, force update if needed: this.$forceUpdate();
      console.log(`Loading more verses, new size: ${newSize}`);
    }
  }
},
           handleDesktopMouseMove() {
        if (this.isMobile) return;
        this.showBottomUI = true;
        this.startBottomUIFadeTimer();
      },
      startBottomUIFadeTimer() {
        if (this.isMobile) return;
        if (this.bottomUIFadeTimeout) clearTimeout(this.bottomUIFadeTimeout);
        this.bottomUIFadeTimeout = setTimeout(() => {
          this.showBottomUI = false;
        }, 3000);
      },
toggleHighLight() {
  this.highlightMode = !this.highlightMode;
  if (this.displayMode === 'Hifdh' && this.highlightMode) {
    this.pauseVerseDisplayByPause();
  } else if (this.displayMode === 'Hifdh' && !this.highlightMode) {
    this.resumeVerseDisplayFromPause();
  }
},
     scrollToTop() {
      const container = this.$refs.versesContainer;
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    openOcr() {
      const hasSeen = localStorage.getItem('ocrInstructions');
      this.ocrInstructions = true

    },
    closeOcrUi() {
      this.ocrInstructions = false;
      localStorage.setItem('ocrInstructions', 'true');
    },
    focusTextarea() {
  this.$nextTick(() => {
    if (this.$refs.notesTextarea) {
      this.$refs.notesTextarea.focus();
    }
  });
},
    showControlMenu() {
      if (this.displayMode === 'Hifdh') return
  this.controlMenuVisible = true;
  this.hamburgerMenuVisible = false;
  this.controlMenuFading = false;
  if (this.controlMenuTimeoutId) clearTimeout(this.controlMenuTimeoutId);
  
},
hideControlMenu() {
      if (this.displayMode === 'Hifdh') return

  this.controlMenuVisible = false;
  this.showDisplayModeMenu = false;
  this.hamburgerMenuVisible = true;
  this.controlMenuFading = false;
  if (this.controlMenuTimeoutId) clearTimeout(this.controlMenuTimeoutId);
},
handleHamburgerClick() {
  this.showControlMenu();
},
showHamburgerMenu() {
  this.controlMenuVisible = false;
  this.hamburgerMenuVisible = true;
},

    closeInstructions() {
      console.log('Closing navigation instructions');
      this.showNavigationInstructions = false;
      localStorage.setItem('hasSeenInstructions', 'true');
    },

    // Mushaf Selection
async selectMushaf(type) {
  this.mushafType = type;
  localStorage.setItem('mushafType', type);
  this.showMushafSelection = false;
  if (type === 'qaloon' || type === 'warsh') {
    this.currentLanguage = 'ar';
    localStorage.setItem('language', 'ar');
  }
if (!localStorage.getItem('hasSeenInstructions')) {
      console.log('Showing navigation instructions on first visit');
      await new Promise(resolve => setTimeout(resolve, 3500)); // 3.5 second delay

      this.showNavigationInstructions = true;
    }
      await this.loadInitialData();
    },
    
    async getVerseData(surah, verse) {
      try {
        let url;
        if (this.mushafType === 'hafs') {
          url = `https://api.alquran.cloud/v1/ayah/${surah}:${verse}`;
        } else if (this.mushafType === 'warsh') {
          url = `https://api.quranpedia.net/v1/mushafs/4/surahs/${surah}/ayahs/${verse}`;
        } else if (this.mushafType === 'qaloon') {
          url = `https://api.quranpedia.net/v1/mushafs/7/surahs/${surah}/ayahs/${verse}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (this.mushafType === 'hafs') {
          return {
            text: data.data.text,
            audio: data.data.audio
          };
        } else {
          return {
            text: data.data.text,
            audio: null // Warsh/Qaloon audio may not be available
          };
        }
      } catch (error) {
        console.error('Error fetching verse data:', error);
        return null;
      }
    },
    
    // Revision Mode
    toggleRevisionMode() {
  if (!this.isRevisionMode) {
    this.displayMode ='revision'
    this.isRevisionMode = true;
  if (!this.isPausedByPause) {
    this.pauseVerseDisplayByPause();
  }

    this.initSpeechRecognition();
  } else {
    // If already in revision mode, toggle voice recognition
    if (!this.speechRecognition) {
      this.initSpeechRecognition();
    } else {
      this.isRevisionMode = false;
      this.stopSpeechRecognition();
    }
  }
      this.$forceUpdate()
    },
    
initSpeechRecognition() {
  this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  this.$forceUpdate();

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    // Fallback to Deepgram remains the same
    this.startDeepgramStreaming();
    return;
  }

  // If recognition is already active, stop it before starting a new instance
  if (this.speechRecognition && this.speechRecognition.running) {
      this.speechRecognition.stop();
  }

  this.speechRecognition = new SpeechRecognition();
  this.speechRecognition.lang = 'ar-SA';
  this.speechRecognition.continuous = true;
  this.speechRecognition.interimResults = true;

  // A variable to keep track of the last processed final transcript to avoid re-processing
  let final_transcript = '';

  this.speechRecognition.onresult = (event) => {
    let interim_transcript = '';

    // Iterate through all the results from the beginning
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      // If the result is final, concatenate it to the final transcript
      if (event.results[i].isFinal) {
        final_transcript += event.results[i][0].transcript;
      } else {
        // Otherwise, it's an interim result, so we just grab it
        interim_transcript += event.results[i][0].transcript;
      }
    }

    // Now, combine the final transcript with the latest interim transcript
    // The trim() is important to remove any leading/trailing spaces
    const transcript = (final_transcript + interim_transcript).trim();
    
    // Update your component's state
    this.recognizedText = transcript;
    
    // Call your matching logic
    this.matchRecitedText(transcript);
  };

       this.speechRecognition.onend = () => {
      // You might want to automatically restart recognition here,
      // depending on your application's logic.
      console.log("Speech recognition service disconnected");
  };
      
      this.speechRecognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };
      
      this.speechRecognition.start();
     this.speechRecognition.running = true; // Custom flag to track state 
    },
    
    stopSpeechRecognition() {
      if (this.speechRecognition) {
        this.speechRecognition.stop();
        this.speechRecognition = null;
      }
      if (this.deepgramSocket) {
        this.stopDeepgramStreaming();
      }
      this.recognizedText = '';
      this.correctWords = [];
      this.mistakeWords = [];
      this.unreadVerses = [];
    },


// Adjusted to take a single string and return a single cleaned string
removeCharacters(inputTextString) { // Renamed parameter for clarity
  if (typeof inputTextString !== 'string') {
    console.error("removeCharacters expects a string input.");
    return ""; // Or handle the error as appropriate
  }

 const upperCharactersToRemove = [
    // Common Waqf (Pause) Marks:
    "\u06D6", // ۖ  (SALLI / AL-WASL AWLA) - Prefer to continue
    "\u06D7", // ۗ  (QALLI / AL-WAQF AWLA) - Prefer to stop
    "\u06D8", // ۘ  (WAQF LAZIM) - Mandatory stop (often a Meem-like symbol, also used for QIF)
    "\u06D9", // ۙ  (LA) - Prohibited stop symbol
    "\u06DA", // ۚ  (JA'IZ) - Permissible stop (often a Jeem-like symbol)
    "\u06DB", // ۛ  (MU'ANAQAH) - Embracing stop (three dots, stop at one of the pair)
    "\u06DC", // ۜ  (SAKTAH) - Brief pause without breath (often a Seen-like symbol)

    // Other common Quranic symbols you might want to remove:
    "\u06DD", // ۝  (ARABIC END OF AYAH) - Marks the end of a verse
    "\u06DE", // ۞  (ARABIC START OF RUB EL HIZB) - Marks a section/ حزب
    "\u06E9", // ۩  (ARABIC PLACE OF SAJDAH) - Indicates a prostration point

    // Less common as symbols but sometimes appear as small high characters for stops:
    "\u0615", //  ARABIC SMALL HIGH TAH - Can signify Waqf Mutlaq (Absolute Stop)

    // You can add more characters to this list if needed
  ];

  let currentString = inputTextString; // Work directly with the input string

  for (let j = 0; j < upperCharactersToRemove.length; j++) {
    const charToRemove = upperCharactersToRemove[j];
    // Modern environments (ES2021+) can use:
    // currentString = currentString.replaceAll(charToRemove, "");
    // For broader compatibility, the while loop is fine:
    while (currentString.includes(charToRemove)) {
      currentString = currentString.replace(charToRemove, "");
    }
  }
  return currentString; // Return the single cleaned string
},
async matchRecitedText(transcript) {
  if (this.isTransitioning || !this.currentVerseData?.text) return;

  // Always reset highlights for new part
  this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  await this.$nextTick();

  const verseText = this.processArabicText(this.currentVerseData.text);
  const verseParts = this.segmentText(verseText);
  const currentPart = verseParts[this.currentPartIndex] || '';
  let verseWords = currentPart.split(' ').filter(word => word.trim());
  let recitedWords = this.processArabicText(transcript)
    .split(' ')
    .filter((word, i, arr) => word && (i === 0 || word !== arr[i - 1]));

  let correct = [];
  let mistakes = [];
  let unread = [];
  let pointer = 0;
  let vibrated = false;

  // Helper: Remove tashkeel and normalize
  const norm = w => this.removeTashkeel(w).toLowerCase();

  let i = 0;
  while (i < recitedWords.length && pointer < verseWords.length) {
    const recited = norm(recitedWords[i]);
    const current = norm(verseWords[pointer]);

    // Direct match
    if (ratio(current, recited, { ignoreCase: true }) >= 70) {
      correct.push(pointer);
      pointer++;
      i++;
      continue;
    }

    // Look ahead: If recited word matches a later verse word (skip)
    let found = false;
    for (let lookahead = pointer + 1; lookahead < verseWords.length; lookahead++) {
      if (ratio(norm(verseWords[lookahead]), recited, { ignoreCase: true }) >= 70) {
        // Mark skipped words as mistakes
        for (let skip = pointer; skip < lookahead; skip++) {
          mistakes.push(skip);
          vibrated = true;
        }
        correct.push(lookahead);
        pointer = lookahead + 1;
        i++;
        found = true;
        break;
      }
    }
    if (found) continue;

    // Look back: If recited word matches a previous verse word, jump back and remove highlights after that word
    const prevIdx = correct.findIndex(idx =>
      ratio(norm(verseWords[idx]), recited, { ignoreCase: true }) >= 70
    );
    if (prevIdx !== -1 && prevIdx < pointer - 1) {
      // Remove highlights after prevIdx
      correct = correct.filter(idx => idx <= prevIdx);
      mistakes = mistakes.filter(idx => idx <= prevIdx);
      pointer = prevIdx + 1;
      i++;
      continue;
    }

    // No match: mark as mistake, vibrate
    mistakes.push(pointer);
    vibrated = true;
    pointer++;
    i++;
  }

  // Mark remaining as unread
  for (let j = 0; j < verseWords.length; j++) {
    if (!correct.includes(j) && !mistakes.includes(j)) unread.push(j);
  }

  this.correctWords = correct;
  this.mistakeWords = mistakes;
  this.unreadVerses = unread;

  // Vibrate on mistake
  if (vibrated && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(120);
  }

  // Advance to next part if all words are attempted (correct or mistake)
  if (
    (correct.length + mistakes.length === verseWords.length) &&
    verseWords.length > 0 &&
    !this.isTransitioning
  ) {
      this.toggleRevisionMode();
    this.isTransitioning = true;
    setTimeout(() => {
      this.correctWords = [];
      this.mistakeWords = [];
      this.unreadVerses = [];
  correct = [];
   mistakes = [];
   unread = [];
   verseWords = [];
   recitedWords = [];
  pointer = 0;
  vibrated = false;
      if (this.currentPartIndex < verseParts.length - 1) {
        this.currentPartIndex++;
        this.displayCurrentPart();
      } else {
        this.selectVerse(true);
      }
      this.isTransitioning = false;
      this.toggleRevisionMode();
    }, 500);
  }
},

async matchWord(recitedWord, verseWords, matchState) {
  const cleanRecited = this.removeTashkeel(recitedWord).toLowerCase();
  let matched = false;

  // Check current + next 2 words for potential matches
  for (let offset = 0; offset < 3; offset++) {
    const versePos = matchState.currentPosition + offset;
    if (versePos >= verseWords.length) break;

    const verseWord = verseWords[versePos];
    const cleanVerse = this.removeTashkeel(verseWord).toLowerCase();
    const similarity = ratio(cleanVerse, cleanRecited);

    if (similarity >= 75) {
      // Mark skipped words as mistakes if jumping forward
      if (offset > 0) {
        for (let i = matchState.currentPosition; i < versePos; i++) {
          matchState.mistakes.push(i);
        }
        if (navigator.vibrate) navigator.vibrate(100);
      }

      matchState.correct.push(versePos);
      matchState.currentPosition = versePos + 1;
      matched = true;
      break;
    }
  }

  // If no match found, mark current position as mistake
  if (!matched && matchState.currentPosition < verseWords.length) {
    matchState.mistakes.push(matchState.currentPosition);
    matchState.currentPosition++;
  }
},

async safeProgress(verseParts) {
  this.isTransitioning = true;
  
  // Clear everything before progressing
  this.clearAllHighlights();
  await this.$nextTick();
  await new Promise(resolve => setTimeout(resolve, 500));

  // Store current part index before potentially changing it
  const wasLastPart = this.currentPartIndex >= verseParts.length - 1;

  if (!wasLastPart) {
    this.currentPartIndex++;
    this.displayCurrentPart();
  } else {
    await this.selectVerse(true);
  }

  // Final reset after progression
  this.clearAllHighlights();
  this.isTransitioning = false;
},

clearAllHighlights() {
  // Direct assignment is fine for complete array replacement
  this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  
  // Force update if needed (usually not necessary)
  this.$nextTick(() => {
    if (this.correctWords.length || this.mistakeWords.length || this.unreadVerses.length) {
      this.$forceUpdate();
    }
  });
},
handleWordClick(index, verse) {
  this.showDisplayModeMenu = false;
  this.showHighlightMenu = false;
  const color = this.getWordHighlightColor(index, verse.uuid);
  if (color) {
    this.highlightContextMenu = {
      verseUuid: verse.uuid,
      wordIndex: index,
      color,
    };
    this.$nextTick(() => {
      const wordEl = document.querySelector(`[data-word-uuid="${verse.uuid}-${index}"]`);
      if (wordEl) {
        const rect = wordEl.getBoundingClientRect();
        this.highlightContextMenuPosition = {
          top: rect.top + window.scrollY - 60,
          left: rect.left + window.scrollX + rect.width / 2 - 80,
        };
      }
      this.showHighlightContextMenu = true;
    });
  } else {
    this.openVerseNote(verse);
  }
},
getWordHighlightColor(index, verseUuid) {
  if (
    this.highlights &&
    this.highlights[verseUuid] &&
    this.highlights[verseUuid][index]
  ) {
    return this.highlights[verseUuid][index];
  }
  return null;
},  removeSingleHighlight() {
    const { verseUuid, wordIndex } = this.highlightContextMenu;
    if (this.highlights[verseUuid]) {
      delete this.highlights[verseUuid][wordIndex];
      if (Object.keys(this.highlights[verseUuid]).length === 0) {
        delete this.highlights[verseUuid];
      }
      this.saveVerseHighlights(verseUuid);
    }
    this.showHighlightContextMenu = false;
  },
  showHighlightMenuForWord() {
    // Open the highlight color menu for this word
    this.activeVerseUuidForHighlighting = this.highlightContextMenu.verseUuid;
    this.selectedWordIndices = [this.highlightContextMenu.wordIndex];
    this.highlightMenuPosition = { ...this.highlightContextMenuPosition };
    this.showHighlightMenu = true;
    this.showHighlightContextMenu = false;
  },
  openVerseNoteByContext() {
    // Open note for the verse
    const verse = this.allVerses.find(v => v.uuid === this.highlightContextMenu.verseUuid);
    if (verse) {
      this.openVerseNote(verse);
    }
    this.showHighlightContextMenu = false;
  },
async selectVerse(next = true) { // Make async
  if (this.displayMode === 'Hifdh') {
    this.selectNextHifdhVerse();
    return;
  }
  if (this.displayMode === 'revision') {
    this.correctWords = [];
    this.mistakeWords = [];
    this.unreadVerses = [];
    this.displayedWords = [];
    this.currentPartWords = [];
    this.$forceUpdate();
  }
  if (this.isRevisionMode) {
    this.displayMode = "revision"
      this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  }
    this.clearAnimationTimers();

    this.unreadVerses = Array.from({ length: this.currentPartWords.length }, (_, i) => i);

  this.clearAnimationTimers();
  // Fully reset display state
  this.displayedWords = [];
  this.currentTextParts = [];
  this.currentPartWords = [];
  this.currentPartIndex = 0;
this.correctWords = [];
this.mistakeWords = [];
this.unreadVerses = [];

  // When navigating to a new verse while paused by the button,
  // reset the remaining time as it applies to the new verse/part.
  if (this.isPausedByPause) {
    this.pausedPartRemainingTime = 0;
  }

   if (!this.currentVerseData || !this.currentVerseData.surah || !this.currentVerseData.verse) {
    const firstVerse = this.allVerses && this.allVerses.length > 0 ? this.allVerses[0] : null;
    if (firstVerse) {
      this.currentVerseData = { ...firstVerse };
    } else {
      this.errorMessage = this.getLocalizedErrorMessage('noVersesAvailable');
      return;
    }
  }


  if (!this.allVerses || this.allVerses.length === 0) {
    this.currentVerseData = null;
    this.currentTextParts = [];
    this.unreadVerses = [];
    if (!this.isLoading && !this.errorMessage) {
      this.errorMessage = this.getLocalizedErrorMessage('noVersesAvailable');
      this.isLoading = false; // Ensure loading is false if error occurs here
    }
    return;
  }

  let newIndex;
  const previousVerseUuid = this.currentVerseData ? this.currentVerseData.uuid : null;

  if (this.isShuffleMode) {
    newIndex = Math.floor(Math.random() * this.allVerses.length);
  } else if (next && this.currentVerseData) {
    const currentSurah = this.currentVerseData.surah;
    const currentVerseNum = this.currentVerseData.verse;
    const surahInfo = SURAH_DATA.find(s => s.id === currentSurah);
if (!surahInfo) {
  console.error('Surah info not found for surah:', currentSurah);
  // Fallback: go to first verse of Quran or handle as needed
  newIndex = this.allVerses.findIndex(verse => verse.surah === 1 && verse.verse === 1);
} else if (currentVerseNum < surahInfo.verses) {
  newIndex = this.allVerses.findIndex(verse => verse.surah === currentSurah && verse.verse === currentVerseNum + 1);
} else if (currentSurah < 114) {
  newIndex = this.allVerses.findIndex(verse => verse.surah === currentSurah + 1 && verse.verse === 1);
} else {
  newIndex = this.allVerses.findIndex(verse => verse.surah === 1 && verse.verse === 1);
}
  } else { // Default to first verse if no current verse or not 'next'
    newIndex = this.allVerses.findIndex(verse => verse.surah === 1 && verse.verse === 1);
  }

  if (newIndex === -1) { // Fallback if verse not found
    console.error('Next verse not found, falling back to first verse of Quran.');
    newIndex = this.allVerses.findIndex(verse => verse.surah === 1 && verse.verse === 1) || 0;
  }

  this.currentVerseData = { ...this.allVerses[newIndex] };
  
  // Only reset revision highlights if the verse actually changed
  if (!previousVerseUuid || this.currentVerseData.uuid !== previousVerseUuid) {
    this.unreadVerses = []; // Reset for the new verse
  }

  this.currentPartIndex = 0; // New verse always starts at the first part.
  this.currentTextParts = this.segmentText(this.currentVerseData.text);
  // displayedWords will be cleared by displayCurrentPart
  this.errorMessage = null;

  // Load associated data for the new currentVerseData
  if (this.currentVerseData && this.currentVerseData.uuid) {
     await this.loadVerseNote(this.currentVerseData.uuid);
      await this.loadVerseCompletion(this.currentVerseData.uuid);
      await this.loadVerseHighlights(this.currentVerseData.uuid);
  }
  this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  // Now that data is loaded, display the current part
  this.displayCurrentPart(); // This will handle clearing displayedWords and starting animation
  this.saveLastViewed();
    this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
},




displayNextPart() {
  if (this.isPausedByHold) return; // If paused by hold, do nothing.

  if (this.currentPartIndex < this.currentTextParts.length - 1) {
    this.currentPartIndex++;
    this.displayCurrentPart();
  } else {
    // At the last part of the current verse.
    // Auto-advance to the next verse only if not in revision mode and not paused by the button.
    if (this.displayMode !== 'revision' && !this.isPausedByPause) {
      this.partTimeoutId = setTimeout(() => { // Ensure partTimeoutId is set for this delay
        // Double check isPausedByPause again, in case it was set during the NEXT_VERSE_DELAY
        if (!this.isPausedByPause && this.displayMode !== 'revision') { // Check again before advancing
            this.selectVerse(true);
        }
      }, this.NEXT_VERSE_DELAY); // Use NEXT_VERSE_DELAY
      this.partTimeoutStartTime = Date.now(); // Record start time for this specific timeout
      this.currentActivePartDuration = this.NEXT_VERSE_DELAY; 
    }
    // If paused by button at the end of a verse, do nothing.
    // User must manually navigate or unpause.
    // When unpaused, resumeVerseDisplayFromPause will handle starting the timer for the NEXT_VERSE_DELAY.
  }
},
    
    // Existing methods
  async loadSurahVerses(surahId) {
  this.isLoading = true;
  try {
    const surahVerses = this.allVerses.filter(v => v.surah === surahId);
    this.currentSurahData = this.SURAH_DATA.find(s => s.id === surahId);
    this.displayedVerses = surahVerses;
    // Set currentVerseData to the first verse of the surah for bottom info bar
    if (surahVerses.length > 0) {
      this.currentVerseData = { ...surahVerses[0] };
    }
    // Load highlights for all verses in this surah
    for (const verse of surahVerses) {
      await this.loadVerseHighlights(verse.uuid);
    }
    this.isLoading = false;
  } catch (error) {
    this.errorMessage = this.getLocalizedErrorMessage('loadSurahError');
    this.isLoading = false;
  }
  this.saveLastViewed();
},
    
    // ... (all other existing methods)
    
    // Add new methods for the fixes:
    // Fix for Surah/Verse Selection

    
    // Fix for Tafsir Mode Navigation
    handleAppClick(event) {
      if (this.highlightMode && this.isSelectingWords) {
  // Prevent navigation while highlighting
  return;
}
       // If in full-surah mode, don't do any verse/part navigation from global clicks
      if (this.displayMode === 'full-surah') {
        // Still handle overlay closing if click is outside content
        if (
            !event.target.closest('.notes-overlay .notes-container') &&
            !event.target.closest('.loops-overlay .loops-container') &&
            !event.target.closest('.surah-verse-overlay .surah-verse-container') &&
            !event.target.closest('.search-overlay .search-container') &&
            !event.target.closest('.voice-search-overlay .voice-search-container') &&
            !event.target.closest('.highlight-menu .highlight-container') &&
            !event.target.closest('.control-buttons-container')
        ) {
            // Logic to close overlays if the click was on the backdrop
            if (event.target.classList.contains('notes-overlay')) this.showNotesOverlay = false;
            if (event.target.classList.contains('loops-overlay')) this.showLoopsMenu = false;
            if (event.target.classList.contains('surah-verse-overlay')) this.showSurahVerseMenu = false;
            if (event.target.classList.contains('search-overlay')) this.closeOverlay('search');
            if (event.target.classList.contains('voice-search-overlay')) this.closeOverlay('voice');
            if (event.target.classList.contains('highlight-menu')) this.showHighlightMenu = false; // Assuming highlight-menu is the overlay itself
        }
        return;
      }
      // Skip if clicking inside any overlay or control buttons
      if (
        event.target.closest('.notes-overlay') ||
        event.target.closest('.loops-overlay') ||
        event.target.closest('.language-menu') ||
        event.target.closest('.display-mode-menu') ||
        event.target.closest('.surah-verse-overlay') ||
        event.target.closest('.search-overlay') ||
        event.target.closest('.voice-search-overlay') ||
        event.target.closest('.highlight-menu') ||
        event.target.closest('.control-buttons-container') // Keep this to prevent controls from closing overlays
      ) {
         // Check if the click is on the overlay backdrop itself, not the content
        const isBackdropClick = (
          (this.showNotesOverlay && event.target.classList.contains('notes-overlay')) ||
          (this.showLoopsMenu && event.target.classList.contains('loops-overlay')) ||
          (this.showLanguageMenu && event.target.classList.contains('language-selection-overlay')) ||
          (this.showDisplayModeMenu && event.target.classList.contains('display-mode-menu-overlay')) ||
          (this.showSurahVerseMenu && event.target.classList.contains('surah-verse-overlay')) ||
          (this.showSearchOverlay && event.target.classList.contains('search-overlay')) ||
          (this.showVoiceSearchOverlay && event.target.classList.contains('voice-search-overlay')) ||
          (this.showHighlightMenu && event.target.classList.contains('highlight-menu'))
        );
        if (!isBackdropClick) {
          // Click is inside content of an overlay (not backdrop)
          return;
        }
      }

      // If the click is on a select element or its options, don't close overlays.
      if (event.target.tagName === 'SELECT' || event.target.tagName === 'OPTION' || event.target.closest('select')) {
    
        return;
      }
      

      
      // Close all overlays
      this.showNotesOverlay = false;
      this.showLoopsMenu = false;
      this.showLanguageMenu = false;
      this.showDisplayModeMenu = false;
      this.showSurahVerseMenu = false;
      this.showSearchOverlay = false;
      this.showVoiceSearchOverlay = false;
      this.showHighlightMenu = false;
      
      // Handle Tafsir mode navigation
      if (this.displayMode === 'tafseer' && this.currentTextParts.length > 1) {
        const clickX = event.clientX || (event.touches && event.touches[0].clientX);
        const screenWidth = window.innerWidth;
        const isArabic = this.currentLanguage === 'ar';
        
        if ((clickX > screenWidth )) {
          this.displayPreviousPart();
        } else {
          this.displayNextPart();

        }
        return;
      }
    },
    
    // Fix for Audio Playback
    async initAudioPlayback() {
      if (!this.currentVerseData) return;
      try {
        let audioUrl;
        if (this.mushafType === 'hafs') {
          const response = await fetch(`https://api.alquran.cloud/v1/ayah/${this.currentVerseData.surah}:${this.currentVerseData.verse}/ar.alafasy`);
          const data = await response.json();
          audioUrl = data.data.audio;
        } else {
          // Fallback to Hafs audio for Warsh/Qaloon ADD QALOON WARSH @@@@@@@@@@@@@@@@@
          console.warn('Audio not available for selected mushaf, falling back to Hafs');
          const response = await fetch(`https://api.alquran.cloud/v1/ayah/${this.currentVerseData.surah}:${this.currentVerseData.verse}/ar.alafasy`);
          const data = await response.json();
          audioUrl = data.data.audio;
        }
        
        if (audioUrl) {
          this.currentAudio = new Audio(audioUrl);
          this.currentAudio.play()
            .then(() => {
              this.isAudioPlaying = true;
            })
            .catch(error => {
              console.error('Audio playback error:', error);
              this.handleAudioError();
            });
          
          this.currentAudio.onended = () => {
              this.isAudioPlaying = true;
              this.selectVerse(true);
              this.initAudioPlayback()
            if (this.isContinuousAudio) {
              this.selectVerse(true);
            }
          };
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
        this.handleAudioError();
      }
    },
    
    handleAudioError() {
      this.isAudioPlaying = false;
      // Try next verse if current fails
      setTimeout(() => {
        this.selectVerse(true);
      }, 1000);
    },
    
    // Add Full Surah Mode to UI
   setDisplayMode(mode) {
 if (this.displayMode === 'full-surah') {
    this.fullSurahScrollPosition = this.$refs.versesContainer ? 
      this.$refs.versesContainer.scrollTop : 0;
  }
  
  if (mode === 'full-surah' && this.fullSurahScrollPosition > 0) {
    this.$nextTick(() => {
      if (this.$refs.versesContainer) {
        this.$refs.versesContainer.scrollTop = this.fullSurahScrollPosition;
      }
    });
  }
  this.displayMode = mode;
  this.clearAnimationTimers();
  this.showDisplayModeMenu = false;

  if (mode === 'Hifdh') {
    this.enterHifdhMode();
    this.displayedWords = [];
    this.currentTextParts = [];
    this.$forceUpdate();
  } else if (mode === 'tafseer') {
    // Open fassarli overlay for current verse
    this.fassarliMode = true;
    // Optionally, set selectedVerse and selectedSurah if needed
    this.selectedVerse = this.currentVerseData ? this.currentVerseData.verse : 1;
    // If you want to ensure surah is set:
    // this.selectedSurah = this.currentVerseData ? this.currentVerseData.surah : 1;
    return; // Don't run the rest of the code for tafseer mode
  } else if (mode === 'full-surah') {
    if (this.currentVerseData && this.currentVerseData.surah) {
      this.loadSurahVerses(this.currentVerseData.surah);
    } else if (this.allVerses.length > 0) {
      this.loadSurahVerses(this.allVerses[0].surah);
    } else {
      this.errorMessage = this.getLocalizedErrorMessage('noVersesAvailable');
    }
  } else {
    // For 'verse' mode or other modes that show single verse
    this.correctWords = [];
    this.mistakeWords = [];
    this.unreadVerses = [];
    // If coming from full-surah mode, use the currentVerseData (which is now set to the first verse of the surah)
    if (!this.currentVerseData && this.allVerses.length > 0) {
      this.currentVerseData = { ...this.allVerses[0] };
    }
    if (this.currentVerseData) {
      this.currentTextParts = this.segmentText(this.currentVerseData.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.displayCurrentPart();
    }
    if (this.isAudioPlaying) {
      this.$nextTick(() => {
        this.playCurrentVerse();
      });
    }
  }
  this.saveLastViewed();
    },
 
    
    // UI Styling
    toggleTheme() {
      if (this.currentTheme === 'light') {
        this.currentTheme = 'dark';
      } else if (this.currentTheme === 'dark') {
        this.currentTheme = 'sepia';
      } else {
        this.currentTheme = 'light';
      }
      document.documentElement.setAttribute('data-theme', this.currentTheme);
      localStorage.setItem('theme', this.currentTheme);

    },
    
    // Offline Support
    async initIndexedDB() {
      return openDB('quran-db', 2, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('verses')) {
            db.createObjectStore('verses', { keyPath: 'uuid' })
              .createIndex('language', 'language', { unique: false });
          }
          if (!db.objectStoreNames.contains('cacheStatus')) {
            db.createObjectStore('cacheStatus', { keyPath: 'language' });
          }
          if (!db.objectStoreNames.contains('notes')) {
            db.createObjectStore('notes', { keyPath: 'uuid' });
          }
          if (!db.objectStoreNames.contains('completions')) {
            db.createObjectStore('completions', { keyPath: 'uuid' });
          }
          if (!db.objectStoreNames.contains('highlights')) {
            db.createObjectStore('highlights', { keyPath: 'uuid' });
          }
        },
      });
    },
    
    // ... (all other existing methods)

        toggleDisplayModeMenu() {
    this.showDisplayModeMenu = !this.showDisplayModeMenu;
    console.log('Display mode menu toggled:', this.showDisplayModeMenu);
  },

toggleSurahVerseMenu() {
  this.showSurahVerseMenu = !this.showSurahVerseMenu;
  if (this.showSurahVerseMenu) {
    this.selectedSurah = this.currentVerseData ? this.currentVerseData.surah : 1;
    this.updateVerseOptions();
    this.$nextTick(() => {
      if (this.$refs.surahSelect) {
        this.$refs.surahSelect.focus();
      }
    });
  }
},

updateVerseOptions() {
  const surah = this.SURAH_DATA.find(s => s.id === this.selectedSurah);
  this.verseOptions = surah ? Array.from({ length: surah.verses }, (_, i) => i + 1) : [];
  this.selectedVerse = 1;
},
selectSurahVerse() {
  this.clearAnimationTimers();
  this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
    this.displayedWords = [];
    this.currentPartWords = [];
    this.$forceUpdate();
  const verse = this.allVerses.find(v => v.surah === this.selectedSurah && v.verse === this.selectedVerse);
  
  if (verse) {
    this.currentVerseData = { ...verse };
    this.currentTextParts = this.segmentText(verse.text);
    this.currentPartIndex = 0;
    this.displayedWords = [];
    this.clearAnimationTimers();
    
    this.displayCurrentPart();
    this.showSurahVerseMenu = false;

    // FIX: If in full-surah mode, reload the surah verses
    if (this.displayMode === 'full-surah') {
      this.loadSurahVerses(this.selectedSurah);
      // Optionally, scroll to the selected verse
      this.$nextTick(() => {
        const verseEl = document.querySelector(`[data-verse-uuid="${verse.uuid}"]`);
        if (verseEl) verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }
},

async loadTafseer() {
  if (!this.currentVerseData || this.currentLanguage !== 'ar') {
    this.errorMessage = this.getLocalizedErrorMessage('tafseerNotAvailable');
    return;
  }
  this.originalSurah = this.currentVerseData.surah;
  this.isLoading = true;
    this.displayedWords = [];
  this.currentTextParts = [];
  this.$forceUpdate();
  try {
    const verseKey = this.currentVerseData.verseKey;
    const response = await fetch(`https://api.alquran.cloud/v1/ayah/${verseKey}/ar.waseet`);
    const data = await response.json();
    if (data.code === 200 && data.data && data.data.text) {
      this.currentVerseData.text = data.data.text;
      this.currentTextParts = this.segmentText(data.data.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.clearAnimationTimers();
      this.displayCurrentPart();
    } else {
      throw new Error('Invalid tafseer response');
    }
  } catch (error) {
    console.error('Error loading tafseer:', error);
    this.errorMessage = this.getLocalizedErrorMessage('loadError');
  } finally {
    this.isLoading = false;
  }
},
getLocalizedErrorMessage(key, detail = '') {
  const messages = {
    loadNoteError: {
      ar: `خطأ في تحميل الملاحظة: ${detail}`,
      en: `Error loading note: ${detail}`,
      fr: `Erreur lors du chargement de la note : ${detail}`,
      bn: `নোট লোডিংয়ে ত্রুটি: ${detail}`,
      tr: `Not yükleme hatası: ${detail}`,
      ur: `نوٹ لوڈ کرنے میں خرابی: ${detail}`,
    },
    HifdhComplete: {
      ar: 'تم إكمال الحفظ! ابدأ من جديد؟',
      en: 'Hifdh completed! Start over?',
      fr: `Erreur lors du chargement de la note : ${detail}`,
      bn: `নোট লোডিংয়ে ত্রুটি: ${detail}`,
      tr: `Not yükleme hatası: ${detail}`,
      ur: `نوٹ لوڈ کرنے میں خرابی: ${detail}`,    },
    saveCompletionError: {
      ar: `خطأ في حفظ الإكمال: ${detail}`,
      en: `Error saving completion: ${detail}`,
      fr: `Erreur lors de l'enregistrement de l'achèvement : ${detail}`,
      bn: `সমাপ্তি সংরক্ষণে ত্রুটি: ${detail}`,
      tr: `Tamamlama kaydetme hatası: ${detail}`,
      ur: `مکمل کرنے میں خرابی: ${detail}`,
    },
    loadHighlightError: {
      ar: `خطأ في تحميل التمييز: ${detail}`,
      en: `Error loading highlight: ${detail}`,
      fr: `Erreur lors du chargement du surlignage : ${detail}`,
      bn: `হাইলাইট লোডিংয়ে ত্রুটি: ${detail}`,
      tr: `Vurgu yükleme hatası: ${detail}`,
      ur: `ہائی لائٹ لوڈ کرنے میں خرابی: ${detail}`,
    },
    loadCompletionError: {
      ar: `خطأ في تحميل الإكمال: ${detail}`,
      en: `Error loading completion: ${detail}`,
      fr: `Erreur lors du chargement de l'achèvement : ${detail}`,
      bn: `সমাপ্তি লোডিংয়ে ত্রুটি: ${detail}`,
      tr: `Tamamlama yükleme hatası: ${detail}`,
      ur: `مکمل لوڈ کرنے میں خرابی: ${detail}`,
    },
    dbError: {
      ar: `خطأ في قاعدة البيانات: ${detail}`,
      en: `Database error: ${detail}`,
      fr: `Erreur de base de données : ${detail}`,
      bn: `ডাটাবেস ত্রুটি: ${detail}`,
      tr: `Veritabanı hatası: ${detail}`,
      ur: `ڈیٹا بیس میں خرابی: ${detail}`,
    },
       noDataAfterLoad: {
      ar: 'لم يتم العثور على بيانات الآيات بعد تحميل جميع الملفات.',
      en: 'No Quran verse data found after loading all files.',
      fr: 'Aucune donnée de verset du Coran trouvée après le chargement de tous les fichiers.',
      bn: 'সমস্ত ফাইল লোড করার পরে কোনো কুরআনের আয়াতের ডেটা পাওয়া যায়নি।',
      tr: 'Tüm dosyalar yüklendikten sonra Kuran ayeti verisi bulunamadı.',
      ur: 'تمام فائلوں کو لوڈ کرنے کے بعد قرآن کے آیات کا کوئی ڈیٹا نہیں ملا۔',
    },
    shareError: {
      ar: 'فشل في المشاركة أو النسخ إلى الحافظة',
      en: 'Failed to share or copy to clipboard',
      fr: 'Échec du partage ou de la copie dans le presse-papiers',
      bn: 'শেয়ার বা ক্লিপবোর্ডে কপি করতে ব্যর্থ হয়েছে',
      tr: 'Paylaşma veya panoya kopyalama başarısız oldu',
      ur: 'شئیر یا کلپ بورڈ میں کاپی کرنے میں ناکامی ہوئی',
    },
    voiceSearchNotSupported: {
      ar: 'البحث الصوتي غير مدعوم.',
      en: 'Voice search not supported.',
      fr: 'Recherche vocale non prise en charge.',
      bn: 'ভয়েস অনুসন্ধান সমর্থিত নয়।',
      tr: 'Sesli arama desteklenmiyor.',
      ur: 'صوتی تلاش تعاون یافتہ نہیں ہے۔',
    },
    voiceSearchError: {
      ar: `خطأ في البحث الصوتي: ${detail}`,
      en: `Voice search error: ${detail}`,
      fr: `Erreur de recherche vocale: ${detail}`,
      bn: `ভয়েস অনুসন্ধানে ত্রুটি: ${detail}`,
      tr: `Sesli arama hatası: ${detail}`,
      ur: `صوتی تلاش میں خرابی: ${detail}`,
    },
    tafseerNotAvailable: {
      ar: 'التفسير متاح فقط باللغة العربية',
      en: 'Tafseer is only available in Arabic',
      fr: 'Le tafsir est uniquement disponible en arabe',
      bn: 'তাফসীর শুধুমাত্র আরবিতে উপলব্ধ',
      tr: 'Tefsir sadece Arapça olarak mevcuttur',
      ur: 'تفسیر صرف عربی میں دستیاب ہے',
    },
    saveNoteError: {
      ar: `خطأ في حفظ الملاحظة: ${detail}`,
      en: `Error saving note: ${detail}`,
      fr: `Erreur lors de l'enregistrement de la note : ${detail}`,
      bn: `নোট সংরক্ষণে ত্রুটি: ${detail}`,
      tr: `Not kaydetme hatası: ${detail}`,
      ur: `نوٹ محفوظ کرنے میں خرابی: ${detail}`,
    },
  };
  return messages[key][this.currentLanguage] || messages[key].en;
},
  loadPage() {
    // Placeholder: Implement page-based display (e.g., verses on the same page)
    console.log('Page mode not implemented');
    this.selectVerse(); // Fallback to verse mode
  },
  loadChapter() {
    // Placeholder: Implement chapter-based display (e.g., entire surah)
    console.log('Chapter mode not implemented');
    this.selectVerse(); // Fallback to verse mode
  },
    toggleShuffleMode() {
    this.isShuffleMode = !this.isShuffleMode;
    console.log('Shuffle mode:', this.isShuffleMode);
  },

searchPagination(direction) {
  this.currentPage += direction;
  if (this.currentPage < 1) this.currentPage = 1;
  if (this.currentPage > Math.ceil(this.searchResults.length / this.resultsPerPage)) {
    this.currentPage = Math.ceil(this.searchResults.length / this.resultsPerPage);
  }
  this.$nextTick(() => {
    const resultsContainer = document.querySelector('.search-results');
    if (resultsContainer) resultsContainer.scrollTop = 0;
  });
},
  handleResultClick(result) {
    const text = `${result.text}\n${this.currentLanguage === 'ar' ? result.surahArabicName : result.surahEnglishName} ${result.verse}`;
    navigator.clipboard.write(text)
      .then(() => {
        this.showCopyNotification = true;
        setTimeout(() => {
          this.showCopyNotification = false;
        }, 2000);
      })
      .catch(err => console.error('Clipboard copy failed:', err));
  },
  closeOverlay(type) {
    if (type === 'search') {
      this.showSearchOverlay = false;
      this.searchQuery = '';
      this.searched = false;

      this.searchResults = [];
    } else if (type === 'voice') {
      this.showVoiceSearchOverlay = false;
      this.detectedText = '';
      this.detectedWords = [];
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
      }
    }
  },
  openVoiceOverlay() {
    this.showSearchOverlay = false;
    this.showVoiceSearchOverlay = true;
    this.startVoiceSearch();
  },
    processSurahData(data) {
   if (!data || !data.data || !data.data.ayahs) return [];
      const surah = data.data;
      const surahInfo = SURAH_DATA.find(s => s.id === surah.number);
      if (!surahInfo) {
        console.error(`Surah info not found for surah number: ${surah.number}`);
        return [];
      }
      return surah.ayahs.map(ayah => ({
        uuid: `${surah.number}:${ayah.numberInSurah}-${this.currentLanguage}`,
        surah: surah.number,
        verse: ayah.numberInSurah,
        verseKey: `${surah.number}:${ayah.numberInSurah}`,
        text: ayah.text,
        surahArabicName: surahInfo.arabicName,
        surahEnglishName: surahInfo.englishName,
        audio: ayah.audio || null, // Ensure audio property exists
        language: this.currentLanguage,
      }));
    },

startWordSelection(event, index, verseUuidParam = null) {
  const targetVerseUuid = verseUuidParam || (this.currentVerseData ? this.currentVerseData.uuid : null);
  if (!targetVerseUuid) {
    console.warn("startWordSelection: No targetVerseUuid available.");
    return;
  }

  // Define which modes allow word selection for highlighting
  const highlightEnabledModes = ['Hifdh', 'full-surah']; // Add 'verse', 'tafseer' if needed
  if (!highlightEnabledModes.includes(this.displayMode)) {
    return;
  }

  event.preventDefault();
  this.isSelectingWords = true;
  this.selectedWordIndices = [index];
  this.highlightSelectionStart = index;
  this.activeVerseUuidForHighlighting = targetVerseUuid;
  this.showHighlightMenu = false;
  this.showHighlightContextMenu = false;
},

updateWordSelection(event, index, verseUuidParam = null) {
  const targetVerseUuid = verseUuidParam || (this.currentVerseData ? this.currentVerseData.uuid : null);

  if (!this.isSelectingWords || this.activeVerseUuidForHighlighting !== targetVerseUuid) {
    return;
  }

  if (!this.isSelectingWords || this.activeVerseUuidForHighlighting !== targetVerseUuid) return;
  const highlightEnabledModes = ['Hifdh', 'full-surah'];
  if (!highlightEnabledModes.includes(this.displayMode)) return;
  event.preventDefault();
  // Always select range between start and current
  const minIndex = Math.min(this.highlightSelectionStart, index);
  const maxIndex = Math.max(this.highlightSelectionStart, index);
  this.selectedWordIndices = Array.from({ length: maxIndex - minIndex + 1 }, (_, i) => minIndex + i);
},

endWordSelection(event) {
 const highlightEnabledModes = ['Hifdh', 'full-surah'];
  if (!highlightEnabledModes.includes(this.displayMode) || !this.isSelectingWords) {
    this.isSelectingWords = false;
    return;
  }
  this.isSelectingWords = false;
  if (this.wasScrolling) {
    this.wasScrolling = false;
    return; // Don't show highlight menu if user was scrolling
  }
  if (this.selectedWordIndices.length > 0) {
    let target = event.target;
    while (target && !target.classList.contains('inline-block')) {
      target = target.parentElement;
    }
    if (target) {
      const rect = target.getBoundingClientRect();
      const menuWidth = 180; // Approximate width of your highlight menu
      let left = rect.left + window.scrollX + (rect.width / 2) - menuWidth / 2;
      // On mobile, center in viewport if menu would overflow
      if (window.innerWidth < 600) {
        left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
      }
      this.highlightMenuPosition = {
        top: rect.top + window.scrollY - 60,
        left,
      };
      this.showHighlightMenu = true;
    }
  }
},



selectInitialLanguage(lang) {
  this.currentLanguage = lang;
  localStorage.setItem('language', lang);
  this.showLanguageSelection = false;

   if (lang === 'ar') {
    this.showMushafSelection = true;
  } else {
    this.showMushafSelection = false;
    this.mushafType = 'hafs';
    this.loadInitialData();
  }

  if (!localStorage.getItem('hasSeenInstructions')) {
      console.log('Showing navigation instructions on first visit');
      this.showNavigationInstructions = true;
    }
  this.loadInitialData().then(() => {
    if (this.allVerses.length > 0 && !this.errorMessage) {
      this.selectVerse();
    } else if (!this.errorMessage) {
      this.errorMessage = this.getLocalizedErrorMessage('noDataAfterLoad');
      this.isLoading = false;
    }
  });

},

toggleLanguageMenu() {
  this.showLanguageMenu = !this.showLanguageMenu;
},
async loadLocalMushafJson(type) {
    const validTypes = ['warsh', 'qaloon'];
    if (!validTypes.includes(type)) return [];
    
    try {
        const response = await fetch(`/${type}.json`);
        if (!response.ok) throw new Error(`HTTP ${response.status} loading ${type}`);
        
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid data format');
        
        return data.map(aya => {
            // Validate required fields
            if (!aya.sura_no || !aya.aya_no || !aya.aya_text) {
                console.warn('Invalid ayah data:', aya);
                return null;
            }
            return {
                uuid: `${aya.sura_no}:${aya.aya_no}-ar-${type}`,
                surah: parseInt(aya.sura_no),
                verse: parseInt(aya.aya_no),
                verseKey: `${aya.sura_no}:${aya.aya_no}`,
                text: String(aya.aya_text).replace(/[\uFBC0-\uFC63]/g, ''),
                surahArabicName: aya.sura_name_ar?.trim() || '',
                surahEnglishName: aya.sura_name_en || '',
                audio: null,
                language: 'ar',
            };
        }).filter(Boolean); // Remove null entries
        
    } catch (e) {
        console.error(`Failed to load ${type} mushaf:`, e);
        this.errorMessage = `Failed to load ${type} data: ${e.message}`;
        return [];
    }
},
setLanguage(lang) {
  this.currentLanguage = lang;
  localStorage.setItem('language', lang);
  this.showLanguageMenu = false;
  if (lang === 'ar') {
    this.showMushafSelection = true;
  } else {
    this.showMushafSelection = false;
    this.mushafType = 'hafs'; // <-- Force Hafs for non-Arabic
    localStorage.setItem('mushafType', 'hafs');
    this.loadInitialData().then(() => {
      if (this.displayMode === 'full-surah' && this.currentVerseData) {
        this.loadSurahVerses(this.currentVerseData.surah);
      }
      if (this.allVerses.length > 0 && !this.errorMessage) {
        this.selectVerse();
      } else if (!this.errorMessage) {
        this.errorMessage = this.getLocalizedErrorMessage('noDataAfterLoad');
      }
      this.isLoading = false;
    });
  }
},
async loadInitialData() {
      console.log('Loading with mushaf:', this.mushafType); // <-- Check this first
    

  this.isLoading = true;
  this.cacheStatus = 'checking';
  try {
       if (this.mushafType === 'warsh' || this.mushafType === 'qaloon') {
      this.allVerses = await this.loadLocalMushafJson(this.mushafType);
      if (this.allVerses.length > 0) {
                this.allVerses.sort((a,b) => a.surah === b.surah ? a.verse - b.verse : a.surah - b.surah);

        this.selectVerse();
      } else {
        this.errorMessage = this.getLocalizedErrorMessage('noDataAfterLoad');
      }
      this.isLoading = false;
      return;
       } else if (this.currentLanguage !== 'ar' && this.mushafType !== 'hafs') {
        this.mushafType = 'hafs'; // Default to hafs for non-Arabic if something else was set
    }
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cached = await this.checkServiceWorkerCache();
      if (cached) {
        this.cacheStatus = 'cached';
        this.allVerses = cached;
        console.log('Loaded from SW cache:', this.allVerses);
                this.allVerses.sort((a,b) => a.surah === b.surah ? a.verse - b.verse : a.surah - b.surah);

        this.selectVerse();
        return;
      }
    }
    const indexedDBCache = await this.getIndexedDBCache();
    if (indexedDBCache && indexedDBCache.length > 0) {
      this.cacheStatus = 'cached';
      this.allVerses = indexedDBCache;
      console.log('Loaded from IndexedDB:', this.allVerses);
            this.allVerses.sort((a,b) => a.surah === b.surah ? a.verse - b.verse : a.surah - b.surah);

      this.selectVerse();
      this.checkCacheFreshness();
      return;
    }
    this.cacheStatus = 'uncached';
    await this.loadFromAPI();
  } catch (error) {
    console.error('Initial load error:', error);
    this.errorMessage = this.getLocalizedErrorMessage('loadError');
  } finally {
    this.isLoading = false;
  }
},

    async checkServiceWorkerCache() {
      try {
        const cache = await caches.match(`/api/quran/${this.currentLanguage}`);
        if (cache) {
          return await cache.json();
        }
        return null;
      } catch (error) {
        console.error('Service Worker cache check failed:', error);
        return null;
      }
    },

    async getIndexedDBCache() {
      try {
        const db = await this.$indexedDB;
        const tx = db.transaction('verses', 'readonly');
        const store = tx.objectStore('verses');
        const index = store.index('language');
        return await index.getAll(this.currentLanguage);
      } catch (error) {
        console.error('IndexedDB access error:', error);
        return null;
      }
    },

    async loadFromAPI() {
      try {
        // Load first surah immediately
        const firstSurah = await this.fetchSurah(1);
        if (firstSurah) {
          this.allVerses = firstSurah;
          this.selectVerse();
          
          // Cache the initial data
          await this.cacheVerses(firstSurah);
          
          // Start background loading of remaining surahs
          this.backgroundLoadQuran();
        }
      } catch (error) {
        throw error;
      }
    },

    async fetchSurah(surahNumber) {
      try {
        const edition = EDITIONS[this.currentLanguage] || EDITIONS.ar;
        const apiUrl = `https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`;
        
        // Try to fetch from network first
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const processed = this.processSurahData(data);
        
        // Cache the API response in Service Worker
        if ('caches' in window) {
          const cacheKey = `/api/surah/${surahNumber}/${this.currentLanguage}`;
          const cache = await caches.open('quran-data');
          await cache.put(cacheKey, new Response(JSON.stringify(processed)));
        }
        
        return processed;
      } catch (error) {
        console.error(`Error loading surah ${surahNumber}:`, error);
        return null;
      }
    },

    async backgroundLoadQuran() {
      if (this.isBackgroundLoading) return;
      this.isBackgroundLoading = true;
      
      try {
        for (let surah = 2; surah <= 114; surah++) {
          const surahData = await this.fetchSurah(surah);
          if (surahData) {
            this.allVerses = [...this.allVerses, ...surahData];
            await this.cacheVerses(surahData);
          }
          
          // Throttle requests
          if (surah % 5 === 0) await new Promise(r => setTimeout(r, 500));
        }
        
        // Mark cache as complete
        await this.markCacheComplete();
      } catch (error) {
        console.error('Background loading error:', error);
      } finally {
        this.isBackgroundLoading = false;
      }
    },

    async cacheVerses(verses) {
      try {
        // Cache in IndexedDB
        const db = await this.$indexedDB;
        const tx = db.transaction('verses', 'readwrite');
        const store = tx.objectStore('verses');
        
        const promises = verses.map(verse => {
          verse.cachedAt = new Date().toISOString();
          verse.language = this.currentLanguage;
          return store.put(verse);
        });
        
        await Promise.all(promises);
      } catch (error) {
        console.error('IndexedDB cache error:', error);
      }
    },

    async markCacheComplete() {
      try {
        const db = await this.$indexedDB;
        const tx = db.transaction('cacheStatus', 'readwrite');
        const store = tx.objectStore('cacheStatus');
        await store.put({
          language: this.currentLanguage,
          complete: true,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error marking cache complete:', error);
      }
    },

    async checkCacheFreshness() {
      try {
        const db = await this.$indexedDB;
        const tx = db.transaction('cacheStatus', 'readonly');
        const store = tx.objectStore('cacheStatus');
        const status = await store.get(this.currentLanguage);
        
        // If cache is older than 7 days, refresh in background
        if (status && new Date(status.updatedAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          this.backgroundLoadQuran();
        }
      } catch (error) {
        console.error('Cache freshness check error:', error);
      }
    },



    segmentText(text) {
      if (!text) return [];
      const words = text.split(' ').filter(word => word.trim());
      const parts = [];
      
      for (let i = 0; i < words.length; i += this.WORDS_PER_PART) {
        parts.push(words.slice(i, i + this.WORDS_PER_PART).join(' '));
      }
      
      return parts.length ? parts : [text];
    },

removeTashkeel(text) {
  if (!text) return '';
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, '') // All diacritics
    .replace(/[أإآ]/g, 'ا') // Normalize alif
    .replace(/ى/g, 'ي') // Normalize ya
    .replace(/ؤ/g, 'و') // Normalize waw
    .replace(/ة/g, 'ه') // Normalize ta marbuta
    .replace(/\s+/g, ' ') // Normalize whitespace
    .normalize('NFC')
    .trim();
},

openSearchOverlay() {

  this.showSearchOverlay = true;
  this.showVoiceSearchOverlay = false;
  this.searchQuery = '';
  this.searchResults = [];
  this.currentPage = 1;
  this.errorMessage = null;
  this.focusSearchInput();
},

performSearch() {
    this.currentPage = 1;
  setTimeout(() => {
    // ...existing code...
    this.$nextTick(() => {
      const resultsContainer = document.querySelector('.search-results');
      if (resultsContainer) resultsContainer.scrollTop = 0;
      if (this.$refs.searchInput) this.$refs.searchInput.blur();
    });
  }, 300);

    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      this.isSearching = false;
      this.errorMessage = this.getLocalizedErrorMessage('emptySearch');
      return;
    }
    this.isSearching = true;
    this.searchResults = [];
    this.errorMessage = null;
    this.currentPage = 1;
    setTimeout(() => {
      this.searchResults = this.allVerses
        .filter(verse => {
          if (!verse.text) return false;
          const searchText = this.currentLanguage === 'ar'
            ? this.removeTashkeel(verse.text).toLowerCase()
            : verse.text.toLowerCase().trim();
          const searchQueryNormalized = this.currentLanguage === 'ar'
            ? this.removeTashkeel(this.searchQuery).toLowerCase()
            : this.searchQuery.toLowerCase().trim();
          return searchText.includes(searchQueryNormalized);
        })
        .map(verse => ({
          uuid: verse.uuid,
          text: verse.text,
          surah: verse.surah,
          verse: verse.verse,
          surahArabicName: verse.surahArabicName,
          surahEnglishName: verse.surahEnglishName,
        }));
      this.isSearching = false;
    this.searched = true;
 
      // Scroll to top of results
 this.$nextTick(() => {
      const resultsContainer = document.querySelector('.search-results');
      if (resultsContainer) resultsContainer.scrollTop = 0;
      if (this.$refs.searchInput) this.$refs.searchInput.blur();
    });
  }, 300);
  },
selectSearchResult(result) {
  const verse = this.allVerses.find(v => v.uuid === result.uuid);
  if (!verse) return;
  if (this.displayMode === 'full-surah') {
    this.selectedSurah = result.surah;
    this.loadSurahVerses(result.surah).then(() => {
      this.showSearchOverlay = false;
      this.$nextTick(() => {
        const verseEl = document.querySelector(`[data-verse-uuid="${result.uuid}"]`);
        if (verseEl) verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  } else if (this.displayMode === 'tafseer') {
    this.currentVerseData = { ...verse };
    this.loadTafseer();
    this.showSearchOverlay = false;
  } else if (this.displayMode === 'Hifdh') {
    this.currentVerseData = { ...verse };
    this.updateHifdhVerseQueue();
    this.HifdhCurrentVerseIndex = 0;
    this.showSearchOverlay = false;
    this.showBottomInfo = false;
    this.currentTextParts = this.segmentText(verse.text);
    this.currentPartIndex = 0;
    this.displayedWords = [];
    this.clearAnimationTimers();
    this.displayCurrentPart();
  } else {
    // Verse mode
    this.currentVerseData = { ...verse };
    this.currentTextParts = this.segmentText(verse.text);
    this.currentPartIndex = 0;
    this.displayedWords = [];
    this.clearAnimationTimers();
    this.displayCurrentPart();
    this.showSearchOverlay = false;
  }
},


startVoiceSearch() {
  console.log('Starting voice search, lang:', this.currentLanguage);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    this.detectedText = this.getLocalizedErrorMessage('voiceSearchNotSupported');
    this.detectedWords = [];
    console.log('Voice search not supported by browser');
    return;
  }
  this.recognition = new SpeechRecognition();
  this.recognition.lang = { ar: 'ar-SA', en: 'en-US', fr: 'fr-FR', bn: 'bn-BD', tr: 'tr-TR', ur: 'ur-PK' }[this.currentLanguage];
  this.recognition.continuous = true;
  this.recognition.interimResults = true;
  this.recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0].transcript)
      .join('');
    this.detectedText = transcript;
    this.detectedWords = transcript.split(' ').filter((word, i, arr) => i === 0 || word !== arr[i - 1]);
    console.log('Voice search result:', transcript);
    if (this.silenceTimeoutId) {
      clearTimeout(this.silenceTimeoutId);
    }
    this.silenceTimeoutId = setTimeout(() => {
      console.log('Silence detected, performing search');
      if (this.detectedText) {
        this.searchQuery = this.detectedText;
        this.performSearch(this.detectedText);
      } else {
        console.warn('No detected text to search');
      }
      this.showVoiceSearchOverlay = false;
      this.showSearchOverlay = true;
      this.recognition.stop();
    }, 1000);
  };
  this.recognition.onerror = (event) => {
    if (event.error === 'aborted') {
      console.log('Voice recognition aborted');
      return;
    }
    this.detectedText = this.getLocalizedErrorMessage('voiceSearchError', event.error);
    this.detectedWords = [];
    console.log('Voice search error:', event.error);
    this.recognition.stop();
    this.recognition = null;
  };
  this.recognition.onend = () => {
    console.log('Voice recognition ended');
    if (this.recognition && this.showVoiceSearchOverlay && !this.detectedText.includes('error')) {
      console.log('Restarting voice recognition');
      this.recognition.start();
    }
  };
  this.recognition.start();
},

resetVoiceSearch() {
  console.log('Resetting voice search');
  if (this.recognition) {
    this.recognition.stop();
    this.recognition.onend = null;
    this.recognition = null;
  }
  this.startVoiceSearch();
  this.detectedText = '';
},

handleVoiceSearchTouchMove(event) {
  if (!this.showVoiceSearchOverlay || !this.isHoldingGlobal) return;
  if (event.changedTouches.length > 0) {
    const touchX = event.changedTouches[0].clientX;
    const deltaX = this.touchStartX - touchX;
    const timeElapsed = Date.now() - this.touchStartTime;
    console.log('Voice search touch move at x:', touchX, 'deltaX:', deltaX, 'time:', timeElapsed);
    if (Math.abs(deltaX) > this.SWIPE_HORIZONTAL_THRESHOLD && timeElapsed < this.SWIPE_TIME_THRESHOLD) {
      this.hasSwiped = true;
      const isArabic = this.currentLanguage === 'ar';
      const shouldRemoveWord = (isArabic && deltaX > 0) || (!isArabic && deltaX < 0);
      if (shouldRemoveWord) {
        console.log('Horizontal swipe detected - Removing last word');
        const words = this.detectedText.split(' ');
        if (words.length > 0) {
          words.pop();
          this.detectedText = words.join(' ');
        }
      }
      this.touchStartX = null;
    }
  }
},


applyHighlight(color) {
  if (!this.activeVerseUuidForHighlighting) return;
  const verseUuid = this.activeVerseUuidForHighlighting;
  if (!this.highlights[verseUuid]) this.highlights[verseUuid] = {};

  this.selectedWordIndices.forEach(index => {
    this.highlights[verseUuid][index] = color;
  });
  this.saveVerseHighlights(verseUuid);
  this.showHighlightMenu = false;
  this.selectedWordIndices = [];
},
removeHighlight() {
  if (!this.activeVerseUuidForHighlighting) return;
  const verseUuid = this.activeVerseUuidForHighlighting;
  if (this.highlights[verseUuid]) {
    this.selectedWordIndices.forEach(index => {
      delete this.highlights[verseUuid][index];
    });
    // If no highlights remain, reset to an empty object
    if (Object.keys(this.highlights[verseUuid]).length === 0) {
      delete this.highlights[verseUuid]; // More semantically correct: remove the key if empty
    }
  }
  this.saveVerseHighlights(verseUuid);
  this.showHighlightMenu = false;
  this.selectedWordIndices = [];
  this.activeVerseUuidForHighlighting = null;
  // this.$forceUpdate(); // Usually not needed if reactivity is working correctly
},
 async saveVerseHighlights(verseUuid) {
    if (!verseUuid) return;    const db = await this.$indexedDB;
    const tx = db.transaction('highlights', 'readwrite');
    if (!tx) return; // Guard against null transaction
    const store = tx.objectStore('highlights');
    await store.put({
  uuid: verseUuid,
      highlights: { ...(this.highlights[verseUuid] || {}) }, // Spread to unwrap proxy
      });
  },
async loadVerseHighlights(verseUuid) {
  if (!verseUuid) return;
  try {
    const db = await this.$indexedDB;
    if (!db) {
      // Ensure reactivity by setting an empty object if db is not available
      // Vue 3's reactivity should handle adding new keys to a reactive object.
      this.highlights[verseUuid] = {};
      return;
    }
    const tx = db.transaction('highlights', 'readonly');
    const store = tx.objectStore('highlights');
    const highlightData = await store.get(verseUuid);
    // Check if highlightData itself and its 'highlights' property exist
    if (highlightData && typeof highlightData.highlights === 'object') {
      this.highlights[verseUuid] = highlightData.highlights || {};
    } else {
      this.highlights[verseUuid] = {};
    }
  } catch (error) {
    console.error('Error loading highlights:', error);
    this.errorMessage = this.getLocalizedErrorMessage('loadHighlightError', error.message);
    // Ensure reactivity on error by setting an empty object
    this.highlights[verseUuid] = {};
  }
},
isWordHighlighted(index, verseUuidParam = null) {
    // Only show highlights in Hifdh or full-surah mode
  if (this.displayMode !== 'Hifdh' && this.displayMode !== 'full-surah') {
    return false;
  }
  const uuidToUse = verseUuidParam || this.activeVerseUuidForHighlighting || (this.currentVerseData ? this.currentVerseData.uuid : null);
  if (!uuidToUse) return false;
  return !!(this.highlights[uuidToUse] && this.highlights[uuidToUse][index]);
},
getHighlightClass(index, verseUuidParam = null) {
    // Only apply highlight classes in Hifdh or full-surah mode
  if (this.displayMode !== 'Hifdh' && this.displayMode !== 'full-surah') {
    return '';
  }
  const uuidToUse = verseUuidParam || this.activeVerseUuidForHighlighting || (this.currentVerseData ? this.currentVerseData.uuid : null);
  if (!uuidToUse) return '';
  const color = this.highlights[uuidToUse] && this.highlights[uuidToUse][index];
  return color ? `highlight-${color.replace('#', '')}` : '';
},
toggleAudio() {
  if (!this.currentVerseData) return;

  if (this.isAudioPlaying) {
    this.currentAudio.pause();
    this.isAudioPlaying = false;
  } else {
    if (this.currentAudio) this.currentAudio.pause();
    this.initAudioPlayback();
  }
},
readNextVerseAudio() {
  if (this.isAudioPlaying && this.displayMode !== 'Hifdh') {
    const nextVerse = this.getNextVerse(this.currentVerseData);
    if (nextVerse) {
      this.currentVerseData = nextVerse;
      this.initAudioPlayback();
    } else {
      this.isAudioPlaying = false;
    }
  }
},
async readCurrentVerse() {
  if (!this.currentVerseData || this.currentLanguage !== 'ar') return;
  this.stopAudioPlayback();
  try {
    const audioUrl = this.currentVerseData.audio || `https://api.alquran.cloud/v1/ayah/${this.currentVerseData.verseKey}/${AUDIO_EDITION}`;
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error('Audio fetch failed');
    const audioData = await response.json();
    const audioUrlToPlay = audioData.data.audio || audioUrl;
    this.initAudioPlayback(audioUrlToPlay);
    this.isAudioPlaying = true;
  } catch (error) {
    console.error('Audio playback error:', error);
    this.errorMessage = this.getLocalizedErrorMessage('audioError', error.message);
  }
},

  startAudioHold(event) {
  this.audioHoldTimeout = setTimeout(() => {
    this.isContinuousAudio = true;
    console.log('Continuous audio enabled');
  }, 2000); // 2 seconds hold
},

stopAudioHold() {
  clearTimeout(this.audioHoldTimeout);
},
  stopAudioPlayback() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isAudioPlaying = false;
  },

    focusSearchInput() {
     this.$nextTick(() => {
      this.$refs.searchInput.focus();
    });
},


    startWordHighlighting(text) {
      const words = text.split(' ');
      const durationPerWord = this.currentAudio.duration * 1000 / words.length;
      let currentIndex = 0;
      
      this.highlightInterval = setInterval(() => {
        if (currentIndex >= words.length) {
          clearInterval(this.highlightInterval);
          return;
        }
        
        this.currentWordIndex = currentIndex++;
      }, durationPerWord);
    },





animateWords() {
  if (this.isPausedByHold) return; // Don't animate if paused by hold

  // If paused by button, and word animation was already stopped/cleared by pauseVerseDisplayByPause,
  // don't restart it here. resumeVerseDisplayFromPause will handle it.
  if (this.isPausedByPause && !this.wordIntervalId) {
      // If isPausedByPause is true, but wordIntervalId IS set, it means animateWords
      // was called (e.g. by displayCurrentPart after a manual navigation while paused),
      // so we should let it run to display the words, but the partTimeoutId won't be set.
      // However, if wordIntervalId is NOT set, it means we are in a state where pause button
      // explicitly stopped it, so don't restart it here.
      // This check is subtle: if pause button is active, and we are here,
      // it means a new part was loaded. We *do* want to show its words.
      // The `pauseVerseDisplayByPause` should clear `wordIntervalId`.
      // `resumeVerseDisplayFromPause` should restart `animateWords`.
      // So, if `isPausedByPause` is true, `animateWords` should still run to *display* the words
      // but the `partTimeoutId` in `displayCurrentPart` won't be set.
      // The only time `animateWords` should NOT run if `isPausedByPause` is if `wordIntervalId` was explicitly cleared by `pauseVerseDisplayByPause`
      // and we are not in a "fresh display" scenario.
      // This logic is tricky. Let's simplify: animateWords will always try to run if called.
      // The pause/resume logic will manage clearing/restarting it.
  }

  // Clear any existing word animation interval before starting a new one
  if (this.wordIntervalId) {
    clearInterval(this.wordIntervalId);
    this.wordIntervalId = null;
  }

  let wordIndex = this.displayedWords.length; // Start from where we left off (usually 0 as displayedWords is cleared)

  this.wordIntervalId = setInterval(() => {
    if (this.isPausedByHold || (this.isPausedByPause && !this.wordIntervalId)) {
        // If hold is activated during animation, or pause button stops it.
        // This check inside setInterval is a secondary safety, primary is outside.
        clearInterval(this.wordIntervalId); // Stop this interval
        this.wordIntervalId = null;
        return;
    }

    if (wordIndex < this.currentPartWords.length) {
      this.displayedWords.push(this.currentPartWords[wordIndex]);
      wordIndex++;
    } else {
      clearInterval(this.wordIntervalId);
      this.wordIntervalId = null; // Animation for this part is complete
    }
  }, this.WORD_ANIMATION_INTERVAL);
}
,

clearAnimationTimers() {
  if (this.wordIntervalId) {
    clearInterval(this.wordIntervalId);
    this.wordIntervalId = null;
  }
  if (this.partTimeoutId) {
    clearTimeout(this.partTimeoutId);
    this.partTimeoutId = null;
  }
}
,

    toggleLanguage() {
      this.currentLanguage = this.currentLanguage === 'ar' ? 'en' : 'ar';
      // Update error messages if they are displayed
      if (this.errorMessage) {
          if (this.errorMessage.includes("No Quran verse data") || this.errorMessage.includes("لم يتم العثور على بيانات الآيات")) {
              this.errorMessage = this.currentLanguage === 'ar' ? "لم يتم العثور على بيانات الآيات بعد تحميل جميع الملفات." : "No Quran verse data found after loading all files.";
          } else if (this.errorMessage.includes("No Verses loaded") || this.errorMessage.includes("لم يتم تحميل أي آيات")) {
              this.errorMessage = this.currentLanguage === 'ar' ? "لم يتم تحميل أي آيات. يرجى التحقق من ملفات JSON." : "No Verses loaded. Please check the JSON files.";
          } else if (this.errorMessage.includes("No Verses available") || this.errorMessage.includes("لا توجد آيات متاحة")) {
              this.errorMessage = this.currentLanguage === 'ar' ? "لا توجد آيات متاحة للعرض." : "No Verses available to display.";
          }
      }

      if (this.currentVerseData) {
        const textToDisplay = this.currentLanguage === 'ar' ? this.currentVerseData.arabic_text : this.currentVerseData.english_text;
        if (!textToDisplay || textToDisplay.trim() === "") {
            this.selectVerse(); // Find a new Verse if current one lacks text in new lang
            return;
        }
       // Clear current display and animations before preparing the new language text
       this.clearAnimationTimers();
        this.displayedWords = [];

        // Wait for the DOM to update (reflecting the cleared words)
        this.$nextTick(() => {
          this.currentTextParts = this.segmentText(textToDisplay);
          this.currentPartIndex = 0;
          // Now display the current verse part with the new language.
          // displayCurrentPart will re-initialize displayedWords (though it's already empty here)
          // and start animating words for the new language.
          this.displayCurrentPart(); 
        });
      } else if (!this.isLoading) { 
        this.selectVerse();
      }
    },


getLocalizedErrorMessage(key, detail = '') {
  const messages = {
    emptySearch: {
        ar: 'يرجى إدخال نص للبحث',
        en: 'Please enter text to search',
        fr: 'Veuillez entrer du texte pour rechercher',
        bn: 'অনুসন্ধানের জন্য টেক্সট প্রবেশ করুন',
        tr: 'Arama yapmak için metin girin',
        ur: 'تلاش کے لیے متن درج کریں',
      },
      noResults: {
        ar: 'لم يتم العثور على نتائج',
        en: 'No results found',
        fr: 'Aucun résultat trouvé',
        bn: 'কোন ফলাফল পাওয়া যায়নি',
        tr: 'Sonuç bulunamadı',
        ur: 'کوئی نتائج نہیں ملے',
      },
    noDataAfterLoad: {
      ar: 'لم يتم العثور على بيانات الآيات بعد تحميل جميع الملفات.',
      en: 'No Quran verse data found after loading all files.',
      fr: 'Aucune donnée de verset du Coran trouvée après le chargement de tous les fichiers.',
      bn: 'সমস্ত ফাইল লোড করার পরে কোনো কুরআনের আয়াতের ডেটা পাওয়া যায়নি।',
      tr: 'Tüm dosyalar yüklendikten sonra Kuran ayeti verisi bulunamadı.',
      ur: 'تمام فائلوں کو لوڈ کرنے کے بعد قرآن کے آیات کا کوئی ڈیٹا نہیں ملا۔',
    },
    shareError: {
      ar: 'فشل في المشاركة أو النسخ إلى الحافظة',
      en: 'Failed to share or copy to clipboard',
      fr: 'Échec du partage ou de la copie dans le presse-papiers',
      bn: 'শেয়ার বা ক্লিপবোর্ডে কপি করতে ব্যর্থ হয়েছে',
      tr: 'Paylaşma veya panoya kopyalama başarısız oldu',
      ur: 'شئیر یا کلپ بورڈ میں کاپی کرنے میں ناکامی ہوئی',
    },
    audioError: {
      ar: `خطأ في تشغيل الصوت: ${detail}`,
      en: `Audio playback error: ${detail}`,
      fr: `Erreur de lecture audio : ${detail}`,
      bn: `অডিও প্লেব্যাক ত্রুটি: ${detail}`,
      tr: `Ses oynatma hatası: ${detail}`,
      ur: `آڈیو پلے بیک میں خرابی: ${detail}`,
    },
    voiceSearchNotSupported: {
      ar: 'البحث الصوتي غير مدعوم.',
      en: 'Voice search not supported.',
      fr: 'Recherche vocale non prise en charge.',
      bn: 'ভয়েস অনুসন্ধান সমর্থিত নয়।',
      tr: 'Sesli arama desteklenmiyor.',
      ur: 'صوتی تلاش تعاون یافتہ نہیں ہے۔',
    },
    voiceSearchError: {
      ar: `خطأ في البحث الصوتي: ${detail}`,
      en: `Voice search error: ${detail}`,
      fr: `Erreur de recherche vocale: ${detail}`,
      bn: `ভয়েস অনুসন্ধানে ত্রুটি: ${detail}`,
      tr: `Sesli arama hatası: ${detail}`,
      ur: `صوتی تلاش میں خرابی: ${detail}`,
    },
  };
  return messages[key][this.currentLanguage] || messages[key].en;
},
togglePause() {
  if (this.isPausedByPause) {
    this.resumeVerseDisplayFromPause();
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
  } else {
    this.pauseVerseDisplayByPause();
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }
},

pauseVerseDisplayByPause() {
  if (this.isLoading || this.errorMessage || !this.currentVerseData || this.isPausedByPause) return;
  this.isPausedByPause = true;

  // Clear the auto-advance timer for the current part, if it was set.
  // This timer would have been set *after* word animation completed.
  if (this.partTimeoutId) {
    const elapsedTime = Date.now() - this.partTimeoutStartTime;
    this.pausedPartRemainingTime = this.currentActivePartDuration - elapsedTime;
    if (this.pausedPartRemainingTime < 0) this.pausedPartRemainingTime = 0;
    clearTimeout(this.partTimeoutId);
    this.partTimeoutId = null;
  } else {
    // If no partTimeoutId, it means either:
    // 1. Word animation is still in progress (wordIntervalId is active).
    // 2. Word animation finished, but partTimeoutId was never set (e.g., already paused, or revision mode).
    // 3. Part was at the very beginning.
    // In these cases, when resumed, a full duration timer will be set.
    this.pausedPartRemainingTime = 0;
  }

  // DO NOT stop wordIntervalId here. Let current part's words finish animating.
  // The displayCurrentPart method will check isPausedByPause before setting a new partTimeoutId.
}

,

resumeVerseDisplayFromPause() {
  if (!this.isPausedByPause) return;
  this.isPausedByPause = false;

  // Resume word animation if it was paused and not yet complete for the current part
  // This scenario is removed because pause button no longer stops word animation.
  // if (!this.wordIntervalId && this.currentPartWords && this.currentPartWords.length > 0 && this.displayedWords.length < this.currentPartWords.length) {
  //   this.animateWords();
  // }

  // If there's no current verse data or parts, or word animation is still running, nothing to do here for timers.
  if (!this.currentVerseData || this.currentTextParts.length === 0 || this.wordIntervalId) {
    this.pausedPartRemainingTime = 0;
    return;
  }

  // At this point, isPausedByPause is now false, and wordIntervalId is null (current part's words are fully displayed).
  // We need to set the auto-advance timer for the *currently displayed part*.
  let timeoutDuration;
  let callback;

  // If currentPartIndex is out of bounds (e.g. end of verse was reached while paused)
  if (this.currentPartIndex >= this.currentTextParts.length) {
      callback = () => this.selectVerse(true);
      timeoutDuration = this.NEXT_VERSE_DELAY;
      this.currentActivePartDuration = this.NEXT_VERSE_DELAY;
  } else {
      // Current part is valid and fully displayed. Set its full duration timer.
      const partText = this.currentTextParts[this.currentPartIndex];
      const tempCurrentPartWords = partText ? partText.split(' ').filter(word => word.trim() !== '') : [];

      if (tempCurrentPartWords.length === 0) { // Current part is empty
          callback = () => this.displayNextPart();
          timeoutDuration = 100; // Short delay
          this.currentActivePartDuration = 100;
      } else {
          // Use the already calculated currentActivePartDuration for this part.
          // If it's 0 (e.g. if displayCurrentPart wasn't called properly before pause), recalculate.
          if (!this.currentActivePartDuration || this.currentActivePartDuration <= 0) {
              let currentPartFullDuration = this.PART_DISPLAY_DURATION;
              // (Recalculation logic from displayCurrentPart)
              if (tempCurrentPartWords.length < (this.WORDS_PER_PART * 0.8) && this.WORDS_PER_PART > 0 && !this.currentAudio) { // Added !this.currentAudio
                  const proportion = tempCurrentPartWords.length / this.WORDS_PER_PART;
                  currentPartFullDuration = Math.max(
                      proportion * this.PART_DISPLAY_DURATION,
                      (tempCurrentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000
                  );
              }
              const minDurationForAnimation = (tempCurrentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000;
              this.currentActivePartDuration = Math.max(currentPartFullDuration, minDurationForAnimation);
              if (this.currentAudio && this.currentAudio.duration) { // If audio, use its duration
                  this.currentActivePartDuration = this.currentAudio.duration * 1000;
              }
          }
          timeoutDuration = this.currentActivePartDuration;
          callback = () => this.displayNextPart();
      }
  }

  // Only set timer if not in revision mode
  if (timeoutDuration > 0 && callback && this.displayMode !== 'revision') {
    this.partTimeoutId = setTimeout(callback, timeoutDuration);
    this.partTimeoutStartTime = Date.now();
  }
  this.pausedPartRemainingTime = 0; // Always consume/reset
}

,


pauseVerseDisplayByHold() {
  if (this.isLoading || this.errorMessage || !this.currentVerseData || this.isPausedByHold) return;
  this.isPausedByHold = true;
  this.showBottomUI = false;
  this.showBottomInfo = false;

  // Pause word animation
  if (this.wordIntervalId) {
    clearInterval(this.wordIntervalId);
    this.wordIntervalId = null; // Mark as paused by hold
  }

  // Pause part auto-advance timer
  if (this.partTimeoutId) {
    const elapsedTime = Date.now() - this.partTimeoutStartTime;
    this.pausedPartRemainingTime = this.currentActivePartDuration - elapsedTime;
    if (this.pausedPartRemainingTime < 0) this.pausedPartRemainingTime = 0;
    clearTimeout(this.partTimeoutId);
    this.partTimeoutId = null;
  } else {
     // If no partTimeoutId, it might be because the part was fully displayed and waiting for NEXT_VERSE_DELAY,
    // or it was at the very beginning (word animation might be running).
    // If currentActivePartDuration and partTimeoutStartTime are set (meaning part timer context exists), calculate remaining.
    if (this.currentActivePartDuration > 0 && this.partTimeoutStartTime > 0) {
        const elapsedTime = Date.now() - this.partTimeoutStartTime;
        this.pausedPartRemainingTime = this.currentActivePartDuration - elapsedTime;
        if (this.pausedPartRemainingTime < 0) this.pausedPartRemainingTime = 0;
    } else {
        // If word animation is running, the "remaining time" for the part is effectively its full duration
        // minus whatever word animation has already shown. But for simplicity, if no part timer, assume 0.
        this.pausedPartRemainingTime = 0; 
    }
  }
}

,
resumeVerseDisplayFromHold() {
  if (!this.isPausedByHold) return; // Already resumed or was never paused by hold
  this.isPausedByHold = false; // CRITICAL: Set this immediately to prevent re-entry

  this.showBottomUI = true;
  this.showBottomInfo = true;

  // Ensure currentPartWords is valid
  if (this.currentVerseData && this.currentTextParts.length > 0 && this.currentPartIndex < this.currentTextParts.length) {
    const partText = this.currentTextParts[this.currentPartIndex];
    if (!this.currentPartWords || this.currentPartWords.length === 0) { 
        this.currentPartWords = partText ? partText.split(' ').filter(word => word.trim() !== '') : [];
    }
  } else {
    this.currentPartWords = [];
  }

  // 1. Resume word animation if it was paused mid-way
  if (!this.wordIntervalId && this.currentPartWords.length > 0 && this.displayedWords.length < this.currentPartWords.length) {
    this.animateWords(); // animateWords will set wordIntervalId
  }

  // 2. Resume part timer
  if (!this.currentVerseData || this.currentTextParts.length === 0) {
    this.pausedPartRemainingTime = 0;
    return;
  }

  let timeoutDuration;
  let callback;

  if (this.pausedPartRemainingTime > 0) { // Timer was paused mid-way
    timeoutDuration = this.pausedPartRemainingTime;
    // Check if the part was the last one of the verse AND words were fully displayed
    if (this.currentPartIndex >= this.currentTextParts.length - 1 && 
        (this.displayedWords.length >= this.currentPartWords.length || this.currentPartWords.length === 0) ) {
      callback = () => this.selectVerse(true);
    } else {
      callback = () => this.displayNextPart();
    }
  } else { // pausedPartRemainingTime is 0 (hold was at start/end of part, or very short)
    if (this.currentPartIndex >= this.currentTextParts.length) { // Beyond last part (e.g. end of verse)
      callback = () => this.selectVerse(true);
      timeoutDuration = this.NEXT_VERSE_DELAY;
      this.currentActivePartDuration = this.NEXT_VERSE_DELAY;
    } else {
      // Current part is valid.
      // If word animation is complete for this part, or part is empty
      if ( (this.currentPartWords.length > 0 && this.displayedWords.length >= this.currentPartWords.length) || this.currentPartWords.length === 0 ) {
        // Part was already complete, or is empty. Schedule next action with its original full duration.
        timeoutDuration = this.currentActivePartDuration > 0 ? this.currentActivePartDuration : this.PART_DISPLAY_DURATION;
        if (this.currentPartIndex < this.currentTextParts.length - 1) {
          callback = () => this.displayNextPart();
        } else { // Last part of the verse
          callback = () => this.selectVerse(true);
          // If it was the last part, the duration should be NEXT_VERSE_DELAY if currentActivePartDuration was for this part.
          // However, if currentActivePartDuration was already NEXT_VERSE_DELAY, use that.
          if (this.currentActivePartDuration !== this.NEXT_VERSE_DELAY) {
             // This implies the part itself had a duration, and now we are moving to next verse.
             // The callback is selectVerse, so the timeout should be for that transition.
             // This case is tricky. If part was complete, and it's the last, then NEXT_VERSE_DELAY.
             timeoutDuration = this.NEXT_VERSE_DELAY;
          }
        }
      } else if (this.currentPartWords.length > 0) {
        // Part not complete, word animation is running (or will be started by animateWords above).
        // Set the part timer for its full original duration.
        timeoutDuration = this.currentActivePartDuration > 0 ? this.currentActivePartDuration : this.PART_DISPLAY_DURATION;
        callback = () => this.displayNextPart();
      }
    }
  }

  // Also check !this.isPausedByPause because hold might be released while pause button is active
  if (timeoutDuration > 0 && callback && this.displayMode !== 'revision' && !this.isPausedByPause) {
    this.partTimeoutId = setTimeout(callback, timeoutDuration);
    this.partTimeoutStartTime = Date.now();
  }
  this.pausedPartRemainingTime = 0; // Always consume
}

,

displayCurrentPart() {
    if (this.isPausedByHold) return;
 if (this.displayMode === 'revision') {
    this.correctWords = [];
    this.mistakeWords = [];
    this.unreadVerses = [];
    this.displayedWords = [];
    this.currentPartWords = [];
  }
  this.clearAnimationTimers();

  // Always reset highlights for the new part
  this.displayedWords = [];
  this.currentPartWords = [];
  this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
    this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  this.displayedWords = [];
  this.currentPartWords = [];

  this.$nextTick(() => {
    if (!this.currentVerseData || this.currentTextParts.length === 0 || this.currentPartIndex >= this.currentTextParts.length) {
      if (this.displayMode !== 'revision' && !this.isPausedByPause) {
          this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  this.displayedWords = [];
  this.currentPartWords = [];
        this.partTimeoutId = setTimeout(() => this.selectVerse(true), this.NEXT_VERSE_DELAY);
          this.correctWords = [];
  this.mistakeWords = [];
  this.unreadVerses = [];
  this.displayedWords = [];
  this.currentPartWords = [];
      }
      return;
    }

    const partText = this.currentTextParts[this.currentPartIndex];
    if (!partText || partText.trim() === '') {
      if (this.displayMode !== 'revision' && !this.isPausedByPause) {
        this.displayNextPart();
      }
      return;
    }

    this.currentPartWords = partText.split(' ').filter(word => word.trim() !== '');

    // Set all as unread for the new part
    this.unreadVerses = Array.from({ length: this.currentPartWords.length }, (_, i) => i);

    this.animateWords();

    // Calculate duration for this part
    let currentPartDuration = this.currentAudio && this.currentAudio.duration 
      ? this.currentAudio.duration * 1000 
      : this.PART_DISPLAY_DURATION;

    if (this.currentPartWords.length < (this.WORDS_PER_PART * 0.8) && this.WORDS_PER_PART > 0 && !this.currentAudio) {
      const proportion = this.currentPartWords.length / this.WORDS_PER_PART;
      currentPartDuration = Math.max(
        proportion * this.PART_DISPLAY_DURATION,
        (this.currentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000
      );
    }
    const minDurationForAnimation = (this.currentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000;
    currentPartDuration = Math.max(currentPartDuration, minDurationForAnimation);

    this.currentActivePartDuration = currentPartDuration;
    this.partTimeoutStartTime = Date.now();

    // Schedule next part/verse *only if not paused by the pause button*
    if (this.displayMode !== 'revision' && !this.isPausedByPause) {
      this.partTimeoutId = setTimeout(() => this.displayNextPart(), currentPartDuration);
    }
      this.mistakeWords = [];
  this.unreadVerses = [];
  this.displayedWords = [];
  });
},

handleAppTouchStart(event) {
  // Skip if touching inputs, buttons, or overlays
 // Prevent hold if overlays are open
  if (
    this.showLoopsMenu ||
    this.showSearchOverlay ||
    this.showVoiceSearchOverlay ||
    event.target.closest('input') ||
    event.target.closest('button') ||
    event.target.closest('.control-buttons-container') ||
    event.target.closest('.search-overlay') ||
    event.target.closest('.voice-search-overlay')
  ) {
    return;
  }
  if (this.displayMode !== 'full-surah') {
    event.preventDefault();
  }
  this.wasScrolling = false;
  this.isHoldingGlobal = true;
  this.hasSwiped = false;
  clearTimeout(this.holdStartTimeoutId);
  if (event.changedTouches.length > 0) {
    this.touchStartX = event.changedTouches[0].clientX;
    this.touchStartY = event.changedTouches[0].clientY;
    this.touchStartTime = Date.now();
  }
  if (!this.isPausedByHold) {
    this.holdStartTimeoutId = setTimeout(() => {
      if (
        this.isHoldingGlobal &&
        !this.hasSwiped &&
        !this.showLoopsMenu &&
        !this.showSearchOverlay &&
        !this.showVoiceSearchOverlay
      ) {
        this.pauseVerseDisplayByHold();
      }
    }, this.HOLD_THRESHOLD);
  }
},

handleAppMouseDown(event) {
  if (
    this.showLoopsMenu ||
    this.showSearchOverlay ||
    this.showVoiceSearchOverlay ||
    event.target.closest('input') ||
    event.target.closest('button') ||
    event.target.closest('.control-buttons-container') ||
    event.target.closest('.search-overlay') ||
    event.target.closest('.voice-search-overlay')
  ) {
    return;
  }
  if (this.displayMode !== 'full-surah') {
    event.preventDefault();
  }
      this.showLanguageMenu = false;

  this.isHoldingGlobal = true;
  clearTimeout(this.holdStartTimeoutId);
  if (!this.isPausedByHold) { // Only set up a new hold if not already in a hold-paused state
    this.holdStartTimeoutId = setTimeout(() => { // Timer to initiate the hold
      if (
        this.isHoldingGlobal && // Still holding down
        !this.hasSwiped &&
        !this.showLoopsMenu &&
        !this.showSearchOverlay && // Check overlays again
        !this.showVoiceSearchOverlay
      ) {
        this.pauseVerseDisplayByHold();
      }
    }, this.HOLD_THRESHOLD);
  }
}
,handleHifdhScreenClick(e) {
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    if (x < window.innerWidth / 2) {
      this.selectVerse(false); // Left: previous
    } else {
      this.selectVerse(true);  // Right: next
    }
  },
handleAppMouseUp(event) {
  // 1. Handle specific overlay/UI element interactions that might consume the event
  // or where navigation is not intended.
  if (this.showNotesOverlay && this.$refs.notesTextarea && this.$refs.notesTextarea.contains(event.target)) {
    // Allow interaction with textarea within notes overlay, don't proceed to navigation.
  } else if (this.showNotesOverlay || this.showLoopsMenu || this.showSearchOverlay || this.showVoiceSearchOverlay || this.showSurahVerseMenu || this.showHighlightMenu || this.showHighlightContextMenu) {
    clearTimeout(this.holdStartTimeoutId);
    this.isHoldingGlobal = false; // Reset hold state if an overlay was interacted with
    return;
  }

  const isInteractiveElementClick =
    event.target.closest('button') ||
    event.target.closest('.control-buttons-container') ||
    event.target.closest('.notes-overlay .notes-container button') || // More specific for buttons inside notes
    event.target.closest('.loops-overlay .loops-container') || // Interaction with loop menu content
    event.target.closest('.highlight-menu') ||
    event.target.closest('.highlight-context-menu') ||
    event.target.closest('.search-overlay .search-container') || // Interaction with search content
    event.target.closest('.voice-search-overlay .voice-search-container') || // Interaction with voice search content
    event.target.closest('.surah-verse-overlay .surah-verse-container'); // Interaction with surah/verse select content

  // 2. Clear the timer that *starts* the hold, as mouse is now up.
  clearTimeout(this.holdStartTimeoutId);

  // 3. If isPausedByHold is true, this mouseup is the release of the hold.
  if (this.isPausedByHold) { // Check this first. hasSwiped and isInteractiveElementClick are less relevant if already paused by hold.
    this.resumeVerseDisplayFromHold();
    // isPausedByHold is reset inside resumeVerseDisplayFromHold.
    this.isHoldingGlobal = false;
    return;
  }

  // 4. Else (normal click, not a release from an active hold-pause state)
  if (isInteractiveElementClick) {
    this.isHoldingGlobal = false; // Click was on a UI element, not for navigation
    return;
  }

  if (this.displayMode === 'full-surah') {
    this.isHoldingGlobal = false; // No click navigation in full-surah
    return;
  }

  // At this point, it's a click on the main content area for navigation
  // (and not a release from hold-to-pause, and not on an interactive UI element)
  // isHoldingGlobal means mousedown happened on app container and wasn't a hold that got paused.
  if (this.isHoldingGlobal && !this.hasSwiped) { 
    if (this.displayMode === 'verse' || this.displayMode === 'tafseer') {
      const clickX = event.clientX;
      const screenWidth = window.innerWidth;

      if (clickX > screenWidth / 2) { 
        if (this.currentPartIndex < this.currentTextParts.length - 1) {
          this.displayNextPart();
        } else {
          this.selectVerse(true);
        }
      } else {
        if (this.currentPartIndex > 0) {
          this.displayPreviousPart();
        } else {
          this.displayPreviousVerse();
        }
      }
    }
  }

  // 5. Reset interaction state
  this.isHoldingGlobal = false;
  console.log('Mouse up at x:', event.clientX);
}
,
// Save last viewed verse and surah to localStorage
saveLastViewed() {
  if (this.currentVerseData) {
    localStorage.setItem('lastVerseUuid', this.currentVerseData.uuid);
    localStorage.setItem('lastSurahId', this.currentVerseData.surah);
    localStorage.setItem('lastVerseNumber', this.currentVerseData.verse);
    localStorage.setItem('lastDisplayMode', this.displayMode);
  }
  if (this.currentSurahData) {
    localStorage.setItem('lastSurahId', this.currentSurahData.id);
  }
},
handleAppTouchEnd(event) {
  // 1. Handle specific overlay/UI element interactions
  if (this.showNotesOverlay && this.$refs.notesTextarea && this.$refs.notesTextarea.contains(event.target)) {
    // Allow interaction
  } else if (this.showNotesOverlay || this.showLoopsMenu || this.showSearchOverlay || this.showVoiceSearchOverlay || this.showSurahVerseMenu || this.showHighlightMenu || this.showHighlightContextMenu) {
    clearTimeout(this.holdStartTimeoutId);
    this.isHoldingGlobal = false;
    this.touchStartX = null; this.touchStartY = null; this.touchStartTime = null; this.hasSwiped = false;
    return;
  }

  const isInteractiveElementTouch =
    event.target.closest('button') ||
    event.target.closest('.control-buttons-container') ||
    event.target.closest('.notes-overlay .notes-container button') ||
    event.target.closest('.loops-overlay .loops-container') ||
    event.target.closest('.highlight-menu') ||
    event.target.closest('.highlight-context-menu') ||
    event.target.closest('.search-overlay .search-container') ||
    event.target.closest('.voice-search-overlay .voice-search-container') ||
    event.target.closest('.surah-verse-overlay .surah-verse-container');

  // 2. Clear the timer that *starts* the hold, as touch has ended.
  clearTimeout(this.holdStartTimeoutId);

  // 3. If isPausedByHold is true, this touchend is the release of the hold.
  if (this.isPausedByHold) { // Check this first.
    this.resumeVerseDisplayFromHold();
    this.isHoldingGlobal = false;
    this.touchStartX = null;
    this.touchStartY = null;
    this.touchStartTime = null;
    this.hasSwiped = false;
    return;
  }

  // 4. Else (normal tap, not a release from an active hold-pause state)
  if (isInteractiveElementTouch) {
    this.isHoldingGlobal = false;
    this.touchStartX = null; this.touchStartY = null; this.touchStartTime = null; this.hasSwiped = false;
    return;
  }

  if (this.displayMode === 'full-surah') {
    if (this.wasScrolling) {
      this.wasScrolling = false;
      this.isHoldingGlobal = false;
      this.touchStartX = null; this.touchStartY = null; this.touchStartTime = null; this.hasSwiped = false;
      return;
    }
    this.isHoldingGlobal = false;
    this.touchStartX = null; this.touchStartY = null; this.touchStartTime = null; this.hasSwiped = false;
    return;
  }
  // isHoldingGlobal means touchstart happened on app container and wasn't a hold that got paused.
  if (this.isHoldingGlobal && this.touchStartTime !== null && !this.hasSwiped) { 
    if (event.changedTouches.length > 0) {
      const touchX = event.changedTouches[0].clientX;
      const screenWidth = window.innerWidth;
      const isArabic = this.currentLanguage === 'ar';
      const currentTime = Date.now();
      const isDoubleTap = currentTime - this.lastTapTime < this.DOUBLE_TAP_THRESHOLD;
      
      // Determine if action is "next" or "previous" based on tap side and language
      let actionIsNext = false;
      let actionIsPrevious = false;
        if (touchX >= screenWidth / 2) actionIsNext = true; // Left side for next
        else actionIsPrevious = true; // Right side for previous

      if (this.displayMode === 'tafseer') {
        if (isDoubleTap) {
          if (actionIsNext) {
            this.selectVerse(true); this.loadTafseer();
          } else if (actionIsPrevious) {
            this.displayPreviousVerse(); this.loadTafseer();
          }
        } else {
          if (actionIsNext) this.displayNextPart();
          else if (actionIsPrevious) this.displayPreviousPart();
        }
      } else if (this.displayMode === 'Hifdh') {
        if (!this.isSelectingWords) {
          if (actionIsNext) this.selectNextHifdhVerse();
          else if (actionIsPrevious) this.displayPreviousVerse();
        }
      } else if (this.displayMode === 'verse') {
        if (actionIsNext) {
          if (this.currentPartIndex < this.currentTextParts.length - 1) this.displayNextPart();
          else this.selectVerse(true);
        } else if (actionIsPrevious) {
          if (this.currentPartIndex > 0) this.displayPreviousPart();
          else this.displayPreviousVerse();
        }
      }
      this.lastTapTime = currentTime;
    }
  }

  // 5. Reset interaction state
  this.isHoldingGlobal = false;
  this.touchStartX = null;
  this.touchStartY = null;
  this.touchStartTime = null;
  this.hasSwiped = false;
}
,


async enterHifdhMode() { // Make async
  this.isPausedByPause = false;
  this.isPausedByHold = false;
  this.currentLoopIteration = 0; // Reset loop iteration
  this.updateHifdhVerseQueue();

  if (this.HifdhVerseQueue.length > 0) {
    this.currentVerseData = { ...this.HifdhVerseQueue[0] };
    this.HifdhCurrentVerseIndex = 0;
  } else if (!this.currentVerseData && this.allVerses.length > 0) {
    // Fallback if queue is empty and no current verse (e.g. first time entering Hifdh)
    this.currentVerseData = { ...this.allVerses[0] };
    this.updateHifdhVerseQueue(); // Try to build queue again
    if (this.HifdhVerseQueue.length > 0) {
        this.currentVerseData = { ...this.HifdhVerseQueue[0] };
        this.HifdhCurrentVerseIndex = 0;
    } else {
        this.displayMode = 'verse';
        this.errorMessage = "Could not start Hifdh mode.";
        return;
    }
  } else if (!this.currentVerseData) {
      this.displayMode = 'verse';
      this.errorMessage = "No verses loaded to start Hifdh mode.";
      return;
  }

  if (this.currentVerseData && this.currentVerseData.uuid) {
    await this.loadVerseNote(this.currentVerseData.uuid);
    await this.loadVerseCompletion(this.currentVerseData.uuid);
    await this.loadVerseHighlights(this.currentVerseData.uuid);
  }

  this.currentTextParts = this.segmentText(this.currentVerseData.text);
  this.currentPartIndex = 0;
  this.displayedWords = [];
  this.clearAnimationTimers();
  this.displayCurrentPart();
},

updateHifdhVerseQueue() {
  if (!this.currentVerseData) return;
  const currentSurah = this.currentVerseData.surah;
  const currentVerseNum = this.currentVerseData.verse;
  const versesInRange = [];
  let verseCount = 0;
  let surah = currentSurah;
  let verseNum = currentVerseNum;

  while (verseCount < this.HifdhLoopCount && surah <= 114) {
    const verse = this.allVerses.find(v => v.surah === surah && v.verse === verseNum);
    if (verse) {
      versesInRange.push(verse);
      verseCount++;
    }
    verseNum++;
    const surahInfo = SURAH_DATA.find(s => s.id === surah);
    if (verseNum > surahInfo.verses) {
      surah++;
      verseNum = 1;
    }
  }

  this.HifdhVerseQueue = versesInRange;
  this.HifdhCurrentVerseIndex = 0;
},
processArabicText(text) {
  // Remove non-Arabic chars and all Quranic symbols (Waqf, Sajda, Rub el Hizb, etc.)
  return (text || '')
    .replace(/[\u0615\u06D6-\u06ED\u06DD\u06DE\u06E9]/g, '') // Remove all Quranic marks
    .replace(/[^\u0600-\u06FF\s]/g, '') // Remove non-Arabic chars
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
},
closeFassarli() {
  this.fassarliMode = false;
  if (this.previousDisplayMode) {
    this.displayMode = this.previousDisplayMode;
    this.previousDisplayMode = null;
    if (this.displayMode === 'full-surah') {
      this.$nextTick(() => {
        if (this.$refs.versesContainer) {
          this.$refs.versesContainer.scrollTop = this.fullSurahScrollPosition;
        }
      });
    }
  } else {
    this.displayMode = 'verse';
  }
},
exit() {
  this.displayMode = "verse";
this.fassarliMode = false;
this.highlightMode = false;
},
  toggleNotesOverlay() {
    this.showNotesOverlay = !this.showNotesOverlay;
    if (this.showNotesOverlay) {
      // Determine which verse's note to load
      let verseUuidForNote = this.activeVerseUuidForNotes; // Prioritize if set by openVerseNote
      if (!verseUuidForNote && this.currentVerseData && this.displayMode === 'Hifdh') { // Fallback for Hifdh mode button
        verseUuidForNote = this.currentVerseData.uuid;
      }
      
      if (verseUuidForNote) {
        this.loadVerseNote(verseUuidForNote).then(() => {
          this.$nextTick(() => {
            if (this.$refs.notesTextarea) {
              this.$refs.notesTextarea.focus();
            }
          });
        });
      } else {
        // If no specific verse context, clear the note and focus
        this.currentNote = '';
        this.$nextTick(() => {
          if (this.$refs.notesTextarea) {
            this.$refs.notesTextarea.focus();
          }
        });
      }
      // If no verseUuidForNote, currentNote remains empty, and textarea is focused.
    }
  },
openVerseNote(verse) {
    if (!verse || !verse.uuid) return;
    // If a highlight selection is active (though isSelectingWords is false by the time click fires),
    // or if the highlight menu is shown, it implies the user was interacting with highlighting.
    // The @click.stop on individual words is the primary fix for this.

    this.activeVerseUuidForNotes = verse.uuid;
    this.loadVerseNote(verse.uuid).then(() => {
      this.showNotesOverlay = true;
      // Ensure textarea is focused after overlay is shown and DOM is updated
      this.$nextTick(() => {
        if (this.$refs.notesTextarea) {
          this.$refs.notesTextarea.focus();
        }
      });
    }).catch(error => {
      console.error("Error loading note for openVerseNote:", error);
      this.errorMessage = this.getLocalizedErrorMessage('loadNoteError', error.message);
    });
  },
  async loadVerseNote(verseUuid) {
    if (!verseUuid) { this.currentNote = ''; return; }
    this.activeVerseUuidForNotes = verseUuid; // Keep track for saving
 
    const db = await this.$indexedDB;
    const tx = db.transaction('notes', 'readonly');
    const store = tx.objectStore('notes');
    const note = await store.get(verseUuid);
    this.currentNote = note ? note.text : '';
  },
  async saveVerseNote() {
    if (!this.activeVerseUuidForNotes) return; // Use the active UUID for notes
    const db = await this.$indexedDB;
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    await store.put({
      uuid: this.activeVerseUuidForNotes,
      text: this.currentNote,
    });
  },
async closeNotesOverlay() {
  try {
    await this.saveVerseNote();
  } catch (error) {
    console.error('Error saving note:', error);
    this.errorMessage = this.getLocalizedErrorMessage('saveNoteError', error.message);
  }
  this.showNotesOverlay = false;
},
getCurrentLoopVerses() {
  const verses = [];
  let current = this.currentLoopStartVerse;
  while (current && (current.surah !== this.currentLoopEndVerse.surah || current.verse <= this.currentLoopEndVerse.verse)) {
    verses.push(current);
    current = this.getNextVerse(current);
  }
  return verses;
},
getLoopEndVerse(startVerse) {
  let current = { ...startVerse };
  for (let i = 0; i < this.HifdhLoopRange - 1 && current; i++) {
    current = this.getNextVerse(current);
  }
  return current || startVerse;
},
toggleComplete() {
  return current || startVerse; 
  return this.HifdhVerseQueue; // The current HifdhVerseQueue is the loop
},
async toggleComplete() {
  if (!this.currentVerseData || this.displayMode !== 'Hifdh') return;
  const verseUuid = this.currentVerseData.uuid;
  const currentCompletionStatus = this.completions[verseUuid] || false;
  const newCompletionStatus = !currentCompletionStatus;

  this.completions[verseUuid] = newCompletionStatus;
  this.isVerseCompleted = newCompletionStatus;
  await this.saveVerseCompletion();

  // Check if all verses in current queue are complete
  const allInQueueComplete = this.HifdhVerseQueue.every(verse => 
    this.completions[verse.uuid] === true
  );

  if (allInQueueComplete) {
    console.log("All verses complete. Advancing to next block.");
    const lastVerse = this.HifdhVerseQueue[this.HifdhVerseQueue.length - 1];
    const nextVerse = this.getNextVerse(lastVerse);
    
    if (nextVerse) {
      this.currentVerseData = { ...nextVerse };
      this.updateHifdhVerseQueue();
      this.HifdhCurrentVerseIndex = 0;
      this.currentLoopIteration = 0;
      
      await this.loadVerseNote(this.currentVerseData.uuid);
      await this.loadVerseCompletion(this.currentVerseData.uuid);
      await this.loadVerseHighlights(this.currentVerseData.uuid);
      
      this.currentTextParts = this.segmentText(this.currentVerseData.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.clearAnimationTimers();
      this.displayCurrentPart();
    } else {
      this.HifdhVerseQueue = [];
      this.displayMode = 'verse';
      this.errorMessage = this.getLocalizedErrorMessage('HifdhComplete');
    }
  }
},
  startCompleteHold(event) {
        if (this.displayMode !== 'Hifdh') return;

    this.completeHoldTimeout = setTimeout(() => {
      if (this.displayMode === 'Hifdh') {
        this.completeCurrentLoop();
      }
    }, 1000);
  },
  stopCompleteHold() {
    clearTimeout(this.completeHoldTimeout);
  },
async saveVerseCompletion() {
  if (!this.currentVerseData) return;
  try {
    const db = await this.$indexedDB;
    if (!db) return;
    const tx = db.transaction('completions', 'readwrite');
    const store = tx.objectStore('completions');
    await store.put({
      uuid: this.currentVerseData.uuid,
      completed: this.completions[this.currentVerseData.uuid] || false,
    });
  } catch (error) {
    console.error('Error saving completion:', error);
    this.errorMessage = this.getLocalizedErrorMessage('saveCompletionError', error.message);
  }
},

// Update loadVerseCompletion method

async loadVerseCompletion(verseUuid) {
  if (!verseUuid) return;
  try {
    const db = await this.$indexedDB;
    if (!db) return;
    const tx = db.transaction('completions', 'readonly');
    const store = tx.objectStore('completions');
    const completion = await store.get(verseUuid);
    this.completions[verseUuid] = completion ? completion.completed : false;
    if (this.currentVerseData && this.currentVerseData.uuid === verseUuid) {
      this.isVerseCompleted = this.completions[verseUuid] || false;
    }
  } catch (error) {
    console.error('Error loading completion:', error);
    this.errorMessage = this.getLocalizedErrorMessage('loadCompletionError', error.message);
  }
},
async completeCurrentLoop() { // Make async
  if (!this.currentVerseData || this.HifdhVerseQueue.length === 0) return;
  this.currentLoopIteration++;
  if (true) {
    // Move to the next verse after the current queue
    const lastVerse = this.HifdhVerseQueue[this.HifdhVerseQueue.length - 1];
    const nextVerse = this.getNextVerse(lastVerse);
    if (nextVerse) {
      this.currentVerseData = { ...nextVerse };
      this.updateHifdhVerseQueue(); // Rebuild queue starting from next verse
      this.currentLoopIteration = 0;
   this.HifdhCurrentVerseIndex = 0; // Reset index for the new queue

      // Load data for the new current verse
      if (this.currentVerseData && this.currentVerseData.uuid) {
        await this.loadVerseNote(this.currentVerseData.uuid);
        await this.loadVerseCompletion(this.currentVerseData.uuid);
        await this.loadVerseHighlights(this.currentVerseData.uuid);
      }
      // Now display the new verse
      this.currentTextParts = this.segmentText(this.currentVerseData.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.clearAnimationTimers();
      this.displayCurrentPart();
     } else {
      // End of Quran, reset to start or show completion
      this.HifdhVerseQueue = [];
      this.displayMode = 'verse';
      this.errorMessage = this.getLocalizedErrorMessage('HifdhComplete');
    }
  } else {
    // Repetitions not yet complete, just move to the next verse in the current queue.
    await this.selectNextHifdhVerse();
  }
  // Removed saveVerseCompletion() from here as completion status is managed by toggleComplete.
  // completeCurrentLoop is about repetition tracking and advancing the queue based on that.

},

getNextVerse(current) {
      if (!this.allVerses || this.allVerses.length === 0) return null;

    if (!current) return null;
    const surahInfo = this.SURAH_DATA.find(s => s.id === current.surah);
    if (current.verse < surahInfo.verses) {
      return this.allVerses.find(v => v.surah === current.surah && v.verse === current.verse + 1);
    } else if (current.surah < 114) {
      return this.allVerses.find(v => v.surah === current.surah + 1 && v.verse === 1);
    }
    return null;
  },
  toggleLoopsMenu() {
    this.showLoopsMenu = !this.showLoopsMenu;
  },
  startLoopSwipe(event) {
    this.loopSwipeStartY = event.changedTouches[0].clientY;
  },
handleLoopSwipe(event) {
  const currentY = event.changedTouches[0].clientY;
  const deltaY = this.loopSwipeStartY - currentY;
  if (Math.abs(deltaY) > 20) {
    const increment = deltaY > 0 ? 1 : -1;
    this.HifdhLoopCount = Math.max(1, Math.min(100, this.HifdhLoopCount + increment));
    this.loopSwipeStartY = currentY;
    // Vibrate on change
    if (navigator.vibrate) navigator.vibrate(50);
    // Immediately update the queue and reset index
    this.updateHifdhVerseQueue();
    this.HifdhCurrentVerseIndex = 0;
    if (this.HifdhVerseQueue.length > 0) {
      this.currentVerseData = { ...this.HifdhVerseQueue[0] };
      this.currentTextParts = this.segmentText(this.currentVerseData.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.clearAnimationTimers();
      this.displayCurrentPart();
    }
  }
},
  endLoopSwipe() {
    this.loopSwipeStartY = null;
  },
async selectNextHifdhVerse() { // Make async
  if (this.HifdhVerseQueue.length === 0) return;
  this.HifdhCurrentVerseIndex = (this.HifdhCurrentVerseIndex + 1) % this.HifdhVerseQueue.length;
  this.currentVerseData = { ...this.HifdhVerseQueue[this.HifdhCurrentVerseIndex] };

  if (this.currentVerseData && this.currentVerseData.uuid) { // Load data for new verse
      await this.loadVerseNote(this.currentVerseData.uuid);
      await this.loadVerseCompletion(this.currentVerseData.uuid);
      await this.loadVerseHighlights(this.currentVerseData.uuid);
  }


  this.currentTextParts = this.segmentText(this.currentVerseData.text);
  this.currentPartIndex = 0;
  this.displayedWords = [];
    this.clearAnimationTimers(); // Clear timers for the old verse

    if (this.currentVerseData && this.currentVerseData.text) {
        this.displayCurrentPart(); // Display new verse
    }
    if (this.currentVerseData && this.currentVerseData.uuid) { // Load data for new verse
        this.loadVerseNote(this.currentVerseData.uuid);
        this.loadVerseCompletion(this.currentVerseData.uuid);
        this.loadVerseHighlights(this.currentVerseData.uuid);
    }
 this.clearAnimationTimers(); // Clear timers for the old verse

  if (this.currentVerseData && this.currentVerseData.text) {
      this.displayCurrentPart(); // Display new verse
  }
},

async displayPreviousVerse() {
  if (this.displayMode === 'Hifdh') {
    // ... your Hifdh logic (unchanged) ...
    if (this.HifdhVerseQueue.length === 0) return;
    this.HifdhCurrentVerseIndex = (this.HifdhCurrentVerseIndex - 1 + this.HifdhVerseQueue.length) % this.HifdhVerseQueue.length;
    this.currentVerseData = { ...this.HifdhVerseQueue[this.HifdhCurrentVerseIndex] };
    if (this.currentVerseData && this.currentVerseData.uuid) {
      await this.loadVerseNote(this.currentVerseData.uuid);
      await this.loadVerseCompletion(this.currentVerseData.uuid);
      await this.loadVerseHighlights(this.currentVerseData.uuid);
    }
this.currentTextParts = this.segmentText(this.currentVerseData.text);
this.currentPartIndex = this.currentTextParts.length > 0 ? this.currentTextParts.length - 1 : 0;
this.displayedWords = [];
this.clearAnimationTimers();
this.displayCurrentPart();
  } else {
    // NON-Hifdh MODE (e.g., Verse, Tafseer)
    if (!this.currentVerseData || !this.allVerses || this.allVerses.length === 0) return;
    let prevVerse = null;
    if (this.currentVerseData.verse > 1) {
      // Previous verse in the same surah
      prevVerse = this.allVerses.find(
        v => v.surah === this.currentVerseData.surah && v.verse === this.currentVerseData.verse - 1
      );
    } else if (this.currentVerseData.surah > 1) {
      // Go to last verse of previous surah
      const prevSurahInfo = SURAH_DATA.find(s => s.id === this.currentVerseData.surah - 1);
      if (prevSurahInfo) {
        prevVerse = this.allVerses.find(
          v => v.surah === prevSurahInfo.id && v.verse === prevSurahInfo.verses
        );
      }
    }
    if (prevVerse) {
      this.currentVerseData = { ...prevVerse };
      if (this.currentVerseData && this.currentVerseData.uuid) {
        await this.loadVerseNote(this.currentVerseData.uuid);
        await this.loadVerseCompletion(this.currentVerseData.uuid);
        await this.loadVerseHighlights(this.currentVerseData.uuid);
      }
this.currentTextParts = this.segmentText(this.currentVerseData.text);
this.currentPartIndex = this.currentTextParts.length > 0 ? this.currentTextParts.length - 1 : 0;
this.displayedWords = [];
this.clearAnimationTimers();
this.displayCurrentPart();
    }
  }
},



handleAppTouchMove(event) {
  if (this.showLoopsMenu || this.showSearchOverlay || this.showVoiceSearchOverlay) {
  this.isHoldingGlobal = false;
  this.touchStartX = null;
  this.touchStartY = null;
  this.touchStartTime = null;
  this.hasSwiped = false;
  return;
}
 if (this.displayMode === 'full-surah' && !this.highlightMode) {
    const container = this.$refs.versesContainer;
    if (!container) return;
    if (event.changedTouches.length > 0) {
      const touchX = event.changedTouches[0].clientX;
      const deltaX = touchX - this.touchStartX;
      const absDeltaX = Math.abs(deltaX);
      const deltaY = event.changedTouches[0].clientY - this.touchStartY;
      // Only trigger if horizontal swipe is dominant and > 60px
      if (absDeltaX > 60 && absDeltaX > Math.abs(deltaY)) {
        if (this.hasSwiped) return;
        this.hasSwiped = true;
        if (deltaX > 0) {
          // Swipe right: Next Surah
          const currentIndex = this.SURAH_DATA.findIndex(s => s.id === this.currentSurahData.id);
          if (currentIndex < this.SURAH_DATA.length - 1) {
            const nextSurahId = this.SURAH_DATA[currentIndex + 1].id;
            this.loadSurahVerses(nextSurahId);
            this.selectedSurah = nextSurahId;
            this.$nextTick(() => this.scrollToTop());
          }
        } else {
          // Swipe left: Previous Surah
          const currentIndex = this.SURAH_DATA.findIndex(s => s.id === this.currentSurahData.id);
          if (currentIndex > 0) {
            const prevSurahId = this.SURAH_DATA[currentIndex - 1].id;
            this.loadSurahVerses(prevSurahId);
            this.selectedSurah = prevSurahId;
            this.$nextTick(() => this.scrollToTop());
          }
        }
        return;
      }
    }
    // Vertical swipe for search overlays
    if (container && container.scrollTop === 0 && event.changedTouches.length > 0) {
      const touchY = event.changedTouches[0].clientY;
      const deltaY = touchY - this.touchStartY;
      if (deltaY > this.SWIPE_THRESHOLD) {
        this.showSearchOverlay = true;
        this.focusSearchInput();
        this.hasSwiped = true;
        return;
      }
    }
    this.wasScrolling = true;
    return;
  }
  if (!this.isHoldingGlobal || this.hasSwiped) return;
  if (this.showVoiceSearchOverlay) {
    this.handleVoiceSearchTouchMove(event);
    return;
  }
  if (event.changedTouches.length > 0) {
    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;
    const deltaY = this.touchStartY - touchY;
    const deltaX = Math.abs(this.touchStartX - touchX);
    const timeElapsed = Date.now() - this.touchStartTime;
    console.log('Touch move at x:', touchX, 'y:', touchY, 'deltaY:', deltaY, 'deltaX:', deltaX, 'time:', timeElapsed);
    if (Math.abs(deltaY) > this.SWIPE_THRESHOLD && deltaX < this.SWIPE_HORIZONTAL_THRESHOLD && timeElapsed < this.SWIPE_TIME_THRESHOLD) {
      this.hasSwiped = true;
      clearTimeout(this.holdStartTimeoutId);
      this.isHoldingGlobal = false;
      if (deltaY > 0) {
        console.log('Swipe up detected - Opening voice search');
        this.showSearchOverlay = false;
        this.showVoiceSearchOverlay = true;
        this.resetVoiceSearch();
      } else {
        console.log('Swipe down detected - Opening search');
        this.showVoiceSearchOverlay = false;
        this.showSearchOverlay = true;
        this.focusSearchInput();
      }
      this.touchStartX = null;
      this.touchStartY = null;
      this.touchStartTime = null;
    }
  }
},



handleAppTouchCancel() {
  if (this.isHoldingGlobal) {
    clearTimeout(this.holdStartTimeoutId);
    this.isHoldingGlobal = false;
    this.touchStartX = null;
    this.touchStartY = null;
    this.touchStartTime = null;
    this.hasSwiped = false;
    console.log('Touch cancelled');
  }
},

  hideHighlightContextMenu(e) {
    // Only hide if not clicking inside the menu
    if (!e.target.closest('.highlight-context-menu')) {
      this.showHighlightContextMenu = false;
    }
  },

handleAppMouseLeave() {
  if (this.isHoldingGlobal) {
    clearTimeout(this.holdStartTimeoutId);
    this.isHoldingGlobal = false;
    console.log('Mouse left container');
  }
},
displayPreviousPart() {
  if (this.isPausedByHold) return; // If paused by hold, do nothing.

  if (this.currentPartIndex > 0) {
    this.currentPartIndex--;
    this.displayCurrentPart();
  } else {
    // At the first part of a verse, trying to go previous.
    // This will call displayPreviousVerse, which handles setting up the new verse and calling displayCurrentPart.
    this.displayPreviousVerse();
  }
}
,
 handleGlobalClick(e) {
    // If not clicking inside the control menu, hide it
     if (this.showHighlightMenu && !e.target.closest('.highlight-menu')) {
    this.showHighlightMenu = false;
    e.stopPropagation();
    e.preventDefault();
    return;
  }
    const menu = document.querySelector('.control-buttons-container');
    if (menu && !menu.contains(e.target)) {
      this.hideControlMenu();
    }
  },
shareVerse() {
  if (!this.currentVerseData || !this.currentVerseData.text) {
    console.error('No verse data to share');
    this.errorMessage = this.getLocalizedErrorMessage('noVersesAvailable');
    return;
  }
  const text = `${this.currentVerseData.text}\n${this.currentLanguage === 'ar' ? this.currentVerseData.surahArabicName : this.currentVerseData.surahEnglishName} ${this.currentVerseData.verse}`;
  console.log('Share text:', text);
  if (navigator.share) {
    navigator.share({ text })
      .catch(err => {
        console.error('Share failed:', err);
        this.errorMessage = this.getLocalizedErrorMessage('shareError');
      });
  } else {
    navigator.clipboard.write(text)
      .then(() => {
        this.showCopyNotification = true;
        setTimeout(() => {
          this.showCopyNotification = false;
        }, 2000);
      })
      .catch(err => {
        console.error('Clipboard copy failed:', err);
        this.errorMessage = this.getLocalizedErrorMessage('shareError');
      });
  }
},
  handleClickOutside(e) {
    if (this.showLoopsMenu && !e.target.closest('.loops-overlay')) {
      this.showLoopsMenu = false;
    }
  },
  },
watch: {
  hifdhLoopCount(newVal, oldVal) {
    if (this.displayMode === 'Hifdh') {
      this.currentLoop = 0;
      this.startHifdhLoop(); // or whatever method starts the loop
    }
  }
},
  async mounted() {
  document.addEventListener('click', this.handleClickOutside);
window.addEventListener('dblclick', (e) => {
    e.preventDefault();
  }, { passive: false });
    this.currentTheme = localStorage.getItem('theme') || 'system';
  if (!this.isMobile) {
    document.addEventListener('mousemove', this.handleDesktopMouseMove);
    this.startBottomUIFadeTimer();
  }
    this.$indexedDB = await this.initIndexedDB();
    const db = await this.$indexedDB;
    await db.transaction('notes', 'readwrite').objectStore('notes');
    await db.transaction('completions', 'readwrite').objectStore('completions');
    await db.transaction('highlights', 'readwrite').objectStore('highlights');
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Show mushaf selection when Arabic is selected
 const savedLang = localStorage.getItem('language');
  const savedMushaf = localStorage.getItem('mushafType');
  if (savedLang) {
    this.currentLanguage = savedLang;
    this.showLanguageSelection = false;
  } else {
    this.showLanguageSelection = true;
  }
  if (this.currentLanguage === 'ar' && !savedMushaf) {
  } else {
    this.showMushafSelection = false;
       if (savedMushaf) {
        this.mushafType = savedMushaf;
    }
    await this.loadInitialData();
     const lastDisplayMode = localStorage.getItem('lastDisplayMode');
  const lastVerseUuid = localStorage.getItem('lastVerseUuid');
  const lastSurahId = parseInt(localStorage.getItem('lastSurahId'));
  const lastVerseNumber = parseInt(localStorage.getItem('lastVerseNumber'));

  if (lastDisplayMode === 'full-surah' && lastSurahId) {
    this.setDisplayMode('full-surah');
    this.selectedSurah = lastSurahId;
    await this.loadSurahVerses(lastSurahId);
    // Optionally scroll to last verse
    this.$nextTick(() => {
      if (lastVerseUuid) {
        const verseEl = document.querySelector(`[data-verse-uuid="${lastVerseUuid}"]`);
        if (verseEl) verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  } else if (lastVerseUuid) {
    const verse = this.allVerses.find(v => v.uuid === lastVerseUuid);
    if (verse) {
      this.currentVerseData = { ...verse };
      this.currentTextParts = this.segmentText(verse.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.displayCurrentPart();
    }
  }
   if (this.allVerses.length > 0 && !this.errorMessage) {
      this.selectVerse();
    } else if (!this.errorMessage) {
      this.errorMessage = this.getLocalizedErrorMessage('noDataAfterLoad');
    }
    this.isLoading = false; // Ensure isLoading is false after initial attempt
  }
    document.addEventListener('click', this.hideHighlightContextMenu);
  this.showControlMenu();
 document.addEventListener('mousedown', this.handleGlobalClick);
  document.addEventListener('touchstart', this.handleGlobalClick);
  this.controlMenuVisible = false;
this.hamburgerMenuVisible = true;
  },
  
  beforeUnmount() {
       window.removeEventListener('keydown', this.handleGlobalKeydown);
 document.removeEventListener('mousemove', this.handleDesktopMouseMove);
  if (this.bottomUIFadeTimeout) clearTimeout(this.bottomUIFadeTimeout);

    this.clearAnimationTimers();
    this.stopSpeechRecognition();
      document.removeEventListener('click', this.hideHighlightContextMenu);
 document.removeEventListener('mousedown', this.handleGlobalClick);
  document.removeEventListener('touchstart', this.handleGlobalClick);
  
  }
};
</script>

<style >

html, body, #app, .app-container {
  touch-action: manipulation;
}
/* Existing styles... */
:root {
  --text-color-dark: #e5e7eb; /* gray-200 */
  --text-color-light: #1f2937; /* gray-800 */
  --bg-dark-start: black;
  --bg-dark-end: rgb(0, 12, 18);
  --bg-light-start: #e0f2fe; /* sky-100 */
  --bg-light-end: #bae6fd; /* sky-300 */

  --info-text-dark: #9ca3af; /* gray-400 */
  --info-text-light: #4b5563; /* gray-600 */

  --control-bg-dark: rgba(55, 65, 81, 0.6); /* gray-700 with opacity */
  --control-text-dark: #f3f4f6; /* gray-100 */
  --control-bg-light: rgba(255, 255, 255, 0.7); /* white with opacity */
  --control-text-light: #1f2937; /* gray-800 */
  
  /* ... existing vars ... */
  --glow-color-soft-dark-val: rgba(220, 220, 220, 0.4);  /* Light Blueish */
  --glow-color-strong-dark-val: rgba(255, 255, 255, 0.7);
  --glow-color-extra-dark-val: rgba(221, 221, 221, 0.3);

  --glow-color-soft-light-val: rgba(31, 31, 31, 0.4);  /* Amber/Goldish */
  --glow-color-strong-light-val: rgba(0, 0, 0, 0.7);
  --glow-color-extra-light-val: rgba(31, 31, 31, 0.3);

}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Amiri', serif;
  overflow: hidden; /* Prevent scrollbars on body itself */
}

#app { /* Assuming your Vue app mounts to #app */
  width: 100%;
  height: 100%;
}

.app-container {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem; /* p-4 */
  position: fixed; /* To ensure it covers full screen */
  top: 0;
  left: 0;
  overflow: hidden; /* Prevent scrollbars on the main container */
  transition: background 0.5s ease, color 0.5s ease;
}

.app-container.dark-theme {
  background: linear-gradient(to bottom, var(--bg-dark-start), var(--bg-dark-end));
  color: var(--text-color-dark);
  --current-glow-soft: var(--glow-color-soft-dark-val);
  --current-glow-strong: var(--glow-color-strong-dark-val);
  --current-glow-extra: var(--glow-color-extra-dark-val);
}

.app-container.light-theme {
  background: linear-gradient(to bottom, var(--bg-light-start), var(--bg-light-end));
  color: var(--text-color-light);
  --current-glow-soft: var(--glow-color-soft-light-val);
  --current-glow-strong: var(--glow-color-strong-light-val);
  --current-glow-extra: var(--glow-color-extra-light-val);
}

.app-container.light-theme .quran-verse-text-content {
  /* Example: Slightly adjust text color if glow makes it hard to read, or ensure glow is subtle */
}

.main-content-transition {
  position: relative; /* For stacking context if needed */
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-message, .error-message, .no-verse-message, .quran-verse-display {
  /* Common styling for main content blocks */
  width: 100%;
  max-width: 60rem; /* Adjust as needed, e.g., max-w-5xl */
}
.app-container.light-theme .loading-message,
.app-container.light-theme .no-verse-message {
  color: var(--text-color-light);
}
.app-container.dark-theme .loading-message,
.app-container.dark-theme .no-verse-message {
  color: var(--text-color-dark);
}
.error-message {
  color: #ef4444; /* red-500 */
}
.app-container.light-theme .error-message {
  color: #b91c1c; /* red-700 for better contrast on light bg */
}


.app-container.dark-theme .quran-verse-text-content {
  color: var(--text-color-dark);
}
.app-container.light-theme .quran-verse-text-content {
  color: var(--text-color-light);
}


.bottom-info {
  opacity: 0.8;
}
.app-container.dark-theme .bottom-info {
  color: var(--info-text-dark);
}
.app-container.light-theme .bottom-info {
  color: var(--info-text-light);
}

/* Overall fade for content blocks */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Word animation styles */
.word-fade-enter-active {
  transition: opacity 0.4s ease, filter 0.4s ease;
}
.word-fade-enter-from {
  opacity: 0;
  filter: blur(5px);
}
.word-fade-enter-to {
  opacity: 1;
  filter: blur(0px);
}

.control-buttons-container {
  /* Positioned by Tailwind classes */
}

.control-button {
  font-family:Arial, Helvetica, sans-serif;
    width: 4rem; /* ~44px */
    height: 4rem; /* ~44px */
  border-radius: 9999px; /* pill shape */
  display: flex;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  font-weight: 600; /* semibold */
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -2px rgba(0,0,0,.1); /* Tailwind shadow-md */
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
}

.app-container.dark-theme .control-button {
  background-color: var(--control-bg-dark);
  color: var(--control-text-dark);
}
.app-container.dark-theme .control-button:hover {
  background-color: rgba(31, 41, 55, 0.7); /* gray-800 with opacity */
}


.app-container.light-theme .control-button {
  background-color: var(--control-bg-light);
  color: var(--control-text-light);
}
.app-container.light-theme .control-button:hover {
  background-color: rgba(229, 231, 235, 0.8); /* gray-200 with opacity */
}

.theme-toggle-button svg {
  /* SVG size is controlled by w-5 h-5 in template */
}


@keyframes pulse-glow {
  0%, 100% {
    text-shadow: 0 0 4px var(--current-glow-soft), 0 0 7px var(--current-glow-soft);
  }
  50% {
    text-shadow: 0 0 8px var(--current-glow-strong), 0 0 12px var(--current-glow-strong), 0 0 16px var(--current-glow-extra);
  }
}

.pulsing-word {
  animation: pulse-glow 6s infinite ease-in-out;
}

.language-selection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  z-index: 10;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(12px);
}

.language-selection-overlay.light-theme {
  background: rgba(255, 255, 255, 0.9);
}

.language-selection-container {
  display: flex;
  gap: 1rem;
}


.search-overlay,
.voice-search-overlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
}

.search-overlay.light-theme,
.voice-search-overlay.light-theme {
  background: rgba(255, 255, 255, 0.7);
}

.search-container,
.voice-search-container {
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.search-container input {
  transition: border-color 0.2s ease;
}

.search-container input:focus {
  border-color: #3b82f6; /* blue-500 */
}


.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  align-items: center;
  justify-content: flex-start;
  z-index: 8;
  background: rgba(0, 0, 0, 0.542);
  backdrop-filter: blur(12px);
}

.search-overlay.light-theme {
  background: rgba(255, 255, 255, 0.411);
}

.search-container {
  width: 100%;
  max-width: 800px;
  display: flex;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-family: 'Amiri', serif;
  font-size: 1rem;
}

.search-input.dark-theme {
  background: var(--search-bg-dark);
  color: var(--text-color-dark);
}
.search-input.light-theme {
  background: var(--search-bg-light);
  color: var(--text-color-light);
}

.search-results {
  width: 100%;
  position: absolute;
  overflow-y: auto;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.search-result-item {
  padding: 1rem 4rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
}

.search-result-item:first-child {
  padding-top: 10rem;
}

.search-result-item.dark-theme {
  background: var(--search-bg-dark);
  color: var(--text-color-dark);
}
.search-result-item.light-theme {
  background: var(--search-bg-light);
  color: var(--text-color-light);
}

.search-link {
  color: #3b82f6;
  text-decoration: underline;
}
.search-link:hover {
  color: #1d4ed8;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-bottom: 5rem;

}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 8;
  background: rgba(0, 0, 0, 0.39);
  backdrop-filter: blur(12px);
}

.voice-search-overlay.light-theme {
  background: rgba(116, 116, 116, 0.238);
}

.voice-search-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.Hifdh-mode .control-button {
  /* Ensure consistent styling */
}
.complete-active {
  background-color: #34d399 !important; /* emerald-400 */
  color: white !important;
}
.app-container.dark-theme .complete-active:hover {
  background-color: #2dd4bf !important; /* emerald-500 */
}
.app-container.light-theme .complete-active:hover {
  background-color: #10b981 !important; /* emerald-600 */
}
.notes-overlay,
.loops-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  transition: background 0.5s ease;
}
.notes-overlay.light-theme,
.loops-overlay.light-theme {
  background: rgba(255, 255, 255, 0.5);
}
.notes-container,
.loops-container {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background 0.5s ease, color 0.5s ease;
}
.loops-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}
.loop-value {
  font-size: 2rem;
  user-select: none;
}
.highlight-menu {
  transition: background 0.5s ease, color 0.5s ease;
}
.highlighted {
  transition: background 0.2s ease;
}
.highlight-ffcccb { background-color: #ffcccb; }
.highlight-d4edda { background-color: #d4edda; }
.highlight-cce5ff { background-color: #cce5ff; }
.highlight-fff3cd { background-color: #fff3cd; }
.highlight-e2d1f9 { background-color: #e2d1f9; }


.surah-verse-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  transition: background 0.5s ease;
}
.surah-verse-overlay.light-theme {
  background: rgba(255, 255, 255, 0.5);
}
.surah-verse-container {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background 0.5s ease, color 0.5s ease;
}
.surah-verse-container select,
.surah-verse-container button {
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.search-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(12px);
  transition: background 0.5s ease;
}
.search-overlay.light-theme {
  background: rgba(255, 255, 255, 0.5);
}
.search-container {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.034);
  transition: background 0.5s ease, color 0.5s ease;
}
.search-input {
  border: 1px solid var(--control-text-dark);
  transition: border-color 0.2s ease, background 0.5s ease, color 0.5s ease;
}
.app-container.light-theme .search-input {
  border-color: var(--control-text-light);
}
.search-result-item {
  transition: background 0.2s ease;
}
.pagination button {
  transition: background 0.2s ease, color 0.2s ease;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.audio-active {
  background-color: white !important;
  color: black !important;
}
.app-container.dark-theme .audio-active:hover {
  background-color: #e5e7eb !important; /* gray-200 */
}
.app-container.light-theme .audio-active:hover {
  background-color: #d1d5db !important; /* gray-300 */
}

.notes-overlay,
.loops-overlay,
.surah-verse-overlay,
.search-overlay,
.voice-search-overlay {
  z-index: 50;
}
.highlight-menu {
  z-index: 60;
}
.control-buttons-container {
  z-index: 70;
}

.sepia-theme {
  background-color: #d7d0be;
  color: #5f4b32;
}

.sepia-theme .notes-container, .sepia-theme .loops-container, .sepia-theme .surah-verse-container, 
.sepia-theme .language-menu, .sepia-theme .display-mode-menu, .sepia-theme .highlight-menu {
  background-color: #d7d0be;
  color: #5f4b32;
}

.sepia-theme .notes-container, .sepia-theme .loops-container, .sepia-theme .surah-verse-container, 
.sepia-theme .language-menu, .sepia-theme .display-mode-menu, .sepia-theme .highlight-menu {
  background-color: #d7d0be;
  color: #5f4b32;
}



.verse-line {
  transition: opacity 0.3s ease;
}
.select-container {
  background: var(--select-bg, #f3f4f6); /* Light theme */
  border-radius: 0.5rem;
  padding: 0.5rem;
}
.dark-theme .select-container {
  --select-bg: #1f2937; /* Dark theme */
}
.mistake-glow {
  animation: glow 1s ease-in-out infinite;
  background-color: rgba(255, 0, 0, 0.2);
}
@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
  50% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); }
}
.decorative-number {
  font-family: 'Amiri', serif;
  color: var(--verse-number-color, #4b5563);
}
.dark-theme .decorative-number {
  --verse-number-color: #9ca3af;
}


/* Revision Mode Styles */
.correct-highlight {
  background-color: rgba(0, 255, 0, 0.3);
  border-radius: 3px;
}

.mistake-glow {
  animation: mistakeGlow 0.5s ease-in-out infinite alternate;
  border-radius: 3px;
}

@keyframes mistakeGlow {
  from {
    box-shadow: 0 0 5px rgba(255, 0, 0, 0.5);
  }
  to {
    box-shadow: 0 0 15px rgba(255, 0, 0, 0.8);
  }
}

/* Mushaf Selection Overlay */
.mushaf-selection-overlay {
  position: fixed;
  height: 100%;
  width: 100%;
  z-index: 99;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.mushaf-selection-overlay.light-theme {
  background: rgba(255, 255, 255, 0.7);
}

.mushaf-selection-container {
  max-width: 90%;
  width: 400px;
}

/* Voice Animation */
.voice-animation {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0;
}

.pulse-1 {
  width: 100%;
  height: 100%;
  animation: pulse 2s infinite;
}

.pulse-2 {
  width: 80%;
  height: 80%;
  animation: pulse 2s infinite 0.2s;
}

.pulse-3 {
  width: 60%;
  height: 60%;
  animation: pulse 2s infinite 0.4s;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

.mic-icon {
  width: 40px;
  height: 40px;
}

.detected-text {
  max-width: 80vw;
  text-align: center;
}

.word-animation {
  display: inline-block;
  animation: wordPop 0.3s ease;
}

@keyframes wordPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Full Surah Mode */
.full-surah-display {
  position: fixed;
  width: 100vw;
  height: 100vh;
  overflow-y: scroll;
  padding: 7.5%;

}

.verse-line {
  transition: opacity 0.3s ease;
}

/* Select Fix */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Theme-respecting backgrounds */
.surah-verse-overlay.dark-theme,
.notes-overlay.dark-theme,
.loops-overlay.dark-theme,
.search-overlay.dark-theme,
.voice-search-overlay.dark-theme {
  background: rgb(0, 0, 0);
}

.surah-verse-overlay.light-theme,
.notes-overlay.light-theme,
.loops-overlay.light-theme,
.search-overlay.light-theme,
.voice-search-overlay.light-theme {
  background: rgba(255, 255, 255, 0.7);
}

/* Offline support indicator */
.offline-indicator {
  position: fixed;
  bottom: 5px;
  left: 5px;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 100;
}
.full-surah-display, .control-buttons-container, .control-button, .verse-line, .verse-text {
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
}
.offline-indicator.online {
  background-color: #4CAF50;
  color: white;
}

.offline-indicator.offline {
  background-color: #F44336;
  color: white;
}

/* Decorative verse numbers */
.decorative-number {
  font-family: 'Amiri', serif;
  color: var(--verse-number-color, #4b5563);
}

.dark-theme .decorative-number {
  --verse-number-color: #9ca3af;
}

/* CSP-compliant styles */
@media (max-width: 768px) {
  .control-button {
    width: 3.75rem; /* ~44px */
    height: 3.75rem; /* ~44px */
  }
}
@media (max-width: 768px) {
  .control-buttons-container {
    bottom: 70px;
    right: 10px;
  }
}

.hamburg {
      right: auto;
    bottom: 1.5rem;
    opacity: 0.48;
    position: absolute;
}



/* Responsive adjustments for mobile */
@media (max-width: 768px) {
  .control-buttons-container {
    right: auto;
    bottom: 1.5rem;
    width: 98vw;
    max-width: 98vw;
    padding: 0.5rem 0.25rem;
    gap: 0.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .control-button {
    margin-bottom: 0.25rem;
    min-width: 40px;
    max-width: 60px;
  }
}

.surah-title-header {
  font-size: 1.5rem; /* Equivalent to text-2xl */
  line-height: 2rem;
  margin-bottom: 3rem; /* Equivalent to mb-12 */
  text-align: center; /* Equivalent to text-center */
  padding-top: 0.75rem; /* Slightly more than py-2 for balance with borders */
  padding-bottom: 0.75rem;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-style: solid;
  /* Theme-specific colors will be applied below */
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.light-theme .surah-title-header {
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='rotate(35 10 10)'%3E%3Cpath d='M0 5 V15 H5 V20 H15 V15 H20 V5 H15 V0 H5 V5Z' stroke-width='0.75' stroke-opacity='0.15' stroke='rgb(0,0,0)' fill='none'/%3E%3C/g%3E%3C/svg%3E");

  color: #1f2937;          /* Tailwind gray-800 - strong contrast for text */
  border-color: #d1d5db;     /* Tailwind gray-300 - subtle border */
}

.dark-theme .surah-title-header {
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='rotate(35 10 10)'%3E%3Cpath d='M0 5 V15 H5 V20 H15 V15 H20 V5 H15 V0 H5 V5Z' stroke-width='0.75' stroke-opacity='0.15' stroke='rgb(255,255,255)' fill='none'/%3E%3C/g%3E%3C/svg%3E");

  color: #e5e7eb;          /* Tailwind gray-200 - clear text on dark bg */
  border-color: #4b5563;     /* Tailwind gray-600 - subtle border */
}

.sepia-theme .surah-title-header {
   background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg transform='rotate(35 10 10)'%3E%3Cpath d='M0 5 V15 H5 V20 H15 V15 H20 V5 H15 V0 H5 V5Z' stroke-width='0.75' stroke-opacity='0.10' stroke='rgb(95,75,50)' fill='none'/%3E%3C/g%3E%3C/svg%3E");
  color: #5f4b32;          /* Main sepia text color */
  border-color: #bfb59f;     /* A mid-tone sepia for the border */
}

.surah-title-header::before,
.surah-title-header::after {
  content: '۞'; /* ARABIC START OF RUB EL HIZB symbol (U+06DE) */
  font-family: 'Amiri', serif; /* Ensure it uses the same font */
  font-size: 0.7em; /* Make it smaller than the title text */
  opacity: 0.65; /* Make it subtle */
  padding: 0 0.6em; /* Add some horizontal spacing */
  line-height: 1; /* Helps with vertical alignment */
}

.light-theme .surah-title-header::before,
.light-theme .surah-title-header::after {
  color: #4b5563; /* Tailwind gray-600 */
}

.dark-theme .surah-title-header::before,
.dark-theme .surah-title-header::after {
  color: #9ca3af; /* Tailwind gray-400 */
}

.sepia-theme .surah-title-header::before,
.sepia-theme .surah-title-header::after {
  color: #8c7b60; /* A darker, less prominent sepia tone */
}
.surah-verse-select {
  cursor: pointer !important;
   pointer-events: all !important;
   z-index: 99 !important;
 }
 .highlight-ffcccb { background-color: #ffcccb; color: black; padding: .32rem .51rem; border-radius: 4px; }
.highlight-d4edda { background-color: #d4edda; color: black; padding: .32rem .51rem; border-radius: 4px; }
.highlight-cce5ff { background-color: #cce5ff; color: black; padding: .32rem .51rem; border-radius: 4px; }
.highlight-fff3cd { background-color: #fff3cd; color: black; padding: .32rem .51rem; border-radius: 4px; }
.highlight-e2d1f9 { background-color: #e2d1f9; color: black; padding: .32rem .51rem; border-radius: 4px; }

.complete-active {
  background-color: #34d399 !important; /* emerald-400 */
  color: white !important;
}
.highlight-context-menu {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center; /* Center horizontally */
  gap: 16px; /* Space between buttons */
  min-width: 120px;
  min-height: 48px;
  /* Optional: add background, border, or padding as needed */
}
.sepia-theme .control-buttons-container {
  color: #5f4b32 !important;
}
.sepia-theme .control-button,
.sepia-theme .control-button  {
  background-color: #e6dfc9 ;
  color: #5f4b32 ;
  fill: #5f4b32 !important;
  border-color: #bfb59f !important;
}
.sepia-hamburger {
  background-color: #e6dfc9 !important;
  color: #5f4b32 !important;
  fill: #5f4b32 !important;
  border: 1px solid #bfb59f !important;
}

.control-buttons-container.fade-out {
  opacity: 0;
  transition: opacity 2s;
  pointer-events: none;
}
.control-buttons-container {
  opacity: 1;
  transition: opacity 0.3s;
}

.sepia-hamburger, .dark-theme .sepia-hamburger {
  box-shadow: 0 0 16px 2px #60a5fa !important; /* light blue for dark */
}
.light-theme .sepia-hamburger {
  box-shadow: 0 0 16px 2px #0f035c8d !important;
}
.sepia-theme .sepia-hamburger {
  box-shadow: 0 0 16px 2px #bfa76f !important; /* sepia gold */
}
.glow-blue {
  box-shadow: 0 0 12px 4px #3b82f6, 0 0 2px #3b82f6;
  border-color: #3b82f6 !important;
  background-color: #2563eb !important;
  color: #fff !important;
  animation: bluePulse 1.2s infinite alternate;
}
@keyframes bluePulse {
  from { box-shadow: 0 0 8px 2px #3b82f6; }
  to   { box-shadow: 0 0 18px 8px #60a5fa; }
}

.verse-line, .verse-text {
  transition: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
}
</style>