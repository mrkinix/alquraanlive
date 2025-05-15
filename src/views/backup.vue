<template>
  <div
    class="app-container"
    :class="[currentTheme === 'dark' ? 'dark-theme' : currentTheme === 'sepia' ? 'sepia-theme' : 'light-theme']"
    @mousedown="handleAppMouseDown"
    @mouseup="handleAppMouseUp"
    @mouseleave="handleAppMouseLeave"
    @touchstart="handleAppTouchStart"
    @touchmove="handleAppTouchMove"
    @touchend="handleAppTouchEnd"
    @touchcancel="handleAppTouchCancel"
    @click="handleAppClick"
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
        <div class="flex flex-col gap-3">
          <button
            @click="selectMushaf('hafs')"
            class="p-3 rounded-lg"
            :class="currentTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ currentLanguage === 'ar' ? 'حفص عن عاصم' : 'Hafs' }}
          </button>
          <button
            @click="selectMushaf('warsh')"
            class="p-3 rounded-lg"
            :class="currentTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ currentLanguage === 'ar' ? 'ورش عن نافع' : 'Warsh' }}
          </button>
          <button
            @click="selectMushaf('qaloon')"
            class="p-3 rounded-lg"
            :class="currentTheme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'"
          >
            {{ currentLanguage === 'ar' ? 'قالون عن نافع' : 'Qaloon' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Full Surah Display -->
    <div
      v-if="displayMode === 'full-surah' && currentSurahData"
      class="full-surah-display text-center"
      :key="currentSurahData.id"
      ref="versesContainer"
    >
      <h2 class="text-2xl font-amiri mb-4" :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'">
        {{ currentLanguage === 'ar' ? currentSurahData.arabicName : currentSurahData.englishName }}
      </h2>
      <div
        v-for="verse in displayedVerses"
        :key="verse.uuid"
        class="verse-line flex items-center justify-center py-2 cursor-pointer"
        :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
        @click="openVerseNote(verse)"
      >
        <span class="verse-text text-xl font-amiri flex-1">
          <span
            v-for="(word, index) in verse.text.split(' ')"
            :key="`${verse.uuid}-${index}`"
            class="inline-block mx-1"
            :class="[
              { 'highlighted': isWordHighlighted(index, verse.uuid) },
              getHighlightClass(index, verse.uuid)
            ]"
            @mousedown="startWordSelection($event, index, verse.uuid)"
            @mousemove="updateWordSelection($event, index)"
            @mouseup="endWordSelection"
            @touchstart="startWordSelection($event, index, verse.uuid)"
            @touchmove="updateWordSelection($event, index)"
            @touchend="endWordSelection"
          >
            {{ word }}
          </span>
        </span>
        <span class="verse-number text-sm font-amiri ml-4 decorative-number">
          {{ verse.verse }}
        </span>
      </div>
    </div>
  
    <transition name="fade" mode="out-in" class="main-content-transition">
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
        <!-- Revision Mode Visual Feedback -->
        <div v-if="displayMode === 'revision'" class="revision-feedback mb-4">
          <div class="flex justify-center gap-4">
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span>{{ currentLanguage === 'ar' ? 'صحيح' : 'Correct' }}</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span>{{ currentLanguage === 'ar' ? 'خطأ' : 'Mistake' }}</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 rounded-full opacity-40 mr-2"></div>
              <span>{{ currentLanguage === 'ar' ? 'غير مقروء' : 'Unread' }}</span>
            </div>
          </div>
        </div>

        <p
          :key="currentPartIndex"
          class="quran-verse-text-content text-3xl md:text-5xl font-amiri max-w-4xl mx-auto leading-loose"
          :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
        >
          <transition-group name="word-fade" tag="span">
            <span
              v-for="(word, index) in displayedWords"
              :key="`${currentVerseData.uuid}-${currentPartIndex}-${index}-${currentLanguage}-${word}`"
              class="inline-block mx-1.5 pulsing-word"
              :class="[
                currentLanguage === 'ar' ? 'mb-12' : 'mb-5',
                { 'highlighted': isWordHighlighted(index) },
                getHighlightClass(index),
                { 'correct-highlight': isWordCorrect(index) },
                { 'mistake-glow': isWordMistake(index) },
                { 'opacity-40': isWordUnread(index) }
              ]"
              @mousedown="startWordSelection($event, index)"
              @mousemove="updateWordSelection($event, index)"
              @mouseup="endWordSelection"
              @touchstart="startWordSelection($event, index)"
              @touchmove="updateWordSelection($event, index)"
              @touchend="endWordSelection"
            >
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
      v-if="!isLoading && !errorMessage && currentVerseData"
      class="bottom-info text-sm font-amiri fixed bottom-5 w-full text-center cursor-pointer"
      :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
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
      class="search-overlay fixed inset-0 flex flex-col items-center justify-start pt-8 z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
    >
      <div
        class="search-container bg-opacity-80 p-6 rounded-lg w-full !flex !flex-col h-full max-w-2xl"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
      >
        <div class="flex items-center mb-4">
          <input
            v-model="searchQuery"
            @keyup.enter="performSearch"
            type="text"
            :placeholder="currentLanguage === 'ar' ? 'ابحث في القرآن...' : 'Search in Quran...'"
            class="flex-1 p-2 rounded-l-lg border border-gray-300 focus:outline-none search-input"
            :class="[currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-800', currentLanguage === 'ar' ? 'text-right' : 'text-left']"
            ref="searchInput"
          />
          <button
            @click="performSearch"
            class="mx-1 p-2 bg-gray-500 text-white rounded-none"
            :class="currentTheme === 'dark' ? 'hover:bg-blue-600' : 'hover:bg-blue-400'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-4.23c0-3.58-2.92-6.5-6.5-6.5S3 5.92 3 9.5s2.92 6.5 6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button
            @click="closeOverlay('search')"
            class="p-2 bg-gray-500 text-white rounded-r-lg"
          >
            ✕
          </button>
        </div>
        <div v-if="isSearching" class="text-center py-4">
          {{ currentLanguage === 'ar' ? 'جاري البحث...' : 'Searching...' }}
        </div>
        <div v-else-if="!isSearching && searchResults.length === 0 && searchQuery" class="text-center py-4">
          {{ currentLanguage === 'ar' ? 'لم يتم العثور على نتائج' : 'No results found' }}
        </div>
        <div v-else class="search-results h-full overflow-y-auto">
          <div
            v-for="result in paginatedResults"
            :key="result.uuid"
            @click="selectSearchResult(result)"
            class="search-result-item p-4 border-b cursor-pointer"
            :class="currentTheme === 'dark' ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'"
          >
            <p class="text-lg" :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'">
              {{ result.text }}
            </p>
            <p class="text-sm opacity-80">
              {{ currentLanguage === 'ar' ? result.surahArabicName : result.surahEnglishName }}
              - {{ currentLanguage === 'ar' ? 'الآية' : 'Verse' }} {{ result.verse }}
            </p>
          </div>
          <div v-if="searchResults.length > resultsPerPage" class="pagination">
            <button
              @click="searchPagination(-1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg"
              :class="currentTheme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'"
            >
              {{ currentLanguage === 'ar' ? 'السابق' : 'Previous' }}
            </button>
            <span>{{ currentPage }} / {{ Math.ceil(searchResults.length / resultsPerPage) }}</span>
            <button
              @click="searchPagination(1)"
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
      class="voice-search-overlay fixed inset-0 flex items-center justify-center z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      @click="closeOverlay('voice')"
    >
      <div class="voice-search-container bg-opacity-80 p-6 rounded-lg" @click.stop>
        <div class="voice-animation" @click="resetVoiceSearch">
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
    <div v-if="showLanguageSelection" class="language-selection-overlay">
      <button
        v-for="lang in ['ar', 'en', 'fr', 'bn', 'tr', 'ur']"
        :key="lang"
        @click="selectInitialLanguage(lang)"
        class="language-button text-xl"
      >
        {{ lang === 'ar' ? 'العربية' : langNames[lang] }}
      </button>
    </div>

    <!-- Surah and Verse Selection Overlay -->
    <div
      v-if="showSurahVerseMenu"
      class="surah-verse-overlay fixed inset-0 flex flex-col items-center justify-start pt-8 z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      @click="handleAppClick"
    >
      <div
        class="surah-verse-container bg-opacity-80 p-6 rounded-lg w-full max-w-2xl"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl">
            {{ currentLanguage === 'ar' ? 'اختر السورة والآية' : 'Select Surah and Verse' }}
          </h2>
          <button
            @click="showSurahVerseMenu = false"
            class="p-2 bg-gray-500 text-white rounded-lg"
            :class="currentTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-400'"
          >
            ✕
          </button>
        </div>
        <div class="flex flex-col gap-4">
          <select
            v-model="selectedSurah"
            class="p-2 rounded-lg border"
            :class="currentTheme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'"
            @change="updateVerseOptions"
            @click="handleSelectClick"
            ref="surahSelect"
            aria-label="Select Surah"
          >
            <option v-for="surah in SURAH_DATA" :key="surah.id" :value="surah.id">
              {{ currentLanguage === 'ar' ? surah.arabicName : surah.englishName }} ({{ surah.verses }} {{ currentLanguage === 'ar' ? 'آيات' : 'Verses' }})
            </option>
          </select>
          <select
            v-model="selectedVerse"
            class="p-2 rounded-lg border"
            :class="currentTheme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'"
            @click="handleSelectClick"
            ref="verseSelect"
          >
            <option v-for="verse in verseOptions" :key="verse" :value="verse">
              {{ currentLanguage === 'ar' ? 'الآية' : 'Verse' }} {{ verse }}
            </option>
          </select>
          <button
            @click="selectSurahVerse"
            class="p-2 bg-blue-500 text-white rounded-lg"
            :class="currentTheme === 'dark' ? 'hover:bg-blue-600' : 'hover:bg-blue-400'"
          >
            {{ currentLanguage === 'ar' ? 'اختيار' : 'Select' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notes Overlay (Hifz Mode) -->
    <div
      v-if="showNotesOverlay"
      class="notes-overlay fixed inset-0 flex items-center justify-center z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
      @click="closeNotesOverlay"
    >
      <div
        class="notes-container bg-opacity-80 p-6 rounded-lg w-full max-w-2xl"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl">
            {{ currentLanguage === 'ar' ? 'ملاحظات الآية' : 'Verse Notes' }}
          </h2>
          <button
            @click="closeNotesOverlay"
            class="p-2 bg-red-500 text-white rounded-lg"
            :class="currentTheme === 'dark' ? 'hover:bg-red-600' : 'hover:bg-red-400'"
          >
            ✕
          </button>
        </div>
        <textarea
          v-model="currentNote"
          class="w-full h-64 p-2 rounded-lg border"
          :class="currentTheme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'"
          :placeholder="currentLanguage === 'ar' ? 'اكتب ملاحظاتك هنا...' : 'Write your notes here...'"
        ></textarea>
      </div>
    </div>

    <!-- Loops Menu (Hifz Mode) -->
    <div
      v-if="showLoopsMenu"
      class="loops-overlay fixed inset-0 flex items-center justify-center z-50"
      :class="currentTheme === 'dark' ? 'dark-theme' : 'light-theme'"
    >
      <div
        class="loops-container bg-opacity-80 p-6 rounded-lg"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
        @click="showLoopsMenu = false"
        @touchstart="startLoopSwipe"
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
            {{ hifzLoopCount }}
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
    >
      <div
        class="highlight-container bg-opacity-80 p-4 rounded-lg flex gap-2"
        :class="currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'"
      >
        <button
          v-for="color in highlightColors"
          :key="color"
          @click="applyHighlight(color)"
          class="w-8 h-8 rounded-full"
          :style="{ backgroundColor: color }"
        ></button>
        <button
          @click="removeHighlight"
          class="p-2 bg-red-500 text-white rounded-lg"
          :class="currentTheme === 'dark' ? 'hover:bg-red-600' : 'hover:bg-red-400'"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Control Buttons Container -->
    <div class="control-buttons-container bg-black/30 rounded-xl p-2 max-sm:scale-90 fixed max-sm:bottom-12 bottom-5 sm:right-5 flex space-x-2 z-50">
      <!-- Revision Mode Button -->
      <button
        v-if="displayMode !== 'revision' && currentLanguage === 'ar'"
        @click="toggleRevisionMode"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'وضع المراجعة' : 'Revision Mode'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 16a7 7 0 110-14 7 7 0 010 14zm1-11h-2v3H8v2h3v3h2v-3h3v-2h-3V8z"/>
        </svg>
      </button>

      <!-- Hifz Mode Exit Button -->
      <button
        v-if="displayMode === 'hifz'"
        @click="exitHifzMode"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'الخروج من وضع الحفظ' : 'Exit Hifz Mode'"
      >
        ✕
      </button>
      
      <!-- Notes Button (Hifz Mode) -->
      <button
        v-if="displayMode === 'hifz'"
        @click="toggleNotesOverlay"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'ملاحظات' : 'Notes'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-3v-3h-2v3H6v-2h3v-3h2v3h3v2z"/>
        </svg>
      </button>
      
      <!-- Complete Button (Hifz Mode) -->
      <button
        v-if="displayMode === 'hifz'"
        @click="toggleComplete"
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
      
      <!-- Loops Button (Hifz Mode) -->
      <button
        v-if="displayMode === 'hifz'"
        @click.stop="toggleLoopsMenu"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'عدد التكرارات' : 'Number of Loops'"
      >
        ({{ hifzLoopCount }})
      </button>

      <!-- Audio Button -->
      <button
        @click="toggleAudio"
        @mousedown="startAudioHold"
        @mouseup="stopAudioHold"
        @touchstart="startAudioHold"
        @touchend="stopAudioHold"
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
      </button>
      
      <!-- Search Button (Desktop Only) -->
      <button
        v-if="!isMobile"
        @click="openSearchOverlay"
        class="control-button opacity-65 hover:opacity-100"
        :title="currentLanguage === 'ar' ? 'بحث' : 'Search'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/>
        </svg>
      </button>
      
      <!-- Display Mode Menu -->
      <div class="relative">
        <button @click="toggleDisplayModeMenu" class="control-button opacity-65 hover:opacity-100" :aria-label="currentLanguage === 'ar' ? 'تغيير وضع العرض' : 'Change display mode'">
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
              v-if="currentLanguage !== 'ar'"
              @click="setDisplayMode('verse')"
              class="control-button w-12 h-12 flex items-center justify-center text-lg font-bold opacity-65 hover:opacity-100"
              :aria-label="currentLanguage === 'ar' ? 'عرض الآية' : 'Verse view'"
            >
              {{ currentLanguage === 'ar' ? 'آية' : 'Verse' }}
            </button>
            <button
              @click="setDisplayMode('full-surah')"
              class="control-button w-12 h-12 flex items-center justify-center text-lg font-bold opacity-65 hover:opacity-100"
              :aria-label="currentLanguage === 'ar' ? 'عرض السورة كاملة' : 'Full Surah view'"
            >
              {{ currentLanguage === 'ar' ? 'سورة' : 'Surah' }}
            </button>
            <button
              @click="setDisplayMode('tafseer')"
              class="control-button w-12 h-12 flex items-center justify-center text-lg font-bold opacity-65 hover:opacity-100"
              :aria-label="currentLanguage === 'ar' ? 'عرض التفسير' : 'Tafseer view'"
            >
              {{ currentLanguage === 'ar' ? 'تفسير' : 'Tafseer' }}
            </button>
            <button
              @click="setDisplayMode('hifz')"
              class="control-button w-12 h-12 flex items-center justify-center text-lg font-bold opacity-65 hover:opacity-100"
              :aria-label="currentLanguage === 'ar' ? 'وضع الحفظ' : 'Hifz Mode'"
            >
              {{ currentLanguage === 'ar' ? 'حفظ' : 'Hifz' }}
            </button>
          </div>
        </transition>
      </div>
      
      <!-- Language Menu -->
      <div class="relative">
        <button @click="toggleLanguageMenu" class="control-button opacity-65 hover:opacity-100" :aria-label="languageToggleAriaLabel">
          {{ currentLanguage === 'ar' ? 'ع' : (currentLanguage === 'en' ? 'EN' : (currentLanguage === 'fr' ? 'FR' : (currentLanguage === 'bn' ? 'BN' : (currentLanguage === 'tr' ? 'TR' : 'UR')))) }}
        </button>
        <transition name="fade">
          <div
            v-if="showLanguageMenu"
            class="absolute bottom-14 left-1/2 -translate-x-1/2 flex flex-col gap-3 bg-none p-3 rounded-lg z-50"
          >
            <button
              v-for="lang in otherLanguages"
              :key="lang"
              @click="setLanguage(lang)"
              class="control-button w-12 h-12 flex items-center justify-center text-lg font-bold opacity-65 hover:opacity-100"
              :aria-label="'Switch to ' + langNames[lang]"
            >
              {{ lang === 'ar' ? 'ع' : lang.toUpperCase() }}
            </button>
          </div>
        </transition>
      </div>
      
      <!-- Shuffle Button -->
      <button
        @click="toggleShuffleMode"
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
        v-if="displayMode !== 'hifz'"
        @click="togglePause"
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
      <button @click="toggleTheme" class="control-button theme-toggle-button opacity-65 hover:opacity-100" :aria-label="currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'">
        <svg v-if="currentTheme !== 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 7.758a.75.75 0 001.06-1.06L5.634 5.106a.75.75 0 00-1.06 1.06l1.59 1.591z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.362-8.528a.75.75 0 01.818.162z" clip-rule="evenodd"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { openDB } from 'idb';

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

export default {
  data() {
    return {
      // Mushaf selection
      showMushafSelection: false,
      mushafType: 'hafs', // 'hafs', 'warsh', 'qaloon'
      
      // Revision mode
      isRevisionMode: false,
      speechRecognition: null,
      recognizedText: '',
      correctWords: [],
      mistakeWords: [],
      unreadVerses: [],

      

          hifzVerseQueue: [],
      hifzCurrentVerseIndex: 0,
      hifzLoopCount: 10,
      currentLoopIteration: 0, // Track current loop iteration
      completedVerses: {}, // Track comple
      
      // Other existing data properties
      showLanguageSelection: true,
      showLanguageMenu: false,
      isAudioPlaying: false,
      currentAudio: null,
      isContinuousAudio: false,
      completions: {},
      hifzVerseQueue: [],
      hifzCurrentVerseIndex: 0,
      showSurahVerseMenu: false,
      selectedSurah: 1,
      
      selectedVerse: 1,
      verseOptions: [],
      showDisplayModeMenu: false,
      displayMode: 'verse',
      showNotesOverlay: false,
      currentNote: '',
      isVerseCompleted: false,
      hifzLoopCount: 10,
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
        if (!this.isRevisionMode) return false;
        return this.correctWords.includes(index + this.currentPartIndex * this.WORDS_PER_PART);
      };
    },
    isWordMistake() {
      return (index) => {
        if (!this.isRevisionMode) return false;
        return this.mistakeWords.includes(index + this.currentPartIndex * this.WORDS_PER_PART);
      };
    },
    isWordUnread() {
      return (index) => {
        if (!this.isRevisionMode) return false;
        return this.unreadVerses.includes(index + this.currentPartIndex * this.WORDS_PER_PART);
      };
    }
  },

  methods: {
    // Mushaf Selection
    selectMushaf(type) {
      this.mushafType = type;
      localStorage.setItem('mushafType', type);
            this.showMushafSelection = false; // Hide selection after choosing

      this.loadInitialData();
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
      this.isRevisionMode = !this.isRevisionMode;
      if (this.isRevisionMode) {
        this.initSpeechRecognition();
      } else {
        this.stopSpeechRecognition();
      }
    },
    
    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        this.errorMessage = this.getLocalizedErrorMessage('voiceSearchNotSupported');
        return;
      }
      
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.lang = 'ar-SA';
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      
      this.speechRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join(' ');
        this.recognizedText = transcript;
        this.matchRecitedText(transcript);
      };
      
      this.speechRecognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
      };
      
      this.speechRecognition.start();
    },
    
    stopSpeechRecognition() {
      if (this.speechRecognition) {
        this.speechRecognition.stop();
        this.speechRecognition = null;
      }
      this.recognizedText = '';
      this.correctWords = [];
      this.mistakeWords = [];
      this.unreadVerses = [];
    },
    
    matchRecitedText(transcript) {
      if (!this.currentVerseData) return;
      
      const verseText = this.currentVerseData.text;
      const verseWords = verseText.split(' ');
      const recitedWords = transcript.split(' ');
      
      // Simple matching algorithm - match words sequentially
      this.correctWords = [];
      this.mistakeWords = [];
            this.unreadVerses = [];

      for (let i = 0; i < recitedWords.length && i < verseWords.length; i++) {
        if (verseWords[i].includes(recitedWords[i])) {
          this.correctWords.push(i);
        } else {
          this.mistakeWords.push(i);
          // Provide feedback for mistakes
          if (navigator.vibrate) navigator.vibrate([200]);
        }
      }
      
            // Mark remaining verse words as unread

      for (let i = recitedWords.length; i < verseWords.length; i++) {
               this.unreadVerses.push(i); // Store global word index

      }
      
      // If entire verse is correct, move to next verse
      if (this.correctWords.length === verseWords.length && this.mistakeWords.length === 0) {
        setTimeout(() => {
          this.selectVerse(true);
        }, 1000);
      }
    },
    
    // Existing methods
    async loadSurahVerses(surahId) {
            this.isLoading = true;

      try {
        const cached = await this.getCachedSurah(surahId);
        if (cached) {
          this.currentSurahData = cached;
          this.lazyLoadVerses();
          return;
        }

        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
        const data = await response.json();
        if (data.code === 200) {
          this.currentSurahData = {
            id: surahId,
            arabicName: data.data.name,
            englishName: data.data.englishName,
            verses: data.data.ayahs.map(ayah => ({
              uuid: `${surahId}:${ayah.numberInSurah}`,
              surah: surahId,
              verse: ayah.numberInSurah,
              text: ayah.text,
              surahArabicName: data.data.name,
              surahEnglishName: data.data.englishName,
            })),
          };
          await this.cacheSurah(this.currentSurahData);
          this.lazyLoadVerses();
        } else {
          this.errorMessage = this.getLocalizedErrorMessage('loadSurahError');
        }
      } catch (error) {
        console.error('Error loading Surah:', error);
          this.errorMessage = this.getLocalizedErrorMessage('loadSurahError', error.message);
      } finally {
        this.errorMessage = this.currentLanguage === 'ar' ? 'خطأ في الاتصال.' : 'Connection error.';
      }
    },
    
    // ... (all other existing methods)
    
    // Add new methods for the fixes:
    
    // Fix for Hifz Mode Loop Completion

    
    // Fix for Surah/Verse Selection
    handleSelectClick(event) {
      event.stopPropagation();
      event.target.focus();
      if (event.target.size === 0) {
        event.target.size = 5;
        setTimeout(() => {
          event.target.size = 0;
        }, 1000);
      }
    },
    
    // Fix for Tafsir Mode Navigation
    handleAppClick(event) {
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
        event.target.closest('.control-buttons-container')
      ) {
        return;
      }
      
      if (event.target.tagName === 'SELECT' || event.target.closest('.select-container')) {
        return;
      }
      
      if (this.showSurahVerseMenu) {
        this.showSurahVerseMenu = false;
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
        
        if ((clickX > screenWidth / 2 && !isArabic) || (clickX <= screenWidth / 2 && isArabic)) {
          this.displayNextPart();
        } else {
          this.displayPreviousPart();
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
      this.displayMode = mode;
      this.showDisplayModeMenu = false;
      this.clearAnimationTimers();
      
      if (mode === 'hifz') {
        this.enterHifzMode();
      } else if (mode === 'tafseer') {
        this.loadTafseer();
      } else if (mode === 'full-surah') {
        this.loadSurahVerses(this.currentVerseData.surah);
      } else {
        if (this.originalSurah) {
          const verse = this.allVerses.find(v => v.surah === this.originalSurah && v.verse === 1);
          if (verse) {
            this.currentVerseData = { ...verse };
            this.currentTextParts = this.segmentText(verse.text);
            this.currentPartIndex = 0;
            this.displayedWords = [];
            this.displayCurrentPart();
          }
          this.originalSurah = null;
        } else {
          this.selectVerse();
        }
        
        if (this.currentTextParts.length > 0) {
          this.currentPartIndex = Math.min(this.currentPartIndex + 1, this.currentTextParts.length - 1);
          this.displayCurrentPart();
        }
        
        if (this.isAudioPlaying) {
          this.$nextTick(() => {
            this.playCurrentVerse();
          });
        }
      }
    },
    
    // Lazy Loading for verses
    lazyLoadVerses() {
      if (!this.currentSurahData) return;
      const versesContainer = this.$refs.versesContainer;
      if (!versesContainer) return;

      const verses = this.currentSurahData.verses;
      const chunkSize = 10;
      let loadedIndex = 0;

      const loadMoreVerses = (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && loadedIndex < verses.length) {
            const nextChunk = verses.slice(loadedIndex, loadedIndex + chunkSize);
            this.displayedVerses = [...this.displayedVerses, ...nextChunk];
            loadedIndex += chunkSize;
          }
        });
      };

      const observer = new IntersectionObserver(loadMoreVerses, {
        root: versesContainer,
        threshold: 0.1,
      });

      const sentinel = document.createElement('div');
      versesContainer.appendChild(sentinel);
      observer.observe(sentinel);

      // Initial load
      this.displayedVerses = verses.slice(0, chunkSize);
      loadedIndex = chunkSize;
    },
    
    // Hifz Select Fix
    handleSelectClick(event) {
      event.stopPropagation();
      event.target.focus();
      if (event.target.size === 0) {
        event.target.size = 5;
        setTimeout(() => {
          event.target.size = 0;
        }, 1000);
      }
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
    const surah = SURAH_DATA.find(s => s.id === this.selectedSurah);
    this.verseOptions = Array.from({ length: surah.verses }, (_, i) => i + 1);
    this.selectedVerse = 1;
  },
  selectSurahVerse() {
    const verse = this.allVerses.find(v => v.surah === this.selectedSurah && v.verse === this.selectedVerse);
    if (verse) {
      this.currentVerseData = { ...verse };
      this.currentTextParts = this.segmentText(verse.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.clearAnimationTimers();
      this.displayCurrentPart();
      this.showSurahVerseMenu = false;
    }
  },

async loadTafseer() {
  if (!this.currentVerseData || this.currentLanguage !== 'ar') {
    this.errorMessage = this.getLocalizedErrorMessage('tafseerNotAvailable');
    return;
  }
  this.originalSurah = this.currentVerseData.surah;
  this.isLoading = true;
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
selectVerse(next = true) {
    if (this.displayMode === 'hifz') {
      this.selectNextHifzVerse()
      return
    }
  this.clearAnimationTimers();
  this.displayedWords = [];
  if (!this.allVerses || this.allVerses.length === 0) {
    this.currentVerseData = null;
    this.currentTextParts = [];
    if (!this.isLoading && !this.errorMessage) {
      this.errorMessage = this.getLocalizedErrorMessage('noVersesAvailable');
    }
    return;
  }
  let newIndex;
  if (this.isShuffleMode) {
    newIndex = Math.floor(Math.random() * this.allVerses.length);
  } else if (next && this.currentVerseData) {
    const currentSurah = this.currentVerseData.surah;
    const currentVerseNum = this.currentVerseData.verse;
    const surahInfo = SURAH_DATA.find(s => s.id === currentSurah);
    if (currentVerseNum < surahInfo.verses) {
      // Next verse in same surah
      newIndex = this.allVerses.findIndex(verse => verse.surah === currentSurah && verse.verse === currentVerseNum + 1);
    } else if (currentSurah < 114) {
      // First verse of next surah
      newIndex = this.allVerses.findIndex(verse => verse.surah === currentSurah + 1 && verse.verse === 1);
    } else {
      // Loop to Surah 1, Verse 1
      newIndex = this.allVerses.findIndex(verse => verse.surah === 1 && verse.verse === 1);
    }
  } else {
    newIndex = this.allVerses.findIndex(verse => verse.surah === 1 && verse.verse === 1); // Start from first verse
  }
  if (newIndex === -1) {
    console.error('Next verse not found, falling back to random');
    newIndex = 1;
  }
  this.currentVerseData = { ...this.allVerses[newIndex] };
  this.currentTextParts = this.segmentText(this.currentVerseData.text);
  this.currentPartIndex = 0;
  this.errorMessage = null;
  this.displayCurrentPart();
},
    searchPagination(direction) {
    this.currentPage += direction;
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > Math.ceil(this.searchResults.length / this.resultsPerPage)) {
      this.currentPage = Math.ceil(this.searchResults.length / this.resultsPerPage);
    }
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
  
  return surah.ayahs.map(ayah => ({
    uuid: `${surah.number}:${ayah.numberInSurah}-${this.currentLanguage}`,
    surah: surah.number,
    verse: ayah.numberInSurah,
    verseKey: `${surah.number}:${ayah.numberInSurah}`,
    text: ayah.text,
    surahArabicName: surahInfo.arabicName,
    surahEnglishName: surahInfo.englishName,
    audio: ayah.audio || null,
    language: this.currentLanguage,
  }));
},

selectInitialLanguage(lang) {
  this.currentLanguage = lang;
  localStorage.setItem('language', lang);
  this.showLanguageSelection = false;
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

setLanguage(lang) {
  this.currentLanguage = lang;
  localStorage.setItem('language', lang);
  this.showLanguageMenu = false;
  this.loadInitialData().then(() => {
    if (this.allVerses.length > 0 && !this.errorMessage) {
      this.selectVerse();
    } else if (!this.errorMessage) {
      this.errorMessage = this.getLocalizedErrorMessage('noDataAfterLoad');
      this.isLoading = false;
    }
  });
},
async loadInitialData() {
  this.isLoading = true;
  this.cacheStatus = 'checking';
  try {
    if ('serviceWorker' in navigator && 'caches' in window) {
      const cached = await this.checkServiceWorkerCache();
      if (cached) {
        this.cacheStatus = 'cached';
        this.allVerses = cached;
        console.log('Loaded from SW cache:', this.allVerses);
        this.selectVerse();
        return;
      }
    }
    const indexedDBCache = await this.getIndexedDBCache();
    if (indexedDBCache && indexedDBCache.length > 0) {
      this.cacheStatus = 'cached';
      this.allVerses = indexedDBCache;
      console.log('Loaded from IndexedDB:', this.allVerses);
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

handleAppTouchMove(event) {
  if (!this.isHoldingGlobal || this.hasSwiped || this.showSearchOverlay || this.showVoiceSearchOverlay) return;
  if (event.changedTouches.length > 0) {
    const touchX = event.changedTouches[0].clientX;
    const touchY = event.changedTouches[0].clientY;
    const deltaY = this.touchStartY - touchY;
    const deltaX = Math.abs(this.touchStartX - touchX);
    const timeElapsed = Date.now() - this.touchStartTime;
    console.log('Touch move - x:', touchX, 'y:', touchY, 'deltaY:', deltaY, 'deltaX:', deltaX, 'time:', timeElapsed);
    if (Math.abs(deltaY) > this.SWIPE_THRESHOLD && deltaX < this.SWIPE_HORIZONTAL_THRESHOLD && timeElapsed < this.SWIPE_TIME_THRESHOLD) {
      this.hasSwiped = true;
      clearTimeout(this.holdStartTimeoutId);
      this.isHoldingGlobal = false;
      if (deltaY > 0) {
        console.log('Swipe up - Opening voice search');
        this.showSearchOverlay = false;
        this.showVoiceSearchOverlay = true;
        this.resetVoiceSearch();
      } else if (deltaY < 0) {
        console.log('Swipe down - Opening text search');
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
      if (this.searchResults.length === 0) {
        this.errorMessage = this.getLocalizedErrorMessage('noResults');
      }
      // Scroll to top of results
      this.$nextTick(() => {
        const resultsContainer = document.querySelector('.search-results');
        if (resultsContainer) resultsContainer.scrollTop = 0;
      });
    }, 300);
  },
  selectSearchResult(result) {
    const verse = this.allVerses.find(v => v.uuid === result.uuid);
    if (verse) {
      this.currentVerseData = { ...verse };
      this.currentTextParts = this.segmentText(verse.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.clearAnimationTimers();
      this.displayCurrentPart();
      this.showSearchOverlay = false;
      this.searchQuery = '';
      this.searchResults = [];
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
    this.detectedWords = transcript.split(' ').filter(word => word.trim());
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

startWordSelection(event, index) {
    if (this.displayMode !== 'hifz') return;
    event.preventDefault();
    this.isSelectingWords = true;
    this.selectedWordIndices = [index];
    this.showHighlightMenu = false;
  },
  updateWordSelection(event, index) {
    if (this.displayMode !== 'hifz' || !this.isSelectingWords) return;
    event.preventDefault();
    if (!this.selectedWordIndices.includes(index)) {
      const minIndex = Math.min(...this.selectedWordIndices, index);
      const maxIndex = Math.max(...this.selectedWordIndices, index);
      this.selectedWordIndices = Array.from(
        { length: maxIndex - minIndex + 1 },
        (_, i) => minIndex + i
      );
    }
  },
  endWordSelection() {
    if (this.displayMode !== 'hifz' || !this.isSelectingWords) return;
    this.isSelectingWords = false;
    if (this.selectedWordIndices.length > 0) {
      const rect = document.querySelector(`.pulsing-word:nth-child(${this.selectedWordIndices[0] + 1})`).getBoundingClientRect();
      this.highlightMenuPosition = {
        top: rect.top - 60,
        left: rect.left + rect.width / 2 - 80,
      };
      this.showHighlightMenu = true;
    }
  },
  applyHighlight(color) {
    if (!this.currentVerseData) return;
    const verseUuid = this.currentVerseData.uuid;
    if (!this.highlights[verseUuid]) this.highlights[verseUuid] = {};
    this.selectedWordIndices.forEach(index => {
      this.highlights[verseUuid][index] = color;
    });
    this.saveVerseHighlights();
    this.showHighlightMenu = false;
    this.selectedWordIndices = [];
  },
  removeHighlight() {
    if (!this.currentVerseData) return;
    const verseUuid = this.currentVerseData.uuid;
    this.selectedWordIndices.forEach(index => {
      delete this.highlights[verseUuid][index];
    });
    this.saveVerseHighlights();
    this.showHighlightMenu = false;
    this.selectedWordIndices = [];
  },
  async saveVerseHighlights() {
    if (!this.currentVerseData) return;
    const db = await this.$indexedDB;
    const tx = db.transaction('highlights', 'readwrite');
    const store = tx.objectStore('highlights');
    await store.put({
      uuid: this.currentVerseData.uuid,
      highlights: this.highlights[this.currentVerseData.uuid] || {},
    });
  },
async loadVerseHighlights() {
  if (!this.currentVerseData) return;
  try {
    const db = await this.$indexedDB;
    if (!db) return;
    const tx = db.transaction('highlights', 'readonly');
    const store = tx.objectStore('highlights');
    const highlight = await store.get(this.currentVerseData.uuid);
    this.highlightedParts = highlight ? highlight.indices : [];
  } catch (error) {
    console.error('Error loading highlights:', error);
    this.errorMessage = this.getLocalizedErrorMessage('loadHighlightError', error.message);
  }
},
  isWordHighlighted(index) {
    if (!this.currentVerseData) return false;
    const verseUuid = this.currentVerseData.uuid;
    return this.highlights[verseUuid] && this.highlights[verseUuid][index];
  },
  getHighlightClass(index) {
    if (!this.currentVerseData) return '';
    const verseUuid = this.currentVerseData.uuid;
    const color = this.highlights[verseUuid] && this.highlights[verseUuid][index];
    return color ? `highlight-${color.replace('#', '')}` : '';
  },

toggleAudio() {
  if (!this.currentVerseData) return;

  if (this.isAudioPlaying) {
    this.currentAudio.pause();
    this.isAudioPlaying = false;
  } else {
    this.initAudioPlayback();
  }
},
readNextVerseAudio() {
  if (this.isAudioPlaying && this.displayMode !== 'hifz') {
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
    if (this.$refs.searchInput) {
      this.$refs.searchInput.focus();
    }
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

displayCurrentPart() {
  // Clear any ongoing animations and timers
  this.clearAnimationTimers();

  // Clear previous words immediately
  this.displayedWords = [];

  // Force DOM update to ensure screen is cleared
  this.$forceUpdate();
  this.$nextTick(() => {
    // Check if there's valid data to display
    if (!this.currentVerseData || this.currentPartIndex >= this.currentTextParts.length) {
      console.log('No more parts, moving to next verse');
      this.partTimeoutId = setTimeout(() => this.selectVerse(true), this.NEXT_VERSE_DELAY);
      return;
    }

    const partText = this.currentTextParts[this.currentPartIndex];
    this.currentPartWords = partText.split(' ').filter(word => word.trim() !== '');
    console.log('Displaying part:', this.currentPartIndex, 'Words:', this.currentPartWords);

    // Start animating words
    this.animateWords();

    // Calculate duration for this part
    let currentPartDuration = this.PART_DISPLAY_DURATION;
    if (this.currentPartWords.length < (this.WORDS_PER_PART * 0.8) && this.WORDS_PER_PART > 0) {
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
    console.log('Part duration:', currentPartDuration);

    // Schedule the next part
    this.partTimeoutId = setTimeout(() => this.displayNextPart(), currentPartDuration);
  });
},

displayNextPart() {
  if (this.currentPartIndex < this.currentTextParts.length - 1) {
    this.currentPartIndex++;
    this.displayCurrentPart();
  }
},

animateWords() {
  let wordIndex = 0; // Start fresh for the new part
  this.displayedWords = []; // Ensure cleared again before animation
  console.log('Starting word animation for part:', this.currentPartIndex);
  this.wordIntervalId = setInterval(() => {
    if (wordIndex < this.currentPartWords.length) {
      this.displayedWords = [...this.displayedWords, this.currentPartWords[wordIndex]];
      wordIndex++;
      console.log('Added word:', this.currentPartWords[wordIndex - 1], 'Total words:', this.displayedWords.length);
    } else {
      clearInterval(this.wordIntervalId);
      this.wordIntervalId = null;
      console.log('Word animation completed');
    }
  }, this.WORD_ANIMATION_INTERVAL);
},

clearAnimationTimers() {
  if (this.wordIntervalId) {
    clearInterval(this.wordIntervalId);
    this.wordIntervalId = null;
  }
  if (this.partTimeoutId) {
    clearTimeout(this.partTimeoutId);
    this.partTimeoutId = null;
  }
  console.log('Cleared animation timers');
},

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
    console.log('Toggling pause: Resuming');
    this.resumeVerseDisplayFromPause();
  } else {
    console.log('Toggling pause: Pausing');
    this.pauseVerseDisplayByPause();
  }
},

pauseVerseDisplayByPause() {
  if (this.isLoading || this.errorMessage || !this.currentVerseData || this.isPausedByPause) {
    return;
  }
  this.isPausedByPause = true;
  console.log('Paused by pause button');
  if (this.wordIntervalId) {
    clearInterval(this.wordIntervalId);
    this.wordIntervalId = null;
  }
  if (this.partTimeoutId) {
    const elapsedTime = Date.now() - this.partTimeoutStartTime;
    this.pausedPartRemainingTime = this.currentActivePartDuration - elapsedTime;
    if (this.pausedPartRemainingTime < 0) this.pausedPartRemainingTime = 0;
    clearTimeout(this.partTimeoutId);
    this.partTimeoutId = null;
    console.log('Part timeout paused. Remaining:', this.pausedPartRemainingTime);
  } else {
    this.pausedPartRemainingTime = 0;
  }
},

resumeVerseDisplayFromPause() {
  if (!this.isPausedByPause) return;
  console.log('Resuming from pause button');
  this.isPausedByPause = false;

  // Resume animating remaining words if any
  if (this.currentPartWords && this.currentPartWords.length > this.displayedWords.length) {
    let wordIndex = this.displayedWords.length;
    this.wordIntervalId = setInterval(() => {
      if (wordIndex < this.currentPartWords.length) {
        this.displayedWords.push(this.currentPartWords[wordIndex]);
        wordIndex++;
      } else {
        clearInterval(this.wordIntervalId);
        this.wordIntervalId = null;
      }
    }, this.WORD_ANIMATION_INTERVAL);
  }

  // Resume part timeout if remaining time exists
  if (this.pausedPartRemainingTime > 0) {
    const resumeCallback = (this.currentVerseData && this.currentTextParts.length > 0 && this.currentPartIndex < this.currentTextParts.length)
      ? this.displayNextPart
      : this.selectVerse;
    this.partTimeoutId = setTimeout(resumeCallback, this.pausedPartRemainingTime);
    this.partTimeoutStartTime = Date.now();
  }
},

resumeVerseDisplayFromPause() {
  if (!this.isPausedByPause) return;
  console.log('Resuming from pause button');
  if (this.currentPartWords && this.currentPartWords.length > 0 && this.displayedWords.length < this.currentPartWords.length) {
    this.animateWords();
  }
  if (this.pausedPartRemainingTime > 0) {
    const resumeCallback = (this.currentVerseData && this.currentTextParts.length > 0 && this.currentPartIndex < this.currentTextParts.length)
      ? this.displayNextPart
      : this.selectVerse;
    this.partTimeoutId = setTimeout(resumeCallback, this.pausedPartRemainingTime);
    this.partTimeoutStartTime = Date.now();
  }
  this.isPausedByPause = false;
},

pauseVerseDisplayByHold() {
  if (this.isLoading || this.errorMessage || !this.currentVerseData || this.isPausedByHold) {
    return;
  }
  this.isPausedByHold = true;
  console.log('Paused by hold');
  if (this.wordIntervalId) {
    clearInterval(this.wordIntervalId);
    this.wordIntervalId = null;
  }
  if (this.partTimeoutId) {
    const elapsedTime = Date.now() - this.partTimeoutStartTime;
    this.pausedPartRemainingTime = this.currentActivePartDuration - elapsedTime;
    if (this.pausedPartRemainingTime < 0) this.pausedPartRemainingTime = 0;
    clearTimeout(this.partTimeoutId);
    this.partTimeoutId = null;
    console.log('Part timeout paused by hold. Remaining:', this.pausedPartRemainingTime);
  } else {
    this.pausedPartRemainingTime = 0;
  }
},

resumeVerseDisplayFromHold() {
  if (!this.isPausedByHold) return;
  console.log('Resuming from hold');
  if (this.currentPartWords && this.currentPartWords.length > 0 && this.displayedWords.length < this.currentPartWords.length) {
    this.animateWords();
  }
  if (this.pausedPartRemainingTime > 0) {
    const resumeCallback = (this.currentVerseData && this.currentTextParts.length > 0 && this.currentPartIndex < this.currentTextParts.length)
      ? this.displayNextPart
      : this.selectVerse;
    this.partTimeoutId = setTimeout(resumeCallback, this.pausedPartRemainingTime);
    this.partTimeoutStartTime = Date.now();
  }
  this.isPausedByHold = false;
},

displayCurrentPart() {
  this.clearAnimationTimers();

  if (!this.currentVerseData || this.currentPartIndex >= this.currentTextParts.length) {
    this.displayedWords = [];
    this.partTimeoutId = setTimeout(this.selectVerse, this.NEXT_VERSE_DELAY);
    return;
  }

  const partText = this.currentTextParts[this.currentPartIndex];
  this.currentPartWords = partText.split(' ').filter(word => word.trim() !== '');
  this.displayedWords = [];
  this.animateWords();

  let currentPartDuration = this.PART_DISPLAY_DURATION;
  if (this.currentPartWords.length < (this.WORDS_PER_PART * 0.8) && this.WORDS_PER_PART > 0) {
    const proportion = this.currentPartWords.length / this.WORDS_PER_PART;
    currentPartDuration = Math.max(proportion * this.PART_DISPLAY_DURATION, (this.currentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000);
  }
  const minDurationForAnimation = (this.currentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000;
  currentPartDuration = Math.max(currentPartDuration, minDurationForAnimation);

  this.currentActivePartDuration = currentPartDuration;
  this.partTimeoutStartTime = Date.now();
  this.partTimeoutId = setTimeout(this.displayNextPart, currentPartDuration);
},
handleAppMouseDown(event) {
  // Skip if clicking on inputs, buttons, or overlays
  if (
    event.target.closest('input') ||
    event.target.closest('button') ||
    event.target.closest('.control-buttons-container') ||
    event.target.closest('.search-overlay') ||
    event.target.closest('.voice-search-overlay')
  ) {
    return;
  }
  event.preventDefault();
  this.isHoldingGlobal = true;
  clearTimeout(this.holdStartTimeoutId);
  if (!this.isPausedByHold) {
    this.holdStartTimeoutId = setTimeout(() => {
      if (this.isHoldingGlobal && !this.hasSwiped) {
        this.pauseVerseDisplayByHold();
      }
    }, this.HOLD_THRESHOLD);
  }
  console.log('Mouse down at x:', event.clientX);
},

handleAppTouchStart(event) {
  // Skip if touching inputs, buttons, or overlays
  if (
    event.target.closest('input') ||
    event.target.closest('button') ||
    event.target.closest('.control-buttons-container') ||
    event.target.closest('.search-overlay') ||
    event.target.closest('.voice-search-overlay')
  ) {
    return;
  }
  event.preventDefault();
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
      if (this.isHoldingGlobal && !this.hasSwiped) {
        this.pauseVerseDisplayByHold();
      }
    }, this.HOLD_THRESHOLD);
  }
  console.log('Touch start at x:', this.touchStartX, 'y:', this.touchStartY, 'time:', this.touchStartTime);
},
handleAppMouseUp(event) {
  const isControlButtonClick = event.target.closest('.control-buttons-container') ||
                              event.target.closest('.search-overlay') ||
                              event.target.closest('.voice-search-overlay');
  clearTimeout(this.holdStartTimeoutId);
  if (this.isPausedByHold && !this.hasSwiped) {
    if (!isControlButtonClick) {
      this.resumeVerseDisplayFromHold();
    }
    this.isHoldingGlobal = false;
    return;
  }
  if (this.isHoldingGlobal && !isControlButtonClick) {
    if (this.isPausedByPause) {
      console.log('Resuming from pause due to UI click');
      this.resumeVerseDisplayFromPause();
    }
    const clickX = event.clientX;
    const screenWidth = window.innerWidth;
    const isArabic = this.currentLanguage === 'ar';
    if ((clickX > screenWidth / 2 && !isArabic) || (clickX <= screenWidth / 2 && isArabic)) {
      console.log('Mouse up - Next verse');
      this.selectVerse(true);
    } else {
      console.log('Mouse up - Previous verse');
      this.displayPreviousVerse();
    }
  }
  this.isHoldingGlobal = false;
  console.log('Mouse up at x:', event.clientX);
},

handleAppTouchEnd(event) {
  const isControlButtonTouch =
    event.target.closest('.control-buttons-container') ||
    event.target.closest('.notes-overlay') ||
    event.target.closest('.loops-overlay') ||
    event.target.closest('.highlight-menu') ||
    event.target.closest('.search-overlay') ||
    event.target.closest('.voice-search-overlay');
  clearTimeout(this.holdStartTimeoutId);
  if (this.isPausedByHold && !this.hasSwiped) {
    if (!isControlButtonTouch) {
      this.resumeVerseDisplayFromHold();
    }
    this.isHoldingGlobal = false;
    this.touchStartX = null;
    this.touchStartY = null;
    this.touchStartTime = null;
    this.hasSwiped = false;
    return;
  }
  if (this.isHoldingGlobal && !isControlButtonTouch && this.touchStartY !== null && !this.hasSwiped) {
    if (this.isPausedByPause) {
      console.log('Resuming from pause due to UI tap');
      this.resumeVerseDisplayFromPause();
    }
    if (event.changedTouches.length > 0) {
      const touchX = event.changedTouches[0].clientX;
      const screenWidth = window.innerWidth;
      const isArabic = this.currentLanguage === 'ar';
      const currentTime = Date.now();
      const isDoubleTap = currentTime - this.lastTapTime < this.DOUBLE_TAP_THRESHOLD;

      if (this.displayMode === 'tafseer') {
        if (isDoubleTap) {
          if ((touchX > screenWidth / 2 && !isArabic) || (touchX <= screenWidth / 2 && isArabic)) {
            console.log('Double tap - Next Surah');
            this.selectVerse(true);
            this.loadTafseer();
          } else {
            console.log('Double tap - Previous Surah');
            this.displayPreviousVerse();
            this.loadTafseer();
          }
        } else {
          if ((touchX > screenWidth / 2 && !isArabic) || (touchX <= screenWidth / 2 && isArabic)) {
            console.log('Single tap - Next Tafseer part');
            this.displayNextPart();
          } else {
            console.log('Single tap - Previous Tafseer part');
            this.displayPreviousPart();
          }
        }
      } else if (this.displayMode === 'hifz') {
        if (!this.isSelectingWords) {
          if ((touchX > screenWidth / 2 && !isArabic) || (touchX <= screenWidth / 2 && isArabic)) {
            console.log('Tap - Next Hifz verse');
            this.selectNextHifzVerse();
          } else {
            console.log('Tap - Previous Hifz verse');
            this.displayPreviousVerse();
          }
        }
      } else {
        if ((touchX > screenWidth / 2 && !isArabic) || (touchX <= screenWidth / 2 && isArabic)) {
          console.log('Tap - Next verse');
          this.selectVerse(true);
        } else {
          console.log('Tap - Previous verse');
          this.displayPreviousVerse();
        }
      }

      this.lastTapTime = currentTime;
    }
  }
  this.isHoldingGlobal = false;
  this.touchStartX = null;
  this.touchStartY = null;
  this.touchStartTime = null;
  this.hasSwiped = false;
},


enterHifzMode() {
  this.isPausedByPause = false;
  this.isPausedByHold = false;
  this.currentLoop = 1;
  this.updateHifzVerseQueue();
  this.currentVerseData = this.hifzVerseQueue[0] || this.currentVerseData;
  this.currentTextParts = this.segmentText(this.currentVerseData.text);
  this.currentPartIndex = 0;
  this.displayedWords = [];
  this.clearAnimationTimers();
  this.displayCurrentPart();
  this.loadVerseNote();
  this.loadVerseCompletion();
  this.loadVerseHighlights();
},

updateHifzVerseQueue() {
  if (!this.currentVerseData) return;
  const currentSurah = this.currentVerseData.surah;
  const currentVerseNum = this.currentVerseData.verse;
  const versesInRange = [];
  let verseCount = 0;
  let surah = currentSurah;
  let verseNum = currentVerseNum;

  while (verseCount < this.hifzLoopCount && surah <= 114) {
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

  this.hifzVerseQueue = versesInRange;
  this.hifzCurrentVerseIndex = 0;
},
  exitHifzMode() {
    this.displayMode = 'verse';
    this.selectVerse();
  },
  toggleNotesOverlay() {
    this.showNotesOverlay = !this.showNotesOverlay;
    if (this.showNotesOverlay) {
      this.loadVerseNote();
    }
  },
  async loadVerseNote() {
    if (!this.currentVerseData) return;
    const db = await this.$indexedDB;
    const tx = db.transaction('notes', 'readonly');
    const store = tx.objectStore('notes');
    const note = await store.get(this.currentVerseData.uuid);
    this.currentNote = note ? note.text : '';
  },
  async saveVerseNote() {
    if (!this.currentVerseData) return;
    const db = await this.$indexedDB;
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');
    await store.put({
      uuid: this.currentVerseData.uuid,
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
  for (let i = 0; i < this.hifzLoopRange - 1 && current; i++) {
    current = this.getNextVerse(current);
  }
  return current || startVerse;
},
toggleComplete() {
  if (!this.currentVerseData || this.displayMode !== 'hifz') return;

  // Toggle complete status for the current verse
  const verseKey = `${this.currentVerseData.surah}:${this.currentVerseData.verse}`;
  this.completedVerses[verseKey] = !this.completedVerses[verseKey];

  // Check if all verses in the current loop are complete
  const loopVerses = this.getCurrentLoopVerses();
  const allComplete = loopVerses.every(verse => {
    const key = `${verse.surah}:${verse.verse}`;
    return this.completedVerses[key];
  });

  if (allComplete) {
    // Move to the next verse after the current loop
    const lastVerseInLoop = loopVerses[loopVerses.length - 1];
    const nextVerse = this.getNextVerse(lastVerseInLoop);
    if (nextVerse) {
      this.currentVerseData = nextVerse;
      this.currentLoopStartVerse = nextVerse;
      this.currentLoopEndVerse = this.getLoopEndVerse(nextVerse);
      this.hifzLoopCount = this.defaultHifzLoopCount;
      this.currentLoopIteration = 0;
      // Reset completed status for new loop
      loopVerses.forEach(verse => {
        const key = `${verse.surah}:${verse.verse}`;
        this.completedVerses[key] = false;
      });
    }
  }

  // Save to IndexedDB
  this.saveCompletedVerses();
},
  startCompleteHold(event) {
    this.completeHoldTimeout = setTimeout(() => {
      if (this.displayMode === 'hifz') {
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
async loadVerseCompletion() {
  if (!this.currentVerseData) return;
  try {
    const db = await this.$indexedDB;
    if (!db) return;
    const tx = db.transaction('completions', 'readonly');
    const store = tx.objectStore('completions');
    const completion = await store.get(this.currentVerseData.uuid);
    this.completions[this.currentVerseData.uuid] = completion ? completion.completed : false;
    this.isVerseCompleted = this.completions[this.currentVerseData.uuid] || false;
  } catch (error) {
    console.error('Error loading completion:', error);
    this.errorMessage = this.getLocalizedErrorMessage('loadCompletionError', error.message);
  }
},
  completeCurrentLoop() {
    this.currentLoop++;
    if (this.currentLoop > this.hifzLoopCount) {
      this.currentLoop = 1;
      this.hifzVerseQueue = [];
    }
    this.selectNextHifzVerse();
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
      this.hifzLoopCount = Math.max(0, Math.min(100, this.hifzLoopCount + increment));
      this.loopSwipeStartY = currentY;
      // Vibrate on change
      if (navigator.vibrate) navigator.vibrate(50);
    }
  },
  endLoopSwipe() {
    this.loopSwipeStartY = null;
  },
selectNextHifzVerse() {
  if (this.hifzVerseQueue.length === 0) return;
  this.hifzCurrentVerseIndex = (this.hifzCurrentVerseIndex + 1) % this.hifzVerseQueue.length;
  this.currentVerseData = { ...this.hifzVerseQueue[this.hifzCurrentVerseIndex] };
  this.currentTextParts = this.segmentText(this.currentVerseData.text);
  this.currentPartIndex = 0;
  this.displayedWords = [];
  this.clearAnimationTimers();
  this.displayCurrentPart();
  this.loadVerseNote();
  this.loadVerseCompletion();
  this.loadVerseHighlights();
},

displayPreviousVerse() {
  if (this.displayMode === 'hifz') {
    if (this.hifzVerseQueue.length === 0) return;
    this.hifzCurrentVerseIndex = (this.hifzCurrentVerseIndex - 1 + this.hifzVerseQueue.length) % this.hifzVerseQueue.length;
    this.currentVerseData = { ...this.hifzVerseQueue[this.hifzCurrentVerseIndex] };
    this.currentTextParts = this.segmentText(this.currentVerseData.text);
    this.currentPartIndex = 0;
    this.displayedWords = [];
    this.clearAnimationTimers();
    this.displayCurrentPart();
    this.loadVerseNote();
    this.loadVerseCompletion();
    this.loadVerseHighlights();
  } else {
    if (!this.currentVerseData) return;
    let prevVerse = null;
    if (this.currentVerseData.verse > 1) {
      prevVerse = this.allVerses.find(
        v => v.surah === this.currentVerseData.surah && v.verse === this.currentVerseData.verse - 1
      );
    } else if (this.currentVerseData.surah > 1) {
      const prevSurah = SURAH_DATA.find(s => s.id === this.currentVerseData.surah - 1);
      prevVerse = this.allVerses.find(
        v => v.surah === this.currentVerseData.surah - 1 && v.verse === prevSurah.verses
      );
    }
    if (prevVerse) {
      this.currentVerseData = { ...prevVerse };
      this.currentTextParts = this.segmentText(prevVerse.text);
      this.currentPartIndex = 0;
      this.displayedWords = [];
      this.clearAnimationTimers();
      this.displayCurrentPart();
      this.loadVerseNote();
      this.loadVerseCompletion();
      this.loadVerseHighlights();
    }
  }
},

handleAppTouchMove(event) {
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
      } else if (deltaY < 0) {
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

handleAppTouchMove(event) {
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

handleAppMouseLeave() {
  if (this.isHoldingGlobal) {
    clearTimeout(this.holdStartTimeoutId);
    this.isHoldingGlobal = false;
    console.log('Mouse left container');
  }
},
displayPreviousPart() {
  if (this.currentPartIndex > 0) {
    this.currentPartIndex--;
    this.displayCurrentPart();
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
  },

  async mounted() {
    this.$indexedDB = await this.initIndexedDB();
    const db = await this.$indexedDB;
    await db.transaction('notes', 'readwrite').objectStore('notes');
    await db.transaction('completions', 'readwrite').objectStore('completions');
    await db.transaction('highlights', 'readwrite').objectStore('highlights');
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    
    // Show mushaf selection when Arabic is selected
    if (this.currentLanguage === 'ar') {
      this.showMushafSelection = true;
    } else {
      await this.loadInitialData();
      if (this.allVerses.length > 0 && !this.errorMessage) {
        this.selectVerse();
      } else if (!this.errorMessage) {
        this.errorMessage = this.getLocalizedErrorMessage('noDataAfterLoad');
        this.isLoading = false;
      }
    }
  },
  
  beforeUnmount() {
    this.clearAnimationTimers();
    this.stopSpeechRecognition();
  }
};
</script>

<style>
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
  width: 2.75rem; /* ~44px */
  height: 2.75rem; /* ~44px */
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
  padding: 2rem;
  z-index: 8;
  background: rgba(0, 0, 0, 0.327);
  backdrop-filter: blur(12px);
}

.search-overlay.light-theme {
  background: rgba(255, 255, 255, 0.411);
}

.search-container {
  width: 100%;
  max-width: 800px;
  display: flex;
  gap: 1rem;
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
  margin-top: 2rem;
  max-height: calc(100vh - 150px);

}

.search-result-item {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.5rem;
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

.hifz-mode .control-button {
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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


.full-surah-display {
  max-height: 80vh;
  overflow-y: auto;
  padding: 1rem;
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
  background: rgba(0, 0, 0, 0.7);
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
  max-height: 80vh;
  overflow-y: auto;
  padding: 1rem;
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
  background: rgba(0, 0, 0, 0.7);
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
  .control-buttons-container {
    bottom: 70px;
    right: 10px;
  }
}
</style>