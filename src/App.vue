<template>
  <div :class="['app-container', currentTheme === 'dark' ? 'dark-theme' : 'light-theme']">
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
      >        <p
          class="quran-verse-text-content text-3xl md:text-5xl font-amiri max-w-4xl mx-auto leading-loose"
          :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'"
        >
          <transition-group name="word-fade" tag="span">
            <span
              v-for="(word, index) in displayedWords"
              :key="`${currentVerseData.uuid}-${currentPartIndex}-${index}-${currentLanguage}-word`"
              class="inline-block mx-1.5 pulsing-word" :class="currentLanguage == 'ar' ? ' mb-12' : ' mb-5'"
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
    <div v-if="!isLoading && !errorMessage && currentVerseData" class="bottom-info text-sm font-amiri fixed bottom-5 w-full text-center" :dir="currentLanguage === 'ar' ? 'rtl' : 'ltr'">
      <p>
        <span>{{ currentLanguage === 'ar' ? currentVerseData.surahArabicName : currentVerseData.surahEnglishName }}</span>
        <span class="mx-1">-</span>
        <span>{{ currentLanguage === 'ar' ? 'الآية' : 'Verse' }} {{ currentVerseData.verse }}</span>
      </p>
    </div>

    <!-- Control Buttons: Language and Theme -->
    <div class="control-buttons-container fixed max-sm:bottom-12 bottom-5 sm:right-5 flex space-x-2 z-50">
      <button @click="toggleLanguage" class="control-button opacity-30 hover:opacity-100" :aria-label="currentLanguage === 'ar' ? 'Switch to English' : 'Switch to Arabic'">
        {{ currentLanguage === 'ar' ? 'EN' : 'AR' }}
      </button>
      <button @click="toggleTheme" class="control-button theme-toggle-button opacity-30 hover:opacity-100" :aria-label="currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'">
        <svg v-if="currentTheme === 'dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 7.758a.75.75 0 001.06-1.06L5.634 5.106a.75.75 0 00-1.06 1.06l1.59 1.591z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
          <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.713-6.636 4.362-8.528a.75.75 0 01.818.162z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
// Helper data for Surah names.
// IMPORTANT: This needs to be populated with all 114 Surahs.
const SURAH_DATA = [
  { id: 1, arabicName: "الفاتحة", englishName: "Al-Fatiha" },
  { id: 2, arabicName: "البقرة", englishName: "Al-Baqarah" },
  { id: 3, arabicName: "آل عمران", englishName: "Aal-i-Imran" },
  { id: 4, arabicName: "النساء", englishName: "An-Nisa" },
  { id: 5, arabicName: "المائدة", englishName: "Al-Ma'idah" },
  { id: 6, arabicName: "الأنعام", englishName: "Al-An'am" },
  { id: 7, arabicName: "الأعراف", englishName: "Al-A'raf" },
  { id: 8, arabicName: "الأنفال", englishName: "Al-Anfal" },
  { id: 9, arabicName: "التوبة", englishName: "At-Tawbah" },
  { id: 10, arabicName: "يونس", englishName: "Yunus" },
  { id: 11, arabicName: "هود", englishName: "Hud" },
  { id: 12, arabicName: "يوسف", englishName: "Yusuf" },
  { id: 13, arabicName: "الرعد", englishName: "Ar-Ra'd" },
  { id: 14, arabicName: "ابراهيم", englishName: "Ibrahim" },
  { id: 15, arabicName: "الحجر", englishName: "Al-Hijr" },
  { id: 16, arabicName: "النحل", englishName: "An-Nahl" },
  { id: 17, arabicName: "الإسراء", englishName: "Al-Isra" },
  { id: 18, arabicName: "الكهف", englishName: "Al-Kahf" },
  { id: 19, arabicName: "مريم", englishName: "Maryam" },
  { id: 20, arabicName: "طه", englishName: "Taha" },
  { id: 21, arabicName: "الأنبياء", englishName: "Al-Anbiya" },
  { id: 22, arabicName: "الحج", englishName: "Al-Hajj" },
  { id: 23, arabicName: "المؤمنون", englishName: "Al-Mu'minun" },
  { id: 24, arabicName: "النور", englishName: "An-Nur" },
  { id: 25, arabicName: "الفرقان", englishName: "Al-Furqan" },
  { id: 26, arabicName: "الشعراء", englishName: "Ash-Shu'ara" },
  { id: 27, arabicName: "النمل", englishName: "An-Naml" },
  { id: 28, arabicName: "القصص", englishName: "Al-Qasas" },
  { id: 29, arabicName: "العنكبوت", englishName: "Al-Ankabut" },
  { id: 30, arabicName: "الروم", englishName: "Ar-Rum" },
  { id: 31, arabicName: "لقمان", englishName: "Luqman" },
  { id: 32, arabicName: "السجدة", englishName: "As-Sajdah" },
  { id: 33, arabicName: "الأحزاب", englishName: "Al-Ahzab" },
  { id: 34, arabicName: "سبإ", englishName: "Saba" },
  { id: 35, arabicName: "فاطر", englishName: "Fatir" },
  { id: 36, arabicName: "يس", englishName: "Ya-Sin" },
  { id: 37, arabicName: "الصافات", englishName: "As-Saffat" },
  { id: 38, arabicName: "ص", englishName: "Sad" },
  { id: 39, arabicName: "الزمر", englishName: "Az-Zumar" },
  { id: 40, arabicName: "غافر", englishName: "Ghafir" },
  { id: 41, arabicName: "فصلت", englishName: "Fussilat" },
  { id: 42, arabicName: "الشورى", englishName: "Ash-Shuraa" },
  { id: 43, arabicName: "الزخرف", englishName: "Az-Zukhruf" },
  { id: 44, arabicName: "الدخان", englishName: "Ad-Dukhan" },
  { id: 45, arabicName: "الجاثية", englishName: "Al-Jathiyah" },
  { id: 46, arabicName: "الأحقاف", englishName: "Al-Ahqaf" },
  { id: 47, arabicName: "محمد", englishName: "Muhammad" },
  { id: 48, arabicName: "الفتح", englishName: "Al-Fath" },
  { id: 49, arabicName: "الحجرات", englishName: "Al-Hujurat" },
  { id: 50, arabicName: "ق", englishName: "Qaf" },
  { id: 51, arabicName: "الذاريات", englishName: "Adh-Dhariyat" },
  { id: 52, arabicName: "الطور", englishName: "At-Tur" },
  { id: 53, arabicName: "النجم", englishName: "An-Najm" },
  { id: 54, arabicName: "القمر", englishName: "Al-Qamar" },
  { id: 55, arabicName: "الرحمن", englishName: "Ar-Rahman" },
  { id: 56, arabicName: "الواقعة", englishName: "Al-Waqi'ah" },
  { id: 57, arabicName: "الحديد", englishName: "Al-Hadid" },
  { id: 58, arabicName: "المجادلة", englishName: "Al-Mujadila" },
  { id: 59, arabicName: "الحشر", englishName: "Al-Hashr" },
  { id: 60, arabicName: "الممتحنة", englishName: "Al-Mumtahanah" },
  { id: 61, arabicName: "الصف", englishName: "As-Saf" },
  { id: 62, arabicName: "الجمعة", englishName: "Al-Jumu'ah" },
  { id: 63, arabicName: "المنافقون", englishName: "Al-Munafiqun" },
  { id: 64, arabicName: "التغابن", englishName: "At-Taghabun" },
  { id: 65, arabicName: "الطلاق", englishName: "At-Talaq" },
  { id: 66, arabicName: "التحريم", englishName: "At-Tahrim" },
  { id: 67, arabicName: "الملك", englishName: "Al-Mulk" },
  { id: 68, arabicName: "القلم", englishName: "Al-Qalam" },
  { id: 69, arabicName: "الحاقة", englishName: "Al-Haqqah" },
  { id: 70, arabicName: "المعارج", englishName: "Al-Ma'arij" },
  { id: 71, arabicName: "نوح", englishName: "Nuh" },
  { id: 72, arabicName: "الجن", englishName: "Al-Jinn" },
  { id: 73, arabicName: "المزمل", englishName: "Al-Muzzammil" },
  { id: 74, arabicName: "المدثر", englishName: "Al-Muddaththir" },
  { id: 75, arabicName: "القيامة", englishName: "Al-Qiyamah" },
  { id: 76, arabicName: "الانسان", englishName: "Al-Insan" },
  { id: 77, arabicName: "المرسلات", englishName: "Al-Mursalat" },
  { id: 78, arabicName: "النبإ", englishName: "An-Naba" },
  { id: 79, arabicName: "النازعات", englishName: "An-Nazi'at" },
  { id: 80, arabicName: "عبس", englishName: "Abasa" },
  { id: 81, arabicName: "التكوير", englishName: "At-Takwir" },
  { id: 82, arabicName: "الإنفطار", englishName: "Al-Infitar" },
  { id: 83, arabicName: "المطففين", englishName: "Al-Mutaffifin" },
  { id: 84, arabicName: "الإنشقاق", englishName: "Al-Inshiqaq" },
  { id: 85, arabicName: "البروج", englishName: "Al-Buruj" },
  { id: 86, arabicName: "الطارق", englishName: "At-Tariq" },
  { id: 87, arabicName: "الأعلى", englishName: "Al-Ala" },
  { id: 88, arabicName: "الغاشية", englishName: "Al-Ghashiyah" },
  { id: 89, arabicName: "الفجر", englishName: "Al-Fajr" },
  { id: 90, arabicName: "البلد", englishName: "Al-Balad" },
  { id: 91, arabicName: "الشمس", englishName: "Ash-Shams" },
  { id: 92, arabicName: "الليل", englishName: "Al-Layl" },
  { id: 93, arabicName: "الضحى", englishName: "Ad-Duhaa" },
  { id: 94, arabicName: "الشرح", englishName: "Ash-Sharh" },
  { id: 95, arabicName: "التين", englishName: "At-Tin" },
  { id: 96, arabicName: "العلق", englishName: "Al-Alaq" },
  { id: 97, arabicName: "القدر", englishName: "Al-Qadr" },
  { id: 88, arabicName: "البينة", englishName: "Al-Bayyinah" }, // Corrected ID: 98
  { id: 99, arabicName: "الزلزلة", englishName: "Az-Zalzalah" },
  { id: 100, arabicName: "العاديات", englishName: "Al-Adiyat" },
  { id: 101, arabicName: "القارعة", englishName: "Al-Qari'ah" },
  { id: 102, arabicName: "التكاثر", englishName: "At-Takathur" },
  { id: 103, arabicName: "العصر", englishName: "Al-Asr" },
  { id: 104, arabicName: "الهمزة", englishName: "Al-Humazah" },
  { id: 105, arabicName: "الفيل", englishName: "Al-Fil" },
  { id: 106, arabicName: "قريش", englishName: "Quraysh" },
  { id: 107, arabicName: "الماعون", englishName: "Al-Ma'un" },
  { id: 108, arabicName: "الكوثر", englishName: "Al-Kawthar" },
  { id: 109, arabicName: "الكافرون", englishName: "Al-Kafirun" },
  { id: 110, arabicName: "النصر", englishName: "An-Nasr" },
  { id: 111, arabicName: "المسد", englishName: "Al-Masad" },
  { id: 112, arabicName: "الإخلاص", englishName: "Al-Ikhlas" },
  { id: 113, arabicName: "الفلق", englishName: "Al-Falaq" },
  { id: 114, arabicName: "الناس", englishName: "An-Nas" }
];


export default {
  data() {
    // --- Configuration ---
    const QURAN_AR_FILE = 'quran.json';
    const QURAN_EN_FILE = 'en.json';
    const WORDS_PER_PART = 25; // Adjusted for potentially shorter verses
    const PART_DISPLAY_DURATION = 7000; // Adjusted
    const WORD_ANIMATION_INTERVAL = 150; // Adjusted
    const NEXT_VERSE_DELAY = 2000;
    // ---------------------

    return {
      QURAN_AR_FILE,
      QURAN_EN_FILE,
      WORDS_PER_PART,
      PART_DISPLAY_DURATION,
      WORD_ANIMATION_INTERVAL,
      NEXT_VERSE_DELAY,

      allVerses: [], // Will store full verse objects with all language versions
      currentVerseData: null, // Stores the currently selected full verse object
      
      currentTextParts: [],
      currentPartIndex: 0,

      displayedWords: [],
      currentPartWords: [],
      wordIntervalId: null,
      partTimeoutId: null,
      
      isLoading: true,
      errorMessage: null,

      currentLanguage: 'ar', // 'ar' or 'en'
      currentTheme: 'dark',  // 'dark' or 'light'
    };
  },
  async mounted() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    await this.loadAllVerses();
    if (this.allVerses.length > 0 && !this.errorMessage) {
      this.selectRandomVerse();
    } else if (!this.errorMessage) {
      this.errorMessage = this.currentLanguage === 'ar' ? "لم يتم العثور على بيانات الآيات بعد تحميل جميع الملفات." : "No Quran verse data found after loading all files.";
      this.isLoading = false;
    }
  },
  methods: {
    async loadAllVerses() {
      this.isLoading = true;
      this.errorMessage = null;
      let loadedVerses = [];

      try {
        const [responseAr, responseEn] = await Promise.all([
          fetch(`/books/${this.QURAN_AR_FILE}`),
          fetch(`/books/${this.QURAN_EN_FILE}`)
        ]);

        if (!responseAr.ok) {
          throw new Error(`Failed to fetch ${this.QURAN_AR_FILE}: ${responseAr.statusText}`);
        }
        if (!responseEn.ok) {
          throw new Error(`Failed to fetch ${this.QURAN_EN_FILE}: ${responseEn.statusText}`);
        }

        const quranDataAr = await responseAr.json();
        const quranDataEn = await responseEn.json();

        // Create a lookup for English verses for easier merging
        const englishVersesMap = {};
        for (const chapIdStr in quranDataEn) {
          const chapId = parseInt(chapIdStr);
          if (!englishVersesMap[chapId]) {
            englishVersesMap[chapId] = {};
          }
          quranDataEn[chapIdStr].forEach(verse => {
            englishVersesMap[chapId][verse.verse] = verse.text;
          });
        }
        
        for (const chapIdStr in quranDataAr) {
          const chapterNumber = parseInt(chapIdStr);
          const surahInfo = SURAH_DATA.find(s => s.id === chapterNumber);

          if (!surahInfo) {
            console.warn(`Surah info not found for chapter ${chapterNumber}`);
            continue;
          }

          const versesInChapterAr = quranDataAr[chapIdStr];
          if (Array.isArray(versesInChapterAr)) {
            for (const verseAr of versesInChapterAr) {
              if (verseAr && typeof verseAr.text === 'string' && verseAr.text.trim() !== '') {
                const englishText = (englishVersesMap[chapterNumber] && englishVersesMap[chapterNumber][verseAr.verse])
                                    ? englishVersesMap[chapterNumber][verseAr.verse]
                                    : ""; // Default to empty if no English text

                loadedVerses.push({
                  uuid: `${chapterNumber}-${verseAr.verse}`,
                  chapter: chapterNumber,
                  verse: verseAr.verse,
                  arabic_text: verseAr.text,
                  english_text: englishText,
                  surahArabicName: surahInfo.arabicName,
                  surahEnglishName: surahInfo.englishName,
                });
              }
            }
          }
        }

        this.allVerses = loadedVerses;
        if (this.allVerses.length === 0 && !this.errorMessage) {
          this.errorMessage = this.currentLanguage === 'ar' ? "لم يتم تحميل أي آيات. يرجى التحقق من ملفات JSON." : "No Verses loaded. Please check the JSON files.";
        }
      } catch (error) {
        console.error("Error loading Quran data:", error);
        this.errorMessage = (this.currentLanguage === 'ar' ? "فشل تحميل بيانات الآيات: " : "Failed to load Quran verse data: ") + error.message;
      } finally {
        this.isLoading = false;
      }
    },

    selectRandomVerse() {
      this.clearAnimationTimers();
      this.displayedWords = [];

      if (!this.allVerses || this.allVerses.length === 0) {
        this.currentVerseData = null;
        this.currentTextParts = [];
        if (!this.isLoading && !this.errorMessage) {
            this.errorMessage = this.currentLanguage === 'ar' ? "لا توجد آيات متاحة للعرض." : "No Verses available to display.";
        }
        return;
      }

      const randomIndex = Math.floor(Math.random() * this.allVerses.length);
      this.currentVerseData = { ...this.allVerses[randomIndex] }; 
      
      const textToDisplay = this.currentLanguage === 'ar' ? this.currentVerseData.arabic_text : this.currentVerseData.english_text;

      if (!textToDisplay || textToDisplay.trim() === "") {
        // If no text for current language, try to find next suitable verse quickly
        this.partTimeoutId = setTimeout(this.selectRandomVerse, 50); 
        return;
      }
      
      this.currentTextParts = this.segmentText(textToDisplay);
      this.currentPartIndex = 0;
      this.errorMessage = null; 

      this.displayCurrentPart();
    },

    segmentText(text) {
      if (!text) return [];
      const words = text.split(' ').filter((word) => word.trim() !== '');
      const parts = [];
      for (let i = 0; i < words.length; i += this.WORDS_PER_PART) {
        parts.push(words.slice(i, i + this.WORDS_PER_PART).join(' '));
      }
      // If text is shorter than WORDS_PER_PART, or if no spaces, parts might be empty.
      // Ensure at least the original text is returned as one part.
      return parts.length > 0 ? parts : (text.trim() !== '' ? [text] : []);
    },

    displayCurrentPart() {
      this.clearAnimationTimers();

      if (!this.currentVerseData || this.currentPartIndex >= this.currentTextParts.length) {
        this.displayedWords = []; 
        this.partTimeoutId = setTimeout(this.selectRandomVerse, this.NEXT_VERSE_DELAY);
        return;
      }

      const partText = this.currentTextParts[this.currentPartIndex];
      this.currentPartWords = partText.split(' ').filter((word) => word.trim() !== '');
      this.displayedWords = [];
      this.animateWords();

      let currentPartDuration = this.PART_DISPLAY_DURATION;
      // Adjust duration if the part is significantly shorter than WORDS_PER_PART
      if (this.currentPartWords.length < (this.WORDS_PER_PART * 0.8) && this.WORDS_PER_PART > 0) { // e.g., less than 80%
        const proportion = this.currentPartWords.length / this.WORDS_PER_PART;
        currentPartDuration = Math.max(proportion * this.PART_DISPLAY_DURATION, (this.currentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000); // Ensure enough time for words + buffer
      }
       // Ensure minimum duration for very short parts
      const minDurationForAnimation = (this.currentPartWords.length * this.WORD_ANIMATION_INTERVAL) + 1000; // Time for all words to animate + 1s buffer
      currentPartDuration = Math.max(currentPartDuration, minDurationForAnimation) + 7000;


      this.partTimeoutId = setTimeout(this.displayNextPart, currentPartDuration);
    },

    displayNextPart() {
      this.currentPartIndex++;
      this.displayCurrentPart();
    },

    animateWords() {
      let wordIndex = 0;
      this.wordIntervalId = setInterval(() => {
        if (wordIndex < this.currentPartWords.length) {
          this.displayedWords.push(this.currentPartWords[wordIndex]);
          wordIndex++;
        } else {
          clearInterval(this.wordIntervalId);
          this.wordIntervalId = null;
        }
      }, this.WORD_ANIMATION_INTERVAL);
    },

    clearAnimationTimers() {
      if (this.wordIntervalId) clearInterval(this.wordIntervalId);
      this.wordIntervalId = null;
      if (this.partTimeoutId) clearTimeout(this.partTimeoutId);
      this.partTimeoutId = null;
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
            this.selectRandomVerse(); // Find a new Verse if current one lacks text in new lang
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
        this.selectRandomVerse();
      }
    },

    toggleTheme() {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', this.currentTheme);
    }
  },
  beforeUnmount() {
    this.clearAnimationTimers();
  },
};
</script>

<style> /* Changed to global style for html, body, and theme vars */
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

</style>
