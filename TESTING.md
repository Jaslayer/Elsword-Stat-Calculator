# 測試環境設置指南

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 運行測試

**互動式測試模式**（推薦開發時使用）
```bash
npm test
```

**單次運行**
```bash
npm run test:run
```

**UI 界面測試**（可視化查看測試結果）
```bash
npm run test:ui
```

**生成覆蓋率報告**
```bash
npm run test:coverage
```

## 項目結構

```
stat/
├── src/                    # 源代碼
│   └── utils.js           # 工具函數
├── tests/                 # 測試文件
│   ├── utils.test.js      # 單元測試（16 個）
│   └── dom.test.js        # DOM 互動測試（11 個）
├── index.html             # 主 HTML 文件
├── style.css              # 樣式文件
├── package.json           # 項目配置和依賴
├── vitest.config.js       # Vitest 測試配置
└── README.md              # 項目文檔
```

## 核心函數

### roundNumber(num, decimals = 10)
處理浮點數精度問題，避免 JavaScript 浮點數計算誤差。

**參數：**
- `num` (number): 要四捨五入的數字
- `decimals` (number): 小數位數（默認 10）

**返回值：** (number) 精確的浮點數

### calculateThreeWayBinding(left, result, middle, changedType)
計算配置1、配置2和變動量的三向綁定關係。

**參數：**
- `left` (number): 配置1 的值
- `result` (number): 配置2 的值
- `middle` (number): 變動量的值
- `changedType` (string): 改變的類型 ('left', 'result', 'middle')

**返回值：** (object) { left, result, middle }

## 測試覆蓋

### 單元測試 (16 個測試)
- ✅ roundNumber - 浮點數精度處理
  - 累積加 0.1 十次 = 1
  - 累積減 0.1 十次 = 0
- ✅ calculateThreeWayBinding - 三向綁定計算邏輯

### DOM 互動測試 (11 個測試)
- ✅ 刪除按鈕 Hover 事件
  - 初始時應無 show 類
  - 滑鼠進入時顯示按鈕（添加 show 類）
  - 滑鼠離開時隱藏按鈕（移除 show 類）
  - 多次切換應正常工作
  - 點擊按鈕應觸發事件
  - Hover 時按鈕可視且可點擊

- ✅ Panel 刪除流程
  - 多個 panels 同時存在
  - 單獨 hover 應只顯示對應按鈕
  - 點擊刪除應只刪除該 panel

## 下一步

1. 添加更多 DOM 互動測試（spinner 按鈕、input 輸入等）
2. 為按鈕型輸入框的對話框添加測試
3. 為三向綁定的 DOM 操作創建集成測試
4. 添加端對端（E2E）測試，使用 Playwright 或 Cypress 進行完整流程測試
