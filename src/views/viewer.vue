<template>
    <div id="app">
      <header>
        <h1>Quran Viewer</h1>
        <div v-if="!isLoading && !error" class="surah-selector">
          <label for="surah-select">Select Surah:</label>
          <select id="surah-select" v-model="selectedSurahNumber" @change="handleSurahChange">
            <option v-for="surahOption in surahOptionsForDropdown" :key="surahOption.value" :value="surahOption.value">
              {{ surahOption.text }}
            </option>
          </select>
        </div>
      </header>
  
      <main>
        <div v-if="isLoading" class="loading-message">
          <p>Loading Quran data...</p>
        </div>
        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
        </div>
        <div v-else-if="selectedSurah" class="surah-container">
          <h2>
            {{ selectedSurah.englishName }} ({{ selectedSurah.arabicName }})
            <br>
            Surah {{ selectedSurah.number }}
          </h2>
          <div v-for="verse in selectedSurah.verses" :key="verse.verse_number" class="verse">
            <p class="verse-number">{{ selectedSurah.number }}:{{ verse.verse_number }}</p>
            <p class="arabic-text">{{ verse.text_arabic }}</p>
            <p class="english-text">{{ verse.text_english }}</p>
          </div>
        </div>
        <div v-else-if="!isLoading && combinedSurahsData.length > 0" class="no-surah-selected">
          <p>Please select a Surah to display.</p>
        </div>
        <div v-else-if="!isLoading && combinedSurahsData.length === 0" class="no-data">
          <p>No Quran data processed. Please check if surah_info.json is available and correctly formatted.</p>
        </div>
      </main>
    </div>
  </template>
  
  <script>
  export default {
    name: 'App',
    data() {
      return {
        surahDetails: [], // From surah_info.json
        arabicQuran: {},  // From quran.json (Arabic)
        englishQuran: {}, // From en.json (English)
        combinedSurahsData: [], // Processed data
        selectedSurahNumber: null, // Will be set after data loads
        isLoading: true,
        error: null,
      };
    },
    computed: {
      selectedSurah() {
        if (this.isLoading || !this.combinedSurahsData.length || this.selectedSurahNumber === null) {
          return null;
        }
        return this.combinedSurahsData.find(s => s.number === parseInt(this.selectedSurahNumber));
      },
      surahOptionsForDropdown() {
        if (this.isLoading || !this.surahDetails.length) {
          // Fallback if surahDetails is not loaded, though it should be.
          return Object.keys(this.arabicQuran || {}).map(num => ({
            value: parseInt(num),
            text: `Surah ${num}`
          }));
        }
        return this.surahDetails.map(s => ({
          value: s.number,
          text: `${s.number}. ${s.englishName} (${s.arabicName})`
        }));
      }
    },
    async mounted() {
      await this.loadAllData();
    },
    methods: {
      async loadAllData() {
        this.isLoading = true;
        this.error = null;
        try {
          // URLs for the JSON files in the public folder
          // IMPORTANT: Ensure these files exist at these paths in your `public` directory.
          const surahInfoUrl = '/books/surah_info.json';
          const arabicQuranUrl = '/books/quran.json';
          const englishQuranUrl = '/books/en.json';
  
          const [surahInfoRes, arabicRes, englishRes] = await Promise.all([
            fetch(surahInfoUrl).catch(e => { console.error(`Fetch error for surah_info.json: ${e.message}`); return { ok: false, statusText: e.message, json: () => Promise.resolve(null) }; }),
            fetch(arabicQuranUrl).catch(e => { console.error(`Fetch error for quran.json: ${e.message}`); return { ok: false, statusText: e.message, json: () => Promise.resolve(null) }; }),
            fetch(englishQuranUrl).catch(e => { console.error(`Fetch error for en.json: ${e.message}`); return { ok: false, statusText: e.message, json: () => Promise.resolve(null) }; })
          ]);
  
          let surahInfoData = null;
          if (surahInfoRes.ok) {
              surahInfoData = await surahInfoRes.json();
          } else {
              console.warn(`Could not load surah_info.json: ${surahInfoRes.statusText}. Surah names and proper ordering might be affected.`);
              // Attempt to build a basic surahDetails from arabicQuran keys if surah_info is missing
              if (arabicRes.ok) {
                  const tempArabicData = await arabicRes.clone().json(); // Clone because response body can be read once
                   surahInfoData = Object.keys(tempArabicData).map(num => ({
                      number: parseInt(num),
                      englishName: `Surah ${num}`,
                      arabicName: `سورة ${num}`,
                      versesCount: tempArabicData[num].length
                  })).sort((a,b) => a.number - b.number);
              } else {
                   throw new Error(`Failed to fetch Arabic Quran: ${arabicRes.statusText} AND surah_info.json`);
              }
          }
          this.surahDetails = surahInfoData;
  
  
          if (!arabicRes.ok) throw new Error(`Failed to fetch Arabic Quran: ${arabicRes.statusText}`);
          this.arabicQuran = await arabicRes.json();
          
          if (!englishRes.ok) throw new Error(`Failed to fetch English Quran: ${englishRes.statusText}`);
          this.englishQuran = await englishRes.json();
          
          this.processAndCombineData();
  
        } catch (err) {
          console.error("Error loading Quran data:", err);
          this.error = `Failed to load Quran data: ${err.message}. Please check the console and ensure JSON files are in the public/books/ directory and correctly formatted.`;
        } finally {
          this.isLoading = false;
        }
      },
  
      processAndCombineData() {
        const combined = [];
        if (!this.surahDetails || Object.keys(this.arabicQuran).length === 0 || Object.keys(this.englishQuran).length === 0) {
            this.error = this.error || "One or more essential Quran data files (Arabic, English, or Surah Info) are missing or invalid.";
            this.combinedSurahsData = []; // Ensure it's empty if data is bad
            return;
        }
  
        for (const surahInfo of this.surahDetails) {
          const surahNumStr = String(surahInfo.number);
          const arabicVersesForSurah = this.arabicQuran[surahNumStr] || [];
          const englishVersesForSurah = this.englishQuran[surahNumStr] || [];
  
          const verses = [];
          const verseCount = surahInfo.versesCount || (arabicVersesForSurah.length > 0 ? arabicVersesForSurah.length : 0);
  
          for (let verseNum = 1; verseNum <= verseCount; verseNum++) {
            const arabicVerse = arabicVersesForSurah.find(v => v.verse === verseNum);
            const englishVerse = englishVersesForSurah.find(v => v.verse === verseNum);
  
            verses.push({
              verse_number: verseNum,
              text_arabic: arabicVerse ? arabicVerse.text : "Arabic text not available",
              text_english: englishVerse ? englishVerse.text : "Translation not available"
            });
          }
          
          combined.push({
            number: surahInfo.number,
            englishName: surahInfo.englishName || `Surah ${surahInfo.number}`,
            arabicName: surahInfo.arabicName || `سورة ${surahInfo.number}`,
            verses: verses
          });
        }
        this.combinedSurahsData = combined;
        if (this.combinedSurahsData.length > 0 && this.selectedSurahNumber === null) {
          this.selectedSurahNumber = this.combinedSurahsData[0].number;
        }
      },
      handleSurahChange() {
        // This method is called when the select dropdown changes.
        // selectedSurahNumber is already updated by v-model.
        // If you need to do anything else on surah change, add it here.
      }
    }
  };
  </script>
  
  <style>
  #app {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin: 0 auto;
    padding: 20px;
    max-width: 900px;
    line-height: 1.6;
  }
  
  header {
    text-align: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #42b983;
  }
  
  header h1 {
    color: #42b983;
    margin: 0 0 15px 0;
  }
  
  .surah-selector {
    margin-top: 10px;
  }
  
  .surah-selector label {
    margin-right: 10px;
    font-weight: bold;
  }
  
  .surah-selector select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ccc;
    font-size: 1em;
  }
  
  .loading-message, .error-message, .no-surah-selected, .no-data {
    text-align: center;
    padding: 20px;
    font-size: 1.2em;
  }
  
  .error-message {
    color: red;
    background-color: #ffebee;
    border: 1px solid #ef9a9a;
    border-radius: 4px;
  }
  
  .surah-container {
    margin-top: 20px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  .surah-container h2 {
    text-align: center;
    color: #35495e;
    margin-top: 0;
    margin-bottom: 25px;
    font-size: 1.8em;
    line-height: 1.3;
  }
  
  .verse {
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px dashed #d0d0d0;
  }
  
  .verse:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  .verse-number {
    font-weight: bold;
    color: #42b983;
    margin-bottom: 8px;
    font-size: 0.9em;
  }
  
  .arabic-text {
    font-family: 'Amiri', 'Noto Naskh Arabic', 'Traditional Arabic', serif;
    font-size: 2em; /* Increased for better readability */
    direction: rtl;
    text-align: right;
    margin-bottom: 10px;
    line-height: 2; /* Increased for Arabic script */
    color: #333;
  }
  
  .english-text {
    font-size: 1.1em;
    color: #444;
    line-height: 1.7;
    margin-top: 5px;
  }
  
  /* Basic responsive design */
  @media (max-width: 600px) {
    #app {
      padding: 10px;
    }
    .surah-container h2 {
      font-size: 1.5em;
    }
    .arabic-text {
      font-size: 1.7em;
    }
    .english-text {
      font-size: 1em;
    }
  }
  </style>
  