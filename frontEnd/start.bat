@echo off
chcp 65001 >nul
echo 🚀 Coze Chat Full 启动脚本
echo ==========================

if not exist "node_modules" (
    echo 📦 安装依赖...
    call npm install
)

echo 🎯 启动开发服务器...
echo 访问地址: http://localhost:8888
echo.
npm run dev
