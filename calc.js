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
        return computeInputValue(input);
      }
    }
  }
  return 0;
}

/**
 * 計算輸入值（解析 + 複雜計算）
 * 支持適應力和致命一擊傷害的 "panel|..." 格式
 * 在 syncAllStatValues 時調用，確保所有計算在一個地方進行
 * @param {Element} input - 輸入元素
 * @returns {number} 計算後的最終數值
 */
function computeInputValue(input) {
  let value;
  if (input.classList.contains('button-input')) {
    if (input.dataset.value && input.dataset.value.includes('|')) {
      const panelItem = input.closest('.input-panel-item');
      const itemIndex = panelItem ? parseInt(panelItem.dataset.index) : -1;
      
      if (itemIndex === 1) {
        // 適應力 (Adaptability) - 使用純計算函數
        const parts = input.dataset.value.split('|');
        const values = {
          panel: parseFloat(parts[0]) || 0,
          gathering_place: parts[1] === '1',
          adapt_potion: parts[2] === '1',
          super_adapt: parseFloat(parts[3]) || 0
        };
        value = calculateAdaptabilityValue(values);
      } else if (itemIndex === 2) {
        // 致命一擊傷害 (Critical Damage) - 使用純計算函數
        const parts = input.dataset.value.split('|');
        const values = {
          panel: parseFloat(parts[0]) || 0,
          additive_damages: parts[1] ? parts[1].split(',').map(v => parseFloat(v) || 0) : [],
          multiplicative_damages: parts[2] ? parts[2].split(',').map(v => parseFloat(v) || 0) : []
        };
        value = calculateCriticalDamageValue(values);
      } else {
        // 其他格式只取第一個值
        value = parseFloat(input.dataset.value.split('|')[0]) || 0;
      }
    } else {
      value = parseFloat(input.dataset.value) || 0;
    }
  } else {
    value = parseFloat(input.value) || 0;
  }
  return value;
}

/**
 * 向後相容：parseInputValue 現在調用 computeInputValue
 * 保留此別名以避免破壞現有引用
 */
function parseInputValue(input) {
  return computeInputValue(input);
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

// --------- 純計算函數 (用於複雜項目) ---------

/**
 * 計算適應力值 - 純計算函數（用於按鈕顯示）
 * @param {Object} values - 包含 panel, gathering_place, adapt_potion, super_adapt 的對象
 * @returns {number} 計算結果
 * 公式: min(panel + gathering_place_buff + adapt_potion_buff, 60) + super_adapt
 * 輸入時允許超過 60，但計算時限制在 60
 */
function calculateAdaptabilityValue(values) {
  let panelValue = parseFloat(values.panel) || 0;
  // 允許輸入超過 60，不在此限制
  
  const gatheringPlace = values.gathering_place ? 2 : 0;  // 集合地 +2
  const adaptPotion = values.adapt_potion ? 3 : 0;        // 適應靈藥 +3
  const superAdapt = parseFloat(values.super_adapt) || 0;
  
  // 計算: min(panel + buff, 60) + super_adapt
  const buffedPanel = Math.min(panelValue + gatheringPlace + adaptPotion, 60);
  return buffedPanel + superAdapt;
}

/**
 * 計算致命一擊傷害值 - 純計算函數（用於按鈕顯示）
 * @param {Object} values - 包含 panel, additive_damages, multiplicative_damages 的對象
 * @returns {number} 計算結果
 * 公式: panel + 150 × (∏[(乘算+100)/100] - 1) + 加算總和
 */
function calculateCriticalDamageValue(values) {
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
  return roundNumber(result);
}

// --------- 查詢函數 (從 DOM 獲取值) ---------

/**
 * 查詢特殊項目的 config 值（適應力、致命一擊傷害等）
 * 從 DOM 中獲取該項目的 config1 和 config2 值
 * @param {number} itemIndex - 項目索引
 * @returns {Object} {config1, config2, itemIndex, itemName}
 */
function getItemConfigValues(itemIndex) {
  const panels = document.querySelectorAll('.input-panel-item');
  
  for (let panel of panels) {
    if (parseInt(panel.dataset.index) === itemIndex) {
      const leftButton = panel.querySelector('.left-input');
      const resultButton = panel.querySelector('.result-input');
      
      if (leftButton) {
        const config1 = computeInputValue(leftButton);
        const config2 = resultButton ? computeInputValue(resultButton) : 0;
        
        return {
          config1,
          config2,
          itemIndex,
          itemName: STAT_NAMES[itemIndex]
        };
      }
    }
  }
  
  return {
    config1: 0,
    config2: 0,
    itemIndex,
    itemName: STAT_NAMES[itemIndex]
  };
}

/**
 * 查詢特殊項目的 config 值（通用 DOM 查詢函數）
 * 支持適應力、致命一擊傷害等複雜項目
 * @param {number} itemIndex - 項目索引
 * @returns {Object} {config1, config2, itemIndex, itemName}
 */
function getDOM(itemIndex) {
  return getItemConfigValues(itemIndex);
}

// --------- 其他統計項目 ---------

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
  const result = getDOM(STAT_ITEMS.ADAPTABILITY);
  const currentValue = button.classList.contains('left-input') ? result.config1 : result.config2;
  
  // 計算乘數: min(100 - debuff + 當前值, 100) / 100
  const multiplierBase = Math.min(100 - presetDebuff + currentValue, 100);
  const multiplier = multiplierBase / 100;
  
  return multiplier === 0 ? 1 : multiplier;
}

/**
 * 計算配置乘積（通用函數）
 * 當值為0或空時以1計算
 * 使用全局快取 allValues，根據目前設定的公式計算乘積
 * 特殊處理: 適應力需要取 debuff 值後計算乘數
 * 
 * @param {string} configType - 'config1' 或 'config2'
 * @returns {number} 計算得到的乘積
 */
function calculateConfigProduct(configType = 'config1') {
  // 使用 UserInputData 而非舊的 allStatValues 快取
  if (!window.UserInputData) {
    return 1;
  }
  
  let product = 1;
  
  // 取得正確的配置物件
  const configData = configType === 'config1' ? window.UserInputData.config1 : window.UserInputData.config2;
  
  // 遍歷所有項目（從 config1 或 config2 中取值）
  for (let itemIndex in configData) {
    itemIndex = parseInt(itemIndex);
    let value = configData[itemIndex];
    
    // 適應力特殊處理：需要計算實際乘數
    if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
      // 確定要查詢的按鈕 ID
      const buttonId = configType === 'config1' 
        ? `#stat-${itemIndex}-left`
        : `#stat-${itemIndex}-result`;
      
      const button = document.querySelector(buttonId);
      if (button && button.dataset.value) {
        const parts = button.dataset.value.split('|');
        const panel = parseInt(parts[0]) || 0;           // panel 值
        const debuff = parts[4] !== undefined ? parseFloat(parts[4].replace('%', '')) : 95;  // preset 值
        
        // 計算乘數：min(100 - debuff + panel, 100) / 100
        const multiplierBase = Math.min(100 - debuff + panel, 100);
        const multiplier = multiplierBase / 100;
        
        value = multiplier === 0 ? 1 : multiplier;
      }
    }
    
    const effectiveValue = (value === 0 || value === null || value === undefined) ? 1 : value;
    product *= effectiveValue;
  }
  
  return roundNumber(product);
}

/**
 * 計算配置1的乘積
 * @returns {number} 配置1乘積
 */
function calculateConfig1Product() {
  return calculateConfigProduct('config1');
}

/**
 * 計算配置2的乘積
 * @returns {number} 配置2乘積
 */
function calculateConfig2Product() {
  return calculateConfigProduct('config2');
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
  
  // 計算產品值
  const config1Product = calculateConfig1Product();
  const config2Product = calculateConfig2Product();
  
  // 計算比值
  const ratioValue = window.ComputeEngine && window.ComputeEngine.calculateRatioValue
    ? window.ComputeEngine.calculateRatioValue(config1Product, config2Product)
    : (function() {
        const maxProduct = Math.max(config1Product, config2Product);
        const minProduct = Math.min(config1Product, config2Product);
        return minProduct === 0 ? '-' : (maxProduct / minProduct).toFixed(7);
      })();
  
  // ✨ 保存到 UserInputData
  if (window.UserInputData) {
    window.UserInputData.setComputedResults(config1Product, config2Product, ratioValue);
  }
  
  // 從 UserInputData 中讀取顯示值
  const displayConfig1 = window.UserInputData ? window.UserInputData.config1Product : config1Product;
  const displayConfig2 = window.UserInputData ? window.UserInputData.config2Product : config2Product;
  const displayRatio = window.UserInputData ? window.UserInputData.ratioValue : ratioValue;
  
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
  config1ProductDiv.textContent = displayConfig1;
  config1ProductDiv.style.fontSize = getAdaptiveFontSize(displayConfig1) + 'px';
  
  // 更新配置2乘積
  const config2Wrapper = configWrappers[1];
  let config2ProductDiv = config2Wrapper.querySelector('.config2-product-value');
  if (!config2ProductDiv) {
    config2ProductDiv = document.createElement('div');
    config2ProductDiv.className = 'config2-product-value';
    config2ProductDiv.style.cssText = 'color: rgba(255, 255, 255, 0.9); text-align: center; margin-bottom: 4px; font-weight: 600;';
    config2Wrapper.appendChild(config2ProductDiv);
  }
  config2ProductDiv.textContent = displayConfig2;
  config2ProductDiv.style.fontSize = getAdaptiveFontSize(displayConfig2) + 'px';
  
  // 根據數值大小決定哪個配置亮起
  const config1Panels = document.querySelectorAll('.config-wrapper:nth-child(2)');
  const config2Panels = document.querySelectorAll('.config-wrapper:nth-child(3)');
  
  if (displayConfig1 > displayConfig2) {
    // 配置1數值較大，亮起配置1
    config1Panels.forEach(panel => panel.classList.add('highlighted'));
    config2Panels.forEach(panel => panel.classList.remove('highlighted'));
  } else if (displayConfig2 > displayConfig1) {
    // 配置2數值較大，亮起配置2
    config1Panels.forEach(panel => panel.classList.remove('highlighted'));
    config2Panels.forEach(panel => panel.classList.add('highlighted'));
  } else {
    // 數值相等，兩個都不亮
    config1Panels.forEach(panel => panel.classList.remove('highlighted'));
    config2Panels.forEach(panel => panel.classList.remove('highlighted'));
  }
  
  // 更新箭頭顯示
  updateArrowDisplay(displayConfig1, displayConfig2);
  
  // 更新比值 (較大值 ÷ 較小值)
  const ratioWrapper = configWrappers[2];
  let ratioDiv = ratioWrapper.querySelector('.config-ratio-value');
  if (!ratioDiv) {
    ratioDiv = document.createElement('div');
    ratioDiv.className = 'config-ratio-value';
    ratioDiv.style.cssText = 'color: rgba(255, 255, 255, 0.9); text-align: center; margin-bottom: 4px; font-weight: 600;';
    ratioWrapper.appendChild(ratioDiv);
  }
  
  if (displayRatio === '-') {
    ratioDiv.textContent = '-';
  } else {
    // 分割小數點後2位(含)之前和之後的部分
    const decimalIndex = displayRatio.indexOf('.');
    const mainPart = displayRatio.substring(0, decimalIndex + 3); // 小數點前 + 小數點 + 2位
    const remainingPart = displayRatio.substring(decimalIndex + 3);
    // 主要部分用亮綠色，剩餘部分保持原色
    ratioDiv.innerHTML = `<span style="color: #00ff00;">${mainPart}</span>${remainingPart}`;
  }
  ratioDiv.style.fontSize = getAdaptiveFontSize(displayRatio) + 'px';
}

// 導出函數供外部使用
window.updateProductDisplay = updateProductDisplay;
window.calculateConfig1Product = calculateConfig1Product;
window.calculateConfig2Product = calculateConfig2Product;
window.calculateAllStatProducts = calculateAllStatProducts;
window.getStatItemValue = getStatItemValue;
window.parseInputValue = parseInputValue;
window.calculateAdaptabilityMultiplier = calculateAdaptabilityMultiplier;
window.calculateAdaptabilityValue = calculateAdaptabilityValue;
window.calculateCriticalDamageValue = calculateCriticalDamageValue;

// 導出各統計項目的計算函數
window.calculatePhysicalMagicAttack = calculatePhysicalMagicAttack;
window.getDOM = getDOM;
window.getItemConfigValues = getItemConfigValues;
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
  
  // Step 4: 分發事件（供測試監聽和擴展）
  // 注：產品顯示更新會在 Step 5 的 syncAllStatValues() 中自動進行
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
  
  // Step 5: 同步所有 stat 值到全局快取（自動觸發 updateProductDisplay()）
  window.allStatValues = syncAllStatValues();
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
  store.initFromDOM(parseInputValue, (itemIndex) => getDOM(itemIndex), STAT_ITEMS);
  
  // 訂閱狀態變化（可用於調試和高級功能）
  store.subscribe((eventType, data) => {
    // console.log(`[StatStore Event] ${eventType}:`, data);
  });
}

/**
 * 集中同步所有 stat 值
 * 從 DOM 中收集所有 stat-N-left 和 stat-N-result 的值
 * 用於快速訪問、狀態快照和調試
 * 同步完成後自動更新產品顯示和比值
 * ✨ 新增：同步至 UserInputData 全局數據結構
 * 
 * @returns {Object} 包含 config1 和 config2 的對象
 *   config1: { 0: value, 1: value, ... }
 *   config2: { 0: value, 1: value, ... }
 */
function syncAllStatValues() {
  const allValues = {
    config1: {},  // stat-N-left 的所有值
    config2: {},  // stat-N-result 的所有值
    timestamp: Date.now()
  };
  
  // 遍歷所有 stat-N-left 元素
  const leftElements = document.querySelectorAll('[id^="stat-"][id$="-left"]');
  leftElements.forEach(element => {
    const match = element.id.match(/stat-(\d+)-left/);
    if (match) {
      const index = parseInt(match[1]);
      const value = computeInputValue(element);
      allValues.config1[index] = value;
      
      // ✨ 同步至 UserInputData
      if (window.UserInputData) {
        window.UserInputData.setConfig1(index, value);
      }
    }
  });
  
  // 遍歷所有 stat-N-result 元素
  const resultElements = document.querySelectorAll('[id^="stat-"][id$="-result"]');
  resultElements.forEach(element => {
    const match = element.id.match(/stat-(\d+)-result/);
    if (match) {
      const index = parseInt(match[1]);
      const value = computeInputValue(element);
      allValues.config2[index] = value;
      
      // ✨ 同步至 UserInputData
      if (window.UserInputData) {
        window.UserInputData.setConfig2(index, value);
      }
    }
  });
  
  // ✨ 新增：同步特殊項目數據到 UserInputData
  syncSpecialItemsToUserData();
  
  // ✨ 根據 UserInputData 更新 UI 顯示
  if (window.syncUIFromUserData && typeof window.syncUIFromUserData === 'function') {
    window.syncUIFromUserData();
  }
  
  // 同步完成後，自動更新產品顯示和比值
  if (window.updateProductDisplay && typeof window.updateProductDisplay === 'function') {
    setTimeout(() => {
      window.updateProductDisplay();
    }, 0);
  }
  
  return allValues;
}

/**
 * ✨ 新增函數：同步特殊項目（致命一擊傷害、適應力）到 UserInputData
 * 從 DOM 中提取這些複雜項目的數據，並更新到全局 UserInputData
 */
function syncSpecialItemsToUserData() {
  if (!window.UserInputData) return;
  
  // 同步致命一擊傷害 (itemIndex = 2)
  const criticalButton = document.querySelector('#stat-2-left');
  if (criticalButton && criticalButton.dataset.value) {
    const parts = criticalButton.dataset.value.split('|');
    const panel = parseFloat(parts[0]) || 0;
    const additive = parts[1] ? parts[1].split(',').map(v => parseFloat(v) || 0) : [];
    const multiplicative = parts[2] ? parts[2].split(',').map(v => parseFloat(v) || 0) : [];
    
    window.UserInputData.setCriticalDamage(panel, additive, multiplicative);
  }
  
  // 同步適應力 (itemIndex = 1)
  const adaptButton = document.querySelector('#stat-1-left');
  if (adaptButton && adaptButton.dataset.value) {
    const parts = adaptButton.dataset.value.split('|');
    const adaptData = {
      panel: parseFloat(parts[0]) || 0,
      gathering_place: parts[1] === '1',
      adapt_potion: parts[2] === '1',
      super_adapt: parseFloat(parts[3]) || 0,
      preset: parts[4] || '95%'
    };
    
    window.UserInputData.setAdaptability(adaptData);
  }
}

/**
 * 獲取特定 stat 項的當前值
 * @param {number} itemIndex - 項目索引 (0-10)
 * @param {string} configType - 'config1' 或 'config2'
 * @returns {number} 該項目的值
 */
function getStatValue(itemIndex, configType = 'config1') {
  const selector = configType === 'config1' 
    ? `#stat-${itemIndex}-left`
    : `#stat-${itemIndex}-result`;
  
  const element = document.querySelector(selector);
  return element ? computeInputValue(element) : 0;
}

/**
 * 根據 UserInputData 更新所有 UI 元素的顯示
 * 確保 input-button 和 inputbox 的顯示值都來自 UserInputData
 */
function syncUIFromUserData() {
  if (!window.UserInputData) return;
  
  // 更新所有 config1 (left) 的按鈕和輸入框
  for (let itemIndex in window.UserInputData.config1) {
    itemIndex = parseInt(itemIndex);
    const value = window.UserInputData.config1[itemIndex];
    const element = document.querySelector(`#stat-${itemIndex}-left`);
    
    if (element) {
      if (element.classList.contains('button-input')) {
        // 按鈕輸入：更新 textContent
        element.textContent = value === 0 ? '' : value;
      } else {
        // 普通輸入框：更新 value
        element.value = value === 0 ? '' : value;
      }
    }
  }
  
  // 更新所有 config2 (result) 的按鈕和輸入框
  for (let itemIndex in window.UserInputData.config2) {
    itemIndex = parseInt(itemIndex);
    const value = window.UserInputData.config2[itemIndex];
    const element = document.querySelector(`#stat-${itemIndex}-result`);
    
    if (element) {
      if (element.classList.contains('button-input')) {
        // 按鈕輸入：更新 textContent
        element.textContent = value === 0 ? '' : value;
      } else {
        // 普通輸入框：更新 value
        element.value = value === 0 ? '' : value;
      }
    }
  }
}

/**
 * 批量獲取多個 stat 項的值
 * @param {Array<number>} indices - 項目索引數組
 * @param {string} configType - 'config1' 或 'config2'
 * @returns {Object} { itemIndex: value, ... }
 */
function getStatValues(indices, configType = 'config1') {
  const result = {};
  indices.forEach(index => {
    result[index] = getStatValue(index, configType);
  });
  return result;
}

/**
 * 驗證 stat 值的完整性
 * 確保所有 11 個項目都有值（即使是 0）
 * 用於調試和數據驗證
 * 
 * @returns {Object} { valid: boolean, missing: Array, stats: Object }
 */
function validateStatValues() {
  const allValues = syncAllStatValues();
  const expectedIndices = Object.keys(STAT_ITEMS).map(key => STAT_ITEMS[key]);
  
  const config1Missing = expectedIndices.filter(idx => !(idx in allValues.config1));
  const config2Missing = expectedIndices.filter(idx => !(idx in allValues.config2));
  
  return {
    valid: config1Missing.length === 0 && config2Missing.length === 0,
    config1Missing,
    config2Missing,
    stats: allValues
  };
}

// 導出新架構的函數供外部使用
window.handleStatInputChange = handleStatInputChange;
window.getStatSnapshot = getStatSnapshot;
window.initializeNewArchitecture = initializeNewArchitecture;
window.syncAllStatValues = syncAllStatValues;
window.syncSpecialItemsToUserData = syncSpecialItemsToUserData;
window.updateUserDataFromElement = updateUserDataFromElement;
window.extractAdaptabilityData = extractAdaptabilityData;
window.extractCriticalDamageData = extractCriticalDamageData;
window.attachStatChangeListeners = attachStatChangeListeners;
window.getStatValue = getStatValue;
window.getStatValues = getStatValues;
window.validateStatValues = validateStatValues;
window.syncUIFromUserData = syncUIFromUserData;

/**
 * ✨ 新增：直接同步單個 stat 項到 UserInputData
 * 當用戶改變任何輸入時，立即更新 UserInputData（不等待 syncAllStatValues）
 * @param {Element} element - 改變的輸入元素
 */
function updateUserDataFromElement(element) {
  if (!window.UserInputData || !element) return;
  
  let index, isConfig1, value;
  
  try {
    // 判斷是 config1 還是 config2
    let match;
    isConfig1 = false;
    
    match = element.id.match(/stat-(\d+)-left/);
    if (match) {
      isConfig1 = true;
    } else {
      match = element.id.match(/stat-(\d+)-result/);
      isConfig1 = false;
    }
    
    if (!match) return;
    
    index = parseInt(match[1]);
    value = computeInputValue(element);
    
    // 直接更新 UserInputData
    if (isConfig1) {
      window.UserInputData.setConfig1(index, value);
      
      // 特殊項目：同步複雜數據
      if (index === 1) {
        // 適應力
        const adaptData = extractAdaptabilityData(element);
        if (adaptData) window.UserInputData.setAdaptability(adaptData);
      } else if (index === 2) {
        // 致命一擊傷害
        const criticalData = extractCriticalDamageData(element);
        if (criticalData) window.UserInputData.setCriticalDamage(criticalData.panel, criticalData.additive, criticalData.multiplicative);
      }
    } else {
      window.UserInputData.setConfig2(index, value);
    }
    
    // ✨ 更新相應的 UI 元素
    const elementId = element.id;
    const updateElement = document.querySelector(`#${elementId}`);
    if (updateElement) {
      if (updateElement.classList.contains('button-input')) {
        updateElement.textContent = value === 0 ? '' : value;
      } else {
        updateElement.value = value === 0 ? '' : value;
      }
    }
  } finally {
    // 輸出變動欄位和變動值
    if (index !== undefined && value !== undefined) {
      console.log(`📝 變動: stat-${index}-${isConfig1 ? 'left' : 'result'} = ${value}`);
    }
    // 輸出完整 DS
    console.log(`📊 總 DS:`, window.UserInputData.getAllData());
  }
}

/**
 * 從適應力按鈕提取數據
 */
function extractAdaptabilityData(element) {
  if (!element || !element.dataset.value) return null;
  
  const parts = element.dataset.value.split('|');
  return {
    panel: parseFloat(parts[0]) || 0,
    gathering_place: parts[1] === '1',
    adapt_potion: parts[2] === '1',
    super_adapt: parseFloat(parts[3]) || 0,
    preset: parts[4] || '95%'
  };
}

/**
 * 從致命一擊傷害按鈕提取數據
 */
function extractCriticalDamageData(element) {
  if (!element || !element.dataset.value) return null;
  
  const parts = element.dataset.value.split('|');
  return {
    panel: parseFloat(parts[0]) || 0,
    additive: parts[1] ? parts[1].split(',').map(v => parseFloat(v) || 0) : [],
    multiplicative: parts[2] ? parts[2].split(',').map(v => parseFloat(v) || 0) : []
  };
}

/**
 * ✨ 新增：全局事件委托監聽
 * 監聽所有 stat-N-left 和 stat-N-result 的變化，自動更新 UserInputData
 * 只監聽 data-value 屬性變化（實際的數據改變）
 */
function attachStatChangeListeners() {
  // ✨ 監聽所有 button-input 的 data-value 屬性變化
  const buttons = document.querySelectorAll('[id^="stat-"][id$="-left"], [id^="stat-"][id$="-result"]');
  buttons.forEach(button => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-value') {
          updateUserDataFromElement(button);
        }
      });
    });
    
    observer.observe(button, { attributes: true, attributeFilter: ['data-value'] });
  });
  
  console.log('✅ 監聽已啟用');
}

// 初始化
function init() {
  // 附加事件監聽器（用戶輸入時直接更新 UserInputData）
  attachStatChangeListeners();
  
  updateProductDisplay();
  // 初始化時同步值到全局快取（不輸出）
  window.allStatValues = syncAllStatValues();
  
  // 初始化 UserInputData 的初始值
  const leftElements = document.querySelectorAll('[id^="stat-"][id$="-left"]');
  leftElements.forEach(element => {
    const match = element.id.match(/stat-(\d+)-left/);
    if (match) {
      const index = parseInt(match[1]);
      const value = computeInputValue(element);
      if (window.UserInputData) {
        window.UserInputData.setConfig1(index, value);
      }
    }
  });
  
  // 初始化特殊項目
  if (window.UserInputData) {
    syncSpecialItemsToUserData();
  }
  
  console.log('✅ 系統已初始化，監聽已啟用');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


