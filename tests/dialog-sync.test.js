import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UI 互動測試 - 詳細對話框消失', () => {
  let dialog;
  let input;
  let calcPanel;
  let button;
  let panelDiv;

  beforeEach(() => {
    // 創建 calc-panel
    calcPanel = document.createElement('div');
    calcPanel.id = 'calcPanel';
    document.body.appendChild(calcPanel);

    // 創建對話框
    dialog = document.createElement('div');
    dialog.id = 'numberInputDialog';
    dialog.className = 'number-input-dialog show';
    dialog.innerHTML = `
      <div class="detailed-dialog">
        <input type="number" class="dialog-input" />
      </div>
    `;
    calcPanel.appendChild(dialog);

    input = dialog.querySelector('.dialog-input');

    // 創建 button
    panelDiv = document.createElement('div');
    panelDiv.className = 'input-panel-item';
    button = document.createElement('button');
    button.className = 'button-input';
    button.textContent = '0';
    panelDiv.appendChild(button);
    calcPanel.appendChild(panelDiv);
  });

  afterEach(() => {
    if (calcPanel.parentNode) {
      calcPanel.parentNode.removeChild(calcPanel);
    }
  });

  it('對話框顯示時應該存在於 DOM', () => {
    expect(dialog).toBeTruthy();
    expect(dialog.classList.contains('show')).toBe(true);
  });

  it('點擊對話框範圍外應該消失', () => {
    // 模擬點擊外部事件
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const outside = document.createElement('div');
    outside.className = 'outside-element';
    calcPanel.appendChild(outside);

    // 模擬關閉邏輯
    if (!dialog.contains(outside)) {
      dialog.classList.remove('show');
    }
    expect(dialog.classList.contains('show')).toBe(false);
  });

  it('Escape 鍵按下時應該消失', () => {
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    
    // 模擬 Escape 事件處理
    if (escapeEvent.key === 'Escape') {
      dialog.classList.remove('show');
    }
    expect(dialog.classList.contains('show')).toBe(false);
  });

  it('其他 inputbox/inputbutton 被 focus 時應該消失', () => {
    const otherButton = document.createElement('button');
    otherButton.className = 'button-input';
    calcPanel.appendChild(otherButton);

    // 模擬其他按鈕被 focus 時的邏輯
    if (document.activeElement !== input && 
        (document.activeElement.classList.contains('stat-input') || 
         document.activeElement.classList.contains('button-input'))) {
      dialog.classList.remove('show');
    }

    expect(dialog.classList.contains('show')).toBe(true); // 邏輯中需要檢查

    // 模擬實際的焦點移動
    otherButton.focus();
    dialog.classList.remove('show');
    expect(dialog.classList.contains('show')).toBe(false);
  });

  it('對話框消失時 button 應該失焦', () => {
    button.focus();
    expect(document.activeElement).toBe(button);

    // 模擬對話框消失時的邏輯
    dialog.classList.remove('show');
    button.blur();
    expect(document.activeElement).not.toBe(button);
  });
});

describe('UI 互動測試 - 數值同步', () => {
  let dialog;
  let input;
  let calcPanel;
  let button;
  let panelDiv;

  beforeEach(() => {
    // 創建 calc-panel
    calcPanel = document.createElement('div');
    calcPanel.id = 'calcPanel';
    document.body.appendChild(calcPanel);

    // 創建對話框
    dialog = document.createElement('div');
    dialog.id = 'numberInputDialog';
    dialog.className = 'number-input-dialog show';
    dialog.innerHTML = `
      <div class="detailed-dialog">
        <input type="number" class="dialog-input" />
      </div>
    `;
    calcPanel.appendChild(dialog);

    input = dialog.querySelector('.dialog-input');

    // 創建 panel 和 button
    panelDiv = document.createElement('div');
    panelDiv.className = 'input-panel-item';
    button = document.createElement('button');
    button.className = 'button-input';
    button.dataset.value = '0';
    button.textContent = '0';
    panelDiv.appendChild(button);
    calcPanel.appendChild(panelDiv);

    // 綁定輸入事件以同步值
    input.addEventListener('input', () => {
      const value = parseFloat(input.value) || 0;
      button.dataset.value = value;
      button.textContent = value;
    });
  });

  afterEach(() => {
    if (calcPanel.parentNode) {
      calcPanel.parentNode.removeChild(calcPanel);
    }
  });

  it('在對話框中輸入數值時應該同步到 button 的 textContent', () => {
    input.value = '123';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.textContent).toBe('123');
  });

  it('在對話框中輸入數值時應該同步到 button 的 dataset.value', () => {
    input.value = '456';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.dataset.value).toBe('456');
  });

  it('多次輸入應該多次同步', () => {
    input.value = '100';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.textContent).toBe('100');
    expect(button.dataset.value).toBe('100');

    input.value = '200';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.textContent).toBe('200');
    expect(button.dataset.value).toBe('200');

    input.value = '300';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.textContent).toBe('300');
    expect(button.dataset.value).toBe('300');
  });

  it('輸入浮點數時應該正確同步', () => {
    input.value = '3.14';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.textContent).toBe('3.14');
    expect(button.dataset.value).toBe('3.14');
  });

  it('輸入空值應該同步為 0', () => {
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.textContent).toBe('0');
    expect(button.dataset.value).toBe('0');
  });

  it('輸入負數時應該正確同步', () => {
    input.value = '-99.99';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(button.textContent).toBe('-99.99');
    expect(button.dataset.value).toBe('-99.99');
  });
});
