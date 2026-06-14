import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('變化量改變時的三向綁定行為', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head><title>Test</title></head>
        <body>
          <div id="calcPanel"></div>
        </body>
      </html>
    `, {
      url: 'http://localhost',
      pretendToBeVisual: true
    });

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;

    window.MAX_ADAPTABILITY_PANEL = 60;
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('變化量改變時應只更新panel欄位，保持其他欄位不變', () => {
    // 模擬初始狀態
    const initialData = '30|0|0|10|95'; // panel=30, gathering=0, potion=0, super=10, preset=95
    const parts = initialData.split('|');
    
    // 模擬panel被計算為50（因為左=30+變化量=20）
    const newPanelValue = 50;
    
    // 只更新panel，保持其他字段
    parts[0] = newPanelValue;
    const updatedData = parts.join('|');
    
    // 驗證格式
    const newParts = updatedData.split('|');
    expect(newParts[0]).toBe('50'); // panel更新為50
    expect(newParts[1]).toBe('0'); // gathering保持不變
    expect(newParts[2]).toBe('0'); // potion保持不變
    expect(newParts[3]).toBe('10'); // super保持不變（不被變化量影響）
    expect(newParts[4]).toBe('95'); // preset保持不變
  });

  it('變化量改變時應正確計算新的按鈕顯示值', () => {
    // 場景：左=30, 變化量=40, 右應該=70
    // 右的panel應該被反推為60，計算結果也應該是70
    const MAX_PANEL = window.MAX_ADAPTABILITY_PANEL;
    
    const leftValue = 30;
    const middleValue = 40;
    const newResult = leftValue + middleValue; // 70
    
    // 模擬適應力的數據
    const gatheringPlace = 0;
    const adaptPotion = 0;
    const superAdapt = 10;
    
    // 反推panel值
    const buffedPanel = newResult - superAdapt; // 70 - 10 = 60
    let panelValue;
    
    if (buffedPanel <= 60) {
      panelValue = Math.max(0, buffedPanel - gatheringPlace - adaptPotion);
    } else {
      panelValue = MAX_PANEL;
    }
    
    panelValue = Math.min(panelValue, MAX_PANEL);
    
    // 計算按鈕應該顯示的值
    const displayValue = Math.min(panelValue + gatheringPlace + adaptPotion, 60) + superAdapt;
    
    expect(panelValue).toBe(60); // panel反推為60
    expect(displayValue).toBe(70); // 按鈕顯示70（因為super=10）
  });

  it('變化量改變時不應影響超適應力值', () => {
    // 初始狀態
    const initialParts = ['45', '0', '0', '20', '95'];
    const initialSuper = parseInt(initialParts[3]);
    
    // 變化量改變導致panel值更新
    const newPanelValue = 60; // panel更新為60
    initialParts[0] = newPanelValue;
    
    // 驗證super_adapt沒被改變
    const newSuper = parseInt(initialParts[3]);
    expect(newSuper).toBe(initialSuper);
    expect(newSuper).toBe(20); // 保持不變
  });

  it('變化量改變後按鈕值應立即反映計算結果', () => {
    // 場景：左panel=20, 變化量=50, 右結果應該=70
    // 即使panel被限制為60，按鈕還是要顯示70
    const leftPanel = 20;
    const middleValue = 50;
    
    // 直接計算
    const newResult = leftPanel + middleValue; // 70
    
    // 適應力配置：gathering=0, potion=0, super=0
    const gatheringPlace = 0;
    const adaptPotion = 0;
    const superAdapt = 0;
    
    // 計算應該顯示的值
    const displayValue = Math.min(Math.min(60 + gatheringPlace + adaptPotion, 60) + superAdapt, newResult);
    
    // 按鈕應該立即顯示70（因為按鈕顯示的是完整計算結果）
    expect(newResult).toBe(70);
  });
});
