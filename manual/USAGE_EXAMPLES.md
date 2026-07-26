/**
 * 輸入框狀態管理器 - 使用示例和驗證
 */

import InputStateManager from './src/input-state-manager.js';
import IdManager from './src/id-manager.js';

console.log('=== 輸入框狀態管理器 使用示例 ===\n');

// 示例 1: 獲取所有輸入框狀態
console.log('【示例 1】獲取所有輸入框狀態');
console.log(`
// 代碼:
const allStates = InputStateManager.getAllInputStates();

// 返回格式:
{
  stats: {
    0: { left: 100, result: 200, middle: 150 },
    2: { left: 50, result: 75, middle: 62.5 },
    ...
  },
  dialog: {
    additive: [
      { id: 'dialog-additive-123', index: '123', value: 10, preset: 'custom' },
      ...
    ],
    multiplicative: [
      { id: 'dialog-multiplicative-456', index: '456', value: 2.0, preset: '光環' },
      ...
    ]
  },
  timestamp: '2026-07-26T...'
}
`);

// 示例 2: 獲取特定類型的輸入框狀態
console.log('\n【示例 2】獲取特定類型的輸入框狀態');
console.log(`
// 獲取統計項目狀態
const statsStates = InputStateManager.getStatsInputStates();
// 返回: { 0: {left, result, middle}, 1: {left, result, middle}, ... }

// 獲取加成傷害狀態
const additiveStates = InputStateManager.getAdditiveInputStates();
// 返回: [{ id, index, value, preset }, ...]

// 獲取乘算爆傷狀態
const multiplicativeStates = InputStateManager.getMultiplicativeInputStates();
// 返回: [{ id, index, value, preset }, ...]
`);

// 示例 3: 設置輸入框值
console.log('\n【示例 3】設置輸入框值');
console.log(`
// 設置單個輸入框
InputStateManager.setInputValue('stat-0-left', 100);

// 批量設置多個輸入框
InputStateManager.setMultipleInputValues({
  'stat-0-left': 100,
  'stat-2-left': 50,
  'dialog-additive-123': 10,
});
`);

// 示例 4: 序列化和反序列化
console.log('\n【示例 4】序列化和反序列化（保存和恢復狀態）');
console.log(`
// 序列化 - 保存所有輸入框狀態到 JSON 字符串
const jsonStr = InputStateManager.serialize();
// 可以保存到 localStorage、檔案或數據庫

// 反序列化 - 從 JSON 字符串恢復狀態
const result = InputStateManager.deserialize(jsonStr);
// 返回: { stats: {success, failed}, additive: {success, failed}, multiplicative: {success, failed} }
`);

// 示例 5: 獲取統計信息
console.log('\n【示例 5】獲取統計信息');
console.log(`
// 獲取統計數據
const stats = InputStateManager.getStatistics();
// 返回:
{
  statsCount: 11,              // 統計項目數
  additiveCount: 3,            // 加成傷害輸入框數
  multiplicativeCount: 2,      // 乘算爆傷輸入框數
  total: 16,                   // 總輸入框數
  timestamp: '2026-07-26T...'  // 時間戳
}

// 獲取人類可讀的摘要
console.log(InputStateManager.getSummary());
// 輸出:
// === 輸入框狀態摘要 ===
// 統計項目: 11 個
// 加成傷害: 3 個
// 乘算爆傷: 2 個
// 總計: 16 個
// 時間: 2026-07-26T...
`);

// 示例 6: 驗證輸入框值
console.log('\n【示例 6】驗證輸入框值');
console.log(`
// 驗證所有輸入框
const validation = InputStateManager.validateAll();
// 返回:
{
  valid: true,                    // 是否全部有效
  errors: [],                     // 錯誤列表
  warnings: [                     // 警告列表
    { id: 'stat-2-left', message: '乘算爆傷值應該是正數' }
  ]
}
`);

// 示例 7: 清空輸入框
console.log('\n【示例 7】清空所有輸入框');
console.log(`
// 清空並觸發確認對話框
const result = InputStateManager.clearAll(true);
// 返回: { success: true, cleared: 16, errors: [] }

// 不觸發確認對話框（用於編程清空）
const result = InputStateManager.clearAll(false);
`);

// 示例 8: 實際使用場景
console.log('\n【示例 8】實際使用場景');
console.log(`
// 場景 1: 保存用戶配置
function saveConfiguration() {
  const json = InputStateManager.serialize();
  localStorage.setItem('user_config', json);
  console.log('配置已保存');
}

// 場景 2: 載入用戶配置
function loadConfiguration() {
  const json = localStorage.getItem('user_config');
  if (json) {
    InputStateManager.deserialize(json);
    console.log('配置已載入');
  }
}

// 場景 3: 驗證並提交
function submitForm() {
  const validation = InputStateManager.validateAll();
  if (!validation.valid) {
    console.error('輸入有誤:', validation.errors);
    return;
  }
  
  const states = InputStateManager.getAllInputStates();
  // 發送到服務器
  fetch('/api/calculate', { 
    method: 'POST', 
    body: JSON.stringify(states) 
  });
}

// 場景 4: 快速查看當前狀態
function debugCurrentState() {
  console.log(InputStateManager.getSummary());
  console.log('詳細狀態:', InputStateManager.getAllInputStates());
}
`);

// 示例 9: 與 ID Manager 配合
console.log('\n【示例 9】與 ID Manager 配合使用');
console.log(`
// 批量生成 ID 並讀取狀態
const statIds = [];
for (let i = 0; i < 11; i++) {
  const leftId = IdManager.stat.leftId(i);
  const value = InputStateManager.getInputValue(document.getElementById(leftId));
  statIds.push({ id: leftId, value });
}

// 使用 ID 管理器驗證 ID 格式
if (IdManager.isValidId('stat-0-left', 'stat-left')) {
  const index = IdManager.patterns.extractStatIndex('stat-0-left');
  console.log(\`項目索引: \${index}\`);
}
`);

console.log('\n=== API 參考 ===');
console.log(`
主要方法:
  ✓ getAllInputStates()      - 獲取所有輸入框狀態
  ✓ getStatsInputStates()    - 獲取統計項目狀態
  ✓ getDialogInputStates()   - 獲取對話框狀態
  ✓ getAdditiveInputStates() - 獲取加成傷害狀態
  ✓ getMultiplicativeInputStates() - 獲取乘算爆傷狀態
  ✓ getInputValue(element)   - 獲取單個輸入框值
  ✓ setInputValue(id, value) - 設置單個輸入框值
  ✓ setMultipleInputValues(states) - 批量設置值
  ✓ serialize()              - 序列化為 JSON
  ✓ deserialize(jsonStr)     - 從 JSON 反序列化
  ✓ restoreInputStates(states) - 恢復狀態
  ✓ getStatistics()          - 獲取統計信息
  ✓ getSummary()             - 獲取人類可讀摘要
  ✓ clearAll(confirm)        - 清空所有輸入框
  ✓ validateAll()            - 驗證所有輸入框

在 HTML 中使用:
  <script type="module">
    import InputStateManager from './src/input-state-manager.js';
    
    // 在全局作用域中暴露（便於調試）
    window.InputStateManager = InputStateManager;
    
    // 現在可以在控制台中直接使用:
    // InputStateManager.getAllInputStates()
  </script>
`);

console.log('\n💡 提示: 在瀏覽器開發者工具中運行上述代碼');
