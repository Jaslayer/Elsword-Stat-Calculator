/**
 * 狀態管理層 - 集中管理所有配置數據
 * 數據源：存儲 config1 和 config2 的值
 * 無副作用：僅管理數據，不直接操作DOM
 */

const StatStore = {
  // 配置1的值映射 (itemIndex -> value)
  config1Values: new Map(),
  
  // 配置2的值映射 (itemIndex -> value)
  config2Values: new Map(),
  
  // 三向箁定的映射關係（如果需要）
  threeWayBindings: new Map(),
  
  // 監聽器清單
  listeners: [],
  
  /**
   * 設置配置1的單項值
   * @param {number} itemIndex - 項目索引
   * @param {number} value - 新值
   * @returns {boolean} 值是否改變
   */
  setConfig1Value(itemIndex, value) {
    const oldValue = this.config1Values.get(itemIndex);
    if (oldValue === value) return false;
    
    this.config1Values.set(itemIndex, value);
    this.notifyListeners('config1ValueChanged', { itemIndex, value, oldValue });
    return true;
  },
  
  /**
   * 設置配置2的單項值
   * @param {number} itemIndex - 項目索引
   * @param {number} value - 新值
   * @returns {boolean} 值是否改變
   */
  setConfig2Value(itemIndex, value) {
    const oldValue = this.config2Values.get(itemIndex);
    if (oldValue === value) return false;
    
    this.config2Values.set(itemIndex, value);
    this.notifyListeners('config2ValueChanged', { itemIndex, value, oldValue });
    return true;
  },
  
  /**
   * 獲取配置1的單項值
   * @param {number} itemIndex - 項目索引
   * @returns {number} 該項目的配置1值
   */
  getConfig1Value(itemIndex) {
    return this.config1Values.get(itemIndex) || 0;
  },
  
  /**
   * 獲取配置2的單項值
   * @param {number} itemIndex - 項目索引
   * @returns {number} 該項目的配置2值
   */
  getConfig2Value(itemIndex) {
    return this.config2Values.get(itemIndex) || 0;
  },
  
  /**
   * 獲取所有配置1值
   * @returns {Array} 所有配置1值的數組
   */
  getAllConfig1Values() {
    return Array.from(this.config1Values.values());
  },
  
  /**
   * 獲取所有配置2值
   * @returns {Array} 所有配置2值的數組
   */
  getAllConfig2Values() {
    return Array.from(this.config2Values.values());
  },
  
  /**
   * 三向箁定：當一侧改變時，同步另一侧
   * @param {number} itemIndex - 項目索引
   * @param {string} sourceConfig - 改變源 ('config1' 或 'config2')
   * @param {number} value - 新值
   */
  syncThreeWayBinding(itemIndex, sourceConfig, value) {
    const targetConfig = sourceConfig === 'config1' ? 'config2' : 'config1';
    const setSetter = targetConfig === 'config1' ? 'setConfig1Value' : 'setConfig2Value';
    
    this[setSetter](itemIndex, value);
    this.notifyListeners('threeWaySynced', {
      itemIndex,
      sourceConfig,
      targetConfig,
      value
    });
  },
  
  /**
   * 獲取完整狀態快照（用於測試驗證）
   * @returns {Object} 包含 config1 和 config2 的快照
   */
  getSnapshot() {
    return {
      config1: Object.fromEntries(this.config1Values),
      config2: Object.fromEntries(this.config2Values),
      timestamp: Date.now()
    };
  },
  
  /**
   * 批量設置配置1值
   * @param {Map} values - itemIndex -> value 的映射
   */
  setConfig1Values(values) {
    const changes = [];
    values.forEach((value, itemIndex) => {
      const changed = this.setConfig1Value(itemIndex, value);
      if (changed) changes.push(itemIndex);
    });
    if (changes.length > 0) {
      this.notifyListeners('config1ValuesChanged', { itemIndexes: changes });
    }
  },
  
  /**
   * 批量設置配置2值
   * @param {Map} values - itemIndex -> value 的映射
   */
  setConfig2Values(values) {
    const changes = [];
    values.forEach((value, itemIndex) => {
      const changed = this.setConfig2Value(itemIndex, value);
      if (changed) changes.push(itemIndex);
    });
    if (changes.length > 0) {
      this.notifyListeners('config2ValuesChanged', { itemIndexes: changes });
    }
  },
  
  /**
   * 從DOM初始化狀態
   * 讀取所有 .input-panel-item 的值並填充狀態
   * @param {Function} parseInputValueFn - 解析input值的函數
   * @param {Function} calculateAdaptabilityFn - 計算適應力的函數
   * @param {Object} STAT_ITEMS - 統計項目常數
   */
  initFromDOM(parseInputValueFn, calculateAdaptabilityFn, STAT_ITEMS) {
    const panels = document.querySelectorAll('.input-panel-item');
    
    panels.forEach(panel => {
      const itemIndex = parseInt(panel.dataset.index);
      const leftInput = panel.querySelector('.left-input');
      const resultInput = panel.querySelector('.result-input');
      
      if (leftInput) {
        let value;
        if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
          const result = calculateAdaptabilityFn();
          value = result.config1;
        } else {
          value = parseInputValueFn(leftInput);
        }
        this.config1Values.set(itemIndex, value);
      }
      
      if (resultInput) {
        let value;
        if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
          const result = calculateAdaptabilityFn();
          value = result.config2;
        } else {
          value = parseInputValueFn(resultInput);
        }
        this.config2Values.set(itemIndex, value);
      }
    });
    
    this.notifyListeners('initialized', { config1Size: this.config1Values.size, config2Size: this.config2Values.size });
  },
  
  /**
   * 重置所有状态
   */
  clear() {
    this.config1Values.clear();
    this.config2Values.clear();
    this.notifyListeners('cleared', {});
  },
  
  /**
   * 添加状态变化监听器
   * @param {Function} callback - 回调函数，接收 (eventType, data)
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  },
  
  /**
   * 通知所有监听器
   * @private
   */
  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error(`Error in store listener: ${error.message}`);
      }
    });
  }
};

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StatStore;
}
if (typeof window !== 'undefined') {
  window.StatStore = StatStore;} else if (typeof global !== 'undefined') {
  global.StatStore = StatStore;}
