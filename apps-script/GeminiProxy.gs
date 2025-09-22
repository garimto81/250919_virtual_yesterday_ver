/**
 * Gemini API Proxy for Poker Hand Logger
 * Version: 1.0.0
 * Description: 서버사이드 API 키 보호를 위한 프록시
 */

// API 키는 Apps Script 프로젝트 설정에서 관리
// File > Project Settings > Script Properties에서 GEMINI_API_KEY 설정

function doPost(e) {
  try {
    // Script Properties에서 API 키 가져오기
    const scriptProperties = PropertiesService.getScriptProperties();
    const GEMINI_API_KEY = scriptProperties.getProperty('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      return ContentService
        .createTextOutput(JSON.stringify({
          error: 'API key not configured',
          message: 'Please set GEMINI_API_KEY in Script Properties'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 요청 데이터 파싱
    const requestData = JSON.parse(e.postData.contents);

    // 요청 검증 (옵션)
    if (!requestData.contents || !Array.isArray(requestData.contents)) {
      return ContentService
        .createTextOutput(JSON.stringify({
          error: 'Invalid request format'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Gemini API 호출
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const response = UrlFetchApp.fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      payload: JSON.stringify(requestData),
      muteHttpExceptions: true
    });

    // 응답 반환
    return ContentService
      .createTextOutput(response.getContentText())
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Proxy error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Proxy error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'active',
      version: '1.0.0',
      description: 'Gemini API Proxy for Poker Hand Logger'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// API 키 설정 헬퍼 함수
function setApiKey(apiKey) {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('GEMINI_API_KEY', apiKey);
  return 'API Key set successfully';
}

// API 키 확인 함수 (디버깅용)
function checkApiKey() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('GEMINI_API_KEY');
  return apiKey ? 'API Key is configured' : 'API Key is not configured';
}