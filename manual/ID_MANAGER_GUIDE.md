# ID 管理系統 - 實施文檔

## 概述
為所有輸入框統一生成並管理 ID，提供可序列化的結構。每個輸入框現在都有自己的唯一 ID，便於維護、追蹤和測試。

## 實施內容

### 1. 新增 ID 管理器模組
**File**: `src/id-manager.js`

統一管理所有 ID 的生成邏輯，包含：
- 統計項目輸入框 ID 生成
- 對話框輸入框 ID 生成
- ID 模式匹配和驗證
- 序列化/反序列化功能

### 2. ID 命名規範

#### 統計項目 (主面板)
| 類型 | 模式 | 示例 |
|------|------|------|
| 左配置輸入 | `stat-{index}-left` | `stat-0-left`, `stat-2-left` |
| 中間計算值 | `stat-{index}-middle` | `stat-0-middle`, `stat-2-middle` |
| 結果配置輸入 | `stat-{index}-result` | `stat-0-result`, `stat-2-result` |

#### 對話框 (動態行)
| 類型 | 模式 | 示例 |
|------|------|------|
| 加成傷害輸入 | `dialog-additive-{timestamp}` | `dialog-additive-1721968234567` |
| 加成預設下拉 | `dialog-additive-preset-{timestamp}` | `dialog-additive-preset-1721968234567` |
| 乘算爆傷輸入 | `dialog-multiplicative-{timestamp}` | `dialog-multiplicative-1721968234567` |
| 乘算預設下拉 | `dialog-multiplicative-preset-{timestamp}` | `dialog-multiplicative-preset-1721968234567` |

#### 容器和按鈕
| 元素 | ID |
|------|-----|
| 計算面板 | `calcPanel` |
| 描述面板 | `descriptionPanel` |
| 加成傷害容器 | `additivesContainer` |
| 乘算爆傷容器 | `multiplicativesContainer` |
| 新增加成按鈕 | `add-additive-btn` |
| 新增乘算按鈕 | `add-multiplicative-btn` |

### 3. 更新內容

#### index.html 修改
- ✅ 引入 `src/id-manager.js` 模組
- ✅ 為加成傷害輸入框添加 ID: `dialog-additive-${addIndex}`
- ✅ 為乘算爆傷輸入框添加 ID: `dialog-multiplicative-${mulIndex}`
- ✅ 為預設下拉選單添加 ID
- ✅ 動態生成的行元素也包含 ID

### 4. API 使用示例

#### 生成 ID
```javascript
// 統計項目 ID
IdManager.stat.leftId(0)              // 'stat-0-left'
IdManager.stat.middleId(2)            // 'stat-2-middle'
IdManager.stat.resultId(5)            // 'stat-5-result'

// 對話框 ID
const timestamp = Date.now();
IdManager.dialog.additiveInputId(timestamp)      // 'dialog-additive-{timestamp}'
IdManager.dialog.multiplicativeInputId(timestamp) // 'dialog-multiplicative-{timestamp}'
```

#### 驗證 ID
```javascript
// 檢查 ID 格式
IdManager.patterns.isStatLeftInput('stat-0-left')         // true
IdManager.patterns.isStatResultInput('stat-2-result')     // true
IdManager.patterns.extractStatIndex('stat-2-left')        // 2
IdManager.patterns.extractAdditiveIndex('dialog-additive-123') // '123'
```

#### 序列化
```javascript
// 將 ID 配置序列化為 JSON
const jsonStr = IdManager.serialize();

// 從 JSON 反序列化
const config = IdManager.deserialize(jsonStr);
```

#### 驗證
```javascript
// 驗證 ID 格式是否正確
IdManager.isValidId('stat-0-left', 'stat-left')      // true
IdManager.isValidId('dialog-additive-123', 'additive') // true
```

### 5. 驗證測試結果

運行 `node verify-id-manager.js` 的測試結果：

```
✅ 測試 1: 生成統計項目 ID - 通過
✅ 測試 2: 生成對話框 ID - 通過
✅ 測試 3: 驗證 ID 格式 - 通過
✅ 測試 4: 從 ID 中提取索引 - 通過
✅ 測試 5: 序列化 ID 配置 - 通過
✅ 測試 6: 反序列化 ID 配置 - 通過
✅ 測試 7: ID 驗證函數 - 通過
✅ 測試 8: 獲取摘要信息 - 通過
```

### 6. 優勢

| 方面 | 優勢 |
|------|------|
| **追蹤性** | 每個輸入框都有唯一 ID，便於調試和監控 |
| **可維護性** | 集中管理 ID 命名規則，易於修改和擴展 |
| **序列化** | 可將 ID 配置保存為 JSON，支持持久化和傳輸 |
| **驗證** | 內置 ID 驗證和格式檢查功能 |
| **一致性** | 統一的命名規範，減少錯誤和不一致 |

### 7. 集成方式

在 HTML 中直接使用：
```html
<input type="number" class="dialog-input dialog-additive-input" 
       id="dialog-additive-${addIndex}" />
```

在 JavaScript 中使用：
```javascript
// 獲取輸入框
const input = document.getElementById(IdManager.dialog.additiveInputId(timestamp));

// 驗證 ID
if (IdManager.isValidId(element.id, 'additive')) {
  // 處理邏輯
}
```

## 文件清單

- `src/id-manager.js` - ID 管理器核心模組
- `index.html` - 更新為所有輸入框添加 ID
- `verify-id-manager.js` - 驗證腳本（可選，用於測試）
- 此文檔 - `ID_MANAGER_GUIDE.md`

## 後續建議

1. **在測試中使用**: 利用 ID 管理器編寫單元測試
2. **擴展功能**: 可添加 ID 統計、生成報告等功能
3. **文檔維護**: 記錄新添加的 ID 規則
4. **性能監控**: 使用 ID 追蹤輸入框效能
