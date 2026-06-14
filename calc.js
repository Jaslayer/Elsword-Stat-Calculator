// 計算配置1和配置2的乘積，將結果顯示在最頂列的 header panel

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

/**
 * 獲取指定統計項目的配置值
 * @param {number} itemIndex - 項目索引
 * @param {string} configType - 'left' 或 'result'
 * @returns {number} 該項目的配置值
 */
function getStatItemValue(itemIndex, configType = 'left') {
  const panels = document.querySelectorAll('.input-panel-item');
  for (let panel of panels) {
    if (parseInt(panel.dataset.index) === itemIndex) {
      const selector = configType === 'left' ? '.left-input' : '.result-input';
      const input = panel.querySelector(selector);
      if (input) {
        return parseInputValue(input);
      }
    }
  }
  return 0;
}

/**
 * 解析輸入值，支持適應力的 "panel|super" 格式
 * @param {Element} input - 輸入元素
 * @returns {number} 解析後的數值
 */
function parseInputValue(input) {
  let value;
  if (input.classList.contains('button-input')) {
    if (input.dataset.value && input.dataset.value.includes('|')) {
      // 適應力格式: 只取 panel 值
      value = parseFloat(input.dataset.value.split('|')[0]) || 0;
    } else {
      value = parseFloat(input.dataset.value) || 0;
    }
  } else {
    value = parseFloat(input.value) || 0;
  }
  return value;
}

/**
 * 計算指定統計項目的配置1和配置2乘積
 * @param {number} itemIndex - 項目索引
 * @returns {Object} {config1: 配置1乘積, config2: 配置2乘積}
 */
function calculateStatItemProduct(itemIndex) {
  const config1Value = getStatItemValue(itemIndex, 'left');
  const config2Value = getStatItemValue(itemIndex, 'result');
  
  return {
    config1: config1Value,
    config2: config2Value,
    itemIndex: itemIndex,
    itemName: STAT_NAMES[itemIndex]
  };
}

// ============ 各統計項目的計算函數 ============

/**
 * 計算物/魔攻擊力
 */
function calculatePhysicalMagicAttack() {
  return calculateStatItemProduct(STAT_ITEMS.PHYSICAL_MAGIC_ATTACK);
}

/**
 * 計算適應力值 - 纯计算函数（用于按钮显示）
 * @param {Object} values - 包含 panel, gathering_place, adapt_potion, super_adapt 的对象
 * @returns {number} 计算结果
 * 面板值限制为最多 60
 */
function calculateAdaptabilityValue(values) {
  let panelValue = parseFloat(values.panel) || 0;
  // 限制 panel 值不超過 60
  panelValue = Math.min(panelValue, MAX_ADAPTABILITY_PANEL);
  
  const gatheringPlace = values.gathering_place ? 2 : 0;  // 集合地 +2
  const adaptPotion = values.adapt_potion ? 3 : 0;        // 適應靈藥 +3
  const superAdapt = parseFloat(values.super_adapt) || 0;
  
  // 計算: min(panel + buff, 60) + super_adapt
  const buffedPanel = Math.min(panelValue + gatheringPlace + adaptPotion, 60);
  return buffedPanel + superAdapt;
}

/**
 * 計算適應力 - 特殊計算方法
 * 公式: min(panel + gathering_place_buff + adapt_potion_buff, 60) + super_adapt
 * 面板值限制為最多 60
 */
function calculateAdaptability() {
  const itemIndex = STAT_ITEMS.ADAPTABILITY;
  const panels = document.querySelectorAll('.input-panel-item');
  
  // 找到適應力的面板
  for (let panel of panels) {
    if (parseInt(panel.dataset.index) === itemIndex) {
      const leftButton = panel.querySelector('.left-input');
      const resultButton = panel.querySelector('.result-input');
      
      if (leftButton) {
        // 解析 "panel|gathering_place|adapt_potion|super_adapt|preset" 格式
        const value = leftButton.dataset.value || '0|0|0|0|95';
        const parts = value.split('|');
        
        let panelValue = parseFloat(parts[0]) || 0;
        // 限制 panel 值不超過 60
        panelValue = Math.min(panelValue, MAX_ADAPTABILITY_PANEL);
        
        const gatheringPlace = parts[1] === '1' ? 2 : 0;  // 集合地 +2
        const adaptPotion = parts[2] === '1' ? 3 : 0;     // 適應靈藥 +3
        const superAdapt = parseFloat(parts[3]) || 0;
        
        // 計算: min(panel + buff, 60) + super_adapt
        const buffedPanel = Math.min(panelValue + gatheringPlace + adaptPotion, 60);
        const config1 = buffedPanel + superAdapt;
        
        // 右側配置值計算方式相同
        let config2 = 0;
        if (resultButton) {
          const resultValue = resultButton.dataset.value || '0|0|0|0|95';
          const resultParts = resultValue.split('|');
          
          let resultPanelValue = parseFloat(resultParts[0]) || 0;
          // 限制 panel 值不超過 60
          resultPanelValue = Math.min(resultPanelValue, MAX_ADAPTABILITY_PANEL);
          
          const resultGatheringPlace = resultParts[1] === '1' ? 2 : 0;
          const resultAdaptPotion = resultParts[2] === '1' ? 3 : 0;
          const resultSuperAdapt = parseFloat(resultParts[3]) || 0;
          
          const resultBuffedPanel = Math.min(resultPanelValue + resultGatheringPlace + resultAdaptPotion, 60);
          config2 = resultBuffedPanel + resultSuperAdapt;
        }
        
        return {
          config1: config1,
          config2: config2,
          itemIndex: itemIndex,
          itemName: STAT_NAMES[itemIndex]
        };
      }
    }
  }
  
  // 未找到該項，返回 0
  return {
    config1: 0,
    config2: 0,
    itemIndex: itemIndex,
    itemName: STAT_NAMES[itemIndex]
  };
}

/**
 * 計算致命一擊傷害
 */
function calculateCriticalDamage() {
  return calculateStatItemProduct(STAT_ITEMS.CRITICAL_DAMAGE);
}

/**
 * 計算兩極化
 */
function calculatePolarization() {
  return calculateStatItemProduct(STAT_ITEMS.POLARIZATION);
}

/**
 * 計算 Boss 傷害
 */
function calculateBossDamage() {
  return calculateStatItemProduct(STAT_ITEMS.BOSS_DAMAGE);
}

/**
 * 計算 50%以上/以下
 */
function calculateHPThreshold() {
  return calculateStatItemProduct(STAT_ITEMS.HP_THRESHOLD);
}

/**
 * 計算 100%以下
 */
function calculateBelow100() {
  return calculateStatItemProduct(STAT_ITEMS.BELOW_100);
}

/**
 * 計算流血
 */
function calculateBleeding() {
  return calculateStatItemProduct(STAT_ITEMS.BLEEDING);
}

/**
 * 計算強烈/超越技傷
 */
function calculateStrongSkillDamage() {
  return calculateStatItemProduct(STAT_ITEMS.STRONG_SKILL_DAMAGE);
}

/**
 * 計算所有技傷
 */
function calculateAllSkillDamage() {
  return calculateStatItemProduct(STAT_ITEMS.ALL_SKILL_DAMAGE);
}

/**
 * 計算其他
 */
function calculateOther() {
  return calculateStatItemProduct(STAT_ITEMS.OTHER);
}

/**
 * 計算所有統計項目的乘積
 */
function calculateAllStatProducts() {
  const results = [];
  for (let itemIndex in STAT_NAMES) {
    results.push(calculateStatItemProduct(parseInt(itemIndex)));
  }
  return results;
}

/**
 * 計算適應力的乘數
 * 新公式: min(100 - 環境debuff + 當前輸入值, 100) / 100
 * @param {Element} button - 適應力按鈕元素
 * @returns {number} 乘數值
 */
function calculateAdaptabilityMultiplier(button) {
  if (!button || !button.dataset.value) {
    return 1; // 如果沒有值，返回1
  }
  
  // 解析按鈕的數據格式: "panel|gathering_place|adapt_potion|super_adapt|preset"
  const parts = button.dataset.value.split('|');
  const presetDebuff = parts[4] !== undefined ? parseFloat(parts[4]) : 95; // 環境debuff，默認95
  
  // 使用最終計算的適應力值（包含gathering_place和adapt_potion的buff）
  const result = calculateAdaptability();
  const currentValue = button.classList.contains('left-input') ? result.config1 : result.config2;
  
  // 計算乘數: min(100 - debuff + 當前值, 100) / 100
  const multiplierBase = Math.min(100 - presetDebuff + currentValue, 100);
  const multiplier = multiplierBase / 100;
  
  return multiplier === 0 ? 1 : multiplier;
}

/**
 * 計算配置1的乘積，當值為0或空時以1計算
 * 特殊處理: 適應力使用新乘數計算方式
 */
function calculateConfig1Product() {
  const panels = document.querySelectorAll('.input-panel-item');
  if (panels.length === 0) return 1;
  
  let product = 1;
  panels.forEach(panel => {
    const leftInput = panel.querySelector('.left-input');
    if (leftInput) {
      const itemIndex = parseInt(panel.dataset.index);
      let effectiveValue;
      
      if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
        // 適應力: 使用新的乘數計算方式
        const multiplier = calculateAdaptabilityMultiplier(leftInput);
        effectiveValue = multiplier;
      } else {
        // 其他項目: 當值為0或空時以1計算
        const value = parseInputValue(leftInput);
        effectiveValue = (value === 0 || value === null || value === undefined) ? 1 : value;
      }
      
      product *= effectiveValue;
    }
  });
  
  return roundNumber(product);
}

/**
 * 計算配置2的乘積，當值為0或空時以1計算
 * 特殊處理: 適應力使用新乘數計算方式
 */
function calculateConfig2Product() {
  const panels = document.querySelectorAll('.input-panel-item');
  if (panels.length === 0) return 1;
  
  let product = 1;
  panels.forEach(panel => {
    const resultInput = panel.querySelector('.result-input');
    if (resultInput) {
      const itemIndex = parseInt(panel.dataset.index);
      let effectiveValue;
      
      if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
        // 適應力: 使用新的乘數計算方式
        const multiplier = calculateAdaptabilityMultiplier(resultInput);
        effectiveValue = multiplier;
      } else {
        // 其他項目: 當值為0或空時以1計算
        const value = parseInputValue(resultInput);
        effectiveValue = (value === 0 || value === null || value === undefined) ? 1 : value;
      }
      
      product *= effectiveValue;
    }
  });
  
  return roundNumber(product);
}

/**
 * 更新 header 中的箭頭顯示
 * 配置1大時：青色向下箭頭 ▼ (negative)
 * 配置1小時：紅色向上箭頭 ▲ (positive)
 * 配置相等時：白色等號 = (neutral)
 */
function updateArrowDisplay(config1Product, config2Product) {
  const headerPanel = document.querySelector('.input-panel-header');
  if (!headerPanel) return;
  
  const arrowLeft = headerPanel.querySelector('.arrow-left');
  if (!arrowLeft) return;
  
  // 重置類名
  arrowLeft.classList.remove('positive', 'negative', 'neutral');
  
  // 根據配置值比較決定箭頭樣式
  if (config1Product > config2Product) {
    // 配置1大：左箭頭青色向下 ▼
    arrowLeft.classList.add('negative');
    arrowLeft.style.color = '#00ddff';
    arrowLeft.style.textShadow = '0 0 8px rgba(0, 221, 255, 0.6)';
    arrowLeft.style.transform = 'scaleY(-1)';
    arrowLeft.textContent = '▲';
  } else if (config1Product < config2Product) {
    // 配置1小：左箭頭紅色向上 ▲
    arrowLeft.classList.add('positive');
    arrowLeft.style.color = '#ff3333';
    arrowLeft.style.textShadow = '0 0 8px rgba(255, 51, 51, 0.6)';
    arrowLeft.style.transform = 'scaleY(1)';
    arrowLeft.textContent = '▲';
  } else {
    // 相等：白色等號 =
    arrowLeft.classList.add('neutral');
    arrowLeft.style.color = '#ffffff';
    arrowLeft.style.textShadow = 'none';
    arrowLeft.style.transform = 'scaleY(1)';
    arrowLeft.textContent = '=';
  }
}

/**
 * 根據數字長度動態計算適合的字體大小
 * ✅ 使用 ComputeEngine 的版本（避免重複代碼）
 * @param {string|number} numberValue - 數字值
 * @returns {number} 字體大小（像素）
 */
function getAdaptiveFontSize(numberValue) {
  if (window.ComputeEngine && window.ComputeEngine.getAdaptiveFontSize) {
    return window.ComputeEngine.getAdaptiveFontSize(numberValue);
  }
  
  // 備用實現（以防 ComputeEngine 未加載）
  const numberStr = String(numberValue);
  const length = numberStr.replace(/[^0-9]/g, '').length;
  if (length <= 8) return 30;
  if (length <= 10) return 24;
  if (length <= 12) return 14;
  return 12;
}



/**
 * 更新 header 中的乘積顯示
 */
function updateProductDisplay() {
  const panels = document.querySelectorAll('.input-panel-item');
  if (panels.length === 0) return;
  
  const headerPanel = document.querySelector('.input-panel-header');
  if (!headerPanel) return;
  
  const config1Product = calculateConfig1Product();
  const config2Product = calculateConfig2Product();
  
  const configWrappers = headerPanel.querySelectorAll('.config-wrapper');
  if (configWrappers.length < 2) return;
  
  // 更新配置1乘積
  const config1Wrapper = configWrappers[0];
  let config1ProductDiv = config1Wrapper.querySelector('.config1-product-value');
  if (!config1ProductDiv) {
    config1ProductDiv = document.createElement('div');
    config1ProductDiv.className = 'config1-product-value';
    config1ProductDiv.style.cssText = 'color: rgba(255, 255, 255, 0.9); text-align: center; margin-bottom: 4px; font-weight: 600;';
    config1Wrapper.appendChild(config1ProductDiv);
  }
  config1ProductDiv.textContent = config1Product;
  config1ProductDiv.style.fontSize = getAdaptiveFontSize(config1Product) + 'px';
  
  // 更新配置2乘積
  const config2Wrapper = configWrappers[1];
  let config2ProductDiv = config2Wrapper.querySelector('.config2-product-value');
  if (!config2ProductDiv) {
    config2ProductDiv = document.createElement('div');
    config2ProductDiv.className = 'config2-product-value';
    config2ProductDiv.style.cssText = 'color: rgba(255, 255, 255, 0.9); text-align: center; margin-bottom: 4px; font-weight: 600;';
    config2Wrapper.appendChild(config2ProductDiv);
  }
  config2ProductDiv.textContent = config2Product;
  config2ProductDiv.style.fontSize = getAdaptiveFontSize(config2Product) + 'px';
  
  // 根據數值大小決定哪個配置亮起
  const config1Panels = document.querySelectorAll('.config-wrapper:nth-child(2)');
  const config2Panels = document.querySelectorAll('.config-wrapper:nth-child(3)');
  
  if (config1Product > config2Product) {
    // 配置1數值較大，亮起配置1
    config1Panels.forEach(panel => panel.classList.add('highlighted'));
    config2Panels.forEach(panel => panel.classList.remove('highlighted'));
  } else if (config2Product > config1Product) {
    // 配置2數值較大，亮起配置2
    config1Panels.forEach(panel => panel.classList.remove('highlighted'));
    config2Panels.forEach(panel => panel.classList.add('highlighted'));
  } else {
    // 數值相等，兩個都不亮
    config1Panels.forEach(panel => panel.classList.remove('highlighted'));
    config2Panels.forEach(panel => panel.classList.remove('highlighted'));
  }
  
  // 更新箭頭顯示
  updateArrowDisplay(config1Product, config2Product);
  
  // 更新比值 (較大值 ÷ 較小值)
  const ratioWrapper = configWrappers[2];
  let ratioDiv = ratioWrapper.querySelector('.config-ratio-value');
  if (!ratioDiv) {
    ratioDiv = document.createElement('div');
    ratioDiv.className = 'config-ratio-value';
    ratioDiv.style.cssText = 'color: rgba(255, 255, 255, 0.9); text-align: center; margin-bottom: 4px; font-weight: 600;';
    ratioWrapper.appendChild(ratioDiv);
  }
  
  const ratioValue = window.ComputeEngine && window.ComputeEngine.calculateRatioValue
    ? window.ComputeEngine.calculateRatioValue(config1Product, config2Product)
    : (function() {
        const maxProduct = Math.max(config1Product, config2Product);
        const minProduct = Math.min(config1Product, config2Product);
        return minProduct === 0 ? '-' : (maxProduct / minProduct).toFixed(7);
      })();
  
  if (ratioValue === '-') {
    ratioDiv.textContent = '-';
  } else {
    // 分割小數點後2位(含)之前和之後的部分
    const decimalIndex = ratioValue.indexOf('.');
    const mainPart = ratioValue.substring(0, decimalIndex + 3); // 小數點前 + 小數點 + 2位
    const remainingPart = ratioValue.substring(decimalIndex + 3);
    // 主要部分用亮綠色，剩餘部分保持原色
    ratioDiv.innerHTML = `<span style="color: #00ff00;">${mainPart}</span>${remainingPart}`;
  }
  ratioDiv.style.fontSize = getAdaptiveFontSize(ratioValue) + 'px';
}

// 導出函數供外部使用
window.updateProductDisplay = updateProductDisplay;
window.calculateConfig1Product = calculateConfig1Product;
window.calculateConfig2Product = calculateConfig2Product;
window.calculateAllStatProducts = calculateAllStatProducts;
window.getStatItemValue = getStatItemValue;
window.parseInputValue = parseInputValue;
window.calculateAdaptabilityMultiplier = calculateAdaptabilityMultiplier;

// 導出各統計項目的計算函數
window.calculatePhysicalMagicAttack = calculatePhysicalMagicAttack;
window.calculateAdaptability = calculateAdaptability;
window.calculateCriticalDamage = calculateCriticalDamage;
window.calculatePolarization = calculatePolarization;
window.calculateBossDamage = calculateBossDamage;
window.calculateHPThreshold = calculateHPThreshold;
window.calculateBelow100 = calculateBelow100;
window.calculateBleeding = calculateBleeding;
window.calculateStrongSkillDamage = calculateStrongSkillDamage;
window.calculateAllSkillDamage = calculateAllSkillDamage;
window.calculateOther = calculateOther;

// 導出常數
window.STAT_ITEMS = STAT_ITEMS;
window.STAT_NAMES = STAT_NAMES;

// ============ 新架構：統一事件處理層 ============

/**
 * 統一的事件處理入口函數
 * 流程：用戶輸入 → 更新狀態 → 觸發三向綁定 → 計算派生值 → 更新視圖 → 分發事件
 * 
 * 這是測項友好的架構：所有連動邏輯都通過這個函數，便於追踪和驗證
 * 
 * @param {number} itemIndex - 統計項目索引
 * @param {string} configType - 改變類型 ('config1' 或 'config2')
 * @param {number} newValue - 新值
 */
function handleStatInputChange(itemIndex, configType, newValue) {
  // 確保 StatStore 和 ComputeEngine 已加載
  if (!window.StatStore || !window.ComputeEngine) {
    console.warn('StatStore or ComputeEngine not available');
    return;
  }
  
  // Step 1: 更新狀態存儲
  const store = window.StatStore;
  const changed = configType === 'config1'
    ? store.setConfig1Value(itemIndex, newValue)
    : store.setConfig2Value(itemIndex, newValue);
  
  if (!changed) return; // 值未改變，無需更新
  
  // Step 2: 觸發三向綁定（如果需要）
  if (window.shouldSyncThreeWay && window.shouldSyncThreeWay(itemIndex)) {
    store.syncThreeWayBinding(itemIndex, configType, newValue);
  }
  
  // Step 3: 計算所有派生值
  const computeEngine = window.ComputeEngine;
  const computed = computeEngine.getComputedState(store, STAT_ITEMS, calculateAdaptability);
  
  // Step 4: 更新視圖
  updateProductDisplay();
  
  // Step 5: 分發事件（供測試監聽和擴展）
  const event = new CustomEvent('statInputChanged', {
    detail: {
      itemIndex,
      configType,
      newValue,
      previousValue: configType === 'config1' 
        ? store.getConfig1Value(itemIndex) 
        : store.getConfig2Value(itemIndex),
      computed,
      timestamp: Date.now()
    },
    bubbles: true,
    cancelable: false
  });
  window.dispatchEvent(event);
}

/**
 * 獲取當前計算狀態的快照
 * 用於測試驗證：可隨時審計所有狀態和計算結果
 * 
 * @returns {Object} 包含狀態、計算結果和時間戳的快照
 */
function getStatSnapshot() {
  if (!window.StatStore || !window.ComputeEngine) {
    return null;
  }
  
  const store = window.StatStore;
  const computeEngine = window.ComputeEngine;
  const computed = computeEngine.getComputedState(store, STAT_ITEMS, calculateAdaptability);
  
  return {
    state: store.getSnapshot(),
    computed,
    timestamp: Date.now()
  };
}

/**
 * 初始化新架構（從 DOM 加載狀態）
 * 在頁面加載時調用
 */
function initializeNewArchitecture() {
  if (!window.StatStore) {
    console.warn('StatStore not available');
    return;
  }
  
  const store = window.StatStore;
  store.initFromDOM(parseInputValue, calculateAdaptability, STAT_ITEMS);
  
  // 訂閱狀態變化（可用於調試和高級功能）
  store.subscribe((eventType, data) => {
    // console.log(`[StatStore Event] ${eventType}:`, data);
  });
}

// 導出新架構的函數供外部使用
window.handleStatInputChange = handleStatInputChange;
window.getStatSnapshot = getStatSnapshot;
window.initializeNewArchitecture = initializeNewArchitecture;

// 初始化
function init() {
  updateProductDisplay();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


