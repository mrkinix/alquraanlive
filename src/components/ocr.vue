<template>
 <div class="container">
        <div class="page" ref="page">
            <div class="lines">
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
                <div class="line"></div>
            </div>
            <div class="page-number">٣٤٦</div>
        </div>
        
        <div class="phone" ref="phone">
            <div class="status-bar"></div>
            <div class="camera-app-top-overlay"></div>
            <div class="focus-zone">
                <div class="focus-line"></div>
                <div class="focus-line"></div>
            </div>
            <div class="screen">
                  <div class="camera-app-bottom-overlay" ref="cameraAppBottomOverlay">
                    <div class="camera-button button-press" ref="cameraBtn"></div>
                      </div>
            </div>
                <div class="flash" ref="flash">
                <svg class="moon-icon" ref="moonIcon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                   <g fill="none" stroke="currentColor" stroke-dasharray="4" stroke-dashoffset="4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1">
                        <path d="M13 4h1.5M13 4h-1.5M13 4v1.5M13 4v-1.5">
                            <animate id="lineMdMoonAltLoop0" fill="freeze" attributeName="stroke-dashoffset" begin="0.7s;lineMdMoonAltLoop0.begin+6s" dur="0.4s" values="4;0"/>
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdMoonAltLoop0.begin+2s;lineMdMoonAltLoop0.begin+4s" dur="0.4s" values="4;0"/>
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdMoonAltLoop0.begin+1.2s;lineMdMoonAltLoop0.begin+3.2s;lineMdMoonAltLoop0.begin+5.2s" dur="0.4s" values="0;4"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop0.begin+1.8s" to="M12 5h1.5M12 5h-1.5M12 5v1.5M12 5v-1.5"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop0.begin+3.8s" to="M12 4h1.5M12 4h-1.5M12 4v1.5M12 4v-1.5"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop0.begin+5.8s" to="M13 4h1.5M13 4h-1.5M13 4v1.5M13 4v-1.5"/>
                        </path>
                        <path d="M19 11h1.5M19 11h-1.5M19 11v1.5M19 11v-1.5">
                            <animate id="lineMdMoonAltLoop1" fill="freeze" attributeName="stroke-dashoffset" begin="1.1s;lineMdMoonAltLoop1.begin+6s" dur="0.4s" values="4;0"/>
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdMoonAltLoop1.begin+2s;lineMdMoonAltLoop1.begin+4s" dur="0.4s" values="4;0"/>
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdMoonAltLoop1.begin+1.2s;lineMdMoonAltLoop1.begin+3.2s;lineMdMoonAltLoop1.begin+5.2s" dur="0.4s" values="0;4"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop1.begin+1.8s" to="M17 11h1.5M17 11h-1.5M17 11v1.5M17 11v-1.5"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop1.begin+3.8s" to="M18 12h1.5M18 12h-1.5M18 12v1.5M18 12v-1.5"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop1.begin+5.8s" to="M19 11h1.5M19 11h-1.5M19 11v1.5M19 11v-1.5"/>
                        </path>
                        <path d="M19 4h1.5M19 4h-1.5M19 4v1.5M19 4v-1.5">
                            <animate id="lineMdMoonAltLoop2" fill="freeze" attributeName="stroke-dashoffset" begin="2s;lineMdMoonAltLoop2.begin+6s" dur="0.4s" values="4;0"/>
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdMoonAltLoop2.begin+2s" dur="0.4s" values="4;0"/>
                            <animate fill="freeze" attributeName="stroke-dashoffset" begin="lineMdMoonAltLoop2.begin+1.2s;lineMdMoonAltLoop2.begin+3.2s" dur="0.4s" values="0;4"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop2.begin+1.8s" to="M20 5h1.5M20 5h-1.5M20 5v1.5M20 5v-1.5"/>
                            <set fill="freeze" attributeName="d" begin="lineMdMoonAltLoop2.begin+5.8s" to="M19 4h1.5M19 4h-1.5M19 4v1.5M19 4v-1.5"/>
                        </path>
                    </g>
                    <path fill="none" stroke="currentColor" stroke-dasharray="56" stroke-dashoffset="56" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z">
                        <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="56;0"/>
                    </path>
                </svg>
                
                <div class="arabic-text" ref="arabicText">
                    <div class="surah-name">سورة المؤمنون</div>
                    <div class="page-info">صفحة 346</div>
                    <div class="instruction">اختر الآية للبحث عن تفسيرها</div>
                    
                    <div class="verse-buttons" ref="buttonsContainer">
                        <!-- Verse buttons will be added by JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
  name: 'QuranAnimation',
  mounted() {
    this.createVerseButtons();
    this.$nextTick(() => {
      this._setTimeout(this.runAnimationSequence, 500); 
    }); 
  },
  data() {
    return {
      animationTimeoutIds: [], // Store all timeout IDs
    };
  },
  beforeUnmount() {
    this._clearAllAnimationTimeouts(); 
    console.log("OCR Animation: Cleared animation timeouts before unmount.");
  },
  methods: {
    // Corrected helper to manage one-off timeouts
    _setTimeout(callback, delay) {
      // In Vue 3, this.$el is a good indicator of mounted status within methods.
      // this._isMounted is also available.
      if (!this || !this.$el) { 
        console.warn("OCR Animation: _setTimeout called on unmounted or not-yet-mounted component.");
        return null; 
      }
      const id = setTimeout(() => {
        if (!this || !this.$el) { // Check again before executing callback
          this.animationTimeoutIds = this.animationTimeoutIds.filter(tid => tid !== id);
          return;
        }
        callback();
        this.animationTimeoutIds = this.animationTimeoutIds.filter(tid => tid !== id);
      }, delay);
      this.animationTimeoutIds.push(id);
      return id;
    },

    // Promisified wait helper for async/await sequences
    _wait(delay) {
      return new Promise((resolve) => {
        let timeoutId;
        const operation = () => {
          this.animationTimeoutIds = this.animationTimeoutIds.filter(tid => tid !== timeoutId);
          resolve();
        };
        if (!this || !this.$el) { // If component is unmounted, resolve immediately
          resolve();
          return;
        }
        timeoutId = setTimeout(operation, delay);
        this.animationTimeoutIds.push(timeoutId);
      });
    },
       createVerseButtons() {
        const buttonsContainer = this.$refs.buttonsContainer;
        if (!buttonsContainer) return;

        // Clear existing buttons if any (e.g., on hot reload)
        buttonsContainer.innerHTML = ''; 

        for (let i = 60; i <= 74; i++) {
            const button = document.createElement('div');
            button.className = 'verse-button';
            button.textContent = i;
            buttonsContainer.appendChild(button);
        }
    },
    async runAnimationSequence() {
      // Guard against running if component is unmounted
      if (!this || !this.$el) {
        console.warn("OCR Animation: runAnimationSequence called but component is unmounted or $el not available.");
        this._clearAllAnimationTimeouts();
        return;
      }

      let { 
        page: pageEl, // Added for completeness, though not directly animated in this sequence
        flash: flashEl, 
        moonIcon: moonIconEl, 
        arabicText: arabicTextEl, 
        buttonsContainer: verseButtonsEl, 
        phone: phoneEl,
        cameraBtn: cameraBtnEl 

      } = this.$refs;

      // Critical ref check
      if (!phoneEl || !phoneEl.style) {
        console.error("OCR Animation: Phone element ref is not valid or missing style property.");
        return;
      }
 
      // Helper to safely access refs, providing a dummy style object if ref is missing
      const safeRef = (el) => (el && el.style ? el : { style: {} });

      flashEl = safeRef(flashEl);
      moonIconEl = safeRef(moonIconEl);
      arabicTextEl = safeRef(arabicTextEl);
      verseButtonsEl = safeRef(verseButtonsEl);
      cameraBtnEl = safeRef(cameraBtnEl);

      // Reset animations safely
      [phoneEl, cameraBtnEl, flashEl, moonIconEl, arabicTextEl, verseButtonsEl].forEach(el => {
        el.style.animation = 'none'; // el.style is guaranteed by safeRef or phoneEl check
      });

      // Force reflow to ensure reset is applied before new animations start
      void phoneEl.offsetHeight; 
      // You can add for other elements if needed: void cameraBtnEl.offsetHeight; etc.

      // Set initial states
      phoneEl.style.bottom = '-500px';
      // phoneEl.style.position = 'absolute'; // Already set in CSS, usually not needed here

      try {
        // Start animations sequentially
        phoneEl.style.animation = 'rise-up 2s forwards';
        await this._wait(2000);
        if (!this || !this.$el) return;

        cameraBtnEl.style.animation = 'button-press 1.4s forwards';
        await this._wait(1400);
        if (!this || !this.$el) return;

        flashEl.style.animation = 'fade-in 0.5s forwards';
        await this._wait(500);
        if (!this || !this.$el) return;

        moonIconEl.style.animation = 'fade-in 0.5s forwards';
        await this._wait(1000); // Original delay before next moon icon animation
        if (!this || !this.$el) return;

        moonIconEl.style.animation = 'fade-out 0.5s forwards';
        await this._wait(500);
        if (!this || !this.$el) return;

        arabicTextEl.style.animation = 'fade-in 0.5s forwards';
        verseButtonsEl.style.animation = 'fade-in 0.5s forwards';
        await this._wait(2000); // Original delay before next text animation
        if (!this || !this.$el) return;

        arabicTextEl.style.animation = 'fade-out 0.5s forwards';
        verseButtonsEl.style.animation = 'fade-out 0.5s forwards';
        await this._wait(1000); // Original delay before phone fall
        if (!this || !this.$el) return;

        phoneEl.style.animation = 'fall-down 2s forwards';
        await this._wait(2000); // Wait for fall-down to complete
        if (!this || !this.$el) return;

        // Loop: Restart animation after a short delay (200ms, based on original logic)
        await this._wait(200);
        if (this && this.$el) { // Check if still mounted before looping
            console.log("OCR Animation: Restarting sequence.");
            this.runAnimationSequence(); // Call directly to loop
        }
      } catch (error) {
        console.error("OCR Animation: Error during animation sequence:", error);
        this._clearAllAnimationTimeouts(); // Clean up if an error occurs
      }
    },
       _clearAllAnimationTimeouts() {
      this.animationTimeoutIds.forEach(id => clearTimeout(id));
      this.animationTimeoutIds = [];
   
    }
  }
}
</script>


    <style scoped>
        body {
        

        }
        
        .container {
            position: fixed;
            width: 100vw;
        margin: 0;
            background: rgba(0, 0, 0, 0.855);
            backdrop-filter: blur(15px); 
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-family: Arial, sans-serif;
        }
        
        /* Page styling */
        .page {
            position: fixed;
            width: 80%;
            height: 90%;
            background: #F4EBD0;
            border: 1px solid #ddd;
            border-radius: 8px;
            top: 5%;
            left: 50%;
            transform: translate(-50%, -50%);
            overflow: hidden;
        }
        
      
        
       
        
        .page-number {
            position: absolute;
            bottom: 20px;
            right: calc(50% - 1.25ch);
            font-size: 21px;
            color: #666;
        }
        
        /* Phone styling */
        .phone {
            position: absolute;
            width: 250px;
            height: 450px;
            border-radius: 30px;
            bottom: -500px;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid #333;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
            animation: rise-up 2s forwards 0.5s;
        }
        
        .phone::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 8px;
            background: #222;
            border-radius: 4px;
        }
        
        .phone::after {
            content: '';
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 8px;
            background: #222;
            border-radius: 4px;
        }
        
        .screen {
            position: absolute;
            top: 30px;
            left: 10px;
            right: 10px;
            bottom: 30px;
            border-radius: 5px;
            overflow: hidden;
            background: rgba(255,255,255,0.1);
        }
        
        /* Focus zone lines */
        .focus-zone {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40%;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 2;
        }
        
        .focus-line {
            width: 100%;
            height: 1px;
            background: rgba(51, 64, 111, 0.452);
            margin: 15% 0;
            box-shadow: 0 0 5px rgba(255,255,255,0.5);
        }
        
        .camera-button {
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            border: 3px solid rgba(255,255,255,0.5);
            position: relative;
        }
        
        .camera-button::after {
            content: '';
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.7);
        }
        
        /* Status bar */
        .status-bar {
            position: absolute;
            z-index: 9;
            top: 0;
            left: 0;
            border-radius: 25px 25px 0 0;
            right: 0;
            height: 30px;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 12px;
        }
        
        /* Camera app overlays */
        .camera-app-top-overlay {
            position: absolute;
            top: 30px;
            left: 0;
            right: 0;
            height: 50px;
            background: rgba(0,0,0,0.3);
            display: flex;
            justify-content: space-between;
            padding: 0 15px;
            align-items: center;
            z-index: 1;
        }
        
        .camera-app-bottom-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 100px;
            background: rgba(0,0,0,0.3);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1;
        }
        
        /* Flash effect */
        .flash {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #F4EBD0;
            opacity: 0;
            z-index: 8;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: 30px;
        }
        
        .flash::before {
            content: '';
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 8px;
            background: #222;
            border-radius: 4px;
        }
        
        .flash::after {
            content: '';
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 8px;
            background: #222;
            border-radius: 4px;
        }
        
        /* Moon icon */
        .moon-icon {
            width: 80px;
            height: 80px;
            color: #5E3C16;
            opacity: 0;
        }
        
        /* Arabic text */
        .arabic-text {
            color: #5E3C16;
            text-align: center;
            width: 100%;
            opacity: 0;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        
        .surah-name {
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .page-info {
            font-size: 18px;
            margin-bottom: 20px;
        }
        
        .instruction {
            font-size: 16px;
            margin-bottom: 30px;
        }
        
        /* Verse buttons */
        .verse-buttons {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 8px;
            max-width: 100%;
            opacity: 0;
        }
            /* Add this new rule to reset the background */
        .flash.reset-bg {
            background: transparent;
        }
        .verse-button {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #5E3C16;
            color: #F4EBD0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 16px;
        }
        
        /* Animations */
        @keyframes rise-up {
            to { bottom: calc(50% - 195px); }
        }
        
        @keyframes fall-down {
                        from { bottom: calc(50% - 225px); }
            to { bottom: -500px; }
            
        }
        
        @keyframes button-press {
            0% { transform: scale(1); }
            50% { transform: scale(0.88); }
            100% { transform: scale(1); }
        }
        
        @keyframes fade-in {
            to { opacity: 1; }
        }
        
        @keyframes fade-out {
            to { opacity: 0; }
        }
    </style>