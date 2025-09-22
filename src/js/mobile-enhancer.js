/**
 * 모바일 경험 향상 모듈
 * Version: 1.0.0
 * Description: 모바일 전용 최적화 및 제스처 지원
 */

class MobileEnhancer {
  constructor() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    this.gestureHandlers = new Map();
    this.swipeThreshold = 50; // 스와이프 최소 거리
    this.pinchThreshold = 0.1; // 핀치 최소 배율
  }

  /**
   * 모바일 최적화 초기화
   */
  initialize() {
    if (!this.isMobile) {
      console.log('Desktop mode - Mobile enhancements skipped');
      return;
    }

    console.log('📱 Mobile Enhancer 초기화');

    // 1. 뷰포트 최적화
    this.optimizeViewport();

    // 2. 입력 필드 최적화
    this.optimizeInputFields();

    // 3. 제스처 인식 설정
    this.setupGestures();

    // 4. 햅틱 피드백 설정
    this.setupHapticFeedback();

    // 5. 오프라인 지원
    this.setupOfflineSupport();

    // 6. 화면 방향 제어
    this.handleOrientation();

    // 7. iOS 전용 최적화
    if (this.isIOS) {
      this.optimizeForIOS();
    }
  }

  /**
   * 1. 뷰포트 최적화
   */
  optimizeViewport() {
    // 뷰포트 메타 태그 수정
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }

    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';

    // 안전 영역 처리 (iPhone X+)
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');

    // CSS 추가
    const style = document.createElement('style');
    style.textContent = `
      /* 안전 영역 패딩 */
      body {
        padding-top: var(--safe-area-inset-top);
        padding-bottom: var(--safe-area-inset-bottom);
      }

      /* 모바일 버튼 크기 최적화 */
      @media (max-width: 768px) {
        button, .btn {
          min-height: 44px;
          min-width: 44px;
          font-size: 16px;
        }

        input, select, textarea {
          font-size: 16px; /* iOS 줌 방지 */
          min-height: 44px;
        }

        .modal {
          padding: 10px;
        }

        .modal-content {
          width: 100%;
          max-width: 100%;
          margin: 10px;
        }
      }

      /* 가로 모드 최적화 */
      @media (orientation: landscape) and (max-height: 500px) {
        .header {
          display: none;
        }

        main {
          padding-top: 10px;
        }
      }

      /* 터치 하이라이트 제거 */
      * {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
      }

      /* 스크롤 성능 개선 */
      .scroll-container {
        -webkit-overflow-scrolling: touch;
        overflow-y: auto;
        transform: translateZ(0);
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 2. 입력 필드 최적화
   */
  optimizeInputFields() {
    // 숫자 입력 필드 처리
    document.querySelectorAll('input[type="number"]').forEach(input => {
      // 가상 키보드 타입 설정
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('pattern', '[0-9]*');

      // 포커스 시 전체 선택
      input.addEventListener('focus', (e) => {
        setTimeout(() => e.target.select(), 100);
      });

      // iOS 줌 방지
      input.addEventListener('touchstart', (e) => {
        e.target.style.fontSize = '16px';
      });
    });

    // 텍스트 입력 필드 자동 대문자 비활성화
    document.querySelectorAll('input[type="text"]').forEach(input => {
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('autocomplete', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('spellcheck', 'false');
    });
  }

  /**
   * 3. 제스처 인식 설정
   */
  setupGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let initialDistance = 0;

    // 스와이프 제스처
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();

      // 핀치 줌 초기 거리
      if (e.touches.length === 2) {
        initialDistance = this.getDistance(e.touches[0], e.touches[1]);
      }
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      // 핀치 줌 처리
      if (e.touches.length === 2) {
        const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;

        if (Math.abs(scale - 1) > this.pinchThreshold) {
          this.handlePinch(scale);
        }
      }
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].clientX;
      touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();

      // 스와이프 감지
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = touchEndTime - touchStartTime;

      if (deltaTime < 500) { // 500ms 이내
        if (Math.abs(deltaX) > this.swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
          // 수평 스와이프
          if (deltaX > 0) {
            this.handleSwipe('right');
          } else {
            this.handleSwipe('left');
          }
        } else if (Math.abs(deltaY) > this.swipeThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
          // 수직 스와이프
          if (deltaY > 0) {
            this.handleSwipe('down');
          } else {
            this.handleSwipe('up');
          }
        }
      }
    }, { passive: true });

    // 롱 프레스 제스처
    let longPressTimer;
    document.addEventListener('touchstart', (e) => {
      longPressTimer = setTimeout(() => {
        this.handleLongPress(e.target);
      }, 500);
    }, { passive: true });

    document.addEventListener('touchend', () => {
      clearTimeout(longPressTimer);
    }, { passive: true });

    document.addEventListener('touchmove', () => {
      clearTimeout(longPressTimer);
    }, { passive: true });
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  handleSwipe(direction) {
    console.log(`스와이프: ${direction}`);

    // 햅틱 피드백
    this.triggerHaptic('light');

    // 스와이프 핸들러 실행
    const handler = this.gestureHandlers.get(`swipe-${direction}`);
    if (handler) {
      handler();
    }

    // 기본 동작
    switch (direction) {
      case 'left':
        // 다음 스트릿으로
        if (window.state && window.state.currentStreet) {
          const streets = ['preflop', 'flop', 'turn', 'river'];
          const currentIndex = streets.indexOf(window.state.currentStreet);
          if (currentIndex < streets.length - 1) {
            window.state.currentStreet = streets[currentIndex + 1];
            if (typeof renderAll === 'function') renderAll();
          }
        }
        break;
      case 'right':
        // 실행 취소
        if (typeof undoLastAction === 'function') {
          undoLastAction(window.state.currentStreet);
        }
        break;
      case 'down':
        // 페이지 새로고침 (당겨서 새로고침)
        if (window.scrollY === 0) {
          location.reload();
        }
        break;
    }
  }

  handlePinch(scale) {
    // 핀치 줌 처리
    if (scale > 1.2) {
      // 확대
      document.body.style.fontSize = '18px';
    } else if (scale < 0.8) {
      // 축소
      document.body.style.fontSize = '14px';
    }
  }

  handleLongPress(target) {
    // 롱 프레스 메뉴
    this.triggerHaptic('medium');

    // 플레이어 카드인 경우 빠른 액션 메뉴
    if (target.closest('.player-card')) {
      this.showQuickActionMenu(target.closest('.player-card'));
    }
  }

  /**
   * 4. 햅틱 피드백
   */
  setupHapticFeedback() {
    // 버튼 클릭 시 햅틱
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, .btn')) {
        this.triggerHaptic('light');
      }
    });

    // 중요 액션 시 강한 햅틱
    ['send-to-sheet-btn', 'reset-btn'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          this.triggerHaptic('heavy');
        });
      }
    });
  }

  triggerHaptic(style = 'light') {
    // Vibration API 사용
    if ('vibrate' in navigator) {
      switch (style) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate([30, 10, 30]);
          break;
      }
    }

    // iOS Haptic Feedback (WebKit)
    if (window.webkit?.messageHandlers?.haptic) {
      window.webkit.messageHandlers.haptic.postMessage(style);
    }
  }

  /**
   * 5. 오프라인 지원
   */
  setupOfflineSupport() {
    // 온라인/오프라인 상태 감지
    window.addEventListener('online', () => {
      this.showNotification('온라인 상태로 전환됨', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('오프라인 모드 - 데이터가 로컬에 저장됩니다', 'warning');
    });

    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.log('Service Worker 등록 실패:', err);
      });
    }
  }

  /**
   * 6. 화면 방향 제어
   */
  handleOrientation() {
    // 방향 변경 감지
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.adjustLayout();
      }, 100);
    });

    // 가로 모드 경고
    if (window.innerHeight < window.innerWidth && window.innerHeight < 500) {
      this.showNotification('세로 모드에서 더 나은 경험을 제공합니다', 'info');
    }
  }

  adjustLayout() {
    const isLandscape = window.innerHeight < window.innerWidth;

    if (isLandscape && window.innerHeight < 500) {
      // 가로 모드 최적화
      document.body.classList.add('landscape-mode');
    } else {
      document.body.classList.remove('landscape-mode');
    }
  }

  /**
   * 7. iOS 전용 최적화
   */
  optimizeForIOS() {
    // 바운스 스크롤 방지
    document.body.addEventListener('touchmove', (e) => {
      if (!e.target.closest('.scroll-container')) {
        e.preventDefault();
      }
    }, { passive: false });

    // 홈 화면 추가 안내
    if (!window.navigator.standalone) {
      const isIPad = navigator.userAgent.match(/iPad/);
      const isIPhone = navigator.userAgent.match(/iPhone/);

      if (isIPad || isIPhone) {
        setTimeout(() => {
          this.showAddToHomeScreen();
        }, 5000);
      }
    }

    // 상태바 스타일
    const metaTag = document.createElement('meta');
    metaTag.name = 'apple-mobile-web-app-status-bar-style';
    metaTag.content = 'black-translucent';
    document.head.appendChild(metaTag);
  }

  showAddToHomeScreen() {
    if (localStorage.getItem('addToHomeShown')) return;

    const message = `
      <div style="padding: 15px; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        <h3 style="margin: 0 0 10px 0;">홈 화면에 추가</h3>
        <p style="margin: 0;">공유 버튼 → "홈 화면에 추가"로 앱처럼 사용하세요!</p>
        <button onclick="this.parentElement.remove(); localStorage.setItem('addToHomeShown', 'true');"
                style="margin-top: 10px; padding: 8px 16px; background: #007AFF; color: white; border: none; border-radius: 5px;">
          확인
        </button>
      </div>
    `;

    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.style.cssText = 'position: fixed; bottom: 20px; left: 20px; right: 20px; z-index: 10000;';
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
      localStorage.setItem('addToHomeShown', 'true');
    }, 15000);
  }

  /**
   * 빠른 액션 메뉴
   */
  showQuickActionMenu(playerCard) {
    const menu = document.createElement('div');
    menu.className = 'quick-action-menu';
    menu.innerHTML = `
      <button data-action="fold">Fold</button>
      <button data-action="check">Check</button>
      <button data-action="call">Call</button>
      <button data-action="raise">Raise</button>
      <button data-action="allin">All In</button>
    `;

    menu.style.cssText = `
      position: absolute;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      padding: 10px;
      z-index: 1000;
      display: flex;
      gap: 5px;
    `;

    playerCard.appendChild(menu);

    // 메뉴 클릭 처리
    menu.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      if (action) {
        // 액션 실행
        const playerName = playerCard.dataset.playerName;
        if (typeof addActionToLog === 'function') {
          addActionToLog(action, null, playerName);
        }
        menu.remove();
      }
    });

    // 3초 후 자동 제거
    setTimeout(() => menu.remove(), 3000);
  }

  /**
   * 알림 표시
   */
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `mobile-notification ${type}`;
    notification.textContent = message;

    notification.style.cssText = `
      position: fixed;
      top: calc(var(--safe-area-inset-top) + 10px);
      left: 10px;
      right: 10px;
      padding: 12px;
      background: ${type === 'success' ? '#4CAF50' : type === 'warning' ? '#FF9800' : '#2196F3'};
      color: white;
      border-radius: 8px;
      z-index: 10000;
      text-align: center;
      animation: slideDown 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideUp 0.3s ease-in';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * 제스처 핸들러 등록
   */
  registerGesture(gesture, handler) {
    this.gestureHandlers.set(gesture, handler);
  }
}

// CSS 애니메이션 추가
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-100%);
      opacity: 0;
    }
  }

  .mobile-notification {
    animation: slideDown 0.3s ease-out;
  }

  .landscape-mode .header {
    display: none !important;
  }

  .landscape-mode main {
    padding-top: 5px !important;
  }
`;
document.head.appendChild(animationStyle);

// 전역 인스턴스 생성
window.mobileEnhancer = new MobileEnhancer();

// 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileEnhancer.initialize();
  });
} else {
  window.mobileEnhancer.initialize();
}