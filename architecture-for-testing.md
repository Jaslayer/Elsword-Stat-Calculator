# 测项友好的架构改进方案

## 当前架构问题

1. **数据与视图混合** - 配置值存在DOM属性中，难以追踪
2. **业务逻辑分散** - 计算逻辑和DOM操作耦合
3. **测试隔离困难** - 需要DOM才能测试连动逻辑
4. **难以验证全流程** - 缺少集中的状态审计点

## 改进方案：分层架构

```
用户交互 (input/click)
        ↓
┌─────────────────────────┐
│  事件处理层 (Events)    │  ← 从DOM捕获事件，转换为操作
└──────────────┬──────────┘
               ↓
┌─────────────────────────┐
│  状态管理层 (Store)     │  ← 集中管理所有配置数据
│  - config1Values[]      │     纯数据，便于测试
│  - config2Values[]      │
└──────────────┬──────────┘
               ↓
┌─────────────────────────┐
│  计算引擎 (Compute)     │  ← 纯函数，根据状态计算
│  - getConfig1Product()  │     产品、比值等
│  - getConfig2Product()  │     输入：状态 → 输出：数据
│  - getRatioValue()      │
└──────────────┬──────────┘
               ↓
┌─────────────────────────┐
│  视图更新层 (View)      │  ← 将计算结果映射到DOM
│  - updateDisplay()      │
│  - renderPanel()        │
└─────────────────────────┘
```

## 具体改进步骤

### 1. 创建状态管理器 (store.js)

```javascript
// 集中管理所有配置状态
const StatStore = {
  // 配置数据（源数据）
  config1Values: new Map(),  // itemIndex -> value
  config2Values: new Map(),  // itemIndex -> value
  
  // 设置单项值（返回是否改变）
  setConfig1Value(itemIndex, value) {
    const oldValue = this.config1Values.get(itemIndex);
    this.config1Values.set(itemIndex, value);
    return oldValue !== value;
  },
  
  setConfig2Value(itemIndex, value) {
    const oldValue = this.config2Values.get(itemIndex);
    this.config2Values.set(itemIndex, value);
    return oldValue !== value;
  },
  
  // 三向绑定: 当一侧改变时，同步另一侧
  syncThreeWayBinding(itemIndex, sourceConfig, value) {
    const otherConfig = sourceConfig === 'config1' ? 'config2' : 'config1';
    // 根据需要实现三向绑定逻辑
  },
  
  // 获取完整状态快照（用于测试验证）
  getSnapshot() {
    return {
      config1: Object.fromEntries(this.config1Values),
      config2: Object.fromEntries(this.config2Values)
    };
  },
  
  // 从DOM初始化状态
  initFromDOM() {
    const panels = document.querySelectorAll('.input-panel-item');
    panels.forEach(panel => {
      const itemIndex = parseInt(panel.dataset.index);
      const leftInput = panel.querySelector('.left-input');
      const resultInput = panel.querySelector('.result-input');
      
      if (leftInput) this.config1Values.set(itemIndex, parseInputValue(leftInput));
      if (resultInput) this.config2Values.set(itemIndex, parseInputValue(resultInput));
    });
  }
};
```

### 2. 创建计算引擎 (compute.js)

```javascript
// 纯函数：根据状态计算结果（无副作用）
const ComputeEngine = {
  // 根据状态计算配置1产品
  calculateConfig1Product(store) {
    let product = 1;
    store.config1Values.forEach((value, itemIndex) => {
      if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
        const adaptValue = store.getAdaptabilityValue('config1');
        product *= (adaptValue / 100 + 1);
      } else {
        product *= (value === 0 ? 1 : value);
      }
    });
    return roundNumber(product);
  },
  
  // 根据状态计算配置2产品
  calculateConfig2Product(store) {
    // 类似逻辑
  },
  
  // 根据状态计算比值
  calculateRatioValue(config1Product, config2Product) {
    return calculateRatioValue(config1Product, config2Product);
  },
  
  // 获取完整计算结果
  getComputedState(store) {
    const config1Product = this.calculateConfig1Product(store);
    const config2Product = this.calculateConfig2Product(store);
    return {
      config1Product,
      config2Product,
      ratioValue: this.calculateRatioValue(config1Product, config2Product)
    };
  }
};
```

### 3. 改进事件处理流程

```javascript
// 事件委托：统一入口
function handleStatInputChange(itemIndex, configType, newValue) {
  // Step 1: 更新状态存储
  const changed = configType === 'config1'
    ? StatStore.setConfig1Value(itemIndex, newValue)
    : StatStore.setConfig2Value(itemIndex, newValue);
  
  if (!changed) return; // 值未改变，无需更新
  
  // Step 2: 触发三向绑定
  StatStore.syncThreeWayBinding(itemIndex, configType, newValue);
  
  // Step 3: 计算所有衍生值
  const computed = ComputeEngine.getComputedState(StatStore);
  
  // Step 4: 更新视图
  updateDisplay(computed);
  
  // Step 5: 分发事件（便于测试监听）
  window.dispatchEvent(new CustomEvent('statUpdated', {
    detail: {
      itemIndex,
      configType,
      newValue,
      computed
    }
  }));
}
```

## 测项示例

### 测试单个计算

```javascript
test('config1Product should be 2 when all values are 2', () => {
  const store = new Store();
  store.config1Values.set(0, 2);
  store.config1Values.set(1, 2);
  
  const result = ComputeEngine.calculateConfig1Product(store);
  expect(result).toBe(4); // 2 × 2 = 4
});
```

### 测试完整连动流程

```javascript
test('user input should trigger all cascading updates', async () => {
  // 监听状态变化事件
  const updatePromise = new Promise(resolve => {
    window.addEventListener('statUpdated', (e) => {
      resolve(e.detail);
    });
  });
  
  // 模拟用户输入
  handleStatInputChange(0, 'config1', 10);
  
  // 验证完整流程
  const result = await updatePromise;
  expect(result.itemIndex).toBe(0);
  expect(result.newValue).toBe(10);
  expect(result.computed.config1Product).toBeDefined();
  expect(result.computed.ratioValue).toBeDefined();
});
```

### 测试三向绑定

```javascript
test('three-way binding should sync values correctly', () => {
  handleStatInputChange(0, 'config1', 15);
  
  // 验证状态
  const snapshot = StatStore.getSnapshot();
  expect(snapshot.config1[0]).toBe(15);
  
  // 如果实现了同步，验证config2
  expect(snapshot.config2[0]).toBe(15); // 或按业务规则
});
```

## 优势

✅ **单元测试** - 无需DOM，纯函数可独立测试  
✅ **集成测试** - 通过事件监听验证完整流程  
✅ **可维护性** - 状态变化清晰可追踪  
✅ **可扩展性** - 新增计算规则只需修改计算引擎  
✅ **调试友好** - `StatStore.getSnapshot()` 随时审计状态

## 迁移成本

- 新建2个文件：store.js、compute.js (~200行)
- 修改calc.js：提取纯函数 (~100行)
- 修改事件处理：统一到handleStatInputChange (~50行)
- 测项可大幅简化和增加覆盖率
