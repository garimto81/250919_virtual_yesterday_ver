/**
 * 성능 최적화 모듈
 * Version: 1.0.0
 * Description: 모바일 반응성 개선 및 메모리 관리
 */

class PerformanceOptimizer {
  constructor() {
    this.eventListeners = new WeakMap();
    this.renderQueue = [];
    this.isRendering = false;
    this.touchHandled = false;
    this.memoryThreshold = 50 * 1024 * 1024; // 50MB

    // 성능 모니터링
    this.performanceStats = {
      renderCount: 0,
      eventCount: 0,
      memoryWarnings: 0
    };
  }

  /**
   * 1. 터치 이벤트 최적화
   */
  optimizeTouchEvents() {
    // CSS로 300ms 지연 제거
    const style = document.createElement('style');
    style.textContent = `
      * {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      button, .btn, .clickable {
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
      }

      /* 스크롤 성능 개선 */
      .scrollable {
        -webkit-overflow-scrolling: touch;
        will-change: transform;
      }
    `;
    document.head.appendChild(style);

    // FastClick 대체 구현
    this.initFastClick();
  }

  /**
   * FastClick 대체 - 즉시 반응
   */
  initFastClick() {
    let touchStartTime;
    let touchStartX;
    let touchStartY;
    const threshold = 10; // 10px 움직임 허용

    document.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      this.touchHandled = false;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndTime = Date.now();
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      // 300ms 이내 & 10px 이내 움직임 = 클릭
      if (touchEndTime - touchStartTime < 300) {
        const moveX = Math.abs(touchEndX - touchStartX);
        const moveY = Math.abs(touchEndY - touchStartY);

        if (moveX < threshold && moveY < threshold) {
          // 버튼과 클릭 가능한 요소만 처리
          const target = e.target;
          const isClickable = target.matches('button, .btn, .clickable, a, input, select, textarea');

          if (isClickable) {
            e.preventDefault();

            // 즉시 클릭 이벤트 발생
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
              clientX: touchEndX,
              clientY: touchEndY
            });

            e.target.dispatchEvent(clickEvent);
            this.touchHandled = true;
          }
          // 클릭 가능하지 않은 요소는 스크롤 허용
        }
      }
    }, { passive: false });

    // 마우스 이벤트 중복 방지
    document.addEventListener('click', (e) => {
      if (this.touchHandled) {
        e.preventDefault();
        e.stopPropagation();
        this.touchHandled = false;
      }
    }, true);
  }

  /**
   * 2. 이벤트 리스너 관리
   */
  addManagedEventListener(element, event, handler, options = {}) {
    // 기존 리스너 제거
    this.removeManagedEventListener(element, event);

    // 새 리스너 등록
    const wrappedHandler = (e) => {
      this.performanceStats.eventCount++;
      handler(e);
    };

    element.addEventListener(event, wrappedHandler, options);

    // WeakMap에 저장 (자동 가비지 컬렉션)
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, {});
    }
    this.eventListeners.get(element)[event] = wrappedHandler;
  }

  /**
   * 이벤트 리스너 제거
   */
  removeManagedEventListener(element, event) {
    const listeners = this.eventListeners.get(element);
    if (listeners && listeners[event]) {
      element.removeEventListener(event, listeners[event]);
      delete listeners[event];
    }
  }

  /**
   * 3. 렌더링 최적화 - requestAnimationFrame 활용
   */
  optimizedRender(renderFunction) {
    this.renderQueue.push(renderFunction);

    if (!this.isRendering) {
      this.isRendering = true;
      requestAnimationFrame(() => {
        this.procesRenderQueue();
      });
    }
  }

  procesRenderQueue() {
    const startTime = performance.now();

    // 배치 렌더링
    while (this.renderQueue.length > 0 && performance.now() - startTime < 16) {
      const render = this.renderQueue.shift();
      render();
      this.performanceStats.renderCount++;
    }

    if (this.renderQueue.length > 0) {
      requestAnimationFrame(() => this.procesRenderQueue());
    } else {
      this.isRendering = false;
    }
  }

  /**
   * 4. 메모리 관리
   */
  setupMemoryManagement() {
    // 주기적 메모리 체크 (5분마다)
    setInterval(() => {
      this.checkMemory();
      this.cleanupOldData();
    }, 5 * 60 * 1000);

    // 페이지 비활성화 시 정리
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performCleanup();
      }
    });
  }

  checkMemory() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;

      if (used > this.memoryThreshold) {
        console.warn(`메모리 사용량 높음: ${(used / 1024 / 1024).toFixed(2)}MB`);
        this.performanceStats.memoryWarnings++;
        this.performCleanup();
      }
    }
  }

  cleanupOldData() {
    // 1. 오래된 액션 로그 제거 (최근 100개만 유지)
    if (window.state && window.state.actionState) {
      const streets = ['preflop', 'flop', 'turn', 'river'];
      streets.forEach(street => {
        const actions = window.state.actionState[street];
        if (Array.isArray(actions) && actions.length > 100) {
          window.state.actionState[street] = actions.slice(-100);
        }
      });
    }

    // 2. console.log 제한 (최근 50개만 유지)
    if (window.logBuffer && window.logBuffer.length > 50) {
      window.logBuffer = window.logBuffer.slice(-50);
    }

    // 3. DOM 요소 정리
    this.cleanupDetachedNodes();
  }

  cleanupDetachedNodes() {
    // 분리된 DOM 노드 찾아서 제거
    const allNodes = document.querySelectorAll('*');
    allNodes.forEach(node => {
      if (!document.body.contains(node) && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  performCleanup() {
    // 강제 가비지 컬렉션 트리거
    if (window.gc) {
      window.gc();
    }

    // 이미지 캐시 정리
    this.clearImageCache();

    // 불필요한 타이머 정리
    this.clearUnusedTimers();
  }

  clearImageCache() {
    // 사용하지 않는 이미지 URL 해제
    const images = document.querySelectorAll('img[src^="blob:"]');
    images.forEach(img => {
      if (!img.offsetParent) { // 화면에 보이지 않는 이미지
        URL.revokeObjectURL(img.src);
        img.src = '';
      }
    });
  }

  clearUnusedTimers() {
    // 활성 타이머 ID 추적 및 정리
    if (window.activeTimers) {
      window.activeTimers.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      window.activeTimers.clear();
    }
  }

  /**
   * 5. 가상 스크롤 구현
   */
  setupVirtualScroll(container, items, itemHeight = 50) {
    const visibleCount = Math.ceil(container.clientHeight / itemHeight);
    const totalHeight = items.length * itemHeight;

    // 스크롤 컨테이너 설정
    container.style.overflowY = 'auto';
    container.style.position = 'relative';

    // 가상 높이 설정
    const scrollSpace = document.createElement('div');
    scrollSpace.style.height = `${totalHeight}px`;
    container.appendChild(scrollSpace);

    // 보이는 항목만 렌더링
    const renderVisibleItems = () => {
      const scrollTop = container.scrollTop;
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

      // 기존 항목 제거
      container.querySelectorAll('.virtual-item').forEach(el => el.remove());

      // 보이는 항목만 추가
      for (let i = startIndex; i < endIndex; i++) {
        const item = items[i];
        const element = this.createItemElement(item);
        element.classList.add('virtual-item');
        element.style.position = 'absolute';
        element.style.top = `${i * itemHeight}px`;
        element.style.height = `${itemHeight}px`;
        container.appendChild(element);
      }
    };

    // 스크롤 이벤트 최적화 (throttle)
    let scrollTimeout;
    container.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(renderVisibleItems, 16); // 60fps
    }, { passive: true });

    // 초기 렌더링
    renderVisibleItems();
  }

  createItemElement(item) {
    const div = document.createElement('div');
    div.textContent = item.name || item.toString();
    return div;
  }

  /**
   * 6. 디바운싱 & 스로틀링
   */
  debounce(func, wait = 250) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * 성능 모니터링 리포트
   */
  getPerformanceReport() {
    const report = {
      ...this.performanceStats,
      memoryUsage: performance.memory ?
        (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB' :
        'N/A',
      renderFPS: this.calculateFPS(),
      recommendation: this.getRecommendation()
    };

    return report;
  }

  calculateFPS() {
    // 간단한 FPS 계산
    const now = performance.now();
    const elapsed = now - (this.lastFrameTime || now);
    this.lastFrameTime = now;
    return Math.round(1000 / elapsed);
  }

  getRecommendation() {
    const recommendations = [];

    if (this.performanceStats.memoryWarnings > 0) {
      recommendations.push('메모리 사용량이 높습니다. 페이지 새로고침을 권장합니다.');
    }

    if (this.performanceStats.renderCount > 1000) {
      recommendations.push('렌더링 횟수가 많습니다. 작업을 저장하고 새로 시작하세요.');
    }

    return recommendations.length > 0 ? recommendations : ['성능 양호'];
  }

  /**
   * 초기화
   */
  initialize() {
    console.log('🚀 Performance Optimizer 초기화');

    // 1. 터치 최적화
    this.optimizeTouchEvents();

    // 2. 메모리 관리 설정
    this.setupMemoryManagement();

    // 3. 전역 활성 타이머 추적
    window.activeTimers = new Set();

    // 4. 로그 버퍼 제한
    window.logBuffer = [];
    const originalLog = console.log;
    console.log = (...args) => {
      window.logBuffer.push(args);
      if (window.logBuffer.length > 50) {
        window.logBuffer.shift();
      }
      originalLog.apply(console, args);
    };

    // 5. 성능 모니터링 시작
    this.startMonitoring();
  }

  startMonitoring() {
    // 개발 모드에서만 성능 모니터 표시
    if (localStorage.getItem('debug') === 'true') {
      setInterval(() => {
        const report = this.getPerformanceReport();
        console.log('📊 Performance:', report);
      }, 10000); // 10초마다
    }
  }
}

// 전역 인스턴스 생성 및 초기화
window.performanceOptimizer = new PerformanceOptimizer();

// DOM 준비 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer.initialize();
  });
} else {
  window.performanceOptimizer.initialize();
}

// 기존 renderAll 함수 래핑
if (typeof window.renderAll === 'function') {
  const originalRenderAll = window.renderAll;
  window.renderAll = function(...args) {
    window.performanceOptimizer.optimizedRender(() => {
      originalRenderAll.apply(this, args);
    });
  };
}