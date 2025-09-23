// CORS 우회 설정 (v3.5.31)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const USE_CORS_PROXY = false; // 필요시 true로 변경

// Google Sheets CSV URL에 CORS 프록시 적용
function getCorsProxyUrl(url) {
  if (USE_CORS_PROXY && url.includes('docs.google.com')) {
    return CORS_PROXY + url;
  }
  return url;
}

// 로컬 개발용 대체 데이터
const FALLBACK_DATA = {
  config: {
    headers: ['Setting', 'Value'],
    data: [
      ['APPS_SCRIPT_URL', ''],
      ['VERSION', 'v3.5.31'],
      ['DEBUG_MODE', 'true']
    ]
  },
  players: {
    headers: ['Name', 'Table', 'Seat', 'Stack'],
    data: []
  }
};

console.log('📌 CORS 설정 로드됨 (로컬 개발 모드)');