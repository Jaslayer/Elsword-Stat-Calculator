# 簡單解決方案 - UserInputData 數據結構

## 概述
一個簡單的全局數據結構 `UserInputData`，用來存儲所有用戶輸入的數據（input/checkbox 等）。

## 文件位置
- `src/data-structure.js` - 數據結構定義

## 快速使用

### 1. 設置數據

```javascript
// 設置統計項目配置 1
UserInputData.setConfig1(0, 100)    // 項目 0，值 100
UserInputData.setConfig1(1, 50)     // 項目 1，值 50

// 設置統計項目配置 2
UserInputData.setConfig2(0, 200)    // 項目 0，值 200
UserInputData.setConfig2(1, 75)     // 項目 1，值 75

// 設置致命一擊傷害
UserInputData.setCriticalDamage(
  50,              // 面板
  [10, 20],        // 加成傷害
  [1.5, 2.0]       // 乘算爆傷
)

// 設置適應力
UserInputData.setAdaptability({
  panel: 60,
  gathering_place: true,
  adapt_potion: false,
  super_adapt: 0,
  preset: '95%'
})
```

### 2. 獲取數據

```javascript
// 獲取單個值
const val = UserInputData.getConfig1(0)  // 100

// 獲取所有數據
const allData = UserInputData.getAllData()
console.log(allData)

// 返回結構：
// {
//   config1: { 0: 100, 1: 50, ... },
//   config2: { 0: 200, 1: 75, ... },
//   criticalDamage: { panel: 50, additive_damages: [...], ... },
//   adaptability: { panel: 60, ... },
//   timestamp: '2026-07-26T...'
// }
```

### 3. 用於計算

```javascript
// 獲取數據後進行計算
const data = UserInputData.getAllData()

// 計算配置 1 乘積
let product = 1
for (let i = 0; i < 11; i++) {
  const val = UserInputData.getConfig1(i)
  if (val > 0) {
    product *= val
  }
}

console.log('結果:', product)
```

### 4. 保存/恢復

```javascript
// 保存
localStorage.setItem('data', UserInputData.toJSON())

// 恢復
UserInputData.fromJSON(localStorage.getItem('data'))
```

## 完整 API

| 方法 | 功能 | 示例 |
|------|------|------|
| `setConfig1(index, value)` | 設置配置 1 | `UserInputData.setConfig1(0, 100)` |
| `setConfig2(index, value)` | 設置配置 2 | `UserInputData.setConfig2(0, 200)` |
| `getConfig1(index)` | 獲取配置 1 | `UserInputData.getConfig1(0)` |
| `getConfig2(index)` | 獲取配置 2 | `UserInputData.getConfig2(0)` |
| `setCriticalDamage(panel, add, mul)` | 設置致命一擊傷害 | `UserInputData.setCriticalDamage(50, [10], [1.5])` |
| `setAdaptability(data)` | 設置適應力 | `UserInputData.setAdaptability({...})` |
| `getAllData()` | 獲取所有數據 | `UserInputData.getAllData()` |
| `clear()` | 清空所有數據 | `UserInputData.clear()` |
| `toJSON()` | 轉為 JSON 字符串 | `UserInputData.toJSON()` |
| `fromJSON(jsonStr)` | 從 JSON 導入 | `UserInputData.fromJSON(json)` |

## 數據結構

```javascript
UserInputData = {
  config1: {},              // 配置 1：{ itemIndex: value, ... }
  config2: {},              // 配置 2：{ itemIndex: value, ... }
  
  criticalDamage: {
    panel: 0,
    additive_damages: [],      // 加成傷害數組
    multiplicative_damages: [] // 乘算爆傷數組
  },
  
  adaptability: {
    panel: 0,
    gathering_place: false,
    adapt_potion: false,
    super_adapt: 0,
    preset: '95%'
  }
}
```

## 集成到計算邏輯

在 `interface.js` 或其他計算文件中：

```javascript
// 獲取當前用戶數據
function getCurrentData() {
  return UserInputData.getAllData()
}

// 進行計算
function calculate() {
  const data = getCurrentData()
  
  // 你的計算邏輯
  let result = 1
  for (const [index, value] of Object.entries(data.config1)) {
    if (value > 0) result *= value
  }
  
  return result
}
```

## 優點

✅ 簡單易懂  
✅ 沒有複雜的層級  
✅ 直接在全局作用域中可用  
✅ 可與現有代碼無縫集成  
✅ 支持序列化/反序列化  
✅ 易於擴展

## 接下來

- 在 HTML 的輸入框 change 事件中調用 `UserInputData.setConfig1()` 等方法
- 在計算函數中使用 `UserInputData.getAllData()` 獲取數據
- 根據需要調整數據結構，添加或移除字段

完成！🎉
