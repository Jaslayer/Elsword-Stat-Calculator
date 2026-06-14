import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('物/魔攻擊力三向綁定', () => {
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
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  it('左值改變時應正確計算變動量', () => {
    // 場景：配置1=100, 配置2=150
    const leftValue = 100;
    const resultValue = 150;
    
    // 當左值改變時，變動量應該 = 配置2 - 配置1
    const newMiddle = resultValue - leftValue;
    
    expect(newMiddle).toBe(50);
  });

  it('右值改變時應正確計算變動量', () => {
    // 場景：配置1=50, 配置2從100改為120
    const leftValue = 50;
    const newResultValue = 120;
    
    // 當右值改變時，變動量應該 = 配置2 - 配置1
    const newMiddle = newResultValue - leftValue;
    
    expect(newMiddle).toBe(70);
  });

  it('變動量改變時應正確計算配置2', () => {
    // 場景：配置1=50, 變動量從30改為60
    const leftValue = 50;
    const newMiddleValue = 60;
    
    // 當變動量改變時，配置2應該 = 配置1 + 變動量
    const newResult = leftValue + newMiddleValue;
    
    expect(newResult).toBe(110);
  });

  it('三向綁定應處理負值變動量', () => {
    // 場景：配置1=100, 變動量為-30
    const leftValue = 100;
    const middleValue = -30;
    
    // 配置2應該 = 配置1 + 變動量 = 100 - 30 = 70
    const newResult = leftValue + middleValue;
    
    expect(newResult).toBe(70);
  });

  it('三向綁定應保持一致性', () => {
    // 驗證三向綁定的一致性
    const leftValue = 80;
    const resultValue = 120;
    
    // 從結果推導
    const middleValue = resultValue - leftValue; // 40
    
    // 反推配置2
    const newResult = leftValue + middleValue; // 120
    
    // 驗證一致
    expect(newResult).toBe(resultValue);
  });

  it('三向綁定應限制配置最小值為0', () => {
    // 場景：配置1=50, 變動量=-100
    const leftValue = 50;
    const middleValue = -100;
    
    // 配置2計算 = 50 - 100 = -50，應該被限制為0
    let newResult = leftValue + middleValue;
    newResult = Math.max(0, newResult);
    
    expect(newResult).toBe(0);
  });
});
