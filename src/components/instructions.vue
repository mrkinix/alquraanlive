<template>
  <div 
    class="hadith-guide"
    @click="dismissTutorial"
    @mousedown="startHold"
    @mouseup="endHold"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchmove="handleTouchMove"
  >
    <!-- Vertical divider -->
    <div class="divider"  
></div>

    <!-- Left navigation area -->
    <div class="nav-area left">
      <div class="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="M7.722 14.895v-3.316m0 0V6.158c0-.916.73-1.658 1.633-1.658c.902 0 1.633.742 1.633 1.658v4.474l2.872.452c1.8.274 2.7.411 3.334.797C18.241 12.517 19 13.474 19 14.87c0 .972-.237 1.624-.812 3.377c-.366 1.112-.548 1.668-.846 2.109a3.74 3.74 0 0 1-2.046 1.496c-.505.148-1.083.148-2.238.148h-1.311c-1.666 0-2.498 0-3.214-.317a3.7 3.7 0 0 1-.895-.562c-.6-.507-.972-1.263-1.717-2.775c-.604-1.227-.906-1.84-.92-2.475c-.007-.287.03-.573.107-.849c.172-.611.617-1.127 1.506-2.159z"/>
            <path d="M13.316 6a4 4 0 0 0-8 0"/>
          </g>
        </svg>
        <span>{{ localize('Previous', 'السابق', 'Précédent') }}</span>
      </div>
    </div>

    <!-- Right navigation area -->
    <div class="nav-area right">
      <div class="nav-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
            <path d="M7.722 14.895v-3.316m0 0V6.158c0-.916.73-1.658 1.633-1.658c.902 0 1.633.742 1.633 1.658v4.474l2.872.452c1.8.274 2.7.411 3.334.797C18.241 12.517 19 13.474 19 14.87c0 .972-.237 1.624-.812 3.377c-.366 1.112-.548 1.668-.846 2.109a3.74 3.74 0 0 1-2.046 1.496c-.505.148-1.083.148-2.238.148h-1.311c-1.666 0-2.498 0-3.214-.317a3.7 3.7 0 0 1-.895-.562c-.6-.507-.972-1.263-1.717-2.775c-.604-1.227-.906-1.84-.92-2.475c-.007-.287.03-.573.107-.849c.172-.611.617-1.127 1.506-2.159z"/>
            <path d="M13.316 6a4 4 0 0 0-8 0"/>
          </g>
        </svg>
        <span>{{ localize('Next', 'التالي', 'Suivant') }}</span>
      </div>
    </div>

    <!-- Bottom controls -->
    <div class="bottom-controls">
      <!-- Swipe down icon -->
     
      <div class="swipe-icon down" :class="{ animating: swipeAnimating }">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256">
          <path fill="currentColor" d="M60 76a56 56 0 0 1 112 0a4 4 0 0 1-8 0a48 48 0 0 0-96 0a4 4 0 1 1-8 0m136 48a23.88 23.88 0 0 0-16.07 6.19A24 24 0 0 0 140 114.13V76a24 24 0 0 0-48 0v94l-11.26-18.06A24 24 0 0 0 39.22 176l29.32 50a4 4 0 0 0 6.9-4l-29.31-50a16 16 0 0 1 27.72-16l.07.12l18.68 30A4 4 0 0 0 100 184V76a16 16 0 0 1 32 0v68a4 4 0 0 0 8 0v-12a16 16 0 0 1 32 0v20a4 4 0 0 0 8 0v-4a16 16 0 0 1 32 0v36c0 22.66-7.51 38.06-7.58 38.21a4 4 0 0 0 1.79 5.37a4.05 4.05 0 0 0 1.79.42a4 4 0 0 0 3.58-2.21c.34-.69 8.42-17.13 8.42-41.79v-36a24 24 0 0 0-24-24"/>
        </svg>
        <span>{{ localize('Swipe down for text search', 'السحب لأسفل للبحث النصي', 'Glisser vers le bas pour la recherche textuelle') }}</span>
      </div>
      <!-- Pause button -->
      <div class="hold-hint">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24">
          <path fill="currentColor" d="M11.75 7c1.348 0 2.179.97 2.246 2.329l.004.18v2.115l2.219.403a3.25 3.25 0 0 1 2.602 3.857l-.043.18l-1.048 3.923a2.25 2.25 0 0 1-1.689 1.616l-.165.03l-2.418.347a2.25 2.25 0 0 1-2.28-1.123l-.08-.155l-.03-.063a3.46 3.46 0 0 0-1.025-1.283l-.194-.138l-1.884-1.256l-.093-.059l-.098-.052l-2.363-1.175a.75.75 0 0 1-.416-.655c-.024-1.109.466-1.964 1.42-2.44c.701-.352 1.634-.332 2.826.016l.259.08v-4.17C9.5 8.055 10.342 7 11.75 7m0 1.5c-.46 0-.713.275-.746.866L11 9.508v5.245a.75.75 0 0 1-1.036.693c-1.46-.602-2.441-.743-2.879-.524c-.254.127-.42.29-.51.519l-.038.12l1.905.947l.181.097l.174.109l1.884 1.256a5 5 0 0 1 1.626 1.792l.122.245l.03.062a.75.75 0 0 0 .677.434l.109-.008l2.418-.347a.75.75 0 0 0 .581-.443l.037-.105l1.048-3.924a1.75 1.75 0 0 0-1.239-2.142l-.07-.017l-2.904-.529a.75.75 0 0 1-.609-.63l-.007-.108V9.508c0-.69-.255-1.008-.75-1.008M11.749 2a7.25 7.25 0 0 1 6.697 10.034a4.2 4.2 0 0 0-1.305-.785a5.75 5.75 0 1 0-10.219 1.13a3.3 3.3 0 0 0-.955.307q-.24.121-.455.266A7.25 7.25 0 0 1 11.748 2m0 2.502A4.75 4.75 0 0 1 16.165 11L15 10.789V9.51l-.004-.195l.002-.063a3.24 3.24 0 0 0-.567-1.835l-.09-.132C13.783 6.496 12.891 6 11.75 6c-1.175 0-2.085.526-2.64 1.353a3.24 3.24 0 0 0-.61 1.898l.002.11l-.002.147v2.89l-.262-.036a1 1 0 0 1-.617-.32Q7 11.354 7 9.25a4.75 4.75 0 0 1 4.749-4.75"/>
        </svg>
        <span>{{ localize('Hold to pause', 'اضغط مطولاً للإيقاف', 'Maintenir pour mettre en pause') }}</span>
      </div>

 <!-- Swipe up icon (rotated) -->
      <div class="swipe-icon up" :class="{ animating: swipeAnimating }">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 256 256">
          <path fill="currentColor" d="M60 76a56 56 0 0 1 112 0a4 4 0 0 1-8 0a48 48 0 0 0-96 0a4 4 0 1 1-8 0m136 48a23.88 23.88 0 0 0-16.07 6.19A24 24 0 0 0 140 114.13V76a24 24 0 0 0-48 0v94l-11.26-18.06A24 24 0 0 0 39.22 176l29.32 50a4 4 0 0 0 6.9-4l-29.31-50a16 16 0 0 1 27.72-16l.07.12l18.68 30A4 4 0 0 0 100 184V76a16 16 0 0 1 32 0v68a4 4 0 0 0 8 0v-12a16 16 0 0 1 32 0v20a4 4 0 0 0 8 0v-4a16 16 0 0 1 32 0v36c0 22.66-7.51 38.06-7.58 38.21a4 4 0 0 0 1.79 5.37a4.05 4.05 0 0 0 1.79.42a4 4 0 0 0 3.58-2.21c.34-.69 8.42-17.13 8.42-41.79v-36a24 24 0 0 0-24-24"/>
        </svg>
        <span>{{ localize('Swipe up for voice search', 'السحب لأعلى للبحث الصوتي', 'Glisser vers le haut pour la recherche vocale') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HadithGuide',
  data() {
    return {
      dismissed: false,
      currentLanguage: 'en',
      pressTimer: null,
      touchStartY: 0,
      swipeAnimating: true,
      animationInterval: null
    }
  },
  mounted() {
    this.dismissed = localStorage.getItem('hadithGuideDismissed') === 'true';
    const savedLang = localStorage.getItem('language');
    if (savedLang) this.currentLanguage = savedLang;
    

  },
  beforeDestroy() {
    clearInterval(this.animationInterval);
  },
  methods: {
    localize(en, ar, fr) {
      return this.currentLanguage === 'ar' ? ar : 
             this.currentLanguage === 'fr' ? fr : en;
    },
    startHold() {
      this.pressTimer = setTimeout(() => {
        this.pauseHadith();
      }, 1000);
    },
    endHold() {
      if (this.pressTimer) clearTimeout(this.pressTimer);
    },
    handleTouchStart(e) {
      this.touchStartY = e.touches[0].clientY;
      this.startHold();
    },
    handleTouchEnd() {
      this.endHold();
    },
    handleTouchMove(e) {
      if (!this.pressTimer) return;
      
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchEndY - this.touchStartY;

      if (Math.abs(deltaY) > 50) {
        clearTimeout(this.pressTimer);
        if (deltaY > 0) {
          this.searchHadithText();
        } else {
          this.searchHadithVoice();
        }
      }
    },
    prevHadith() {
      console.log("Previous hadith");
      // Implement previous hadith logic
    },
    nextHadith() {
      console.log("Next hadith");
      // Implement next hadith logic
    },
    pauseHadith() {
      console.log("Hadith paused");
      // Implement pause logic
    },
    searchHadithText() {
      console.log("Text search opened");
      // Implement text search
    },
    searchHadithVoice() {
      console.log("Voice search opened");
      // Implement voice search
    },
    dismissTutorial() {
      this.dismissed = true;
      localStorage.setItem('hadithGuideDismissed', 'true');
    }
  }
}
</script>

<style scoped>
.hadith-guide {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: grid;
  grid-template-columns: 1fr 1px 1fr;
  color: white;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.divider {
  background: rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: calc(50% - 1px);
  height: 100vh;
  width: 2px;
}

.nav-area {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease;
}

.nav-area.left {
  grid-column: 1;
  background: rgba(255, 255, 255, 0.05);
}

.nav-area.right {
  grid-column: 3;
  background: rgba(255, 255, 255, 0.05);
}

.nav-area:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.nav-icon:hover {
  opacity: 1;
}

.nav-icon svg {
  width: 64px;
  height: 64px;
  color: #4CAF50;
}

.nav-icon span {
  font-size: 1.2rem;
  font-weight: 500;
}

.bottom-controls {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.swipe-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.7;
  transition: all 0.5s ease;
}

.swipe-icon.up {
  margin-bottom: 10px;
  position: fixed;
  bottom: 3rem;
}

.swipe-icon.down {
  margin-top: 10px;
    position: fixed;
  top: 3rem;
}

.swipe-icon svg {
  width: 48px;
  height: 48px;
  color: #2196F3;
  transform: rotate(-90deg);
}

.swipe-icon.down svg {
  transform: rotate(90deg);
}

.swipe-icon.animating {
  transform: translateY(0);
}

.swipe-icon.up.animating {
  animation: swipeUp linear 2s infinite;
}

.swipe-icon.down.animating {
  animation: swipeDown linear 2s infinite;
}

.hold-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
    position: fixed;
  bottom: calc(50% - 28px);
}

.hold-hint svg {
  width: 36px;
  height: 36px;
  color: #FF9800;
}

.hold-hint span, .swipe-icon span {
  font-size: 0.9rem;
  text-align: center;
  max-width: 200px;
}

@keyframes swipeUp {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
    transform: translateY(-30px);
  }
}

@keyframes swipeDown {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  100% {
    opacity: 1;
    transform: translateY(30px);
  }
}

@media (max-width: 600px) {
  .nav-icon svg {
    width: 48px;
    height: 48px;
  }
  
  .nav-icon span {
    font-size: 1rem;
  }
  
  .swipe-icon svg {
    width: 36px;
    height: 36px;
  }
  
  .hold-hint svg {
    width: 28px;
    height: 28px;
  }
}
</style>