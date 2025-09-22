# API 보안 설정 가이드

## 목적
클라이언트 코드에 노출된 Gemini API 키를 서버사이드로 이동하여 보안 강화

## 설정 단계

### 1. Google Apps Script 프로젝트 생성

1. [Google Apps Script](https://script.google.com) 접속
2. "새 프로젝트" 클릭
3. 프로젝트 이름을 "PokerHandLogger-GeminiProxy"로 설정

### 2. 프록시 코드 배포

1. `apps-script/GeminiProxy.gs` 파일 내용을 복사
2. Apps Script 편집기에 붙여넣기
3. 저장 (Ctrl+S)

### 3. API 키 설정

1. Apps Script 편집기에서:
   - 파일 > 프로젝트 설정
   - "스크립트 속성" 섹션으로 스크롤
   - "속성 추가" 클릭

2. 다음 정보 입력:
   - 속성: `GEMINI_API_KEY`
   - 값: `여기에_실제_API_키_입력`

3. "스크립트 속성 저장" 클릭

### 4. 웹 앱으로 배포

1. 편집기 상단의 "배포" > "새 배포" 클릭
2. 설정:
   - 유형: 웹 앱
   - 설명: "Gemini API Proxy v1"
   - 실행: "나"
   - 액세스 권한: "모든 사용자"
3. "배포" 클릭
4. **웹 앱 URL 복사** (중요!)

### 5. 클라이언트 설정

1. 포커 핸드 로거 앱 열기
2. 설정 버튼(⚙️) 클릭
3. "Gemini Proxy URL" 필드에 복사한 URL 붙여넣기
4. 저장

## 확인 사항

### ✅ 보안 체크리스트

- [ ] API 키가 코드에서 완전히 제거됨
- [ ] Apps Script 속성에 API 키 저장됨
- [ ] 프록시 URL이 HTTPS로 시작함
- [ ] 테스트 연결 성공

### 🧪 테스트 방법

1. 개발자 도구 콘솔 열기 (F12)
2. 다음 코드 실행:
```javascript
await window.geminiClient.testConnection()
```

3. 성공 응답 확인:
```javascript
{
  success: true,
  data: {
    status: 'active',
    version: '1.0.0'
  }
}
```

## 문제 해결

### "API key not configured" 에러
- Apps Script 프로젝트 설정에서 GEMINI_API_KEY 확인
- 속성 이름 철자 확인

### "Proxy URL not configured" 에러
- 설정에서 Proxy URL 입력 확인
- URL 형식 확인 (https://script.google.com/...)

### CORS 에러
- Apps Script 배포 설정에서 "모든 사용자" 선택 확인
- 새 버전으로 재배포 시도

## 보안 권장사항

1. **API 키 로테이션**: 3개월마다 API 키 변경
2. **사용량 모니터링**: Google Cloud Console에서 API 사용량 확인
3. **접근 제한**: 필요시 Apps Script에서 특정 도메인만 허용
4. **로깅**: 의심스러운 활동 모니터링

## 원복 방법

긴급 상황 시 이전 버전으로 복원:
1. `index.html`에서 Line 1307의 주석 해제
2. `src/js/gemini-client.js` 제거
3. 기존 함수 사용

---

**작성일**: 2025-09-22
**버전**: 1.0.0