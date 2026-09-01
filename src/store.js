/**
 * 狀態管理層 - 統一的單一數據源
 * 存儲所有配置數據、計算結果和特殊項目信息
 * 無副作用：僅管理數據，不直接操作DOM
 */

const StatStore = {
  // 配置1的值映射 (itemIndex -> value)
  config1Values: new Map(),
  
  // 配置2的值映射 (itemIndex -> value)
  config2Values: new Map(),
  
  // ✨ 新增：計算結果
  config1Product: 1,
  config2Product: 1,
  ratioValue: '-',
  
  // ✨ 新增：特殊項目 - 致命一擊傷害
  criticalDamage: {
    panel: 0,
    additive_damages: [],
    multiplicative_damages: []
  },
  
  // ✨ 新增：特殊項目 - 適應力
  adaptability: {
    panel: 0,
    gathering_place: false,
    adapt_potion: false,
    super_adapt: 0,
    preset: '95'
  },
  
  // ✨ 新增：已啟用的項目集合（選取狀態）
  enabledItems: new Set(),
  
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
   * 設置計算結果
   * @param {number} config1Product - 配置1乘積
   * @param {number} config2Product - 配置2乘積
   * @param {string} ratioValue - 比值
   */
  setComputedResults(config1Product, config2Product, ratioValue) {
    this.config1Product = config1Product;
    this.config2Product = config2Product;
    this.ratioValue = ratioValue;
    this.notifyListeners('computedResultsChanged', { config1Product, config2Product, ratioValue });
  },
  
  /**
   * 設置致命一擊傷害數據
   * @param {Object} data - 包含 panel, additive_damages, multiplicative_damages
   */
  setCriticalDamage(data) {
    this.criticalDamage = {
      panel: data.panel || 0,
      additive_damages: data.additive_damages || [],
      multiplicative_damages: data.multiplicative_damages || []
    };
    this.notifyListeners('criticalDamageChanged', this.criticalDamage);
  },
  
  /**
   * 設置適應力數據
   * @param {Object} data - 包含 panel, gathering_place, adapt_potion, super_adapt, preset
   */
  setAdaptability(data) {
    this.adaptability = {
      panel: data.panel || 0,
      gathering_place: data.gathering_place || false,
      adapt_potion: data.adapt_potion || false,
      super_adapt: data.super_adapt || 0,
      preset: data.preset || '95'
    };
    this.notifyListeners('adaptabilityChanged', this.adaptability);
  },
  
  /**
   * 獲取完整的狀態快照（包括計算結果和選取狀態）
   * @returns {Object} 完整的狀態對象
   */
  getAllData() {
    return {
      config1: Object.fromEntries(this.config1Values),
      config2: Object.fromEntries(this.config2Values),
      enabledItems: Array.from(this.enabledItems),
      config1Product: this.config1Product,
      config2Product: this.config2Product,
      ratioValue: this.ratioValue,
      criticalDamage: this.criticalDamage,
      adaptability: this.adaptability,
      timestamp: Date.now()
    };
  },
  
  /**
   * 保存所有狀態到 localStorage
   * @param {string} storageKey - localStorage 的鍵名，默認為 'StatStore'
   * @returns {boolean} 保存是否成功
   */
  saveToStorage(storageKey = 'StatStore') {
    try {
      const data = this.getAllData();
      localStorage.setItem(storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to save StatStore to localStorage:', error);
      return false;
    }
  },
  
  /**
   * 從 localStorage 恢復所有狀態
   * 根據 selectedGameStats 自動初始化 enabledItems
   * @param {string} storageKey - localStorage 的鍵名，默認為 'StatStore'
   * @returns {boolean} 恢復是否成功
   */
  loadFromStorage(storageKey = 'StatStore') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        // 沒有保存的狀態，嘗試從 selectedGameStats 初始化 enabledItems
        this.initEnabledItemsFromStorage();
        return false;
      }
      
      const data = JSON.parse(stored);
      
      // 恢復 config1Values
      this.config1Values.clear();
      if (data.config1 && typeof data.config1 === 'object') {
        Object.entries(data.config1).forEach(([index, value]) => {
          this.config1Values.set(parseInt(index), value);
        });
      }
      
      // 恢復 config2Values
      this.config2Values.clear();
      if (data.config2 && typeof data.config2 === 'object') {
        Object.entries(data.config2).forEach(([index, value]) => {
          this.config2Values.set(parseInt(index), value);
        });
      }
      
      // 恢復 enabledItems
      this.enabledItems.clear();
      if (data.enabledItems && Array.isArray(data.enabledItems)) {
        data.enabledItems.forEach(index => {
          this.enabledItems.add(index);
        });
      }
      
      // 恢復計算結果
      this.config1Product = data.config1Product || 1;
      this.config2Product = data.config2Product || 1;
      this.ratioValue = data.ratioValue || '-';
      
      // 恢復特殊項目數據
      if (data.criticalDamage) {
        this.criticalDamage = data.criticalDamage;
      }
      if (data.adaptability) {
        this.adaptability = data.adaptability;
      }
      
      this.notifyListeners('loaded', { 
        config1Size: this.config1Values.size, 
        config2Size: this.config2Values.size,
        enabledItemsCount: this.enabledItems.size
      });
      
      return true;
    } catch (error) {
      console.error('Failed to load StatStore from localStorage:', error);
      // 恢復失敗時，嘗試從 selectedGameStats 初始化 enabledItems
      this.initEnabledItemsFromStorage();
      return false;
    }
  },
  
  /**
   * 從 localStorage 恢復已啟用的項目
   * 讀取 selectedGameStats 並初始化 enabledItems
   * @returns {Array} 初始化的 enabledItems 列表
   */
  initEnabledItemsFromStorage() {
    const STORAGE_KEY = 'selectedGameStats';
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const selectedGameStats = JSON.parse(stored);
        this.enabledItems.clear();
        
        selectedGameStats.forEach((isSelected, index) => {
          if (isSelected) {
            this.enabledItems.add(index);
          }
        });
        
        this.notifyListeners('enabledItemsInitialized', { 
          enabledItems: Array.from(this.enabledItems)
        });
      } catch (error) {
        console.error('Failed to restore enabledItems from localStorage:', error);
      }
    }
    
    return Array.from(this.enabledItems).sort();
  },
  
  /**
   * 添加已啟用的項目
   * @param {number} itemIndex - 項目索引
   * @returns {boolean} 是否新添加
   */
  addEnabledItem(itemIndex) {
    const isNew = !this.enabledItems.has(itemIndex);
    if (isNew) {
      this.enabledItems.add(itemIndex);
      this.notifyListeners('enabledItemAdded', { itemIndex });
    }
    return isNew;
  },
  
  /**
   * 移除已啟用的項目
   * @param {number} itemIndex - 項目索引
   * @returns {boolean} 是否成功移除
   */
  removeEnabledItem(itemIndex) {
    const wasRemoved = this.enabledItems.delete(itemIndex);
    if (wasRemoved) {
      this.notifyListeners('enabledItemRemoved', { itemIndex });
    }
    return wasRemoved;
  },
  
  /**
   * 檢查項目是否已啟用
   * @param {number} itemIndex - 項目索引
   * @returns {boolean} 項目是否已啟用
   */
  isEnabledItem(itemIndex) {
    return this.enabledItems.has(itemIndex);
  },
  
  /**
   * 獲取所有已啟用的項目
   * @returns {Array} 已啟用項目的索引陣列
   */
  getEnabledItems() {
    return Array.from(this.enabledItems).sort();
  },
  
  /**
   * 清空所有已啟用的項目
   */
  clearEnabledItems() {
    this.enabledItems.clear();
    this.notifyListeners('enabledItemsCleared', {});
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
