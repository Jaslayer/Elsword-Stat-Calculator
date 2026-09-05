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
    const config = parseInt(element.dataset.config);  // "1" 或 "2"
    const index = parseInt(element.dataset.index);
    
    if (!config || !index && index !== 0) {
      console.warn('syncInputToDisplay: 無法識別輸入元素 (缺少 data-config 或 data-index)');
      return;
    }
    
    // 特殊處理複雜項目（stat-1 適應力，stat-2 致命一擊傷害，stat-4 Boss 傷害）
    switch (index) {
      case window.STAT_ITEMS.ADAPTABILITY:
      case window.STAT_ITEMS.CRITICAL_DAMAGE:
      case window.STAT_ITEMS.BOSS_DAMAGE:
        // 複雜項目：從 button.dataset.value 解析並同步到 StatStore
        try {
          const data = JSON.parse(element.dataset.value || '{}');
          let calculatedValue = 0;
          
          switch (index) {
            case window.STAT_ITEMS.ADAPTABILITY:
              // 適應力：根據 config 分別同步到對應的 store
              window.StatStore.setAdaptability(data, config);
              calculatedValue = window.ComputeEngine?.calculateAdaptabilityValue?.(data) ?? data.panel ?? 0;
              
              // 💡 検測是否只有 preset（環境debuff）字段變化
              if (element.dataset.fieldChanged === 'preset') {
                // 同步 preset 值到另一個 config 的適應力
                _syncAdaptabilityPreset(config, data.preset);
                console.log(`✅ 適應力 preset 同步: config${config} 的 preset 已同步到 config${config === 1 ? 2 : 1}`);
              }
              break;
            case window.STAT_ITEMS.CRITICAL_DAMAGE:
              // 致命一擊傷害：根據 config 分別同步到對應的 store
              window.StatStore.setCriticalDamage(data, config);
              calculatedValue = window.ComputeEngine?.calculateCriticalDamageValue?.(data) ?? data.panel ?? 0;
              break;
            case window.STAT_ITEMS.BOSS_DAMAGE:
              // Boss 傷害：根據 config 分別同步到對應的 store
              window.StatStore.setBossDamage(data, config);
              calculatedValue = window.ComputeEngine?.calculateBossDamageValue?.(data) ?? data.value ?? 0;
              break;
          }
          
          // 💡 關鍵修復：同時更新 config values Maps，使乘積計算能讀到值
          if (config === 1) {
            window.StatStore.setConfig1Value(index, calculatedValue);
          } else if (config === 2) {
            window.StatStore.setConfig2Value(index, calculatedValue);
          }
        } catch (e) {
          console.warn(`Failed to parse complex item ${index}:`, e);
        }
        break;
      default:
        // 簡單項目：通過 computeInputValue 讀取數字值
        const value = computeInputValue(element);
        if (config === 1) {
          window.StatStore.setConfig1Value(index, value);
        } else if (config === 2) {
          window.StatStore.setConfig2Value(index, value);
        }
        break;
    }
  }
  // 如果沒有元素：從 DOM 讀取所有初始值
  else {
    // 使用 data-config 屬性直接識別 config1 和 config2
    const config1Elements = document.querySelectorAll('[data-config="1"]');
    const config2Elements = document.querySelectorAll('[data-config="2"]');
    
    config1Elements.forEach(el => {
      const index = parseInt(el.dataset.index);
      switch (index) {
        case window.STAT_ITEMS.ADAPTABILITY:
        case window.STAT_ITEMS.CRITICAL_DAMAGE:
        case window.STAT_ITEMS.BOSS_DAMAGE:
          // 複雜項目：從 dataset.value 解析並計算
          try {
            const data = JSON.parse(el.dataset.value || '{}');
            let calculatedValue = 0;
            
            switch (index) {
              case window.STAT_ITEMS.ADAPTABILITY:
                window.StatStore.setAdaptability(data, 1);
                calculatedValue = window.ComputeEngine?.calculateAdaptabilityValue?.(data) ?? data.panel ?? 0;
                break;
              case window.STAT_ITEMS.CRITICAL_DAMAGE:
                window.StatStore.setCriticalDamage(data, 1);
                calculatedValue = window.ComputeEngine?.calculateCriticalDamageValue?.(data) ?? data.panel ?? 0;
                break;
              case window.STAT_ITEMS.BOSS_DAMAGE:
                window.StatStore.setBossDamage(data, 1);
                calculatedValue = window.ComputeEngine?.calculateBossDamageValue?.(data) ?? data.value ?? 0;
                break;
            }
            window.StatStore.setConfig1Value(index, calculatedValue);
          } catch (e) {
            console.warn(`Failed to parse complex item ${index}:`, e);
          }
          break;
        default:
          // 簡單項目
          const value = computeInputValue(el);
          window.StatStore.setConfig1Value(index, value);
          break;
      }
    });
    
    config2Elements.forEach(el => {
      const index = parseInt(el.dataset.index);
      switch (index) {
        case window.STAT_ITEMS.ADAPTABILITY:
        case window.STAT_ITEMS.CRITICAL_DAMAGE:
        case window.STAT_ITEMS.BOSS_DAMAGE:
          // 複雜項目：從 dataset.value 解析並計算
          try {
            const data = JSON.parse(el.dataset.value || '{}');
            let calculatedValue = 0;
            
            switch (index) {
              case window.STAT_ITEMS.ADAPTABILITY:
                window.StatStore.setAdaptability(data, 2);
                calculatedValue = window.ComputeEngine?.calculateAdaptabilityValue?.(data) ?? data.panel ?? 0;
                break;
              case window.STAT_ITEMS.CRITICAL_DAMAGE:
                window.StatStore.setCriticalDamage(data, 2);
                calculatedValue = window.ComputeEngine?.calculateCriticalDamageValue?.(data) ?? data.panel ?? 0;
                break;
              case window.STAT_ITEMS.BOSS_DAMAGE:
                window.StatStore.setBossDamage(data, 2);
                calculatedValue = window.ComputeEngine?.calculateBossDamageValue?.(data) ?? data.value ?? 0;
                break;
            }
            window.StatStore.setConfig2Value(index, calculatedValue);
          } catch (e) {
            console.warn(`Failed to parse complex item ${index}:`, e);
          }
          break;
        default:
          // 簡單項目
          const value = computeInputValue(el);
          window.StatStore.setConfig2Value(index, value);
          break;
      }
    });
  }
  
  // 共同的計算和顯示流程
  _updateAllDisplays();
}

/**
 * 內部函數：同步適應力的 preset（環境debuff）到另一個 config
 * 當 preset 字段變化時，自動將該值同步到另一個 config 的適應力
 * @private
 * @param {number} sourceConfig - 源 config 號 (1 或 2)
 * @param {string} presetValue - preset 值 ('0', '50', '90', '95')
 */
function _syncAdaptabilityPreset(sourceConfig, presetValue) {
  // 確定目標按鈕（另一個 config）
  // config1 (stat-1-config1) <-> config2 (stat-1-config2)
  const targetButton = sourceConfig === 1 
    ? document.getElementById('stat-1-config2')
    : document.getElementById('stat-1-config1');
  
  if (!targetButton) {
    console.warn(`_syncAdaptabilityPreset: 找不到目標按鈕 (config${sourceConfig === 1 ? 2 : 1})`);
    return;
  }
  
  try {
    // 解析目標 button 的當前數據
    const targetData = JSON.parse(targetButton.dataset.value || '{}');
    
    // 更新 preset 值
    targetData.preset = presetValue;
    
    // 重新序列化並保存回 dataset
    targetButton.dataset.value = JSON.stringify(targetData);
    
    // 保存前一個 preset 值（防止再次觸發同步）
    targetButton.dataset.previousPreset = presetValue;
    
    // 清除 fieldChanged 標記（防止遞迴同步）
    delete targetButton.dataset.fieldChanged;
    
    console.log(`✅ preset 已同步到 config${sourceConfig === 1 ? 2 : 1}: ${presetValue}`);
  } catch (e) {
    console.warn(`Failed to sync adaptability preset:`, e);
  }
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
  
  // 如果成功恢復了狀態，先恢復 DOM 元素值，再計算並顯示；
  // 否則從 DOM 初始化
  if (restored) {
    // Step 1: 將恢復的 StatStore 數據同步回 DOM 元素
    _restoreDOMFromStore();
    
    // Step 2: 計算和顯示結果
    _updateAllDisplays();
  } else {
    // 沒有保存的狀態，從 DOM 初始化
    syncInputToDisplay(null);
  }
  
  console.log('✅ interface.js 已初始化完成 (重整後數據已恢復到 ds → 計算 → 顯示)');
  
}

// ============================================================================
// 2️⃣ 【內部協調】- 流程控制
// ============================================================================

/**
 * 內部函數：將恢復的 StatStore 數據同步回所有 DOM 元素
 * 這確保頁面重整後，DOM 顯示與 StatStore 保存的數據完全一致
 * @private
 */
function _restoreDOMFromStore() {
  if (!window.StatStore) return;
  
  // 恢復 config1（左配置）值到 DOM 元素
  document.querySelectorAll('[data-config="1"]').forEach(element => {
    const index = parseInt(element.dataset.index);
    if (index || index === 0) {
      const value = window.StatStore.getConfig1Value(index);
      
      if (element.classList.contains('button-input')) {
        // 按鈕類型：使用 JSON 格式存儲 { value: ... }
        element.dataset.value = JSON.stringify({ value: value });
        element.textContent = value === 0 ? '' : value;
      } else {
        // 輸入框類型：更新 value 屬性
        element.value = value === 0 ? '' : value;
      }
    }
  });
  
  // 恢復 config2（右配置）值到 DOM 元素
  document.querySelectorAll('[data-config="2"]').forEach(element => {
    const index = parseInt(element.dataset.index);
    if (index || index === 0) {
      const value = window.StatStore.getConfig2Value(index);
      
      if (element.classList.contains('button-input')) {
        // 按鈕類型：使用 JSON 格式存儲 { value: ... }
        element.dataset.value = JSON.stringify({ value: value });
        element.textContent = value === 0 ? '' : value;
      } else {
        // 輸入框類型：更新 value 屬性
        element.value = value === 0 ? '' : value;
      }
    }
  });
  
  // 恢復特殊項目數據（致命一擊傷害、適應力）
  // 這個函數會處理複雜序列化格式（JSON 對象而不是簡單數字）
  _restoreSpecialItemsToDOM();
  
  console.log('✅ DOM 元素已從 StatStore 恢復');
}

/**
 * 內部函數：恢復特殊項目數據到 DOM（致命一擊傷害、適應力）
 * @private
 */
function _restoreSpecialItemsToDOM() {
  if (!window.StatStore) return;
  
  const store = window.StatStore;
  
  console.log('🔍 _restoreSpecialItemsToDOM 開始');
  console.log('   store.criticalDamageConfig1:', store.criticalDamageConfig1);
  console.log('   store.criticalDamageConfig2:', store.criticalDamageConfig2);
  console.log('   store.adaptabilityConfig1:', store.adaptabilityConfig1);
  console.log('   store.adaptabilityConfig2:', store.adaptabilityConfig2);
  
  // 恢復複雜項目到按鈕的 dataset.value 中
  // 注意：button.dataset.value 是獨立的，左右按鈕各自維護
  
  // 恢復致命一擊傷害（config1）
  if (store.criticalDamageConfig1 && Object.keys(store.criticalDamageConfig1).length > 0) {
    const criticalDamageConfig1 = document.getElementById('stat-2-config1');
    if (criticalDamageConfig1) {
      const serialized = serializeCriticalDamage(store.criticalDamageConfig1);
      if (criticalDamageConfig1.classList.contains('button-input')) {
        criticalDamageConfig1.dataset.value = serialized;
        const displayValue = store.criticalDamageConfig1.panel || 0;
        criticalDamageConfig1.textContent = displayValue === 0 ? '' : displayValue;
      } else {
        criticalDamageConfig1.value = serialized;
      }
    }
  }
  
  // 恢復致命一擊傷害（config2）
  if (store.criticalDamageConfig2 && Object.keys(store.criticalDamageConfig2).length > 0) {
    const criticalDamageConfig2 = document.getElementById('stat-2-config2');
    if (criticalDamageConfig2) {
      const resultValue = window.ComputeEngine?.calculateCriticalDamageValue 
        ? window.ComputeEngine.calculateCriticalDamageValue(store.criticalDamageConfig2)
        : store.criticalDamageConfig2.panel;
      
      if (criticalDamageConfig2.classList.contains('button-input')) {
        criticalDamageConfig2.dataset.value = serializeCriticalDamage(store.criticalDamageConfig2);
        criticalDamageConfig2.textContent = resultValue === 0 ? '' : resultValue;
      } else {
        criticalDamageConfig2.value = resultValue === 0 ? '' : resultValue;
      }
    }
  }
  
  // 恢復適應力（config1）
  if (store.adaptabilityConfig1 && Object.keys(store.adaptabilityConfig1).length > 0) {
    const adaptabilityConfig1 = document.getElementById('stat-1-config1');
    if (adaptabilityConfig1) {
      const serialized = serializeAdaptability(store.adaptabilityConfig1);
      if (adaptabilityConfig1.classList.contains('button-input')) {
        adaptabilityConfig1.dataset.value = serialized;
        const displayValue = store.adaptabilityConfig1.panel || 0;
        adaptabilityConfig1.textContent = displayValue === 0 ? '' : displayValue;
      } else {
        adaptabilityConfig1.value = serialized;
      }
    }
  }
  
  // 恢復適應力（config2）
  if (store.adaptabilityConfig2 && Object.keys(store.adaptabilityConfig2).length > 0) {
    const adaptabilityConfig2 = document.getElementById('stat-1-config2');
    if (adaptabilityConfig2) {
      const resultValue = window.ComputeEngine?.calculateAdaptabilityValue 
        ? window.ComputeEngine.calculateAdaptabilityValue(store.adaptabilityConfig2)
        : store.adaptabilityConfig2.panel;
      
      if (adaptabilityConfig2.classList.contains('button-input')) {
        adaptabilityConfig2.dataset.value = serializeAdaptability(store.adaptabilityConfig2);
        adaptabilityConfig2.textContent = resultValue === 0 ? '' : resultValue;
      } else {
        adaptabilityConfig2.value = resultValue === 0 ? '' : resultValue;
      }
    }
  }
  
  // 恢復 Boss 傷害（config1）
  if (store.bossDamageConfig1 && Object.keys(store.bossDamageConfig1).length > 0) {
    const bossDamageConfig1 = document.getElementById('stat-4-config1');
    if (bossDamageConfig1) {
      const serialized = serializeBossDamage(store.bossDamageConfig1);
      if (bossDamageConfig1.classList.contains('button-input')) {
        bossDamageConfig1.dataset.value = serialized;
        const displayValue = store.bossDamageConfig1.value || 0;
        bossDamageConfig1.textContent = displayValue === 0 ? '' : displayValue;
      } else {
        bossDamageConfig1.value = serialized;
      }
    }
  }
  
  // 恢復 Boss 傷害（config2）
  if (store.bossDamageConfig2 && Object.keys(store.bossDamageConfig2).length > 0) {
    const bossDamageConfig2 = document.getElementById('stat-4-config2');
    if (bossDamageConfig2) {
      const resultValue = window.ComputeEngine?.calculateBossDamageValue 
        ? window.ComputeEngine.calculateBossDamageValue(store.bossDamageConfig2)
        : store.bossDamageConfig2.value;
      
      if (bossDamageConfig2.classList.contains('button-input')) {
        bossDamageConfig2.dataset.value = serializeBossDamage(store.bossDamageConfig2);
        bossDamageConfig2.textContent = resultValue === 0 ? '' : resultValue;
      } else {
        bossDamageConfig2.value = resultValue === 0 ? '' : resultValue;
      }
    }
  }
  
  console.log('✅ _restoreSpecialItemsToDOM 完成');
}

/**
 * 序列化致命一擊傷害數據為 JSON 字符串
 * @private
 */
function serializeCriticalDamage(damageData) {
  return JSON.stringify({
    panel: damageData.panel || 0,
    additive_damages: damageData.additive_damages || [],
    multiplicative_damages: damageData.multiplicative_damages || []
  });
}

/**
 * 序列化適應力數據為 JSON 字符串
 * @private
 */
function serializeAdaptability(adaptData) {
  return JSON.stringify({
    panel: adaptData.panel || 0,
    gathering_place: adaptData.gathering_place || false,
    adapt_potion: adaptData.adapt_potion || false,
    super_adapt: adaptData.super_adapt || 0,
    preset: adaptData.preset || '95'
  });
}

/**
 * 序列化 Boss 傷害數據為 JSON 字符串
 * @private
 */
function serializeBossDamage(bossDamageData) {
  return JSON.stringify({
    value: bossDamageData.value || 0,
    guild_skill: bossDamageData.guild_skill || false
  });
}

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
  const leftButtons = document.querySelectorAll('.button-input[data-config="1"]');
  leftButtons.forEach(button => {
    const index = parseInt(button.dataset.index);
    if (index || index === 0) {
      let value;
      
      // 特殊處理複雜項目
      switch (index) {
        case window.STAT_ITEMS.ADAPTABILITY:
        case window.STAT_ITEMS.CRITICAL_DAMAGE:
        case window.STAT_ITEMS.BOSS_DAMAGE:
          // 適應力、致命一擊傷害、Boss傷害：從 button.dataset.value 解析並計算結果值
          try {
            const data = JSON.parse(button.dataset.value || '{}');
            switch (index) {
              case window.STAT_ITEMS.ADAPTABILITY:
                // 適應力：計算結果值
                value = window.ComputeEngine?.calculateAdaptabilityValue?.(data) ?? data.panel ?? 0;
                break;
              case window.STAT_ITEMS.CRITICAL_DAMAGE:
                // 致命一擊傷害：計算結果值
                value = window.ComputeEngine?.calculateCriticalDamageValue?.(data) ?? data.panel ?? 0;
                break;
              case window.STAT_ITEMS.BOSS_DAMAGE:
                // Boss傷害：計算結果值
                value = window.ComputeEngine?.calculateBossDamageValue?.(data) ?? data.value ?? 0;
                break;
            }
          } catch (e) {
            value = 0;
          }
          break;
        default:
          // 簡單項目：從 config1Values 獲取
          value = window.StatStore.getConfig1Value(index);
          break;
      }
      
      button.textContent = value === 0 ? '' : value;
    }
  });
  
  // 更新所有 config2 按鈕
  const resultButtons = document.querySelectorAll('.button-input[data-config="2"]');
  resultButtons.forEach(button => {
    const index = parseInt(button.dataset.index);
    if (index || index === 0) {
      let value;
      
      // 特殊處理複雜項目
      switch (index) {
        case window.STAT_ITEMS.ADAPTABILITY:
          // 適應力：從按鈕的 dataset.value 解析並計算結果
          try {
            const data = JSON.parse(button.dataset.value || '{}');
            value = window.ComputeEngine?.calculateAdaptabilityValue?.(data) ?? data.panel ?? 0;
          } catch (e) {
            value = 0;
          }
          break;
        case window.STAT_ITEMS.CRITICAL_DAMAGE:
          // 致命一擊傷害：從按鈕的 dataset.value 解析並計算結果
          try {
            const data = JSON.parse(button.dataset.value || '{}');
            value = window.ComputeEngine?.calculateCriticalDamageValue?.(data) ?? data.panel ?? 0;
          } catch (e) {
            value = 0;
          }
          break;
        case window.STAT_ITEMS.BOSS_DAMAGE:
          // Boss傷害：從按鈕的 dataset.value 解析並計算結果
          try {
            const data = JSON.parse(button.dataset.value || '{}');
            value = window.ComputeEngine?.calculateBossDamageValue?.(data) ?? data.value ?? 0;
          } catch (e) {
            value = 0;
          }
          break;
        default:
          // 簡單項目：從 config2Values 獲取
          value = window.StatStore.getConfig2Value(index);
          break;
      }
      
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
      
      // 🎯 同時更新 middle-indicator（上下箭頭）的樣式
      const configWrapper = middleInput.closest('.config-wrapper');
      if (configWrapper) {
        const middleIndicator = configWrapper.querySelector('.middle-indicator');
        if (middleIndicator) {
          // 移除舊的類
          middleIndicator.classList.remove('positive', 'negative', 'zero');
          
          // 根據 delta 值設置新的類
          if (delta > 0) {
            middleIndicator.classList.add('positive'); // 紅色向上 ▲
          } else if (delta < 0) {
            middleIndicator.classList.add('negative'); // 青色向下 ▼
          } else {
            middleIndicator.classList.add('zero'); // 灰色點 •
          }
        }
      }
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
  if (config1ProductDiv) {
    config1ProductDiv.textContent = displayConfig1;
    config1ProductDiv.style.fontSize = window.ComputeEngine?.getAdaptiveFontSize(displayConfig1) + 'px' || '30px';
  }
  
  // 更新配置2乘積
  const config2Wrapper = configWrappers[1];
  let config2ProductDiv = config2Wrapper.querySelector('.config2-product-value');
  if (config2ProductDiv) {
    config2ProductDiv.textContent = displayConfig2;
    config2ProductDiv.style.fontSize = window.ComputeEngine?.getAdaptiveFontSize(displayConfig2) + 'px' || '30px';
  }
  
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

/**
 * 內部輔助：同步複雜項目（適應力、致命一擊傷害）到 StatStore
 * @private
 */
function _syncComplexItemsToStore() {
  // 同步適應力 (stat-1-config1, config1)
  const adaptabilityConfig1 = document.getElementById('stat-1-config1');
  if (adaptabilityConfig1 && adaptabilityConfig1.dataset.value) {
    try {
      const data = JSON.parse(adaptabilityConfig1.dataset.value);
      window.StatStore.setAdaptability(data, 1);
    } catch (e) {
      console.warn('Failed to sync adaptability from stat-1-config1:', e);
    }
  }
  
  // 同步適應力 (stat-1-config2, config2)
  const adaptabilityConfig2 = document.getElementById('stat-1-config2');
  if (adaptabilityConfig2 && adaptabilityConfig2.dataset.value) {
    try {
      const data = JSON.parse(adaptabilityConfig2.dataset.value);
      window.StatStore.setAdaptability(data, 2);
    } catch (e) {
      console.warn('Failed to sync adaptability from stat-1-config2:', e);
    }
  }
  
  // 同步致命一擊傷害 (stat-2-config1, config1)
  const criticalDamageConfig1 = document.getElementById('stat-2-config1');
  if (criticalDamageConfig1 && criticalDamageConfig1.dataset.value) {
    try {
      const data = JSON.parse(criticalDamageConfig1.dataset.value);
      window.StatStore.setCriticalDamage(data, 1);
    } catch (e) {
      console.warn('Failed to sync critical damage from stat-2-config1:', e);
    }
  }
  
  // 同步致命一擊傷害 (stat-2-config2, config2)
  const criticalDamageConfig2 = document.getElementById('stat-2-config2');
  if (criticalDamageConfig2 && criticalDamageConfig2.dataset.value) {
    try {
      const data = JSON.parse(criticalDamageConfig2.dataset.value);
      window.StatStore.setCriticalDamage(data, 2);
    } catch (e) {
      console.warn('Failed to sync critical damage from stat-2-config2:', e);
    }
  }
  
  // 同步 Boss 傷害 (stat-4-config1, config1)
  const bossDamageConfig1 = document.getElementById('stat-4-config1');
  if (bossDamageConfig1 && bossDamageConfig1.dataset.value) {
    try {
      const data = JSON.parse(bossDamageConfig1.dataset.value);
      window.StatStore.setBossDamage(data, 1);
    } catch (e) {
      console.warn('Failed to sync boss damage from stat-4-config1:', e);
    }
  }
  
  // 同步 Boss 傷害 (stat-4-config2, config2)
  const bossDamageConfig2 = document.getElementById('stat-4-config2');
  if (bossDamageConfig2 && bossDamageConfig2.dataset.value) {
    try {
      const data = JSON.parse(bossDamageConfig2.dataset.value);
      window.StatStore.setBossDamage(data, 2);
    } catch (e) {
      console.warn('Failed to sync boss damage from stat-4-config2:', e);
    }
  }
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
