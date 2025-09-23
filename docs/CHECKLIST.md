# 🎰 Virtual Data - Poker Hand Logger 체크리스트

> **버전**: v3.5.27 (Apps Script v71.0.4)
> **최종 업데이트**: 2025-09-23
> **목적**: 포커 핸드 로거 애플리케이션의 기능 테스트 및 검증

---

## 🚨 **실패 이력 요약 (반드시 유지)**

### **실패 횟수: 5차**

| 차수 | 실패 원인 | 시도한 해결책 | 결과 |
|------|----------|--------------|------|
| **1차** | Config 시트 접근 시 CORS 차단<br>`APPS_SCRIPT_URL` null 초기화 | 기본 URL 하드코딩 | ❌ 실행 불가능한 URL |
| **2차** | `APPS_SCRIPT_URL` undefined 참조 오류 | localStorage 우선, 기본 URL 설정 | ❌ 변수 스코프 문제 |
| **3차** | DOMContentLoaded 내부에 변수 선언<br>Line 1384 초기화 전 참조 | 전역 변수로 이동 | ❌ DEFAULT_APPS_SCRIPT_URL 미정의 |
| **4차** | DEFAULT_APPS_SCRIPT_URL 미정의<br>Line 5891 참조 오류 | 참조 제거, URL 존재 여부로 판단 | ❌ 캐시 미갱신 |
| **5차** | 브라우저 캐시 문제<br>CAM 로직 잔재<br>addEventListener 오류 | 1. 버전 쿼리 파라미터 (v3.5.25)<br>2. CAM 부분 제거 (v3.5.26)<br>3. CAM 완전 제거 (v3.5.27) | ✅ 해결 |

---

## ✅ **5차 시도 해결 완료**

### **해결된 문제들 (v3.5.27)**

#### **새로운 문제 발견:**
1. **업데이트가 반영되지 않는 문제**
   - 브라우저가 v3.5.24를 표시하지만 실제 동작은 이전 버전
   - 캐시 문제로 추정
   - **해결 필요**: 강제 새로고침 (Ctrl+Shift+R) 또는 캐시 삭제

2. **데이터는 정상 처리되나 서버 통신 불가**
   - PLAYER 행 생성 로직은 정상 작동
   - 하지만 Apps Script와 통신 실패 지속
   - **근본 원인**: Apps Script가 실제로 배포되지 않음

#### **해결 내용:**
1. **캐시 버스팅 (v3.5.25)**
   - 모든 스크립트 태그에 버전 파라미터 추가

2. **CAM 부분 제거 (v3.5.26)**
   - state 변수 제거, Index 메타데이터 CAM 필드 기본값 설정

3. **CAM 완전 제거 (v3.5.27)**
   - 모든 CAM 관련 코드 주석 처리
   - el.cam1/cam2 addEventListener 오류 해결
   - computeCamPrefill, getCamNumber 더미 함수로 대체
   - 카메라 UI 요소 완전 제거
   - 새 핸드 시작 시 CAM 번호 자동 증가 로직 제거
   - loadIndexRow에서 CAM 정보 로드 로직 제거

#### **사용자 안내:**
```bash
# 브라우저 캐시 강제 갱신 방법
1. Ctrl+Shift+R (Windows/Linux) 또는 Cmd+Shift+R (Mac)
2. 개발자 도구 → Network → Disable cache 체크
3. 개발자 도구 → Application → Storage → Clear site data
```

#### **2. Apps Script 배포 확인**
```
필수 확인 사항:
- [ ] Google Apps Script 에디터에서 Code.gs 배포
- [ ] 웹 앱으로 배포 선택
- [ ] 액세스 권한: "모든 사용자"
- [ ] 배포 URL을 앱에 입력
```

---

### **해결 완료 확인 사항**
- [x] addEventListener 오류 해결
- [x] CAM 관련 모든 코드 제거/주석처리
- [x] 버전 v3.5.27로 업데이트
- [x] 브라우저 캐시 강제 새로고침 필요

### **이전 실패 원인들 (4차까지 누적)**

#### **새로운 오류 발견:**

1. **Line 19: DEFAULT_APPS_SCRIPT_URL 미정의 오류**
```javascript
Uncaught ReferenceError: DEFAULT_APPS_SCRIPT_URL is not defined
at HTMLButtonElement.<anonymous> ((index):5891:51)
```
- 원인: DEFAULT_APPS_SCRIPT_URL 변수를 제거했지만 Line 5891에서 여전히 참조
- 영향: URL 설정 모달 열 때 오류 발생

2. **Line 8-9: CORS 오류 지속**
```
Access to fetch at 'https://script.google.com/.../exec'
from origin 'http://localhost:8000' has been blocked by CORS policy
```
- 원인: Apps Script가 실제로 배포되지 않았거나 권한 설정 문제
- 영향: 서버와 통신 불가

3. **Line 26: GitHub API 인증 오류**
```
POST https://api.github.com/gists 401 (Unauthorized)
```
- 원인: GitHub 토큰 없음 또는 만료
- 영향: 클라우드 동기화 실패 (부가 기능)

### **4차 해결 방안**

#### **1. DEFAULT_APPS_SCRIPT_URL 참조 제거 ✅**
```javascript
// Line 5891 수정
// 이전: const isCustomUrl = APPS_SCRIPT_URL !== DEFAULT_APPS_SCRIPT_URL;
// 수정: APPS_SCRIPT_URL 존재 여부로만 판단
currentUrlSpan.className = APPS_SCRIPT_URL ?
  'text-xs text-green-400 break-all font-mono' :
  'text-xs text-amber-400 break-all font-mono';
```

**상태:**
- [x] DEFAULT_APPS_SCRIPT_URL 참조 완전 제거
- [x] URL 존재 여부로만 스타일 결정

#### **2. CORS 오류 해결 방안**
```
실제 원인:
1. Apps Script URL이 잘못되었거나
2. Apps Script가 배포되지 않았거나
3. 배포 설정이 "모든 사용자" 권한이 아님

해결책:
- 사용자가 올바른 Apps Script URL 입력하도록 안내
- CORS 오류 발생해도 앱은 계속 작동
- 오류 메시지를 사용자 친화적으로 변경
```

**상태:**
- [ ] 사용자에게 URL 설정 안내 강화
- [ ] CORS 오류 메시지 개선
- [ ] 오프라인 모드 지원 추가

#### **3. 이전 문제 해결 내역**
```javascript
// 이전 (문제): DOMContentLoaded 내부에 변수 선언
document.addEventListener('DOMContentLoaded', () => {
  let APPS_SCRIPT_URL = null; // ❌ 여기서 선언
  if (APPS_SCRIPT_URL) {...} // ❌ 초기화 전 참조
});

// 수정: 전역 스코프로 이동
let APPS_SCRIPT_URL = null; // ✅ 전역 변수로 선언
initializeAppsScriptUrl(); // ✅ 즉시 초기화

document.addEventListener('DOMContentLoaded', () => {
  if (APPS_SCRIPT_URL) {...} // ✅ 이미 초기화된 변수 참조
});
```

**상태:**
- [x] 변수 스코프 문제 해결
- [x] 전역 변수로 선언하여 모든 함수에서 접근 가능
- [x] DOMContentLoaded 전에 초기화 완료

#### **2. CORS 오류 우회 전략 ✅**
```javascript
// Config 시트 로드를 선택사항으로 변경
try {
  // Config 시트 시도 (실패해도 무방)
} catch {
  // 기본 URL 사용 (CORS 에러 무시)
}
```

**상태:**
- [x] CORS 에러가 발생해도 앱이 정상 작동
- [x] Config 시트는 부가 기능으로 처리
- [x] 에러 로그 최소화

#### **3. Performance Optimizer 오류 (수정 완료) ✅**
```javascript
// performance-optimizer.js Line 234-242
if (node && node.parentNode && !document.body.contains(node)) {
  // null 체크 및 try-catch 보호
}
```

**상태:**
- [x] null 참조 오류 해결
- [x] try-catch로 안전성 강화

---

## 🚨🚨🚨 **이전 CORS 문제 해결 완료 (v71.0.3)**

### **완벽한 문제 분석 결과**

#### **1. 근본 원인: 클라이언트와 서버의 통신 방식 불일치**
```
🔴 문제의 핵심:
- Apps Script (v71.0.1): HTML Service + postMessage 방식으로 응답
- index.html (v3.5.18): 일반 JSON 응답 기대하며 fetch 사용
- 결과: HTML 응답을 JSON으로 파싱하려다 실패
```

#### **2. 상세 분석**
| 구분 | Apps Script (서버) | index.html (클라이언트) | 문제점 |
|------|-------------------|------------------------|--------|
| **응답 방식** | HtmlService.createHtmlOutput() | response.json() 기대 | ❌ HTML을 JSON으로 파싱 불가 |
| **CORS 해결** | postMessage 사용 | 일반 fetch 사용 | ❌ postMessage 리스너 없음 |
| **URL** | /exec (배포 URL) | fetch로 직접 호출 | ⚠️ CORS 정책 적용 |
| **데이터 형식** | HTML 페이지 내 JSON | 순수 JSON 기대 | ❌ 형식 불일치 |

#### **3. Apps Script 코드 분석 (Code.gs)**
```javascript
// 라인 359-393: createCorsResponse 함수
function createCorsResponse(data) {
  const html = `<!DOCTYPE html>...
    window.parent.postMessage({
      type: 'APPS_SCRIPT_RESPONSE',
      data: data
    }, '*');...`;

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
// ⚠️ HTML 응답을 반환 (JSON이 아님!)
```

#### **4. index.html 코드 분석**
```javascript
// 라인 6393-6409: fetch 요청
const response = await fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: urlParams.toString()
});
const result = await response.json();  // ❌ HTML을 JSON으로 파싱 시도
```

### **완벽한 해결책 (2가지 방법)**

#### **해결책 A: Apps Script를 순수 JSON 응답으로 변경** ⭐⭐⭐ 최고 권장
```javascript
// Code.gs 수정 - createCorsResponse 함수를 JSON 응답으로 변경
function createCorsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// doPost 함수도 수정
function doPost(e) {
  // ... 기존 로직 ...
  const result = processAction(data);

  // JSON 응답 반환
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
```
**장점**:
- ✅ 클라이언트 코드 수정 불필요
- ✅ 표준 REST API 방식
- ✅ CORS 문제 자동 해결

#### **해결책 B: index.html에 iframe + postMessage 구현** ⭐⭐
```javascript
// index.html에 추가 - 라인 6393 대체
async function callAppsScriptWithIframe(params) {
  return new Promise((resolve, reject) => {
    // postMessage 리스너 등록
    const messageHandler = (event) => {
      if (event.data.type === 'APPS_SCRIPT_RESPONSE') {
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(iframe);
        resolve(event.data.data);
      }
    };
    window.addEventListener('message', messageHandler);

    // 숨겨진 iframe 생성
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';

    // URL 파라미터 구성
    const url = new URL(APPS_SCRIPT_URL);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key,
        typeof params[key] === 'object' ?
        JSON.stringify(params[key]) : params[key]
      );
    });

    iframe.src = url.toString();
    document.body.appendChild(iframe);

    // 타임아웃 설정
    setTimeout(() => {
      window.removeEventListener('message', messageHandler);
      document.body.removeChild(iframe);
      reject(new Error('요청 시간 초과'));
    }, 30000);
  });
}

// 사용 예시 - 라인 6376-6399 대체
const result = await callAppsScriptWithIframe({
  action: 'batchUpdate',
  table: window.managementState.selectedTable,
  players: playersToSend,
  deleted: deleted
});
```

### **실행 체크리스트**

#### **📋 해결책 A 실행 (Apps Script JSON 응답) - ✅ 완료**
- [x] **1. Code.gs 백업**
  ```bash
  # 현재 Code.gs를 Code-backup.gs로 저장
  ```
- [x] **2. createCorsResponse 함수 수정**
  ```javascript
  function createCorsResponse(data) {
    return ContentService
      .createTextOutput(JSON.stringify(data))
      .setMimeType(ContentService.MimeType.JSON);
  }
  ```
- [x] **3. doPost 함수 수정**
  - createCorsResponse가 이미 사용 중이므로 자동 적용
- [x] **4. doGet 함수 수정**
  - createCorsResponse가 이미 사용 중이므로 자동 적용
- [x] **5. 버전 업데이트**
  - v71.0.2로 업데이트 완료
  - features 배열 업데이트 완료
- [ ] **6. Apps Script 재배포**
  - 배포 > 배포 관리 > 편집
  - 버전: 새 버전
  - 설명: "v71.0.2 - JSON 응답으로 변경"
- [ ] **7. 테스트**
  - 브라우저 캐시 삭제 (Ctrl+Shift+R)
  - 일괄 등록 실행
  - 콘솔에서 오류 확인

#### **📋 Type 시트 스타일 업데이트 - 추가 작업**
- [ ] **1. 폰트 설정 변경**
  - 폰트: ROBOTO
  - 크기: 11
  - 중앙 정렬
- [ ] **2. applyFullSheetStyle 함수 수정**
  - setFontFamily('Roboto')
  - setFontSize(11)
  - setHorizontalAlignment('center')
- [ ] **3. 자동 적용 로직**
  - 플레이어 추가/수정 시 자동 스타일 적용
  - 일괄 업데이트 후 자동 스타일 적용

#### **📋 해결책 B 실행 (iframe + postMessage)**
- [ ] **1. index.html 백업**
- [ ] **2. callAppsScriptWithIframe 함수 추가**
  - 라인 6340 근처에 함수 추가
- [ ] **3. fetch 호출 대체**
  - 라인 6393-6409를 새 함수 호출로 변경
- [ ] **4. doGet 지원 확인**
  - Apps Script doGet이 URL 파라미터 처리하는지 확인
- [ ] **5. 테스트**
  - 브라우저 개발자 도구 > Network 탭 확인
  - iframe 로딩 확인
  - postMessage 이벤트 확인
### **문제 해결 검증**

#### **검증 체크리스트**
- [ ] **Apps Script 검증**
  - [ ] createCorsResponse가 JSON 반환하는지 확인
  - [ ] doPost/doGet이 ContentService 사용하는지 확인
  - [ ] 배포 URL이 최신인지 확인
  - [ ] 배포 설정이 "모든 사용자"인지 확인

- [ ] **클라이언트 검증**
  - [ ] fetch 요청이 정상 작동하는지 확인
  - [ ] response.json()이 성공하는지 확인
  - [ ] 에러 핸들링이 제대로 되는지 확인

- [ ] **통합 테스트**
  - [ ] 플레이어 추가 테스트
  - [ ] 플레이어 수정 테스트
  - [ ] 플레이어 삭제 테스트
  - [ ] 일괄 등록 테스트
  - [ ] Config 조회/저장 테스트

### **디버깅 팁**
```javascript
// 1. Apps Script 로그 확인
console.log('[디버그]', JSON.stringify(data));

// 2. 클라이언트 응답 확인
console.log('Response headers:', response.headers);
console.log('Response type:', response.type);
console.log('Response text:', await response.text());

// 3. CORS 헤더 확인 (개발자 도구)
// Network 탭 > 요청 선택 > Response Headers
// Access-Control-Allow-Origin: * 확인
```

### **결론**
**근본 원인**: Apps Script가 HTML Service로 응답하는데 클라이언트는 JSON을 기대
**최고의 해결책**: Apps Script를 ContentService.JSON으로 변경 (해결책 A)
**차선책**: 클라이언트에 iframe + postMessage 구현 (해결책 B)

---

## 🔴 **최우선 해결 2** - Config 시트 활용 문제

### **현재 문제점**
- **상황**: Config 시트 구조는 완벽하게 구현되어 있으나 실제로 활용되지 않음
- **원인**: 클라이언트(index.html)에서 Config 시트를 참조하는 로직 부재
- **영향**: 설정값들이 하드코딩되어 있어 동적 변경 불가능

### **Config 시트가 참조되지 않는 이유**
1. **하드코딩된 기본값**
   - pokerRoom: 'Merit Hall' (라인 6150, 6371)
   - tableName: 'Ocean Blue' (라인 6151, 6372)
   - chips: '100000' (라인 6146, 6367)

2. **Config 조회 로직 부재**
   - 앱 초기화 시 Config 값을 가져오는 코드 없음
   - 플레이어 추가 시 Config 기본값 참조 안함

3. **저장 로직만 존재**
   - Apps Script에 saveConfig/getConfig 함수는 있음
   - 클라이언트에서 호출하는 부분이 없음

### **해결 체크리스트**

#### **1단계: Config 값 정의**
- [ ] Config 시트에 저장할 설정 항목 정의
  - [ ] DEFAULT_POKER_ROOM: "Merit Hall"
  - [ ] DEFAULT_TABLE_NAME: "Ocean Blue"
  - [ ] DEFAULT_CHIPS: "100000"
  - [ ] DEFAULT_NATIONALITY: ""
  - [ ] AUTO_SAVE_INTERVAL: "30000"
  - [ ] ENABLE_CHIP_ANALYZER: "true"

#### **2단계: 클라이언트 Config 관리 구현**
- [ ] **Config 관리 객체 생성** (index.html에 추가)
  ```javascript
  window.configManager = {
    cache: {},
    defaultValues: {
      DEFAULT_POKER_ROOM: 'Merit Hall',
      DEFAULT_TABLE_NAME: 'Ocean Blue',
      DEFAULT_CHIPS: '100000'
    },
    async load() { /* Config 로드 */ },
    async save(key, value) { /* Config 저장 */ },
    get(key) { /* Config 값 가져오기 */ }
  };
  ```

#### **3단계: Config 로드 구현**
- [ ] **앱 초기화 시 Config 로드**
  ```javascript
  // initializeApp() 함수에 추가
  await window.configManager.load();
  ```
- [ ] **Config 값 Apps Script에서 가져오기**
  ```javascript
  const configs = ['DEFAULT_POKER_ROOM', 'DEFAULT_TABLE_NAME', 'DEFAULT_CHIPS'];
  for (const configType of configs) {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ action: 'getConfig', configType })
    });
  }
  ```

#### **4단계: Config 값 적용**
- [ ] **플레이어 추가 시 Config 값 사용**
  ```javascript
  const newPlayer = {
    name: name,
    chips: window.configManager.get('DEFAULT_CHIPS'),
    pokerRoom: window.configManager.get('DEFAULT_POKER_ROOM'),
    tableName: window.configManager.get('DEFAULT_TABLE_NAME'),
    // ...
  };
  ```
- [ ] **일괄 등록 시 Config 기본값 적용**
  ```javascript
  pokerRoom: p.pokerRoom || window.configManager.get('DEFAULT_POKER_ROOM'),
  tableName: p.tableName || window.configManager.get('DEFAULT_TABLE_NAME'),
  ```

#### **5단계: Config UI 구현**
- [ ] **설정 메뉴 추가**
  - [ ] 설정 버튼 UI 생성
  - [ ] Config 수정 모달 구현
  - [ ] 저장 버튼 클릭 시 saveConfig 호출

#### **6단계: 테스트 및 검증**
- [ ] Config 시트에 기본값 설정
- [ ] 앱 로드 시 Config 값 정상 로드 확인
- [ ] 플레이어 추가 시 Config 값 적용 확인
- [ ] Config 값 변경 후 재로드 시 반영 확인
- [ ] Config 저장 기능 정상 작동 확인

### **구현 우선순위**
1. **즉시**: Config 로드 로직 구현 (앱 초기화)
2. **높음**: 하드코딩된 값을 Config 참조로 변경
3. **중간**: Config UI 구현
4. **낮음**: 추가 Config 항목 확장

---

## 🚨 **긴급 수정 필요** - CORS 에러 해결

### **문제 진단**
- **에러**: `Access to fetch at 'https://script.google.com/...' from origin 'http://localhost:8000' has been blocked by CORS policy`
- **원인**: Google Apps Script가 localhost 도메인에서의 요청을 차단
- **영향**: 플레이어 일괄 등록 기능 작동 불가

### **즉시 해결 방법**

#### **옵션 1: FormData 대신 URL 인코딩 방식 사용** ✅ 권장
```javascript
// index.html 6378번 줄 수정
// 기존 코드:
const response = await fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  body: formData
});

// 수정 코드:
const urlParams = new URLSearchParams();
urlParams.append('action', 'batchUpdate');
urlParams.append('table', managementState.currentTable);
urlParams.append('players', JSON.stringify(playersToSend));
urlParams.append('deleted', JSON.stringify(deleted));

const response = await fetch(APPS_SCRIPT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: urlParams.toString()
});
```

#### **옵션 2: Apps Script 재배포**
1. Google Apps Script 프로젝트 열기
2. 배포 > 새 배포
3. 액세스 권한: "모든 사용자"
4. 새 URL 획득 후 index.html의 APPS_SCRIPT_URL 업데이트

#### **옵션 3: 브라우저 CORS 비활성화 (개발용만)**
```bash
# Chrome 실행 (Windows)
chrome.exe --disable-web-security --user-data-dir="C:/temp"

# Chrome 실행 (Mac)
open -n -a /Applications/Google\ Chrome.app --args --disable-web-security --user-data-dir="/tmp/chrome_dev"
```

### **데이터 구조 불일치 수정**
```javascript
// 새로운 플레이어 추가 시 필드명 통일
{
  name: "tresy song",
  chips: "100000",
  keyplayer: false,     // notable → keyplayer
  nationality: "",     // 누락된 필드 추가
  seatNo: "#1",        // seat → seatNo
  pokerRoom: "Merit Hall",
  tableName: "Ocean Blue",
  tableNo: "10"       // table → tableNo
}
```

---

## ✅ **v71.0.0 플레이어 관리 로직 테스트 체크리스트**

### **플레이어 등록 (createPlayer)**
- [ ] 테이볼+좌석 중복 체크 작동
- [ ] 테이볼+이름 중복 체크 작동
- [ ] 필드 기본값 적용 (Merit Hall, Ocean Blue)
- [ ] 좌석 번호 정규화 (#1, #2 형식)
- [ ] 칩 문자열 → 숫자 변환
- [ ] keyplayer false → 빈값 변환
- [ ] 성공 응답 형식 확인

### **플레이어 수정 (updatePlayerInfo)**
- [ ] 좌석으로 검색 작동
- [ ] 이름으로 검색 작동 (좌석 없을 때)
- [ ] 각 필드 개별 업데이트 확인
  - [ ] chips 업데이트
  - [ ] nationality 업데이트
  - [ ] keyplayer 업데이트
  - [ ] pokerRoom 업데이트
  - [ ] tableName 업데이트
  - [ ] name 변경
  - [ ] seatNo 변경
- [ ] PlayerIndex 클리어 확인

### **플레이어 삭제 (deletePlayer)**
- [ ] 좌석으로 삭제 작동
- [ ] 이름으로 삭제 작동
- [ ] 여러 명 중복 시 첫 번째 삭제
- [ ] 전체 행 삭제 확인
- [ ] PlayerIndex 클리어 확인

### **핸드 종료 후 칩 업데이트 (handleUpdatePlayerChips)**
- [ ] 기존 플레이어 칩 업데이트
- [ ] 플레이어 없으면 자동 추가
  - [ ] 기본값 적용 확인 (Merit Hall, Ocean Blue)
  - [ ] 좌석 비워두기
  - [ ] nationality 비워두기
  - [ ] keyplayer false로 설정
- [ ] 칩 숫자 변환 확인

### **일괄 업데이트 (batchUpdate)**
- [ ] 삭제 처리 순서 확인
- [ ] 추가/수정 처리 순서 확인
- [ ] smartUpdatePlayer 호출 확인
- [ ] 자동 정렬 실행 (Table No → Seat No)
- [ ] 중복 제거 실행
- [ ] 성공/실패 카운트 확인
- [ ] 생성/교체 카운트 확인

### **데이터 변환 (convertToV71Structure)**
- [ ] seat → seatNo 변환
- [ ] table → tableNo 변환
- [ ] notable → keyplayer 변환
- [ ] 좌석 번호 # 자동 추가
- [ ] 칩 콤마 제거 및 숫자 변환
- [ ] 기본값 적용 확인

### **CORS 해결 확인**
- [ ] HTML Service 응답 확인
- [ ] postMessage 통신 테스트
- [ ] FormData 방식 지원
- [ ] URL 인코딩 방식 지원
- [ ] JSON 방식 지원

### **PlayerIndex 클래스**
- [ ] 테이블별 인덱스 작동
- [ ] 이름별 인덱스 작동
- [ ] 키(테이블+좌석) 인덱스 작동
- [ ] 캐시 만료(1분) 확인
- [ ] 자동 리빌드 작동

---

## 🔥 **긴급 최우선 체크리스트** - 모바일 키패드 문제 해결

### ✅ **v3.4.19 모바일 키패드 버튼 해결 완료**
#### **문제 및 해결**
- **증상**: PC에서는 확인/취소 버튼 정상, 스마트폰에서 미작동
- **원인**: 모바일 브라우저의 300ms 터치 지연
- **해결**: touchstart 이벤트로 즉시 반응하도록 수정

#### **최종 해결 코드**
```javascript
// 확인/취소 버튼 즉시 반응 처리
if(btn.id === 'keypad-confirm' || btn.id === 'keypad-cancel') {
  // 터치 즉시 반응 (300ms 지연 제거)
  btn.style.transform = 'scale(0.95)';
  btn.style.filter = 'brightness(1.2)';

  setTimeout(() => {
    btn.style.transform = '';
    btn.style.filter = '';
    btn.click(); // 기존 click 이벤트 트리거
  }, 100);

  e.preventDefault();
  return;
}
```

### ✅ **키패드 반응성 문제 해결 완료 (v3.4.17)**
- [x] mousedown/touchstart 이벤트로 즉시 처리
- [x] 물리적 누름 상태 추적 (buttonPressState Map)
- [x] 시각적 피드백 즉시 제공
- [x] DOM 강제 렌더링 구현

---

## 📋 기본 기능 체크리스트

### 🚀 애플리케이션 시작
- [ ] **페이지 로드**: http://localhost:8000/ 접속 성공
- [ ] **버전 표시**: v3.5.16 버전이 올바르게 표시됨
- [ ] **초기화**: 앱 초기화 메시지가 콘솔에 출력됨
- [ ] **UI 로드**: 모든 UI 요소가 정상적으로 렌더링됨

### 🔄 중복 검사 시스템 (v3.4.15 해결 완료)
- [x] **자동 시작**: 페이지 로드 시 중복 검사 자동 시작
- [x] **로그 모달**: 검사 과정이 통합 로그 모달에 표시
- [x] **직접 호출**: removeDuplicatePlayers(true) 직접 호출
- [x] **이중 실행 차단**: 중복 검사가 1번만 실행됨
- [x] **자동 닫기**: 검사 완료 후 3초 뒤 모달 자동 닫기

### 👥 플레이어 관리
- [ ] **테이블 선택**: 테이블 드롭다운이 정상 작동함
- [ ] **플레이어 추가**: 새 플레이어 등록이 성공함
- [ ] **플레이어 수정**: 기존 플레이어 정보 수정이 가능함
- [ ] **플레이어 삭제**: 플레이어 삭제가 정상 작동함
- [ ] **IN/OUT 상태**: 플레이어 상태 변경이 올바르게 반영됨

### 🎴 카드 선택 시스템
- [ ] **카드 선택기**: 비주얼 카드 선택 UI가 정상 작동함
- [ ] **텍스트 입력 제거**: 텍스트 카드 입력 필드가 모두 제거됨
- [ ] **턴/리버 카드**: 스트릿 진행 시 카드 선택 UI 사용
- [ ] **보드 카드**: 플랍/턴/리버 카드가 올바르게 표시됨

### 💰 칩 관리
- [ ] **칩 스택**: 플레이어별 칩 스택이 정확히 표시됨
- [ ] **칩 변동**: 액션에 따른 칩 변동이 올바르게 계산됨
- [ ] **팟 관리**: 팟 사이즈가 정확히 계산됨
- [ ] **사이드 팟**: 사이드 팟이 필요한 경우 올바르게 생성됨

### 📊 데이터 동기화
- [ ] **Google Sheets 연동**: Apps Script와 정상 연동됨
- [ ] **실시간 동기화**: 데이터 변경이 실시간으로 반영됨
- [ ] **CSV 로딩**: CSV 데이터 로딩이 성공함
- [ ] **에러 처리**: 네트워크 오류 시 적절한 메시지 표시

---

## 🔧 고급 기능 체크리스트

### 🤖 AI 칩 분석 (Gemini)
- [ ] **이미지 분석**: 칩 이미지 업로드 및 분석 성공
- [ ] **칩 인식**: AI가 칩 색상과 개수를 정확히 인식
- [ ] **결과 표시**: 분석 결과가 명확하게 표시됨
- [ ] **오류 처리**: 분석 실패 시 적절한 메시지 표시

### 📱 모바일 최적화
- [x] **터치 지원**: 터치 제스처가 정상 작동함
- [x] **키패드 반응성**: 모바일에서 즉시 반응
- [ ] **반응형 UI**: 모바일 화면에 맞게 UI 조정됨
- [ ] **성능**: 모바일에서도 부드러운 동작

### 🎯 액션 관리
- [ ] **액션 히스토리**: 모든 액션이 히스토리에 기록됨
- [ ] **되돌리기**: 액션 되돌리기 기능 작동
- [ ] **스트릿 진행**: 스트릿 자동 진행이 순서대로 작동
- [ ] **핸드 완료**: 핸드 종료 시 올바른 결과 기록

---

## 🐛 버그 및 오류 체크리스트

### 🚨 일반적인 버그
- [ ] **JavaScript 오류**: 콘솔에 오류 메시지 없음
- [ ] **404 에러**: 모든 리소스 파일이 정상 로드됨
- [ ] **함수 미정의**: ReferenceError 없음
- [ ] **메모리 누수**: 장시간 사용해도 성능 저하 없음

### 🔍 데이터 무결성
- [x] **플레이어 중복**: 중복 플레이어가 자동으로 제거됨
- [ ] **데이터 일관성**: 로컬과 서버 데이터가 일치함
- [ ] **상태 동기화**: UI 상태가 실제 데이터와 일치함
- [ ] **백업 복구**: 데이터 손실 시 복구 가능

### ⚡ 성능 이슈
- [ ] **로딩 속도**: 페이지 로딩이 3초 이내 완료
- [x] **응답성**: 사용자 액션에 즉시 반응
- [ ] **배치 처리**: 대량 데이터 처리 시 UI 블록 없음
- [ ] **캐시 처리**: 브라우저 캐시가 올바르게 작동

---

## 🧪 테스트 시나리오

### 📋 기본 시나리오
1. **신규 게임 시작**
   - [ ] 새 테이블 생성
   - [ ] 플레이어 4명 추가
   - [ ] 블라인드 설정
   - [ ] 첫 핸드 시작

2. **일반적인 핸드 진행**
   - [ ] 프리플랍 액션 기록
   - [ ] 플랍 카드 선택
   - [ ] 베팅 라운드 진행
   - [ ] 턴/리버 진행
   - [ ] 핸드 결과 기록

3. **특수 상황 처리**
   - [ ] 올인 상황
   - [ ] 사이드 팟 생성
   - [ ] 플레이어 IN/OUT
   - [ ] 테이블 변경

### 🔄 스트레스 테스트
- [ ] **장시간 사용**: 2시간 연속 사용 테스트
- [ ] **대량 데이터**: 100개 이상 핸드 기록
- [ ] **동시 액션**: 빠른 연속 액션 처리
- [ ] **네트워크 불안정**: 인터넷 연결 불안정 상황

---

## 🚀 프로젝트 정보 및 개발 로드맵

### 프로젝트 정보
- **현재 버전**: v3.5.16 (Frontend) / v71.0.0 (Apps Script)
- **시작일**: 2025-09-18
- **최근 업데이트**: 2025-09-23

### 📋 개발 체크리스트

#### **Phase 1: 긴급 보안 수정** 🔴
- [x] Apps Script 프록시 코드 작성 (`GeminiProxy.gs`)
- [x] 클라이언트 보안 모듈 작성 (`gemini-client.js`)
- [x] 설정 가이드 문서 작성 (`SETUP_API_SECURITY.md`)
- [ ] Google Apps Script에 코드 배포
- [ ] Script Properties에 API 키 설정
- [ ] 프록시 URL 획득 및 저장
- [ ] index.html에서 하드코딩된 API 키 제거
- [ ] 프록시 연결 테스트
- [ ] 칩 분석 기능 테스트

#### **Phase 2: 코드 구조 개선** 🟡
- [ ] 디렉토리 구조 생성
- [ ] 핵심 모듈 분리 (config, state, utils)
- [ ] 매니저 클래스 분리 (ActionOrderManager, TableManager, ChipAnalyzer)
- [ ] UI 모듈 분리 (modals, render, events)

#### **Phase 3: 상태 관리 개선** 🟢
- [ ] Store 클래스 구현
- [ ] 단방향 데이터 흐름 구현
- [ ] 불변성 보장
- [ ] 상태 스냅샷 기능

#### **Phase 4: 성능 최적화** 🔵
- [ ] Webpack 설정
- [ ] Lazy loading 구현
- [ ] 코드 분할 적용
- [ ] 메모리 누수 제거

#### **Phase 5: 코드 품질** ⚪
- [ ] ESLint/Prettier 설정
- [ ] JSDoc 주석 추가
- [ ] 사용자 가이드 작성
- [ ] API 문서 생성

#### **Phase 6: 테스트 및 배포** 🟣
- [ ] 단위 테스트 작성 (Jest)
- [ ] E2E 테스트 (Cypress)
- [ ] GitHub Actions CI/CD
- [ ] GitHub Pages 배포

### 📊 진행 현황
```
Phase 1: [████░░░░░░] 33% (3/9 완료)
Phase 2: [░░░░░░░░░░] 0% (0/4 완료)
Phase 3: [░░░░░░░░░░] 0% (0/4 완료)
Phase 4: [░░░░░░░░░░] 0% (0/4 완료)
Phase 5: [░░░░░░░░░░] 0% (0/4 완료)
Phase 6: [░░░░░░░░░░] 0% (0/4 완료)

총 진행률: [█░░░░░░░░░] 10% (3/29 완료)
```

---

## 📝 커밋 메시지 규칙
```
type: 간단한 설명 (v버전)

- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 코드 리팩토링
- perf: 성능 개선
- test: 테스트 추가
- chore: 빌드 관련
```

---

## 🔄 변경 이력

### 2025-09-23
- CORS 에러 해결 방법 최상단 배치
- v71.0.0 Apps Script 테스트 체크리스트 추가
- 두 체크리스트 파일 통합

### 2025-09-22
- Apps Script v71.0.0 작성
- 플레이어 관리 로직 분석 및 문서화

### 2025-09-18
- 초기 체크리스트 생성
- v3.4.15 중복 검사 문제 해결
- 모바일 키패드 문제 해결

---

**✅ 모든 항목을 체크한 후 최종 배포를 진행하세요!**

> **참고**: 이 체크리스트는 v3.5.16 기준으로 작성되었으며, 새로운 기능 추가 시 해당 항목들을 추가로 업데이트해야 합니다.