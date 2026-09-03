/**
 * 計算引擎層 - 純函數，根據狀態計算派生值
 * 無副作用：僅進行計算，不修改輸入數據或DOM
 */

// 統計項目列表及其索引對應
const STAT_ITEMS = {
  PHYSICAL_MAGIC_ATTACK: 0,        // 物/魔攻擊力
  ADAPTABILITY: 1,                 // 適應力
  CRITICAL_DAMAGE: 2,              // 致命一擊傷害
  POLARIZATION: 3,                 // 兩極化
  BOSS_DAMAGE: 4,                  // Boss 傷害
  HP_THRESHOLD: 5,                 // 50%以上/以下
  BELOW_100: 6,                    // 100%以下
  BLEEDING: 7,                     // 流血
  STRONG_SKILL_DAMAGE: 8,          // 強烈/超越技傷
  ALL_SKILL_DAMAGE: 9,             // 所有技傷
  OTHER: 10                        // 其他
};

// 統計項目名稱對應
const STAT_NAMES = {
  [STAT_ITEMS.PHYSICAL_MAGIC_ATTACK]: '物/魔攻擊力',
  [STAT_ITEMS.ADAPTABILITY]: '適應力',
  [STAT_ITEMS.CRITICAL_DAMAGE]: '致命一擊傷害',
  [STAT_ITEMS.POLARIZATION]: '兩極化',
  [STAT_ITEMS.BOSS_DAMAGE]: 'Boss 傷害',
  [STAT_ITEMS.HP_THRESHOLD]: '50%以上/以下',
  [STAT_ITEMS.BELOW_100]: '100%以下',
  [STAT_ITEMS.BLEEDING]: '流血',
  [STAT_ITEMS.STRONG_SKILL_DAMAGE]: '強烈/超越技傷',
  [STAT_ITEMS.ALL_SKILL_DAMAGE]: '所有技傷',
  [STAT_ITEMS.OTHER]: '其他'
};

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
   * 內部共通計算乘積函數
   * @param {Map} valuesMap - config1Values 或 config2Values
   * @param {Set} enabledItems - 已啟用的項目集合
   * @param {Object} store - StatStore 狀態管理器（用於取得適應力環境debuff）
   * @returns {number} 乘積結果
   * @private
   */
  _calculateProductFromValues(valuesMap, enabledItems, store) {
    if (!valuesMap || valuesMap.size === 0) {
      return 1;
    }
    
    let product = 1;
    
    valuesMap.forEach((value, itemIndex) => {
      // 檢查項目是否被啟用，若未啟用則跳過
      if (enabledItems && !enabledItems.has(itemIndex)) {
        return;
      }
      
      let effectiveValue;
      
      // 根據項目索引進行特殊處理
      switch (itemIndex) {
        case STAT_ITEMS.ADAPTABILITY: {
          // 適應力特殊處理：min(100-環境debuff+(超)適應力最終值,100)/100
          const adaptValue = value || 0;
          // 從 adaptabilityConfig1 或 adaptabilityConfig2 讀取 preset（兩者應同步）
          const adaptConfig = store && store.adaptabilityConfig1 ? store.adaptabilityConfig1 : (store && store.adaptabilityConfig2 ? store.adaptabilityConfig2 : null);
          const preset = adaptConfig ? parseInt(adaptConfig.preset) || 0 : 0;
          effectiveValue = Math.min(100 - preset + adaptValue, 100) / 100;
          break;
        }
        case STAT_ITEMS.PHYSICAL_MAGIC_ATTACK:
          // 物/魔攻擊力：value直接乘入，若為0則以1計算
          effectiveValue = (value === 0 || value === null || value === undefined) ? 1 : value;
          break;
        case STAT_ITEMS.CRITICAL_DAMAGE:
          // 致命一擊傷害：value/100 直接乘入，若為0則以1計算
          effectiveValue = (value === 0 || value === null || value === undefined) ? 1 : value / 100;
          break;
        default:
          // 其他項目：(value+100)/100 乘入
          effectiveValue = ((value || 0) + 100) / 100;
      }
      
      product *= effectiveValue;
    });
    
    return utilsRoundNumber(product, 5);
  },
  
  /**
   * 通用乘積計算函數
   * 根據配置類型計算乘積
   * 特殊處理：適應力計算公式 min(100-環境debuff+(超)適應力最終值,100)/100
   * 只計算已啟用的項目
   * 
   * @param {Object} store - StatStore 狀態管理器
   * @param {string} configType - 配置類型 ('config1' | 'config2')
   * @returns {number} 乘積結果
   */
  calculateProduct(store, configType) {
    if (!store) return 1;
    
    const valuesMap = configType === 'config1' ? store.config1Values : store.config2Values;
    
    if (!valuesMap || valuesMap.size === 0) {
      return 1;
    }
    
    return this._calculateProductFromValues(valuesMap, store.enabledItems, store);
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
   * @returns {Object} { config1Product, config2Product, ratioValue }
   */
  getComputedState(store) {
    const config1Product = this.calculateProduct(store, 'config1');
    const config2Product = this.calculateProduct(store, 'config2');
    const ratioValue = this.calculateRatioValue(config1Product, config2Product);
    
    return {
      config1Product,
      config2Product,
      ratioValue,
      timestamp: Date.now()
    };
  },

  /**
   * 統一同步函數 - 基於用戶輸入計算所有派生值
   * 一次調用完成：
   * 1. 計算每個項目的三向綁定（變動量 = config2 - config1）
   * 2. 計算 config1Product 和 config2Product
   * 3. 計算比值 (ratio)
   * 
   * @param {Object} store - StatStore 狀態管理器
   * @returns {Object} 完整計算結果
   */
  normalSync(store) {
    if (!store) {
      return {
        config1Product: 1,
        config2Product: 1,
        ratioValue: '-',
        itemDeltas: {},  // 每個項目的變動量
        comparison: 'equal'
      };
    }

    // Step 1: 計算每個項目的三向綁定（變動量）
    const itemDeltas = {};
    const expectedIndices = Object.values(STAT_ITEMS);
    
    expectedIndices.forEach(index => {
      const config1 = store.getConfig1Value(index) || 0;
      const config2 = store.getConfig2Value(index) || 0;
      itemDeltas[index] = utilsRoundNumber(config2 - config1);
    });

    // Step 2: 計算 product 和 ratio
    const config1Product = this.calculateProduct(store, 'config1');
    const config2Product = this.calculateProduct(store, 'config2');
    const ratioValue = this.calculateRatioValue(config1Product, config2Product);

    // Step 3: 比較配置大小關係
    const comparison = config1Product > config2Product 
      ? 'greater' 
      : (config1Product < config2Product ? 'less' : 'equal');

    return {
      config1Product,
      config2Product,
      ratioValue,
      itemDeltas,      // 所有項目的變動量
      comparison,      // 'greater' | 'less' | 'equal'
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
   * 計算適應力值 - 純計算函數（用於按鈕顯示）
   * @param {Object} values - 包含 panel, gathering_place, adapt_potion, super_adapt 的對象
   * @returns {number} 計算結果
   * 公式: min(panel + gathering_place_buff + adapt_potion_buff, 60) + super_adapt
   * 輸入時允許超過 60，但計算時限制在 60
   */
  calculateAdaptabilityValue(values) {
    let panelValue = parseFloat(values.panel) || 0;
    // 允許輸入超過 60，不在此限制
    
    const gatheringPlace = values.gathering_place ? 2 : 0;  // 集合地 +2
    const adaptPotion = values.adapt_potion ? 3 : 0;        // 適應靈藥 +3
    const superAdapt = parseFloat(values.super_adapt) || 0;
    
    // 計算: min(panel + buff, 60) + super_adapt
    const buffedPanel = Math.min(panelValue + gatheringPlace + adaptPotion, 60);
    return buffedPanel + superAdapt;
  },
  
  /**
   * 計算致命一擊傷害值 - 純計算函數（用於按鈕顯示）
   * @param {Object} values - 包含 panel, additive_damages, multiplicative_damages 的對象
   * @returns {number} 計算結果
   * 公式: panel + 150 × (∏[(乘算+100)/100] - 1) + 加算總和
   */
  calculateCriticalDamageValue(values) {
    const panel = parseFloat(values.panel) || 0;
    
    // 計算加算爆傷總和
    let additiveSum = 0;
    if (values.additive_damages && Array.isArray(values.additive_damages)) {
      additiveSum = values.additive_damages.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
    }
    
    // 計算乘算爆傷總乘積: ∏[(m + 100) / 100]
    let multiplicativeProduct = 1;
    if (values.multiplicative_damages && Array.isArray(values.multiplicative_damages)) {
      multiplicativeProduct = values.multiplicative_damages
        .map(v => parseFloat(v) || 0)
        .filter(v => v !== 0)
        .reduce((prod, v) => prod * ((v + 100) / 100), 1);
    }
    
    // 新公式: 面板 + 150 * (乘算總乘積 - 1) + 加算總和
    const result = panel + 150 * (multiplicativeProduct - 1) + additiveSum;
    return utilsRoundNumber(result);
  },

  /**
   * 計算 Boss 傷害值 - 純計算函數（用於按鈕顯示）
   * @param {Object} values - 包含 value, guild_skill 的對象
   * @returns {number} 計算結果
   * 公式: value + (guild_skill ? 2.5 : 0)
   */
  calculateBossDamageValue(values) {
    const baseValue = parseFloat(values.value) || 0;
    const guildSkillBonus = values.guild_skill ? 2.5 : 0;
    return utilsRoundNumber(baseValue + guildSkillBonus);
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
  },

  /**
   * 解析輸入值字符串（根據不同統計項目）
   * 純函數 - 不需要 DOM 訪問
   * @param {string} valueString - 值字符串或 "panel|..." 格式
   * @param {number} itemIndex - 統計項目索引
   * @returns {number} 計算後的最終數值
   */
  parseInputValueByString(valueString, itemIndex = -1) {
    if (!valueString) return 0;
    
    // 解析 JSON 格式
    let values = {};
    if (valueString.startsWith('{')) {
      try {
        values = JSON.parse(valueString);
      } catch (e) {
        return 0;
      }
    } else {
      // 普通數字格式
      return parseFloat(valueString) || 0;
    }
    
    // 根據 itemIndex 調用相應的計算函數
    if (itemIndex === 1) {
      // 適應力
      return this.calculateAdaptabilityValue(values);
    } else if (itemIndex === 2) {
      // 致命一擊傷害
      return this.calculateCriticalDamageValue(values);
    } else {
      // 其他項目返回 panel 值或直接返回值
      return values.panel || values.value || parseFloat(values) || 0;
    }
  }
};

// 導出常數和引擎
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ComputeEngine, STAT_ITEMS, STAT_NAMES, utilsRoundNumber };
}

if (typeof window !== 'undefined') {
  window.ComputeEngine = ComputeEngine;
  window.STAT_ITEMS = STAT_ITEMS;
  window.STAT_NAMES = STAT_NAMES;
  window.roundNumber = utilsRoundNumber;  // 統一的浮點數精度處理
} else if (typeof global !== 'undefined') {
  global.ComputeEngine = ComputeEngine;
  global.STAT_ITEMS = STAT_ITEMS;
  global.STAT_NAMES = STAT_NAMES;
  global.roundNumber = utilsRoundNumber;
}
