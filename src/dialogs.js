/**
 * 對話框管理層 - 所有數字輸入對話框的配置和邏輯
 * 職責：處理 button-input 和特殊輸入項目的對話框交互
 */

// =============== 常量定義 ===============
const MAX_ADAPTABILITY_PANEL = 60; // 適應力面板最大值

// =============== 通用對話框配置工廠函數 ===============
/**
 * 為簡單的數字項目生成統一配置
 */
function createSimpleNumberConfig(statIndex, statName) {
  return {
    type: 'simple-number',
    dialogId: `stat-dialog-${statIndex}`,
    fields: [
      {
        name: 'value',
        type: 'number',
        label: statName,
        className: 'stat-input-field',
        minValue: 0
      }
    ],
    separator: '',
    displayField: 'value',
    parse: (value) => JSON.parse(value || '{}'),
    serialize: (values) => JSON.stringify(values),
    getDisplayValue: (values) => String(values.value)
  };
}

// =============== 特殊對話框配置 (可擴展框架) ===============
const SPECIAL_DIALOGS = {
  // 0: 物/魔攻擊力
  0: createSimpleNumberConfig(0, '物/魔攻擊力'),
  
  1: { // 適應力 (Adaptability) - 特殊多字段配置
    type: 'multi-field',
    dialogId: 'adaptabilityInputDialog',
    fields: [
      {
        name: 'panel',
        type: 'number',
        label: '面板(最大60)',
        className: 'adaptability-panel-input',
        minValue: 0,
        maxValue: MAX_ADAPTABILITY_PANEL // 最大60
      },
      {
        name: 'gathering_place',
        type: 'checkbox',
        label: '集合地 Buff (2%)',
        className: 'adaptability-gathering-place',
        defaultValue: false
      },
      {
        name: 'adapt_potion',
        type: 'checkbox',
        label: '適應靈藥(3%)',
        className: 'adaptability-potion',
        defaultValue: false
      },
      {
        name: 'super_adapt',
        type: 'number',
        label: '超適應力',
        className: 'adaptability-super-input',
        minValue: 0
      },
      {
        name: 'preset',
        type: 'select',
        label: '環境 Debuff',
        className: 'adaptability-select',
        options: [
          { value: '0', label: '0%' },
          { value: '50', label: '50% (12CG)' },
          { value: '90', label: '90% (18CG)' },
          { value: '95', label: '95% (20、21、高熵)' }
        ],
        defaultValue: '95'
      }
    ],
    separator: '',
    displayField: 'panel', // 顯示在按鈕上的字段
    parse: (value) => JSON.parse(value || '{}'),
    serialize: (values) => JSON.stringify(values),
    getDisplayValue: (values) => String(values.panel)
  },
  
  2: { // 致命一擊傷害 (Critical Damage) - 多字段配置（支持動態加算/乘算）
    type: 'critical-damage',
    dialogId: 'criticalDamageInputDialog',
    fields: [
      {
        name: 'panel',
        type: 'number',
        label: '面板',
        className: 'critical-damage-panel-input',
        minValue: 0
      }
    ],
    separator: '',
    displayField: 'panel', // 顯示在按鈕上的字段
    parse: (value) => JSON.parse(value || '{}'),
    serialize: (values) => JSON.stringify(values),
    getDisplayValue: (values) => String(values.panel)
  },
  
  // 4: Boss 傷害
  4: {
    type: 'multi-field',
    dialogId: 'bossDamageInputDialog',
    fields: [
      {
        name: 'value',
        type: 'number',
        label: 'Boss 傷害',
        className: 'boss-damage-value-input',
        minValue: 0
      },
      {
        name: 'guild_skill',
        type: 'checkbox',
        label: '公會技能 (2.5%)',
        className: 'boss-damage-guild-skill',
        defaultValue: false
      }
    ],
    separator: '',
    displayField: 'value',
    parse: (value) => JSON.parse(value || '{"value":0,"guild_skill":false}'),
    serialize: (values) => JSON.stringify(values),
    getDisplayValue: (values) => String(values.value)
  },
  
  // 5: 50%以上/以下
  5: createSimpleNumberConfig(5, '50%以上/以下'),
  
  // 10: 其他
  10: createSimpleNumberConfig(10, '其他')
};

// =============== 致命一擊傷害輔助函數 ===============

/**
 * 對話框內 spinner 改值（實時改變輸入框的值）
 */
function handleDialogSpinnerChange(element, field, increment, handleInputChange) {
  const currentValue = parseFloat(element.value) || 0;
  const minValue = field.minValue !== undefined ? field.minValue : Number.NEGATIVE_INFINITY;
  const maxValue = field.maxValue !== undefined ? field.maxValue : Number.POSITIVE_INFINITY;
  let newValue = currentValue + increment;
  // 限制在 minValue 和 maxValue 之間
  newValue = Math.max(minValue, Math.min(maxValue, newValue));
  element.value = newValue;
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * 生成加算爆傷行 HTML
 */
function generateAdditivesHTML(currentValues, config = '1') {
  let html = '';
  currentValues.additive_damages.forEach((value, addIndex) => {
    if (value === undefined) return;
    html += `
      <div class="dialog-dynamic-row" data-add-index="${addIndex}">
        <input type="number" class="dialog-input dialog-additive-input" id="dialog-additive-${addIndex}" data-index="${addIndex}" data-config="${config}" value="${value ?? ''}" placeholder="" style="flex: 1;" />
        <select class="dialog-preset-select dialog-additive-preset" id="dialog-additive-preset-${addIndex}" data-index="${addIndex}" data-config="${config}" style="flex-shrink: 0; width: 200px;">
          <option value="custom" selected>自訂</option>
        </select>
        <button class="dialog-delete-btn" type="button" data-index="${addIndex}" aria-label="刪除">−</button>
      </div>
    `;
  });
  return html;
}

/**
 * 生成乘算爆傷行 HTML
 */
function generateMultiplicativesHTML(currentValues, presets, config = '1') {
  let html = '';
  currentValues.multiplicative_damages.forEach((value, mulIndex) => {
    if (value === undefined) return;
    const presetOptions = presets.map(preset => 
      `<option value="${preset.value}" ${Math.abs(preset.value - value) < 0.01 ? 'selected' : ''}>${preset.label}</option>`
    ).join('');
    html += `
      <div class="dialog-dynamic-row" data-mul-index="${mulIndex}">
        <input type="number" class="dialog-input dialog-multiplicative-input" id="dialog-multiplicative-${mulIndex}" data-index="${mulIndex}" data-config="${config}" value="${value ?? ''}" placeholder="" style="flex: 1;" />
        <select class="dialog-preset-select dialog-multiplicative-preset" id="dialog-multiplicative-preset-${mulIndex}" data-index="${mulIndex}" data-config="${config}" style="flex-shrink: 0; width: 200px;">
          <option value="custom">自訂</option>${presetOptions}
        </select>
        <button class="dialog-delete-btn" type="button" data-index="${mulIndex}" aria-label="刪除">−</button>
      </div>
    `;
  });
  return html;
}

/**
 * 綁定單行事件
 */
function bindSingleRowEvents(row, inputSelector, handleChange) {
  const input = row.querySelector(inputSelector);
  const presetSelect = row.querySelector('.dialog-preset-select');
  const deleteBtn = row.querySelector('.dialog-delete-btn');
  
  input.addEventListener('input', handleChange);
  input.addEventListener('change', handleChange);
  presetSelect.addEventListener('change', (e) => {
    if (e.target.value !== 'custom') {
      input.value = e.target.value;
    }
    handleChange();
  });
  deleteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    row.remove();
    handleChange();
  });
}

/**
 * 綁定容器中所有行的事件
 */
function bindDamageRowEvents(container, inputSelector, handleChange) {
  const rows = container.querySelectorAll('.dialog-dynamic-row');
  rows.forEach(row => {
    if (row.dataset.eventsBound) return;
    bindSingleRowEvents(row, inputSelector, handleChange);
    row.dataset.eventsBound = 'true';
  });
}

/**
 * 生成對話框 HTML 結構
 */
function generateCriticalDamageDialogHTML(index, currentValues, additivesHTML, multiplicativesHTML, config = '1') {
  const panelInputId = `dialog-panel-${index}`;
  return `
    <div class="detailed-dialog">
      <div class="dual-input-container" style="display: flex; flex-direction: column; gap: 12px;">
        <div class="dialog-input-group">
          <label class="dialog-input-label" for="${panelInputId}">面板</label>
          <div style="display: flex; gap: 6px; align-items: stretch;">
            <input type="number" id="${panelInputId}" class="dialog-input dialog-panel-input" data-config="${config}" placeholder="" style="flex: 1;" />
            <div style="display: flex; flex-direction: column; gap: 0; flex-shrink: 0;">
              <button class="dialog-spinner-btn dialog-panel-up" type="button" aria-label="增加">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>
              </button>
              <button class="dialog-spinner-btn dialog-panel-down" type="button" aria-label="減少">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
              </button>
            </div>
          </div>
        </div>
        
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
          <div class="dialog-input-label">加算爆傷</div>
          <div id="additive-damages-container" style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            ${additivesHTML}
          </div>
          <button class="dialog-add-row-btn" id="add-additive-btn" type="button" style="margin-top: 6px; width: 100%; padding: 4px;">+ 加算</button>
        </div>
        
        <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
          <div class="dialog-input-label">乘算爆傷</div>
          <div id="multiplicative-damages-container" style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
            ${multiplicativesHTML}
          </div>
          <button class="dialog-add-row-btn" id="add-multiplicative-btn" type="button" style="margin-top: 6px; width: 100%; padding: 4px;">+ 乘算</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 設置對話框位置和初始狀態
 */
function setupDialogPosition(dialog, button, panelDiv) {
  const inputPanelRect = panelDiv.getBoundingClientRect();
  const calcPanel = document.getElementById('calcPanel');
  const calcPanelRect = calcPanel.getBoundingClientRect();
  
  const topPos = inputPanelRect.top - calcPanelRect.top;
  const leftPos = calcPanel.offsetWidth * 0.62;
  
  dialog.style.top = topPos + 'px';
  dialog.style.left = leftPos + 'px';
  button.classList.add('focus');
  dialog.classList.add('show');
}

// =============== 致命一擊傷害專用對話框 (支持動態加算/乘算行) ===============
function openCriticalDamageDialog(button, type, index, panelDiv, config, dialog, spinnerIncrement = 0) {
  // 解析當前值
  const currentValues = config.parse(button.dataset.value || '');
  if (spinnerIncrement !== 0) {
    currentValues.panel = Math.max(0, currentValues.panel + spinnerIncrement);
  }
  
  // 預設乘算爆傷選項
  const multiplicativePresets = [
    { label: 'MAESTRO光環', value: 2 },
    { label: '團隊爆傷', value: 10 },
    { label: '223草套(20/23/26/30)', value: 30 }
  ];
  
  // 獲取 config 號
  const configNumber = button.dataset.config || '1';
  
  // 生成 HTML
  const additivesHTML = generateAdditivesHTML(currentValues, configNumber);
  const multiplicativesHTML = generateMultiplicativesHTML(currentValues, multiplicativePresets, configNumber);
  dialog.innerHTML = generateCriticalDamageDialogHTML(index, currentValues, additivesHTML, multiplicativesHTML, configNumber);
  
  // 獲取對話框元素
  const panelInput = dialog.querySelector('.dialog-panel-input');
  const additivesContainer = dialog.querySelector('#additive-damages-container');
  const multiplicativesContainer = dialog.querySelector('#multiplicative-damages-container');
  
  // 設置初始值
  panelInput.value = currentValues.panel || '';
  
  // 設置對話框位置
  setupDialogPosition(dialog, button, panelDiv);
  panelInput.focus();
  
  // 實時同步更新的函數
  const handleInputChange = () => {
    const panelValue = parseFloat(panelInput.value) || 0;
    const additiveDamages = Array.from(dialog.querySelectorAll('.dialog-additive-input')).map(input => parseFloat(input.value) || 0);
    const multiplicativeDamages = Array.from(dialog.querySelectorAll('.dialog-multiplicative-input')).map(input => parseFloat(input.value) || 0).filter(val => val !== 0);
    
    const values = {
      panel: Math.max(0, panelValue),
      additive_damages: additiveDamages.length > 0 ? additiveDamages : [0],
      multiplicative_damages: multiplicativeDamages.length > 0 ? multiplicativeDamages : [0]
    };
    
    button.dataset.value = config.serialize(values);
    button.textContent = (config.getDisplayValue(values) === 0 || config.getDisplayValue(values) === '0') ? '' : config.getDisplayValue(values);
    
    // config1 與 config2 的值分開存儲，不進行同步
    // 使用 data-config 屬性區分配置號
    if (window.syncInputToDisplay && typeof window.syncInputToDisplay === 'function') {
      setTimeout(() => window.syncInputToDisplay(button), 0);
    }
  };
  
  // 綁定 panel 輸入和按鈕事件
  panelInput.addEventListener('input', handleInputChange);
  panelInput.addEventListener('change', handleInputChange);
  dialog.querySelector('.dialog-panel-up').addEventListener('click', (e) => {
    e.preventDefault();
    panelInput.value = Math.max(0, (parseFloat(panelInput.value) || 0) + 1);
    handleInputChange();
  });
  dialog.querySelector('.dialog-panel-down').addEventListener('click', (e) => {
    e.preventDefault();
    panelInput.value = Math.max(0, (parseFloat(panelInput.value) || 0) - 1);
    handleInputChange();
  });
  
  // 綁定行事件
  bindDamageRowEvents(additivesContainer, '.dialog-additive-input', handleInputChange);
  bindDamageRowEvents(multiplicativesContainer, '.dialog-multiplicative-input', handleInputChange);
  
  // 添加行按鈕
  dialog.querySelector('#add-additive-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const newRow = document.createElement('div');
    newRow.className = 'dialog-dynamic-row';
    const addIndex = Date.now();
    newRow.dataset.addIndex = addIndex;
    newRow.innerHTML = `
      <input type="number" class="dialog-input dialog-additive-input" id="dialog-additive-${addIndex}" data-config="${configNumber}" placeholder="" style="flex: 1;" />
      <select class="dialog-preset-select dialog-additive-preset" id="dialog-additive-preset-${addIndex}" data-config="${configNumber}" style="flex-shrink: 0; width: 200px;">
        <option value="custom" selected>自訂</option>
      </select>
      <button class="dialog-delete-btn" type="button" aria-label="刪除">−</button>
    `;
    additivesContainer.appendChild(newRow);
    bindSingleRowEvents(newRow, '.dialog-additive-input', handleInputChange);
    newRow.dataset.eventsBound = 'true';
    newRow.querySelector('.dialog-additive-input').focus();
  });
  
  dialog.querySelector('#add-multiplicative-btn').addEventListener('click', (e) => {
    e.preventDefault();
    const newRow = document.createElement('div');
    newRow.className = 'dialog-dynamic-row';
    const mulIndex = Date.now();
    newRow.dataset.mulIndex = mulIndex;
    const presetOptions = multiplicativePresets.map(p => `<option value="${p.value}">${p.label}</option>`).join('');
    newRow.innerHTML = `
      <input type="number" class="dialog-input dialog-multiplicative-input" id="dialog-multiplicative-${mulIndex}" data-config="${configNumber}" placeholder="" style="flex: 1;" />
      <select class="dialog-preset-select dialog-multiplicative-preset" id="dialog-multiplicative-preset-${mulIndex}" data-config="${configNumber}" style="flex-shrink: 0; width: 200px;">
        <option value="custom" selected>自訂</option>${presetOptions}
      </select>
      <button class="dialog-delete-btn" type="button" aria-label="刪除">−</button>
    `;
    multiplicativesContainer.appendChild(newRow);
    bindSingleRowEvents(newRow, '.dialog-multiplicative-input', handleInputChange);
    newRow.dataset.eventsBound = 'true';
    newRow.querySelector('.dialog-multiplicative-input').focus();
  });
  
  // 定義焦點處理
  const handleOtherInputFocus = (e) => {
    const isOwnElement = dialog.contains(e.target);
    if ((e.target.classList.contains('stat-input') || e.target.classList.contains('button-input')) && !isOwnElement) {
      closeDialog();
    }
  };
  
  const closeDialog = () => {
    dialog.classList.remove('show');
    button.classList.remove('focus');
    button.blur();
    
    // 最後一次更新計算結果
    if (window.updateProductDisplay && typeof window.updateProductDisplay === 'function') {
      setTimeout(() => {
        window.updateProductDisplay();
      }, 10);
    }
    
    // 移除所有事件監聽器
    document.removeEventListener('click', handleDocumentClick, true);
    document.removeEventListener('focus', handleOtherInputFocus, true);
    document.removeEventListener('keydown', handleKeyDown);
  };
  
  const handleDocumentClick = (e) => {
    if (dialog.contains(e.target)) {
      return;
    }
    closeDialog();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeDialog();
  };
  
  // 綁定全局事件監聽器
  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('focus', handleOtherInputFocus, true);
  document.addEventListener('keydown', handleKeyDown);
  
  // 立即觸發一次更新
  handleInputChange();
}

// =============== 通用特殊對話框打開函數 ===============
function openSpecialDialog(button, type, index, panelDiv, config, spinnerIncrement = 0) {
  // 創建或獲取對話框
  let dialog = document.getElementById(config.dialogId);
  if (!dialog) {
    dialog = document.createElement('div');
    dialog.id = config.dialogId;
    dialog.className = 'number-input-dialog';
    document.getElementById('calcPanel').appendChild(dialog);
  }
  
  // 處理致命一擊傷害特殊對話框（支持動態加算/乘算）
  if (config.type === 'critical-damage') {
    openCriticalDamageDialog(button, type, index, panelDiv, config, dialog, spinnerIncrement);
    return;
  }
  
  // 清空對話框內容並重新生成（這樣會自動移除舊的事件監聽器）
  const dataConfig = button.dataset.config || '1';
  let fieldsHTML = '';
  config.fields.forEach((field, fieldIndex) => {
    if (field.type === 'number') {
      const inputId = `dialog-${index}-${field.className}-${fieldIndex}`;
      fieldsHTML += `
        <div class="dialog-input-group">
          <label class="dialog-input-label" for="${inputId}">${field.label}</label>
          <div style="display: flex; gap: 0; align-items: stretch;">
            <input type="number" id="${inputId}" class="dialog-input ${field.className}" data-config="${dataConfig}" style="flex: 1;" />
            <div style="display: flex; flex-direction: column; gap: 0; flex-shrink: 0; height: 100%;">
              <button class="dialog-spinner-btn dialog-spinner-up" type="button" aria-label="增加" title="增加">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
              </button>
              <button class="dialog-spinner-btn dialog-spinner-down" type="button" aria-label="減少" title="減少">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (field.type === 'select') {
      let optionsHTML = '';
      field.options.forEach(option => {
        optionsHTML += `<option value="${option.value}">${option.label}</option>`;
      });
      const selectId = `dialog-${index}-${field.className}-${fieldIndex}`;
      fieldsHTML += `
        <div class="dialog-input-group">
          <label class="dialog-input-label" for="${selectId}">${field.label}</label>
          <select id="${selectId}" class="dialog-select ${field.className}" data-config="${dataConfig}">
            ${optionsHTML}
          </select>
        </div>
      `;
    } else if (field.type === 'checkbox') {
      fieldsHTML += `
        <div class="dialog-input-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" class="dialog-checkbox ${field.className}" data-config="${dataConfig}" />
            <span>${field.label}</span>
          </label>
        </div>
      `;
    }
  });
  
  dialog.innerHTML = `
    <div class="detailed-dialog">
      <div class="dual-input-container">
        ${fieldsHTML}
      </div>
    </div>
  `;
  
  // 獲取所有字段元素
  const fieldElements = {};
  config.fields.forEach(field => {
    fieldElements[field.name] = dialog.querySelector(`.${field.className}`);
  });
  
  const calcPanel = document.getElementById('calcPanel');
  
  // 設置對話框位置
  setupDialogPosition(dialog, button, panelDiv);
  
  // 解析並設置初始值
  const parsedValues = config.parse(button.dataset.value || '');
  
  // main panel spinner 增量（打開對話框時的初始值調整）
  if (spinnerIncrement !== 0) {
    if (config.type === 'simple-number') {
      parsedValues.value = Math.max(0, parsedValues.value + spinnerIncrement);
    } else if (config.type === 'multi-field') {
      // ★ 統一使用 displayField 作為主字段處理 spinner 增量
      const mainField = config.displayField;
      parsedValues[mainField] = Math.max(0, (parsedValues[mainField] || 0) + spinnerIncrement);
    }
  }
  
  config.fields.forEach(field => {
    const element = fieldElements[field.name];
    if (element) {
      if (field.type === 'checkbox') {
        element.checked = parsedValues[field.name] === true;
      } else {
        // 对于数字字段，如果值为0或未定义，显示为空
        const fieldValue = parsedValues[field.name];
        if (field.type === 'number' && (fieldValue === 0 || fieldValue === undefined)) {
          element.value = '';
        } else {
          element.value = fieldValue !== undefined ? fieldValue : (field.defaultValue || '');
        }
      }
    }
  });
  
  // 添加 button 的 focus 類
  button.classList.add('focus');
  
  // 顯示對話框
  dialog.classList.add('show');
  fieldElements[config.fields[0].name].focus();
  fieldElements[config.fields[0].name].select?.();
  
  // 實時同步輸入值到 button
  const handleInputChange = () => {
    const values = {};
    
    config.fields.forEach(field => {
      let value;
      
      // 處理不同類型的字段
      if (field.type === 'checkbox') {
        value = fieldElements[field.name].checked;
      } else {
        value = fieldElements[field.name].value;
      }
      
      // 處理數字類型
      if (field.type === 'number') {
        value = window.roundNumber(parseFloat(value) || 0);
        // 應用最小值限制
        if (field.minValue !== undefined && value < field.minValue) {
          value = field.minValue;
          fieldElements[field.name].value = value;
        }
        // 計算階段的限制已在 ComputeEngine.calculateAdaptabilityValue() 中實現
      }
      
      values[field.name] = value;
    });
    
    // 序列化並保存值
    const serialized = config.serialize(values);
    button.dataset.value = serialized;
    
    // 更新按鈕顯示（只顯示指定字段）
    const displayValue = config.getDisplayValue ? config.getDisplayValue(values) : values[config.displayField];
    // 如果顯示值為0或'0'，保持空白；否則顯示值
    button.textContent = (displayValue === 0 || displayValue === '0') ? '' : displayValue;
    
    // 對於複雜項目（stat-1 適應力、stat-2 致命一擊傷害、stat-4 Boss傷害），呼叫 syncInputToDisplay 保留完整的序列化數據
    // 對於簡單項目，呼叫 syncStatUpdate
    if (index === 1 || index === 2 || index === 4) {
      // 複雜項目：直接呼叫 syncInputToDisplay 避免 syncStatUpdate 的格式覆蓋
      if (window.syncInputToDisplay && typeof window.syncInputToDisplay === 'function') {
        // 確保使用 setTimeout 確保 DOM 更新後再調用
        setTimeout(() => window.syncInputToDisplay(button), 0);
      }
    } else {
      // 簡單項目：使用原來的 syncStatUpdate
      syncStatUpdate(button);
    }
    
    // config1 與 config2 的值分開存儲，不進行同步
    // 使用 data-config 屬性區分配置號
  };
  
  // 立即觸發一次 handleInputChange 來序列化初始值並保存到 button
  handleInputChange();
  
  // 定義焦點處理
  const handleOtherInputFocus = (e) => {
    const isOwnElement = config.fields.some(field => fieldElements[field.name] === e.target);
    // 排除 spinner 按鈕：點擊 spinner 時不關閉對話框
    const isSpinnerButton = e.target.classList.contains('dialog-spinner-btn') || 
                            e.target.closest('.dialog-spinner-btn') !== null;
    if (!isSpinnerButton && (e.target.classList.contains('stat-input') || e.target.classList.contains('button-input')) && !isOwnElement) {
      closeDialog();
    }
  };
  
  const closeDialog = () => {
    dialog.classList.remove('show');
    button.classList.remove('focus');
    button.blur();
    
    // Dialog 關閉時，同步快取並更新顯示
    if (window.syncAllStatValues && typeof window.syncAllStatValues === 'function') {
      window.allStatValues = window.syncAllStatValues();
      // syncAllStatValues 會自動調用 updateProductDisplay，無需再調用
    } else if (window.updateProductDisplay && typeof window.updateProductDisplay === 'function') {
      // 備用：如果沒有 syncAllStatValues，直接調用 updateProductDisplay
      setTimeout(() => {
        window.updateProductDisplay();
      }, 10);
    }
    
    // 移除所有事件監聽器
    config.fields.forEach(field => {
      const element = fieldElements[field.name];
      if (element) {
        element.removeEventListener('input', handleInputChange);
        element.removeEventListener('change', handleInputChange);
        element.removeEventListener('keydown', handleKeyDown);
      }
    });
    document.removeEventListener('click', handleDocumentClick, true);
    document.removeEventListener('focus', handleOtherInputFocus, true);
  };
  
  const handleDocumentClick = (e) => {
    // 排除對話框內部和 spinner 按鈕的點擊
    if ((dialog.contains(e.target) || (e.target.closest && e.target.closest(`#${config.dialogId}`))) || 
        e.target.classList.contains('dialog-spinner-btn') ||
        (e.target.closest && e.target.closest('.dialog-spinner-btn'))) {
      return;
    }
    closeDialog();
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeDialog();
    if (e.key === 'Tab') {
      e.preventDefault();
      const focusedIndex = config.fields.findIndex(f => fieldElements[f.name] === document.activeElement);
      const nextIndex = (focusedIndex + 1) % config.fields.length;
      fieldElements[config.fields[nextIndex].name].focus();
    }
  };
  
  // 綁定事件監聽器
  config.fields.forEach(field => {
    const element = fieldElements[field.name];
    if (element) {
      if (field.type === 'number') {
        element.addEventListener('input', handleInputChange);
        element.addEventListener('change', handleInputChange);
        
        // 對話框內 spinner 按鈕事件（實時改值）
        const parentDiv = element.parentElement;
        if (parentDiv) {
          const upBtn = parentDiv.querySelector('.dialog-spinner-up');
          const downBtn = parentDiv.querySelector('.dialog-spinner-down');
          
          if (upBtn) {
            upBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();  // 防止事件冒泡到關閉對話框的邏輯
              handleDialogSpinnerChange(element, field, 1, handleInputChange);
            });
          }
          
          if (downBtn) {
            downBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();  // 防止事件冒泡到關閉對話框的邏輯
              handleDialogSpinnerChange(element, field, -1, handleInputChange);
            });
          }
        }
      } else if (field.type === 'select') {
        // 💡 檢測是否是 preset（環境debuff）字段變化
        element.addEventListener('change', (e) => {
          if (field.name === 'preset') {
            button.dataset.fieldChanged = 'preset';
          }
          handleInputChange();
        });
      } else if (field.type === 'checkbox') {
        element.addEventListener('change', handleInputChange);
      }
      element.addEventListener('keydown', handleKeyDown);
    }
  });
  
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('focus', handleOtherInputFocus, true);
}

/**
 * 打開數字輸入對話框 - 統一入口
 * @param {Element} button - 被點擊的按鈕
 * @param {string} type - 'config1' 或 'config2'
 * @param {number} index - 統計項目索引
 * @param {Element} panelDiv - 所屬的 panel 元素
 */
function openNumberInputDialog(button, type, index, panelDiv) {
  // 所有 button-input 項目都在 SPECIAL_DIALOGS 中有配置，統一使用 openSpecialDialog
  if (SPECIAL_DIALOGS[index]) {
    openSpecialDialog(button, type, index, panelDiv, SPECIAL_DIALOGS[index]);
  }
}

// =============== 導出到 window ===============
window.openNumberInputDialog = openNumberInputDialog;
window.openSpecialDialog = openSpecialDialog;
window.openCriticalDamageDialog = openCriticalDamageDialog;
window.SPECIAL_DIALOGS = SPECIAL_DIALOGS;
window.MAX_ADAPTABILITY_PANEL = MAX_ADAPTABILITY_PANEL;
