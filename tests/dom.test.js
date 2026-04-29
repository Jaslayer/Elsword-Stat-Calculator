import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';

describe('UI 互動測試 - 刪除按鈕 Hover 事件', () => {
  let panelDiv;
  let deleteBtn;
  let statItem;

  beforeEach(() => {
    // 創建測試的 DOM 結構
    panelDiv = document.createElement('div');
    panelDiv.className = 'input-panel-item';
    panelDiv.dataset.index = '0';

    // 添加刪除按鈕
    deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-panel-btn-inline';
    deleteBtn.dataset.index = '0';
    deleteBtn.textContent = '×';
    panelDiv.appendChild(deleteBtn);

    // 添加面板內容
    const panelRow = document.createElement('div');
    panelRow.className = 'panel-row';
    panelRow.innerHTML = '<div class="panel-label">測試項目</div>';
    panelDiv.appendChild(panelRow);

    document.body.appendChild(panelDiv);

    // 綁定 hover 事件（模擬 index.html 的邏輯）
    panelDiv.addEventListener('mouseenter', () => {
      deleteBtn.classList.add('show');
    });

    panelDiv.addEventListener('mouseleave', () => {
      deleteBtn.classList.remove('show');
    });
  });

  afterEach(() => {
    // 清理 DOM
    if (panelDiv.parentNode) {
      panelDiv.parentNode.removeChild(panelDiv);
    }
  });

  it('初始時刪除按鈕應該沒有 show 類', () => {
    expect(deleteBtn.classList.contains('show')).toBe(false);
  });

  it('滑鼠進入 panel 時應該添加 show 類', async () => {
    // 模擬滑鼠進入
    panelDiv.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(true);
  });

  it('滑鼠離開 panel 時應該移除 show 類', async () => {
    // 先進入
    panelDiv.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(true);

    // 再離開
    panelDiv.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(false);
  });

  it('多次 hover 切換應該正常工作', async () => {
    // 第一次進入
    panelDiv.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(true);

    // 第一次離開
    panelDiv.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(false);

    // 第二次進入
    panelDiv.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(true);

    // 第二次離開
    panelDiv.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(false);
  });

  it('刪除按鈕點擊事件應該正常觸發', async () => {
    let clicked = false;
    deleteBtn.addEventListener('click', () => {
      clicked = true;
    });

    deleteBtn.click();
    expect(clicked).toBe(true);
  });

  it('panel hover 時刪除按鈕應該可視且可點擊', async () => {
    const user = userEvent.setup();

    // 模擬滑鼠進入
    panelDiv.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(deleteBtn.classList.contains('show')).toBe(true);

    // 測試按鈕能否被點擊
    let deleteClicked = false;
    deleteBtn.addEventListener('click', () => {
      deleteClicked = true;
    });

    await user.click(deleteBtn);
    expect(deleteClicked).toBe(true);
  });
});

describe('UI 互動測試 - Panel 刪除流程', () => {
  let wrapper;
  let panel1;
  let panel2;
  let deleteBtn1;
  let deleteBtn2;

  beforeEach(() => {
    // 創建包裝容器
    wrapper = document.createElement('div');
    wrapper.className = 'input-items-wrapper';

    // 創建第一個 panel
    panel1 = document.createElement('div');
    panel1.className = 'input-panel-item';
    panel1.dataset.index = '0';

    deleteBtn1 = document.createElement('button');
    deleteBtn1.className = 'delete-panel-btn-inline';
    deleteBtn1.textContent = '×';
    panel1.appendChild(deleteBtn1);

    const row1 = document.createElement('div');
    row1.className = 'panel-row';
    row1.innerHTML = '<div class="panel-label">物/魔攻擊力</div>';
    panel1.appendChild(row1);

    wrapper.appendChild(panel1);

    // 創建第二個 panel
    panel2 = document.createElement('div');
    panel2.className = 'input-panel-item';
    panel2.dataset.index = '1';

    deleteBtn2 = document.createElement('button');
    deleteBtn2.className = 'delete-panel-btn-inline';
    deleteBtn2.textContent = '×';
    panel2.appendChild(deleteBtn2);

    const row2 = document.createElement('div');
    row2.className = 'panel-row';
    row2.innerHTML = '<div class="panel-label">適應力</div>';
    panel2.appendChild(row2);

    wrapper.appendChild(panel2);

    document.body.appendChild(wrapper);

    // 綁定 hover 事件
    [panel1, panel2].forEach((panel) => {
      const btn = panel.querySelector('.delete-panel-btn-inline');
      panel.addEventListener('mouseenter', () => {
        btn.classList.add('show');
      });
      panel.addEventListener('mouseleave', () => {
        btn.classList.remove('show');
      });

      // 綁定刪除事件
      btn.addEventListener('click', () => {
        panel.remove();
      });
    });
  });

  afterEach(() => {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  });

  it('應該在 wrapper 中包含多個 panels', () => {
    expect(wrapper.querySelectorAll('.input-panel-item').length).toBe(2);
  });

  it('滑鼠 hover 第一個 panel 時只有第一個按鈕顯示', () => {
    panel1.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(deleteBtn1.classList.contains('show')).toBe(true);
    expect(deleteBtn2.classList.contains('show')).toBe(false);
  });

  it('滑鼠 hover 第二個 panel 時只有第二個按鈕顯示', () => {
    panel2.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    expect(deleteBtn1.classList.contains('show')).toBe(false);
    expect(deleteBtn2.classList.contains('show')).toBe(true);
  });

  it('點擊第一個 panel 的刪除按鈕應該刪除該 panel', async () => {
    panel1.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    expect(wrapper.querySelectorAll('.input-panel-item').length).toBe(2);
    
    deleteBtn1.click();
    
    expect(wrapper.querySelectorAll('.input-panel-item').length).toBe(1);
    expect(wrapper.querySelector('[data-index="1"]')).toBeTruthy();
    expect(wrapper.querySelector('[data-index="0"]')).toBeFalsy();
  });

  it('點擊第二個 panel 的刪除按鈕應該只刪除第二個 panel', async () => {
    panel2.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    expect(wrapper.querySelectorAll('.input-panel-item').length).toBe(2);
    
    deleteBtn2.click();
    
    expect(wrapper.querySelectorAll('.input-panel-item').length).toBe(1);
    expect(wrapper.querySelector('[data-index="0"]')).toBeTruthy();
    expect(wrapper.querySelector('[data-index="1"]')).toBeFalsy();
  });
});

describe('UI 互動測試 - Input Panel Header 排序', () => {
  let wrapper;
  let headerPanel;
  let panel0;
  let panel1;
  let panel2;

  // 模擬 reorderPanels 函數
  function reorderPanels(shouldExistIndices, wrapper) {
    const headerPanel = wrapper.querySelector('.input-panel-header');
    const allPanels = Array.from(wrapper.querySelectorAll('.input-panel-item'));
    allPanels.forEach((panel) => {
      const panelIndex = parseInt(panel.dataset.index);
      
      // 只排序在 shouldExistIndices 中的 panels
      if (!shouldExistIndices.includes(panelIndex)) {
        return;
      }
      
      const targetPosition = shouldExistIndices.indexOf(panelIndex);
      // targetPosition 是相對於 panels 的位置，但在 wrapper 中要加 1（因為 header 在第 0 位）
      const targetPositionInWrapper = targetPosition + 1;
      const currentPosition = Array.from(wrapper.children).indexOf(panel);

      // 如果位置不正確，移動到正確位置
      if (currentPosition !== targetPositionInWrapper) {
        // 計算目標元素（確保 header 始終在最前）
        const targetElement = Array.from(wrapper.children)[targetPositionInWrapper];
        if (targetElement) {
          wrapper.insertBefore(panel, targetElement);
        } else {
          wrapper.appendChild(panel);
        }
      }
    });
  }

  beforeEach(() => {
    // 創建包裝容器
    wrapper = document.createElement('div');
    wrapper.className = 'input-items-wrapper';

    // 創建 header
    headerPanel = document.createElement('div');
    headerPanel.className = 'input-panel-header';
    headerPanel.innerHTML = '<div class="panel-row"><div class="panel-label">配置名稱</div></div>';
    wrapper.appendChild(headerPanel);

    // 創建三個 panels
    [0, 1, 2].forEach((index) => {
      const panel = document.createElement('div');
      panel.className = 'input-panel-item';
      panel.dataset.index = index.toString();
      panel.innerHTML = `<div class="panel-row"><div class="panel-label">配置 ${index}</div></div>`;
      wrapper.appendChild(panel);
    });

    panel0 = wrapper.querySelector('[data-index="0"]');
    panel1 = wrapper.querySelector('[data-index="1"]');
    panel2 = wrapper.querySelector('[data-index="2"]');

    document.body.appendChild(wrapper);
  });

  afterEach(() => {
    if (wrapper.parentNode) {
      wrapper.parentNode.removeChild(wrapper);
    }
  });

  it('初始化時 header 應該在最前面', () => {
    expect(wrapper.firstChild).toBe(headerPanel);
    expect(wrapper.children[0].className).toBe('input-panel-header');
  });

  it('添加新 panel 後 header 應該保持在最前面', () => {
    // 添加新 panel
    const newPanel = document.createElement('div');
    newPanel.className = 'input-panel-item';
    newPanel.dataset.index = '3';
    wrapper.appendChild(newPanel);

    expect(wrapper.children[0]).toBe(headerPanel);
    expect(wrapper.children[0].className).toBe('input-panel-header');
  });

  it('刪除 panel 後 header 應該保持在最前面', () => {
    // 刪除第一個 panel
    panel0.remove();

    expect(wrapper.children[0]).toBe(headerPanel);
    expect(wrapper.children[0].className).toBe('input-panel-header');
    expect(wrapper.querySelectorAll('.input-panel-item').length).toBe(2);
  });

  it('排序 [0, 2] 時 header 應該在最前，然後是 panel 0，最後是 panel 2', () => {
    // 只保留 panel 0 和 panel 2
    panel1.remove();

    // 調用排序函數
    reorderPanels([0, 2], wrapper);

    expect(wrapper.children[0]).toBe(headerPanel);
    expect(wrapper.children[1]).toBe(panel0);
    expect(wrapper.children[2]).toBe(panel2);
  });

  it('排序 [2, 0, 1] 時 header 應該在最前，然後按正確順序排列 panels', () => {
    // 調用排序函數，重新排列為 [2, 0, 1]
    reorderPanels([2, 0, 1], wrapper);

    expect(wrapper.children[0]).toBe(headerPanel);
    expect(wrapper.children[1]).toBe(panel2);
    expect(wrapper.children[2]).toBe(panel0);
    expect(wrapper.children[3]).toBe(panel1);
  });

  it('排序 [1, 2] 時 header 應該在最前，然後是 panel 1，最後是 panel 2', () => {
    // 刪除 panel 0
    panel0.remove();

    // 調用排序函數
    reorderPanels([1, 2], wrapper);

    expect(wrapper.children[0]).toBe(headerPanel);
    expect(wrapper.children[1]).toBe(panel1);
    expect(wrapper.children[2]).toBe(panel2);
  });

  it('多次排序操作後 header 始終在最前面', () => {
    // 第一次排序
    reorderPanels([2, 0, 1], wrapper);
    expect(wrapper.children[0]).toBe(headerPanel);

    // 第二次排序
    reorderPanels([0, 1], wrapper);
    expect(wrapper.children[0]).toBe(headerPanel);

    // 第三次排序
    reorderPanels([1, 2], wrapper);
    expect(wrapper.children[0]).toBe(headerPanel);
  });
});
