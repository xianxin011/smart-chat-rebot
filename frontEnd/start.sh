#!/bin/bash
echo "🚀 Coze Chat Full 启动脚本"
echo "=========================="

if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

echo "🎯 启动开发服务器..."
echo "访问地址: http://localhost:8888"
echo ""
npm run dev
