/**
 * v70.0.0 ULTIMATE - 완전 무결 버전
 *
 * Apps Script CORS 완전 해결 버전
 * - HTML Service 방식 CORS 해결
 * - 모든 HTTP 메서드 완벽 지원
 * - 에러 처리 완전 개선
 */

// ==================== 설정 및 상수 ====================

const SHEET_ID = '1J-lf8bYTLPbpdhieUNdb8ckW_uwdQ3MtSBLmyRIwH7U';
const TYPE_SHEET_NAME = 'Type';
const CONFIG_SHEET_NAME = 'Config';

// Type 시트 컬럼 인덱스 (0부터 시작)
const TYPE_COLUMNS = {
  POKER_ROOM: 0,   // A: Poker Room
  TABLE_NAME: 1,   // B: Table Name
  TABLE_NO: 2,     // C: Table No.
  SEAT_NO: 3,      // D: Seat No.
  PLAYERS: 4,      // E: Players
  NATIONALITY: 5,  // F: Nationality
  CHIPS: 6,        // G: Chips
  KEYPLAYER: 7     // H: Keyplayer
};

// 버전 정보
const VERSION_INFO = {
  version: '70.1.0',
  lastUpdate: '2025-09-23',
  features: [
    '새로운 Type 시트 구조 (8컬럼)',
    'Config 시트 지원',
    'Table No. + Seat No. 복합 키',
    '스마트 업데이트',
    'HTML Service + GET 파라미터 지원'
  ]
};

// ==================== CORS 해결을 위한 HTML Service ====================

function doGet(e) {
  const params = e.parameter;

  // POST 데이터 처리 (GET 파라미터로 전달된 경우)
  if (params.action && params.data) {
    try {
      const data = JSON.parse(params.data);
      data.action = params.action;

      let result;

      switch(data.action) {
        case 'createPlayer':
          result = createPlayer(convertToV70Structure(data, data.tableNo));
          break;
        case 'updatePlayerInfo':
          result = updatePlayerInfo(data.tableNo, data.seatNo, data.playerName, data.updateData || data);
          break;
        case 'deletePlayer':
          result = deletePlayer(data.tableNo, data.seatNo, data.playerName);
          break;
        case 'getTablePlayers':
          result = {
            success: true,
            players: getTablePlayers(data.tableNo),
            count: getTablePlayers(data.tableNo).length
          };
          break;
        default:
          result = {
            success: false,
            message: `알 수 없는 액션: ${data.action}`
          };
      }

      return createCorsResponse(result);

    } catch (error) {
      return createCorsResponse({
        success: false,
        message: error.toString(),
        stack: error.stack
      });
    }
  }

  // API 테스트
  if (params.test === 'true') {
    return createCorsResponse({
      success: true,
      message: 'v70 Ultimate API 테스트 모드',
      version: VERSION_INFO.version,
      features: VERSION_INFO.features,
      timestamp: new Date().toISOString()
    });
  }

  // 테이블 조회
  if (params.table) {
    const players = getTablePlayers(params.table);
    return createCorsResponse({
      success: true,
      table: params.table,
      players: players,
      count: players.length,
      timestamp: new Date().toISOString()
    });
  }

  // 기본 응답
  return createCorsResponse({
    success: true,
    message: 'v70 Ultimate API 정상 작동 중',
    version: VERSION_INFO.version,
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    console.log('[v70] doPost 시작:', new Date().toLocaleString());

    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    console.log('[v70] 요청 액션:', data.action);

    let result;

    switch(data.action) {
      case 'batchUpdate':
        result = handleBatchUpdateEnhanced(data);
        break;
      case 'createPlayer':
        result = createPlayer(convertToV70Structure(data, data.tableNo));
        break;
      case 'updatePlayerInfo':
        result = updatePlayerInfo(data.tableNo, data.seatNo, data.playerName, data.updateData || data);
        break;
      case 'replacePlayer':
        result = replacePlayer(data.tableNo, data.seatNo, convertToV70Structure(data, data.tableNo));
        break;
      case 'smartUpdate':
        result = smartUpdatePlayer(convertToV70Structure(data, data.tableNo));
        break;
      case 'deletePlayer':
        result = deletePlayer(data.tableNo, data.seatNo, data.playerName);
        break;
      case 'getTablePlayers':
        result = {
          success: true,
          players: getTablePlayers(data.tableNo),
          count: getTablePlayers(data.tableNo).length
        };
        break;
      case 'clearSheet':
        result = clearTypeSheet();
        break;
      case 'applyStyle':
        result = applyFullSheetStyle();
        break;
      case 'saveConfig':
        result = saveConfigToSheet(data.configType, data.value);
        break;
      case 'getConfig':
        result = {
          success: true,
          value: getConfigFromSheet(data.configType)
        };
        break;
      default:
        result = {
          success: false,
          message: `알 수 없는 액션: ${data.action}`
        };
    }

    return createCorsResponse(result);

  } catch (error) {
    console.error('[v70] doPost 오류:', error);
    return createCorsResponse({
      success: false,
      message: error.toString(),
      stack: error.stack
    });
  }
}

// CORS 응답 생성 함수
function createCorsResponse(data) {
  const jsonResponse = JSON.stringify(data);

  // HTML을 통한 JSONP 응답으로 CORS 우회
  const html = `
<!DOCTYPE html>
<html>
<head>
  <script>
    // CORS 우회를 위한 postMessage 사용
    const data = ${jsonResponse};

    // 부모 창이 있으면 postMessage로 전송
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'APPS_SCRIPT_RESPONSE',
        data: data
      }, '*');
    }

    // 직접 접근 시 JSON 표시
    document.addEventListener('DOMContentLoaded', function() {
      document.body.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
    });
  </script>
</head>
<body>
  <pre id="response">${jsonResponse}</pre>
</body>
</html>`;

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ==================== PlayerIndex 클래스 ====================

class PlayerIndex {
  constructor() {
    this.indexByKey = new Map();
    this.indexByName = new Map();
    this.indexByTable = new Map();
    this.lastBuildTime = 0;
    this.cacheExpiry = 60000; // 1분
  }

  needsRebuild() {
    return Date.now() - this.lastBuildTime > this.cacheExpiry;
  }

  build(data) {
    console.log('[PlayerIndex] 인덱스 빌드 시작');
    this.clear();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 8) continue;

      const tableNo = String(row[TYPE_COLUMNS.TABLE_NO] || '').trim();
      const seatNo = String(row[TYPE_COLUMNS.SEAT_NO] || '').trim();
      const name = String(row[TYPE_COLUMNS.PLAYERS] || '').trim();

      if (!tableNo || !seatNo || !name) continue;

      const key = `${tableNo}_${seatNo}`;

      // 키 인덱스
      this.indexByKey.set(key, i);

      // 이름 인덱스
      if (!this.indexByName.has(name)) {
        this.indexByName.set(name, []);
      }
      this.indexByName.get(name).push(i);

      // 테이블 인덱스
      if (!this.indexByTable.has(tableNo)) {
        this.indexByTable.set(tableNo, []);
      }
      this.indexByTable.get(tableNo).push(i);
    }

    this.lastBuildTime = Date.now();
    console.log(`[PlayerIndex] 빌드 완료: ${this.indexByKey.size}명`);
  }

  clear() {
    this.indexByKey.clear();
    this.indexByName.clear();
    this.indexByTable.clear();
  }

  findByKey(tableNo, seatNo) {
    const key = `${tableNo}_${seatNo}`;
    return this.indexByKey.get(key);
  }

  findByName(name) {
    return this.indexByName.get(name) || [];
  }

  findByTable(tableNo) {
    return this.indexByTable.get(tableNo) || [];
  }
}

// 전역 인덱스 인스턴스
const playerIndex = new PlayerIndex();

// ==================== Sheet 접근 함수 ====================

function getSheet(sheetName = TYPE_SHEET_NAME) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    return spreadsheet.getSheetByName(sheetName);
  } catch (error) {
    console.log('[getSheet] openById 실패, 활성 시트 사용:', error.toString());
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('스프레드시트에 접근할 수 없습니다. Apps Script를 Google Sheets에서 실행해주세요.');
    }
    return spreadsheet.getSheetByName(sheetName);
  }
}

function getTypeSheetData() {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  if (playerIndex.needsRebuild()) {
    playerIndex.build(data);
  }

  return data;
}

// ==================== 플레이어 관리 함수 ====================

function createPlayer(playerData) {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const data = getTypeSheetData();

  const tableNo = String(playerData.tableNo || '').trim();
  const seatNo = String(playerData.seatNo || '').trim();

  // 중복 체크
  const existingRow = playerIndex.findByKey(tableNo, seatNo);
  if (existingRow) {
    return {
      success: false,
      message: `Table ${tableNo} Seat ${seatNo}에 이미 플레이어가 있습니다`,
      action: 'duplicate_found'
    };
  }

  // 새 플레이어 추가
  const newRow = [
    playerData.pokerRoom || '',
    playerData.tableName || '',
    tableNo,
    seatNo,
    playerData.name || '',
    playerData.nationality || '',
    playerData.chips || 0,
    playerData.keyplayer === true ? 'TRUE' : ''
  ];

  sheet.appendRow(newRow);
  playerIndex.clear(); // 인덱스 재빌드 필요

  return {
    success: true,
    message: '플레이어 등록 성공',
    action: 'created'
  };
}

function updatePlayerInfo(tableNo, seatNo, playerName, updateData) {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const data = getTypeSheetData();

  const rowIndex = playerIndex.findByKey(tableNo, seatNo);
  if (!rowIndex) {
    return {
      success: false,
      message: '플레이어를 찾을 수 없습니다'
    };
  }

  const row = data[rowIndex];
  if (row[TYPE_COLUMNS.PLAYERS] !== playerName) {
    return {
      success: false,
      message: '플레이어 이름이 일치하지 않습니다'
    };
  }

  // 업데이트할 필드만 수정
  if (updateData.chips !== undefined) {
    sheet.getRange(rowIndex + 1, TYPE_COLUMNS.CHIPS + 1).setValue(updateData.chips);
  }
  if (updateData.nationality !== undefined) {
    sheet.getRange(rowIndex + 1, TYPE_COLUMNS.NATIONALITY + 1).setValue(updateData.nationality);
  }
  if (updateData.keyplayer !== undefined) {
    sheet.getRange(rowIndex + 1, TYPE_COLUMNS.KEYPLAYER + 1)
      .setValue(updateData.keyplayer ? 'TRUE' : '');
  }
  if (updateData.pokerRoom !== undefined) {
    sheet.getRange(rowIndex + 1, TYPE_COLUMNS.POKER_ROOM + 1).setValue(updateData.pokerRoom);
  }
  if (updateData.tableName !== undefined) {
    sheet.getRange(rowIndex + 1, TYPE_COLUMNS.TABLE_NAME + 1).setValue(updateData.tableName);
  }

  playerIndex.clear();

  return {
    success: true,
    message: '플레이어 정보 업데이트 성공',
    action: 'updated'
  };
}

function replacePlayer(tableNo, seatNo, newPlayerData) {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const data = getTypeSheetData();

  const rowIndex = playerIndex.findByKey(tableNo, seatNo);
  if (!rowIndex) {
    return createPlayer(newPlayerData);
  }

  // 기존 플레이어 교체
  const updatedRow = [
    newPlayerData.pokerRoom || '',
    newPlayerData.tableName || '',
    tableNo,
    seatNo,
    newPlayerData.name || '',
    newPlayerData.nationality || '',
    newPlayerData.chips || 0,
    newPlayerData.keyplayer === true ? 'TRUE' : ''
  ];

  const range = sheet.getRange(rowIndex + 1, 1, 1, 8);
  range.setValues([updatedRow]);

  playerIndex.clear();

  return {
    success: true,
    message: '플레이어 교체 성공',
    action: 'replaced'
  };
}

function smartUpdatePlayer(playerData) {
  const tableNo = String(playerData.tableNo || '').trim();
  const seatNo = String(playerData.seatNo || '').trim();

  const data = getTypeSheetData();
  const existingRow = playerIndex.findByKey(tableNo, seatNo);

  if (!existingRow) {
    return createPlayer(playerData);
  }

  const currentPlayer = data[existingRow][TYPE_COLUMNS.PLAYERS];

  if (currentPlayer !== playerData.name) {
    if (playerData.forceReplace) {
      return replacePlayer(tableNo, seatNo, playerData);
    }

    return {
      success: false,
      action: 'need_confirm',
      message: '자리에 다른 플레이어가 있습니다',
      currentPlayer: currentPlayer,
      newPlayer: playerData.name,
      tableNo: tableNo,
      seatNo: seatNo
    };
  }

  return updatePlayerInfo(tableNo, seatNo, playerData.name, playerData);
}

function deletePlayer(tableNo, seatNo, playerName) {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const data = getTypeSheetData();

  const rowIndex = playerIndex.findByKey(tableNo, seatNo);

  if (!rowIndex) {
    return {
      success: false,
      message: '플레이어를 찾을 수 없습니다'
    };
  }

  if (playerName && data[rowIndex][TYPE_COLUMNS.PLAYERS] !== playerName) {
    return {
      success: false,
      message: '플레이어 이름이 일치하지 않습니다'
    };
  }

  sheet.deleteRow(rowIndex + 1);
  playerIndex.clear();

  return {
    success: true,
    message: '플레이어 삭제 성공',
    action: 'deleted'
  };
}

function getTablePlayers(tableNo) {
  const data = getTypeSheetData();
  const players = [];

  const rowIndices = playerIndex.findByTable(tableNo);

  for (const rowIndex of rowIndices) {
    const row = data[rowIndex];
    players.push({
      pokerRoom: row[TYPE_COLUMNS.POKER_ROOM],
      tableName: row[TYPE_COLUMNS.TABLE_NAME],
      tableNo: row[TYPE_COLUMNS.TABLE_NO],
      seatNo: row[TYPE_COLUMNS.SEAT_NO],
      name: row[TYPE_COLUMNS.PLAYERS],
      nationality: row[TYPE_COLUMNS.NATIONALITY],
      chips: row[TYPE_COLUMNS.CHIPS],
      keyplayer: row[TYPE_COLUMNS.KEYPLAYER] === 'TRUE'
    });
  }

  return players;
}

// ==================== 시트 관리 함수 ====================

function clearTypeSheet() {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }

  playerIndex.clear();

  return {
    success: true,
    message: 'Type 시트 초기화 완료'
  };
}

function sortTypeSheet() {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    const range = sheet.getRange(2, 1, lastRow - 1, 8);
    range.sort([
      {column: TYPE_COLUMNS.TABLE_NO + 1, ascending: true},
      {column: TYPE_COLUMNS.SEAT_NO + 1, ascending: true}
    ]);
  }
}

function applyFullSheetStyle() {
  const sheet = getSheet(TYPE_SHEET_NAME);
  const range = sheet.getDataRange();

  range.setFontFamily('Roboto');
  range.setFontSize(11);
  range.setHorizontalAlignment('center');
  range.setVerticalAlignment('middle');

  const headerRange = sheet.getRange(1, 1, 1, 8);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#f0f0f0');

  return {
    success: true,
    message: '스타일 적용 완료'
  };
}

// ==================== Config 시트 관리 ====================

function saveConfigToSheet(configType, value) {
  try {
    let sheet = getSheet(CONFIG_SHEET_NAME);
    if (!sheet) {
      const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
      sheet = spreadsheet.insertSheet(CONFIG_SHEET_NAME);
      sheet.appendRow(['ConfigType', 'Value', 'UpdatedAt']);
    }

    const data = sheet.getDataRange().getValues();
    let configRow = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === configType) {
        configRow = i + 1;
        break;
      }
    }

    const now = new Date().toISOString();

    if (configRow > 0) {
      sheet.getRange(configRow, 2).setValue(value);
      sheet.getRange(configRow, 3).setValue(now);
    } else {
      sheet.appendRow([configType, value, now]);
    }

    return { success: true };
  } catch (error) {
    console.error('Config 저장 오류:', error);
    return { success: false, error: error.toString() };
  }
}

function getConfigFromSheet(configType) {
  try {
    const sheet = getSheet(CONFIG_SHEET_NAME);
    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === configType) {
        return data[i][1];
      }
    }

    return null;
  } catch (error) {
    console.error('Config 조회 오류:', error);
    return null;
  }
}

// ==================== 헬퍼 함수 ====================

function handleBatchUpdateEnhanced(data) {
  console.log('[v70] Enhanced 배치 업데이트 시작');

  const tableNo = data.table || data.tableNo;
  const players = data.players || [];
  const deleted = data.deleted || [];

  let successCount = 0;
  let errorCount = 0;
  let replacedCount = 0;
  const results = [];

  // 1. 삭제 처리
  for (const deletedPlayer of deleted) {
    try {
      const result = deletePlayer(
        tableNo,
        deletedPlayer.seatNo || deletedPlayer.seat,
        deletedPlayer.name
      );

      if (result.success) {
        successCount++;
      } else {
        errorCount++;
      }
      results.push(result);
    } catch (error) {
      errorCount++;
      console.error(`[v70] 삭제 오류: ${deletedPlayer.name}`, error);
    }
  }

  // 2. 추가/업데이트 처리
  for (const player of players) {
    try {
      const playerData = convertToV70Structure(player, tableNo);
      playerData.forceReplace = data.forceReplace || false;

      const result = smartUpdatePlayer(playerData);

      if (result.success) {
        successCount++;
        if (result.action === 'replaced') {
          replacedCount++;
        }
      } else if (result.action === 'need_confirm') {
        errorCount++;
      } else {
        errorCount++;
      }

      results.push(result);
    } catch (error) {
      errorCount++;
      console.error(`[v70] 처리 오류: ${player.name}`, error);
    }
  }

  // 3. 정렬 및 스타일
  sortTypeSheet();
  applyFullSheetStyle();

  return {
    success: errorCount === 0,
    message: `처리 완료: 성공 ${successCount}, 실패 ${errorCount}, 교체 ${replacedCount}`,
    successCount: successCount,
    errorCount: errorCount,
    replacedCount: replacedCount,
    results: results
  };
}

function convertToV70Structure(oldData, defaultTableNo) {
  console.log('[v70] 데이터 변환:', JSON.stringify(oldData));

  // 좌석 번호 정규화
  let seatNo = oldData.seatNo || oldData.seat || '';
  seatNo = seatNo.toString().replace(/^#0*/, '#');
  if (!seatNo.startsWith('#')) {
    seatNo = `#${seatNo}`;
  }

  // 칩 파싱
  let chips = oldData.chips || 0;
  if (typeof chips === 'string') {
    chips = parseInt(chips.replace(/,/g, '')) || 0;
  }

  // keyplayer/notable 변환
  let keyplayer = oldData.keyplayer;
  if (keyplayer === undefined && oldData.notable !== undefined) {
    keyplayer = oldData.notable;
  }

  return {
    pokerRoom: oldData.pokerRoom || '',
    tableName: oldData.tableName || '',
    tableNo: oldData.tableNo || oldData.table || defaultTableNo || '',
    seatNo: seatNo,
    name: oldData.name || oldData.player || '',
    nationality: oldData.nationality || '',
    chips: chips,
    keyplayer: keyplayer === true || keyplayer === 'TRUE',
    forceReplace: oldData.forceReplace || false
  };
}

console.log('[v70.0.0 ULTIMATE] HTML Service CORS 완전 해결 버전 로드 완료');