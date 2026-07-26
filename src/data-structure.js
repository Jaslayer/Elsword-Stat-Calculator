/**
 * 簡單數據結構 - 存儲所有用戶輸入的數據
 * 用於後續數值計算
 */

const UserInputData = {
  // 統計項目配置 1（左側）
  config1: {},
  
  // 統計項目配置 2（右側/結果）
  config2: {},
  
  // 配置1的最終乘積
  config1Product: 1,
  
  // 配置2的最終乘積
  config2Product: 1,
  
  // 配置1與配置2的比值（最大÷最小）
  ratioValue: '-',
  
  // 致命一擊傷害的詳細數據
  criticalDamage: {
    panel: 0,
    additive_damages: [],
    multiplicative_damages: []
  },
  
  // 適應力的詳細數據
  adaptability: {
    panel: 0,
    gathering_place: false,
    adapt_potion: false,
    super_adapt: 0,
    preset: '95%'
  },

  /**
   * 設置統計項目配置 1 的值
   * @param {number} itemIndex - 項目索引 (0-10)
   * @param {number} value - 配置 1 的值
   */
  setConfig1(itemIndex, value) {
    this.config1[itemIndex] = value;
  },

  /**
   * 設置統計項目配置 2 的值
   * @param {number} itemIndex - 項目索引
   * @param {number} value - 配置 2 的值
   */
  setConfig2(itemIndex, value) {
    this.config2[itemIndex] = value;
  },

  /**
   * 獲取配置 1 的值
   * @param {number} itemIndex - 項目索引
   * @returns {number} 配置 1 的值
   */
  getConfig1(itemIndex) {
    return this.config1[itemIndex] || 0;
  },

  /**
   * 獲取配置 2 的值
   * @param {number} itemIndex - 項目索引
   * @returns {number} 配置 2 的值
   */
  getConfig2(itemIndex) {
    return this.config2[itemIndex] || 0;
  },

  /**
   * 設置致命一擊傷害數據
   * @param {number} panel - 面板值
   * @param {Array} additive - 加成傷害數組
   * @param {Array} multiplicative - 乘算爆傷數組
   */
  setCriticalDamage(panel, additive = [], multiplicative = []) {
    this.criticalDamage = {
      panel: panel || 0,
      additive_damages: additive,
      multiplicative_damages: multiplicative
    };
  },

  /**
   * 設置適應力數據
   * @param {Object} data - 適應力數據對象
   */
  setAdaptability(data) {
    this.adaptability = {
      panel: data.panel || 0,
      gathering_place: data.gathering_place || false,
      adapt_potion: data.adapt_potion || false,
      super_adapt: data.super_adapt || 0,
      preset: data.preset || '95%'
    };
  },

  /**
   * 設置配置1的最終乘積
   * @param {number} product - 最終乘積值
   */
  setConfig1Product(product) {
    this.config1Product = product;
  },

  /**
   * 設置配置2的最終乘積
   * @param {number} product - 最終乘積值
   */
  setConfig2Product(product) {
    this.config2Product = product;
  },

  /**
   * 設置比值
   * @param {string|number} ratio - 比值
   */
  setRatioValue(ratio) {
    this.ratioValue = ratio;
  },

  /**
   * 設置計算結果（乘積和比值）
   * @param {number} config1Product - 配置1的乘積
   * @param {number} config2Product - 配置2的乘積
   * @param {string|number} ratioValue - 比值
   */
  setComputedResults(config1Product, config2Product, ratioValue) {
    this.config1Product = config1Product;
    this.config2Product = config2Product;
    this.ratioValue = ratioValue;
  },

  /**
   * 獲取所有數據
   * @returns {Object} 完整的用戶輸入數據
   */
  getAllData() {
    return {
      config1: this.config1,
      config2: this.config2,
      config1Product: this.config1Product,
      config2Product: this.config2Product,
      ratioValue: this.ratioValue,
      criticalDamage: this.criticalDamage,
      adaptability: this.adaptability,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * 清空所有數據
   */
  clear() {
    this.config1 = {};
    this.config2 = {};
    this.config1Product = 1;
    this.config2Product = 1;
    this.ratioValue = '-';
    this.criticalDamage = {
      panel: 0,
      additive_damages: [],
      multiplicative_damages: []
    };
    this.adaptability = {
      panel: 0,
      gathering_place: false,
      adapt_potion: false,
      super_adapt: 0,
      preset: '95%'
    };
  },

  /**
   * 導出為 JSON
   * @returns {string} JSON 字符串
   */
  toJSON() {
    return JSON.stringify(this.getAllData(), null, 2);
  },

  /**
   * 從 JSON 導入
   * @param {string} jsonStr - JSON 字符串
   */
  fromJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      this.config1 = data.config1 || {};
      this.config2 = data.config2 || {};
      this.config1Product = data.config1Product || 1;
      this.config2Product = data.config2Product || 1;
      this.ratioValue = data.ratioValue || '-';
      this.criticalDamage = data.criticalDamage || this.criticalDamage;
      this.adaptability = data.adaptability || this.adaptability;
    } catch (err) {
      console.error('JSON 導入失敗:', err);
    }
  }
};

// ✨ 將 UserInputData 暴露到全局作用域
if (typeof window !== 'undefined') {
  window.UserInputData = UserInputData;
}
