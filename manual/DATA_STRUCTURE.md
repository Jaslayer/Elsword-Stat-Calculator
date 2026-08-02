# 簡單數據結構 - UserInputData

## 概述
`UserInputData` 是一個簡單的全局對象，用於存儲所有用戶輸入的數據。

## 基本結構

```javascript
UserInputData = {
  config1: {},              // 配置 1 的所有值
  config2: {},              // 配置 2 的所有值
  criticalDamage: {},       // 致命一擊傷害數據
  adaptability: {}          // 適應力數據
}
```

## 常用方法

### 1. 設置統計項目數據

```javascript
// 設置配置 1 的值（例：項目 0 設為 100）
UserInputData.setConfig1(0, 100)

// 設置配置 2 的值
UserInputData.setConfig2(0, 200)
```

### 2. 獲取統計項目數據

```javascript
// 獲取配置 1 的值
const value1 = UserInputData.getConfig1(0)  // 100

// 獲取配置 2 的值
const value2 = UserInputData.getConfig2(0)  // 200
```

### 3. 設置致命一擊傷害

```javascript
UserInputData.setCriticalDamage(
  50,                    // 面板值
  [10, 20],             // 加成傷害數組
  [1.5, 2.0]            // 乘算爆傷數組
)
```

### 4. 設置適應力

```javascript
UserInputData.setAdaptability({
  panel: 60,
  gathering_place: true,
  adapt_potion: false,
  super_adapt: 0,
  preset: '95%'
})
```

### 5. 獲取所有數據

```javascript
const allData = UserInputData.getAllData()
// 返回：
// {
//   config1: { 0: 100, 1: 50, ... },
//   config2: { 0: 200, 1: 75, ... },
//   criticalDamage: { panel: 50, additive_damages: [...], ... },
//   adaptability: { panel: 60, ... },
//   timestamp: '2026-07-26T...'
// }
```

## 完整 API

| 方法 | 功能 |
|------|------|
| `setConfig1(index, value)` | 設置配置 1 的值 |
| `setConfig2(index, value)` | 設置配置 2 的值 |
| `getConfig1(index)` | 獲取配置 1 的值 |
| `getConfig2(index)` | 獲取配置 2 的值 |
| `setCriticalDamage(panel, additive, multiplicative)` | 設置致命一擊傷害 |
| `setAdaptability(data)` | 設置適應力數據 |
| `getAllData()` | 獲取所有數據 |
| `clear()` | 清空所有數據 |
| `toJSON()` | 導出為 JSON 字符串 |
| `fromJSON(jsonStr)` | 從 JSON 導入 |

## 使用示例

### 完整的數據設置流程

```javascript
// 1. 設置統計項目配置
for (let i = 0; i < 11; i++) {
  UserInputData.setConfig1(i, Math.random() * 100)
  UserInputData.setConfig2(i, Math.random() * 150)
}

// 2. 設置致命一擊傷害
UserInputData.setCriticalDamage(
  50,
  [10, 20],
  [1.5, 2.0]
)

// 3. 設置適應力
UserInputData.setAdaptability({
  panel: 60,
  gathering_place: true,
  adapt_potion: true,
  super_adapt: 0,
  preset: '95%'
})

// 4. 獲取所有數據用於計算
const data = UserInputData.getAllData()
console.log(data)
```

### 進行計算

```javascript
// 獲取數據
const data = UserInputData.getAllData()

// 計算配置 1 乘積
let product1 = 1
for (let i = 0; i < 11; i++) {
  const val = UserInputData.getConfig1(i)
  if (val > 0) {
    product1 *= val
  }
}

console.log('配置 1 乘積:', product1)
```

### 保存和恢復

```javascript
// 保存到 localStorage
const json = UserInputData.toJSON()
localStorage.setItem('userdata', json)

// 稍後恢復
UserInputData.fromJSON(localStorage.getItem('userdata'))
```

## 數據結構詳解

### config1 和 config2

```javascript
config1: {
  0: 100,    // 項目 0（物/魔攻擊力）
  1: 50,     // 項目 1（適應力）
  2: 75,     // 項目 2（致命一擊傷害）
  // ...
  10: 30     // 項目 10（其他）
}
```

### criticalDamage

```javascript
criticalDamage: {
  panel: 50,                        // 面板值
  additive_damages: [10, 20],      // 加成傷害（可有多個）
  multiplicative_damages: [1.5, 2.0] // 乘算爆傷（可有多個）
}
```

### adaptability

```javascript
adaptability: {
  panel: 60,              // 面板值（限制 0-60）
  gathering_place: true,  // 聚集地 +2 buff
  adapt_potion: false,    // 適應力藥水 +3 buff
  super_adapt: 0,         // 超越適應值
  preset: '95%'           // 預設難度
}
```

## 與計算函數集成

在你的計算邏輯中使用：

```javascript
// 在 interface.js 或計算函數中
function calculateProduct() {
  const data = UserInputData.getAllData()
  
  let product = 1
  for (const [index, value] of Object.entries(data.config1)) {
    if (value > 0) {
      product *= value
    }
  }
  
  return product
}

// 調用
const result = calculateProduct()
console.log('計算結果:', result)
```

## 簡單粗暴的使用

最簡單的用法：

```javascript
// 設置數據
UserInputData.setConfig1(0, 100)
UserInputData.setConfig2(0, 200)

// 使用數據
const cfg1 = UserInputData.getConfig1(0)  // 100
const cfg2 = UserInputData.getConfig2(0)  // 200

// 計算
const ratio = cfg1 / cfg2  // 0.5
```

完成！🎉
