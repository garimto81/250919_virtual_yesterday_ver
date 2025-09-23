@echo off
echo === 포커 핸드 로거 서버 체크 ===
echo.
echo Python 서버 (8000):
curl -I http://localhost:8000/index-minimal.html 2>nul || echo 연결 실패
echo.
echo Node.js 서버 (8080):
curl -I http://localhost:8080/index-minimal.html 2>nul || echo 연결 실패
echo.
echo 브라우저에서 열기:
echo 1. http://localhost:8000/index-minimal.html
echo 2. http://localhost:8080/index-minimal.html
echo.
pause