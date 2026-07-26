# 如何取得所有輸入框的輸入狀態 - 完整指南

## 概述
現在你可以輕鬆地獲取、保存和恢復所有輸入框的狀態。新的輸入框狀態管理系統提供了統一的 API。

## 最快的方式

在瀏覽器開發者工具 **Console** 中執行：

```javascript
// 一行代碼獲取所有狀態
InputStateManager.getAllInputStates()
```

或者查看簡潔摘要：

```javascript
console.log(InputStateManager.getSummary())

// 輸出:
// === 輸入框狀態摘要 ===
// 統計項目: 11 個
// 加成傷害: 2 個
// 乘算爆傷: 1 個
// 總計: 14 個
// 時間: 2026-07-26T...
```

## 核心方法

### 1. 獲取所有輸入框狀態

```javascript
const allStates = InputStateManager.getAllInputStates();

// 返回結構:
{
  stats: {
    0: { left: 100, result: 200, middle: 150 },
    1: { left: 50, result: 75, middle: 62.5 },
    2: { left: 75, result: 90, middle: 82.5 },
    // ... 其他統計項目
  },
  dialog: {
    additive: [
      { id: 'dialog-additive-1721234567', index: '1721234567', value: 10, preset: 'custom' },
      { id: 'dialog-additive-1721234568', index: '1721234568', value: 20, preset: 'custom' }
    ],
    multiplicative: [
      { id: 'dialog-multiplicative-1721234569', index: '1721234569', value: 2.0, preset: '光環' }
    ]
  },
  timestamp: '2026-07-26T10:30:00.123Z'
}
```

### 2. 獲取統計項目狀態

```javascript
// 只獲取主面板的輸入框狀態
const statsStates = InputStateManager.getStatsInputStates();

// 格式:
{
  0: { left: 100, result: 200, middle: 150 },
  1: { left: 50, result: 75, middle: 62.5 },
  // ...
}

// 訪問特定項目
console.log(statsStates[0].left);    // 100
console.log(statsStates[0].result);  // 200
```

### 3. 獲取對話框中的狀態

```javascript
// 加成傷害輸入框
const additive = InputStateManager.getAdditiveInputStates();
// [ { id, index, value, preset }, ... ]

// 乘算爆傷輸入框
const multiplicative = InputStateManager.getMultiplicativeInputStates();
// [ { id, index, value, preset }, ... ]

// 或一起獲取
const dialogStates = InputStateManager.getDialogInputStates();
// { additive: [...], multiplicative: [...] }
```

### 4. 獲取統計信息

```javascript
const stats = InputStateManager.getStatistics();

// 返回:
{
  statsCount: 11,          // 統計項目數
  additiveCount: 2,        // 加成傷害數
  multiplicativeCount: 1,  // 乘算爆傷數
  total: 14,               // 總輸入框數
  timestamp: '2026-07-26T...'
}
```

## 進階用法

### 保存狀態到 localStorage

```javascript
// 保存
const json = InputStateManager.serialize();
localStorage.setItem('calculator_state', json);
console.log('✅ 狀態已保存');

// 載入（使用者重新打開頁面時）
const saved = localStorage.getItem('calculator_state');
if (saved) {
  InputStateManager.deserialize(saved);
  console.log('✅ 狀態已恢復');
}
```

### 驗證輸入框值

```javascript
const validation = InputStateManager.validateAll();

if (validation.valid) {
  console.log('✅ 所有輸入都有效');
} else {
  console.error('❌ 有以下錯誤:');
  validation.errors.forEach(err => {
    console.error(`  ${err.id}: ${err.message}`);
  });
}

if (validation.warnings.length > 0) {
  console.warn('⚠️ 警告:');
  validation.warnings.forEach(warn => {
    console.warn(`  ${warn.id}: ${warn.message}`);
  });
}
```

### 導出為 JSON 文件

```javascript
function downloadState() {
  const json = InputStateManager.serialize();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `calculator_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  console.log('✅ 文件已下載');
}

// 調用
downloadState();
```

### 設置輸入框值

```javascript
// 設置單個輸入框
InputStateManager.setInputValue('stat-0-left', 100);

// 批量設置多個輸入框
const result = InputStateManager.setMultipleInputValues({
  'stat-0-left': 100,
  'stat-1-left': 50,
  'stat-2-left': 75,
  'dialog-additive-123': 10,
  'dialog-multiplicative-456': 2.0
});

console.log(`✅ 成功設置 ${result.success} 個輸入框`);
if (result.failed > 0) {
  console.error(`❌ 失敗 ${result.failed} 個`);
}
```

## 實用代碼片段

### 監控輸入變化

```javascript
// 每 5 秒檢查一次
setInterval(() => {
  const stats = InputStateManager.getStatistics();
  console.log(`當前有 ${stats.total} 個輸入框有值`);
}, 5000);
```

### 自動保存

```javascript
// 每 30 秒自動保存
setInterval(() => {
  const json = InputStateManager.serialize();
  localStorage.setItem('auto_save', json);
  console.log(`✅ 自動保存 - ${new Date().toLocaleTimeString()}`);
}, 30000);

// 頁面關閉時也保存
window.addEventListener('beforeunload', () => {
  const json = InputStateManager.serialize();
  localStorage.setItem('last_state', json);
});
```

### 生成報告

```javascript
function generateReport() {
  const states = InputStateManager.getAllInputStates();
  const stats = InputStateManager.getStatistics();
  
  let report = '計算器狀態報告\n';
  report += '='.repeat(40) + '\n\n';
  
  report += '【統計項目】\n';
  Object.entries(states.stats).forEach(([idx, values]) => {
    report += `  項目 ${idx}: 左=${values.left}, 結果=${values.result}\n`;
  });
  
  report += '\n【加成傷害】\n';
  states.dialog.additive.forEach(item => {
    report += `  ${item.value} (${item.preset})\n`;
  });
  
  report += '\n【乘算爆傷】\n';
  states.dialog.multiplicative.forEach(item => {
    report += `  ${item.value} (${item.preset})\n`;
  });
  
  report += `\n總計: ${stats.total} 個輸入框\n`;
  report += `時間: ${stats.timestamp}\n`;
  
  return report;
}

console.log(generateReport());
```

### 快捷別名

```javascript
// 在 console 中運行一次，以後可以用簡寫
window.ISM = InputStateManager;  // InputStateManager → ISM
window.IM = IdManager;            // IdManager → IM

// 然後可以簡寫為:
ISM.getAllInputStates()
ISM.getSummary()
IM.stat.leftId(0)
```

## 快速命令參考

| 任務 | 代碼 |
|------|------|
| 查看所有狀態 | `InputStateManager.getAllInputStates()` |
| 查看摘要 | `InputStateManager.getSummary()` |
| 查看統計 | `InputStateManager.getStatistics()` |
| 保存狀態 | `localStorage.setItem('s', InputStateManager.serialize())` |
| 恢復狀態 | `InputStateManager.deserialize(localStorage.getItem('s'))` |
| 驗證數據 | `InputStateManager.validateAll()` |
| 清空所有 | `InputStateManager.clearAll()` |
| 只看統計項目 | `InputStateManager.getStatsInputStates()` |
| 只看加成傷害 | `InputStateManager.getAdditiveInputStates()` |
| 只看乘算爆傷 | `InputStateManager.getMultiplicativeInputStates()` |

## 集成到應用

在你的 HTML/JavaScript 代碼中使用：

```javascript
// 在表單提交時
document.getElementById('submit-btn').addEventListener('click', () => {
  // 驗證
  const validation = InputStateManager.validateAll();
  if (!validation.valid) {
    alert('請修正以下錯誤:\n' + 
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
  .then(data => {
    console.log('✅ 計算完成:', data);
  });
});
```

## 常見問題

**Q: 如何只獲取有值的輸入框？**
```javascript
const states = InputStateManager.getStatsInputStates();
const nonEmpty = Object.entries(states).filter(([_, val]) => val.left);
console.log(nonEmpty);
```

**Q: 如何清除所有狀態？**
```javascript
InputStateManager.clearAll(false);  // false 表示不顯示確認對話框
```

**Q: 如何列出所有輸入框的 ID？**
```javascript
const states = InputStateManager.getAllInputStates();
const allIds = [
  ...Object.keys(states.stats).map(i => `stat-${i}-left`),
  ...states.dialog.additive.map(a => a.id),
  ...states.dialog.multiplicative.map(m => m.id)
];
console.log(allIds);
```

## 需要幫助？

查看更詳細的文檔：
- [INPUT_STATE_QUICK_GUIDE.md](INPUT_STATE_QUICK_GUIDE.md) - 快速參考
- [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) - 完整使用示例
- [ID_MANAGER_GUIDE.md](ID_MANAGER_GUIDE.md) - ID 管理系統說明
