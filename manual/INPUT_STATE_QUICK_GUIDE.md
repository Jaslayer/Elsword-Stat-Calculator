# 輸入框狀態管理 - 快速參考

## 快速開始

在瀏覽器開發者工具的 **Console** 中執行以下代碼：

### 獲取所有輸入框狀態
```javascript
// 獲取完整的狀態對象
InputStateManager.getAllInputStates()

// 示例輸出:
{
  stats: {
    0: { left: 100, result: 200, middle: 150 },
    1: { left: 50, result: 75, middle: 62 },
    ...
  },
  dialog: {
    additive: [{ id: 'dialog-additive-123', value: 10, preset: 'custom' }],
    multiplicative: [{ id: 'dialog-multiplicative-456', value: 2.0, preset: '光環' }]
  },
  timestamp: '2026-07-26T10:30:00.000Z'
}
```

### 獲取摘要信息
```javascript
// 簡潔的摘要
console.log(InputStateManager.getSummary())

// 輸出:
// === 輸入框狀態摘要 ===
// 統計項目: 11 個
// 加成傷害: 2 個
// 乘算爆傷: 1 個
// 總計: 14 個
// 時間: 2026-07-26T10:30:00.000Z
```

### 獲取統計信息
```javascript
InputStateManager.getStatistics()

// 返回:
{
  statsCount: 11,
  additiveCount: 2,
  multiplicativeCount: 1,
  total: 14,
  timestamp: '2026-07-26T10:30:00.000Z'
}
```

## 常見操作

### 1. 獲取特定類型的狀態

```javascript
// 只獲取統計項目狀態
InputStateManager.getStatsInputStates()
// { 0: {left, result, middle}, 1: {left, result, middle}, ... }

// 只獲取加成傷害狀態
InputStateManager.getAdditiveInputStates()
// [ { id, index, value, preset }, ... ]

// 只獲取乘算爆傷狀態
InputStateManager.getMultiplicativeInputStates()
// [ { id, index, value, preset }, ... ]
```

### 2. 讀取單個輸入框的值

```javascript
// 獲取 stat-0-left 的值
const element = document.getElementById('stat-0-left');
const value = InputStateManager.getInputValue(element);
console.log(value)  // 例: 100

// 或直接通過 ID
const value2 = InputStateManager.getInputValue(
  document.getElementById(IdManager.stat.leftId(0))
);
```

### 3. 設置輸入框的值

```javascript
// 設置單個輸入框
InputStateManager.setInputValue('stat-0-left', 100);

// 批量設置多個輸入框
InputStateManager.setMultipleInputValues({
  'stat-0-left': 100,
  'stat-1-left': 50,
  'stat-2-left': 75,
  'dialog-additive-123': 10,
  'dialog-multiplicative-456': 2.0
});

// 返回:
{
  success: 5,
  failed: 0,
  errors: []
}
```

### 4. 驗證所有輸入框

```javascript
const validation = InputStateManager.validateAll();

// 返回:
{
  valid: true,
  errors: [],
  warnings: [
    { id: 'stat-2-left', message: '乘算爆傷值應該是正數' }
  ]
}

// 使用驗證結果
if (validation.valid) {
  console.log('所有輸入都有效');
} else {
  console.error('有以下錯誤:', validation.errors);
}
```

### 5. 保存和恢復狀態

```javascript
// 保存到 localStorage
const json = InputStateManager.serialize();
localStorage.setItem('calculator_state', json);

// 稍後恢復
const savedJson = localStorage.getItem('calculator_state');
InputStateManager.deserialize(savedJson);

// 返回:
{
  stats: { success: 11, failed: 0 },
  additive: { success: 2, failed: 0 },
  multiplicative: { success: 1, failed: 0 },
  errors: []
}
```

### 6. 清空所有輸入框

```javascript
// 清空並彈出確認對話框
InputStateManager.clearAll(true);
// 用戶需要確認

// 直接清空（編程方式）
InputStateManager.clearAll(false);

// 返回:
{
  success: true,
  cleared: 14,
  errors: []
}
```

## 實用場景

### 場景 1: 快速檢查當前計算結果

```javascript
// 一行代碼查看所有結果
console.log(InputStateManager.getStatsInputStates());

// 或格式化輸出
const stats = InputStateManager.getStatsInputStates();
Object.entries(stats).forEach(([idx, values]) => {
  console.log(`項目 ${idx}: 左=${values.left}, 結果=${values.result}`);
});
```

### 場景 2: 導出計算數據

```javascript
// 導出為 JSON 下載
function downloadState() {
  const json = InputStateManager.serialize();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'calculator_state.json';
  a.click();
}

downloadState();
```

### 場景 3: 導入計算數據

```javascript
// 導入 JSON 文件
function uploadState(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    InputStateManager.deserialize(e.target.result);
    console.log('狀態已導入');
  };
  reader.readAsText(file);
}
```

### 場景 4: 監控輸入變化

```javascript
// 定期檢查狀態變化
setInterval(() => {
  const stats = InputStateManager.getStatistics();
  console.log(`當前有 ${stats.total} 個輸入框被填充`);
}, 5000);
```

### 場景 5: 表單驗證和提交

```javascript
function submitCalculation() {
  // 驗證
  const validation = InputStateManager.validateAll();
  if (!validation.valid) {
    alert('輸入有誤:\n' + 
      validation.errors.map(e => e.message).join('\n'));
    return;
  }
  
  // 獲取狀態
  const states = InputStateManager.getAllInputStates();
  
  // 發送到服務器
  fetch('/api/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(states)
  })
  .then(res => res.json())
  .then(data => console.log('計算結果:', data));
}

// 在按鈕上綁定
document.getElementById('submit-btn')?.addEventListener('click', submitCalculation);
```

## 與 ID Manager 配合

```javascript
// 使用 ID 生成器和狀態管理器配合
for (let i = 0; i < 11; i++) {
  const leftId = IdManager.stat.leftId(i);
  const resultId = IdManager.stat.resultId(i);
  
  const leftValue = InputStateManager.getInputValue(
    document.getElementById(leftId)
  );
  const resultValue = InputStateManager.getInputValue(
    document.getElementById(resultId)
  );
  
  console.log(`項目 ${i}: ${leftValue} → ${resultValue}`);
}
```

## API 完整參考

| 方法 | 說明 | 返回值 |
|------|------|--------|
| `getAllInputStates()` | 獲取所有輸入框狀態 | Object |
| `getStatsInputStates()` | 獲取統計項目狀態 | Object |
| `getDialogInputStates()` | 獲取對話框狀態 | Object |
| `getAdditiveInputStates()` | 獲取加成傷害狀態 | Array |
| `getMultiplicativeInputStates()` | 獲取乘算爆傷狀態 | Array |
| `getInputValue(element)` | 獲取單個元素值 | * |
| `setInputValue(id, value)` | 設置單個輸入框值 | Boolean |
| `setMultipleInputValues(states)` | 批量設置值 | Object |
| `serialize()` | 序列化為 JSON | String |
| `deserialize(jsonStr)` | 從 JSON 反序列化 | Object |
| `restoreInputStates(states)` | 恢復狀態 | Object |
| `getStatistics()` | 獲取統計信息 | Object |
| `getSummary()` | 獲取摘要 | String |
| `clearAll(confirm)` | 清空所有輸入框 | Object |
| `validateAll()` | 驗證所有輸入框 | Object |

## 使用提示

💡 **開發者工具快捷方式**

```javascript
// 快速別名（可在 console 中添加）
const ISM = InputStateManager;  // InputStateManager 快捷方式
const IM = IdManager;           // IdManager 快捷方式

// 然後可以簡寫為:
ISM.getAllInputStates()
IM.stat.leftId(0)
```

💾 **自動保存配置**

```javascript
// 每 30 秒自動保存
setInterval(() => {
  localStorage.setItem('auto_save', InputStateManager.serialize());
  console.log('✅ 自動保存完成');
}, 30000);

// 頁面加載時自動恢復
window.addEventListener('load', () => {
  const saved = localStorage.getItem('auto_save');
  if (saved) {
    InputStateManager.deserialize(saved);
    console.log('✅ 自動恢復完成');
  }
});
```

🔍 **調試模式**

```javascript
// 啟用詳細日誌
window.DEBUG_MODE = true;

// 在代碼中使用:
if (window.DEBUG_MODE) {
  console.log('當前狀態:', InputStateManager.getAllInputStates());
  console.log('驗證結果:', InputStateManager.validateAll());
}
```
