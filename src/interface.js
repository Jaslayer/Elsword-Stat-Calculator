// 計算配置1和配置2的乘積，將結果顯示在最頂列的 header panel
// 新架構：所有計算都在 compute.js，interface.js 只負責 DOM 交互和顯示

// ============================================================================
// 1️⃣ 【主入口 & 初始化】- 核心流程
// ============================================================================

/**
 * 統一入口：任何改變（用戶輸入或初始化）後的完整同步流程
 * @param {Element} element - 改變的輸入元素（可選，null 時用於初始化）
 */
function syncInputToDisplay(element = null) {
  if (!window.StatStore || !window.ComputeEngine) {
    console.warn('syncInputToDisplay: 缺少必要的依賴');
    return;
  }
  
  // 如果有具體元素：更新單個 StatStore 值
  if (element) {
    const value = computeInputValue(element);
    
    let match = element.id.match(/stat-(\d+)-left/);
    const isConfig1 = !!match;
    if (!match) {
      match = element.id.match(/stat-(\d+)-result/);
    }
    
    if (!match) {
      console.warn('syncInputToDisplay: 無法識別輸入元素');
      return;
    }
    
    const index = parseInt(match[1]);
    if (isConfig1) {
      window.StatStore.setConfig1Value(index, value);
    } else {
      window.StatStore.setConfig2Value(index, value);
    }
  }
  // 如果沒有元素：從 DOM 讀取所有初始值
  else {
    _syncElementsToStore('[id^="stat-"][id$="-left"]', /stat-(\d+)-left/, 
      (idx, val) => window.StatStore.setConfig1Value(idx, val));
    _syncElementsToStore('[id^="stat-"][id$="-result"]', /stat-(\d+)-result/, 
      (idx, val) => window.StatStore.setConfig2Value(idx, val));
  }
  
  // 共同的計算和顯示流程
  _updateAllDisplays();
}

/**
 * 初始化
 */
function init() {
  if (!window.StatStore || !window.ComputeEngine) {
    console.warn('StatStore or ComputeEngine not loaded');
    return;
  }
  
  // 從 localStorage 恢復所有 StatStore 的狀態
  // 包括 config1/config2 值、計算結果、enabledItems 等
  const restored = window.StatStore.loadFromStorage();
  
  // 如果成功恢復了狀態，直接更新顯示；
  // 否則從 DOM 初始化
  if (restored) {
    // 只更新顯示，不覆蓋已恢復的值
    _updateAllDisplays();
  } else {
    // 沒有保存的狀態，從 DOM 初始化
    syncInputToDisplay(null);
  }
  
  console.log('✅ interface.js 已初始化完成');
}

// ============================================================================
// 2️⃣ 【內部協調】- 流程控制
// ============================================================================

/**
 * 內部函數：計算所有派生值並更新所有顯示
 * 共用於 syncInputToDisplay 和 syncDOMToDisplay
 * @private
 */
function _updateAllDisplays() {
  // Step 1: 計算所有派生值
  const syncResult = window.ComputeEngine.normalSync(window.StatStore, window.STAT_ITEMS);
  
  // Step 2: 依序更新所有顯示
  updateButtonDisplays();
  updateDeltaDisplays(syncResult);
  updateProductDisplay();
}

// ============================================================================
// 3️⃣ 【顯示更新】- DOM 操作
// ============================================================================

/**
 * 更新所有 button-input 的顯示內容（從 DS 取值）
 */
function updateButtonDisplays() {
  if (!window.StatStore) return;
  
  // 更新所有 config1 按鈕
  const leftButtons = document.querySelectorAll('[id^="stat-"][id$="-left"].button-input');
  leftButtons.forEach(button => {
    const match = button.id.match(/stat-(\d+)-left/);
    if (match) {
      const index = parseInt(match[1]);
      const value = window.StatStore.getConfig1Value(index);
      button.textContent = value === 0 ? '' : value;
    }
  });
  
  // 更新所有 config2 按鈕
  const resultButtons = document.querySelectorAll('[id^="stat-"][id$="-result"].button-input');
  resultButtons.forEach(button => {
    const match = button.id.match(/stat-(\d+)-result/);
    if (match) {
      const index = parseInt(match[1]);
      const value = window.StatStore.getConfig2Value(index);
      button.textContent = value === 0 ? '' : value;
    }
  });
}

/**
 * 更新所有項目的變動量顯示（從 normalSync 計算結果）
 */
function updateDeltaDisplays(syncResult) {
  if (!syncResult || !syncResult.itemDeltas) return;
  
  const { itemDeltas } = syncResult;
  
  // 更新每個 panel 中的 middle-input（變動量）
  Object.entries(itemDeltas).forEach(([index, delta]) => {
    const middleInput = document.querySelector(`#stat-${index}-middle`);
    if (middleInput) {
      middleInput.value = delta === 0 ? '' : delta;
    }
  });
}

/**
 * 更新 header 中的乘積顯示
 * 直接調用 ComputeEngine.normalSync() 計算所有派生值，只負責顯示
 */
function updateProductDisplay() {
  const panels = document.querySelectorAll('.input-panel-item');
  if (panels.length === 0) return;
  
  const headerPanel = document.querySelector('.input-panel-header');
  if (!headerPanel) return;
  
  // 一次性計算所有派生值
  let syncResult;
  if (window.ComputeEngine && window.StatStore) {
    syncResult = window.ComputeEngine.normalSync(window.StatStore, window.STAT_ITEMS);
  } else {
    // 備用方案
    syncResult = {
      config1Product: 1,
      config2Product: 1,
      ratioValue: '-',
      comparison: 'equal'
    };
  }
  
  const { config1Product: displayConfig1, config2Product: displayConfig2, ratioValue: displayRatio, comparison } = syncResult;
  
  const configWrappers = headerPanel.querySelectorAll('.config-wrapper');
  if (configWrappers.length < 2) return;
  
  // 保存計算結果回 StatStore
  if (window.StatStore) {
    window.StatStore.setComputedResults(displayConfig1, displayConfig2, displayRatio);
    // 保存所有狀態到 localStorage
    window.StatStore.saveToStorage();
  }

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
  config1ProductDiv.style.fontSize = window.ComputeEngine?.getAdaptiveFontSize(displayConfig1) + 'px' || '30px';
  
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
  config2ProductDiv.style.fontSize = window.ComputeEngine?.getAdaptiveFontSize(displayConfig2) + 'px' || '30px';
  
  // 根據數值大小決定哪個配置亮起
  const config1Panels = document.querySelectorAll('.config-wrapper:nth-child(2)');
  const config2Panels = document.querySelectorAll('.config-wrapper:nth-child(3)');
  
  if (comparison === 'greater') {
    // 配置1數值較大，亮起配置1
    config1Panels.forEach(panel => panel.classList.add('highlighted'));
    config2Panels.forEach(panel => panel.classList.remove('highlighted'));
  } else if (comparison === 'less') {
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
  ratioDiv.style.fontSize = window.ComputeEngine?.getAdaptiveFontSize(displayRatio) + 'px' || '30px';
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

// ============================================================================
// 4️⃣ 【輔助函數】- 公開幫手
// ============================================================================

/**
 * 計算輸入值（解析 + 複雜計算）
 * 支持適應力和致命一擊傷害的 "panel|..." 格式
 * 負責 DOM 訪問，計算邏輯委托給 ComputeEngine
 * @param {Element} input - 輸入元素
 * @returns {number} 計算後的最終數值
 */
function computeInputValue(input) {
  if (!input) return 0;
  
  let valueString = '';
  let itemIndex = -1;
  
  // 提取 DOM 中的值和項目索引
  if (input.classList.contains('button-input')) {
    valueString = input.dataset.value || '0';
    const panelItem = input.closest('.input-panel-item');
    itemIndex = panelItem ? parseInt(panelItem.dataset.index) : -1;
  } else {
    valueString = input.value || '0';
  }
  
  // 委托给 ComputeEngine 進行解析和計算
  return window.ComputeEngine && window.ComputeEngine.parseInputValueByString
    ? window.ComputeEngine.parseInputValueByString(valueString, itemIndex)
    : 0;
}

// ============================================================================
// 5️⃣ 【私有函數】- 內部工具
// ============================================================================

/**
 * 內部輔助：批量同步 DOM 元素值到 StatStore
 * @private
 */
function _syncElementsToStore(selector, idPattern, setterFn) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    const match = el.id.match(idPattern);
    if (match) {
      const index = parseInt(match[1]);
      const value = computeInputValue(el);
      setterFn(index, value);
    }
  });
}

// ============================================================================
// 6️⃣ 【廢棄別名】- 向後相容
// ============================================================================

/**
 * 初始化時的同步（已廢棄，使用 syncInputToDisplay() 替代）
 * @deprecated 使用 syncInputToDisplay() 代替
 */
function syncDOMToDisplay() {
  syncInputToDisplay(null);
}

/**
 * 同步單個輸入元素的值到 StatStore （已廢棄，使用 syncInputToDisplay 替代）
 * @param {Element} element - 改變的輸入元素
 * @deprecated 使用 syncInputToDisplay(element) 代替
 */
function updateUserDataFromElement(element) {
  syncInputToDisplay(element);
}

// ============================================================================
// 7️⃣ 【導出】- 全局暴露
// ============================================================================

window.syncInputToDisplay = syncInputToDisplay;
window.syncDOMToDisplay = syncDOMToDisplay;
window.updateProductDisplay = updateProductDisplay;
window.updateUserDataFromElement = updateUserDataFromElement;
window.updateButtonDisplays = updateButtonDisplays;
window.updateDeltaDisplays = updateDeltaDisplays;
window.computeInputValue = computeInputValue;

// ============================================================================
// 8️⃣ 【頁面初始化】
// ============================================================================

// 頁面加載後初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
