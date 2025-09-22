/**
 * Gemini API Client Module
 * Version: 1.0.0
 * Description: 서버 프록시를 통한 안전한 Gemini API 호출
 */

class GeminiClient {
  constructor(proxyUrl) {
    this.proxyUrl = proxyUrl || localStorage.getItem('geminiProxyUrl');
    if (!this.proxyUrl) {
      console.warn('Gemini Proxy URL not configured');
    }
  }

  /**
   * 프록시 URL 설정
   */
  setProxyUrl(url) {
    this.proxyUrl = url;
    localStorage.setItem('geminiProxyUrl', url);
  }

  /**
   * Gemini API 호출
   * @param {Array} contents - API 요청 내용
   * @param {Object} options - 추가 옵션
   */
  async generateContent(contents, options = {}) {
    if (!this.proxyUrl) {
      throw new Error('Proxy URL not configured. Please deploy Apps Script and set URL.');
    }

    try {
      const requestBody = {
        contents: contents,
        generationConfig: options.generationConfig || {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: options.safetySettings || []
      };

      const response = await fetch(this.proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain' // Apps Script 요구사항
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Proxy error: ${response.status}`);
      }

      const data = await response.json();

      // 에러 체크
      if (data.error) {
        throw new Error(data.error + ': ' + (data.message || ''));
      }

      return data;

    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  /**
   * 칩 분석 요청
   * @param {String} imageBase64 - Base64 인코딩된 이미지
   * @param {Array} chipColors - 칩 색상 정보
   */
  async analyzeChips(imageBase64, chipColors) {
    const prompt = `포커 칩 스택을 분석해주세요.
    칩 색상과 값: ${JSON.stringify(chipColors)}
    각 색상별 칩 개수와 총 금액을 계산해주세요.`;

    const contents = [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
          }
        }
      ]
    }];

    return await this.generateContent(contents);
  }

  /**
   * 프록시 연결 테스트
   */
  async testConnection() {
    if (!this.proxyUrl) {
      return { success: false, error: 'Proxy URL not configured' };
    }

    try {
      const response = await fetch(this.proxyUrl);
      const data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// 전역 인스턴스 생성
window.geminiClient = new GeminiClient();

// 기존 코드 호환성을 위한 래퍼 함수
window.callGeminiAPI = async function(imageBase64, chipColors) {
  try {
    // 프록시 URL 확인
    if (!window.geminiClient.proxyUrl) {
      const proxyUrl = prompt('Gemini 프록시 URL을 입력하세요:\n(Apps Script 배포 후 받은 URL)');
      if (proxyUrl) {
        window.geminiClient.setProxyUrl(proxyUrl);
      } else {
        throw new Error('프록시 URL이 필요합니다');
      }
    }

    // API 호출
    const result = await window.geminiClient.analyzeChips(imageBase64, chipColors);

    // 응답 파싱
    if (result.candidates && result.candidates[0]) {
      const text = result.candidates[0].content.parts[0].text;
      return { success: true, analysis: text };
    } else {
      return { success: false, error: 'Invalid response format' };
    }

  } catch (error) {
    console.error('Gemini API error:', error);
    return { success: false, error: error.message };
  }
};