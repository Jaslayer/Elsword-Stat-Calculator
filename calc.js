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
 * 獲取所有顯示的 input-panel 的配置1值
 */
function getConfig1Values() {
  const panels = document.querySelectorAll('.input-panel-item');
  const values = [];
  panels.forEach(panel => {
    const leftInput = panel.querySelector('.left-input');
    if (leftInput) {
      const itemIndex = parseInt(panel.dataset.index);
      // 特殊項目使用對應的計算函數
      if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
        // 使用適應力的特殊計算邏輯
        const result = calculateAdaptability();
        values.push(result.config1);
      } else {
        // 其他項目使用普通解析
        values.push(parseInputValue(leftInput));
      }
    }
  });
  return values;
}

/**
 * 獲取所有顯示的 input-panel 的配置2值
 */
function getConfig2Values() {
  const panels = document.querySelectorAll('.input-panel-item');
  const values = [];
  panels.forEach(panel => {
    const resultInput = panel.querySelector('.result-input');
    if (resultInput) {
      const itemIndex = parseInt(panel.dataset.index);
      // 特殊項目使用對應的計算函數
      if (itemIndex === STAT_ITEMS.ADAPTABILITY) {
        // 使用適應力的特殊計算邏輯
        const result = calculateAdaptability();
        values.push(result.config2);
      } else {
        // 其他項目使用普通解析
        values.push(parseInputValue(resultInput));
      }
    }
  });
  return values;
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
 */
function calculateAdaptabilityValue(values) {
  const panelValue = parseFloat(values.panel) || 0;
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
        
        const panelValue = parseFloat(parts[0]) || 0;
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
          
          const resultPanelValue = parseFloat(resultParts[0]) || 0;
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
 * 計算配置1的乘積，當值為0或空時以1計算
 */
function calculateConfig1Product() {
  const values = getConfig1Values();
  if (values.length === 0) return 1;
  const product = values.reduce((acc, val) => {
    const effectiveValue = (val === 0 || val === null || val === undefined) ? 1 : val;
    return acc * effectiveValue;
  }, 1);
  return roundNumber(product);
}

/**
 * 計算配置2的乘積，當值為0或空時以1計算
 */
function calculateConfig2Product() {
  const values = getConfig2Values();
  if (values.length === 0) return 1;
  const product = values.reduce((acc, val) => {
    const effectiveValue = (val === 0 || val === null || val === undefined) ? 1 : val;
    return acc * effectiveValue;
  }, 1);
  return roundNumber(product);
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
}

// 導出函數供外部使用
window.updateProductDisplay = updateProductDisplay;
window.calculateConfig1Product = calculateConfig1Product;
window.calculateConfig2Product = calculateConfig2Product;
window.calculateAllStatProducts = calculateAllStatProducts;
window.getStatItemValue = getStatItemValue;
window.parseInputValue = parseInputValue;

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

// 初始化
function init() {
  updateProductDisplay();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


