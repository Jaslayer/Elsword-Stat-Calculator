/**
 * 計算引擎層 - 純函數，根據狀態計算派生值
 * 無副作用：僅進行計算，不修改輸入數據或DOM
 */

// 浮點數精度處理函數 - 避免 5.3 顯示成 5.3000000002 或 5.29999999
const utilsRoundNumber = (num, decimals = 10) => {
  if (!Number.isFinite(num)) return num;
  
  const multiplier = Math.pow(10, decimals);
  const rounded = Math.round(num * multiplier) / multiplier;
  
  // 使用 toFixed 移除末尾的零，然後轉換回數字
  return parseFloat(rounded.toFixed(decimals));
};

const ComputeEngine = {
  /**
   * 計算配置1的乘積
   * 根據所有項目的配置1值，計算乘積
   * 特殊處理：適應力需要先除以100再加1
   * 
   * @param {Object} store - StatStore 狀態管理器
   * @param {Object} STAT_ITEMS - 統計項目常數 (可選)
   * @param {Function} calculateAdaptabilityFn - 計算適應力的函數 (可選)
   * @returns {number} 配置1的乘積
   */
  calculateConfig1Product(store, STAT_ITEMS = null, calculateAdaptabilityFn = null) {
    if (!store || store.config1Values.size === 0) {
      return 1;
    }
    
    let product = 1;
    const ADAPTABILITY_INDEX = 1; // 默認適應力索引
    
    store.config1Values.forEach((value, itemIndex) => {
      let effectiveValue;
      
      // 特殊處理適應力（如果提供了常數對象，使用常數；否則使用默認索引）
      const isAdaptability = STAT_ITEMS 
        ? itemIndex === STAT_ITEMS.ADAPTABILITY 
        : itemIndex === ADAPTABILITY_INDEX;
      
      if (isAdaptability) {
        // 适应力特殊处理：先除以100再加1
        const adaptValue = value || 0;
        effectiveValue = adaptValue === 0 ? 1 : (adaptValue / 100 + 1);
      } else {
        // 其他项目：0或空时以1计算
        effectiveValue = (value === 0 || value === null || value === undefined) ? 1 : value;
      }
      
      product *= effectiveValue;
    });
    
    return utilsRoundNumber(product, 5);
  },
  
  /**
   * 計算配置2的乘積
   * 根據所有項目的配置2值，計算乘積
   * 特殊處理：適應力需要先除以100再加1
   * 
   * @param {Object} store - StatStore 狀態管理器
   * @param {Object} STAT_ITEMS - 統計項目常數 (可選)
   * @param {Function} calculateAdaptabilityFn - 計算適應力的函數 (可選)
   * @returns {number} 配置2的乘積
   */
  calculateConfig2Product(store, STAT_ITEMS = null, calculateAdaptabilityFn = null) {
    if (!store || store.config2Values.size === 0) {
      return 1;
    }
    
    let product = 1;
    const ADAPTABILITY_INDEX = 1; // 默認適應力索引
    
    store.config2Values.forEach((value, itemIndex) => {
      let effectiveValue;
      
      // 特殊處理適應力（如果提供了常數對象，使用常數；否則使用默認索引）
      const isAdaptability = STAT_ITEMS 
        ? itemIndex === STAT_ITEMS.ADAPTABILITY 
        : itemIndex === ADAPTABILITY_INDEX;
      
      if (isAdaptability) {
        // 适应力特殊处理：先除以100再加1
        const adaptValue = value || 0;
        effectiveValue = adaptValue === 0 ? 1 : (adaptValue / 100 + 1);
      } else {
        // 其他项目：0或空时以1计算
        effectiveValue = (value === 0 || value === null || value === undefined) ? 1 : value;
      }
      
      product *= effectiveValue;
    });
    
    return utilsRoundNumber(product, 5);
  },
  
  /**
   * 計算比值：(較大值 ÷ 較小值)
   * 若分母為0，返回 '-'
   * 
   * @param {number} config1Product - 配置1乘積
   * @param {number} config2Product - 配置2乘積
   * @returns {string} 比值字符串（7位小數），或 '-'
   */
  calculateRatioValue(config1Product, config2Product) {
    const maxProduct = Math.max(config1Product, config2Product);
    const minProduct = Math.min(config1Product, config2Product);
    
    if (minProduct === 0) {
      return '-';
    }
    
    return (maxProduct / minProduct).toFixed(7);
  },
  
  /**
   * 獲取完整計算結果
   * 一次調用返回所有派生值：config1Product、config2Product、ratioValue
   * 
   * @param {Object} store - StatStore 狀態管理器
   * @param {Object} STAT_ITEMS - 統計項目常數 (可選)
   * @param {Function} calculateAdaptabilityFn - 計算適應力的函數 (可選)
   * @returns {Object} { config1Product, config2Product, ratioValue }
   */
  getComputedState(store, STAT_ITEMS = null, calculateAdaptabilityFn = null) {
    const config1Product = this.calculateConfig1Product(store, STAT_ITEMS, calculateAdaptabilityFn);
    const config2Product = this.calculateConfig2Product(store, STAT_ITEMS, calculateAdaptabilityFn);
    const ratioValue = this.calculateRatioValue(config1Product, config2Product);
    
    return {
      config1Product,
      config2Product,
      ratioValue,
      timestamp: Date.now()
    };
  },
  
  /**
   * 分離比值的主要部分和小數部分
   * 主要部分：小數點前 + 小數點 + 後2位
   * 小數部分：後2位之後的數字
   * 用於UI中對主要部分著色
   * 
   * @param {string} ratioValue - 比值字符串
   * @returns {Object} { mainPart, decimalPart }
   */
  splitRatioForDisplay(ratioValue) {
    if (ratioValue === '-') {
      return { mainPart: '-', decimalPart: '' };
    }
    
    const decimalIndex = ratioValue.indexOf('.');
    if (decimalIndex === -1) {
      // 沒有小數點
      return { mainPart: ratioValue, decimalPart: '' };
    }
    
    const mainPart = ratioValue.substring(0, decimalIndex + 3); // 小數點前 + 小數點 + 2位
    const decimalPart = ratioValue.substring(decimalIndex + 3);
    
    return { mainPart, decimalPart };
  },
  
  /**
   * 比較兩個配置值的大小關係
   * 用於決定箭頭方向和顏色
   * 
   * @param {number} config1Product - 配置1乘積
   * @param {number} config2Product - 配置2乘積
   * @returns {string} 'greater' | 'less' | 'equal'
   */
  compareConfigs(config1Product, config2Product) {
    if (config1Product > config2Product) return 'greater';
    if (config1Product < config2Product) return 'less';
    return 'equal';
  },
  
  /**
   * 浮點數精度處理函數 - 統一使用 src/utils.js 中的實現
   * @param {number} num - 要四捨五入的數字
   * @param {number} decimals - 小數位數（默認 5）
   * @returns {number} 精確的浮點數
   */
  roundNumber(num, decimals = 5) {
    return utilsRoundNumber(num, decimals);
  },
  
  /**
   * 根據數字長度動態計算字體大小
   * @param {string|number} numberValue - 數字值
   * @returns {number} 字體大小（像素）
   */
  getAdaptiveFontSize(numberValue) {
    const numberStr = String(numberValue);
    const length = numberStr.replace(/[^0-9]/g, '').length; // 只計算數字位數
    
    if (length <= 8) return 30;
    if (length <= 10) return 24;
    if (length <= 12) return 14;
    return 12;
  }
};

// 導出供外部使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComputeEngine;
}
if (typeof window !== 'undefined') {
  window.ComputeEngine = ComputeEngine;} else if (typeof global !== 'undefined') {
  global.ComputeEngine = ComputeEngine;}
