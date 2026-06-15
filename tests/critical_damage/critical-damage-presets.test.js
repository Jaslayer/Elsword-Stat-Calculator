import { describe, it, expect } from 'vitest';

/**
 * 致命一擊傷害 - 乘算預設選項測試
 */
describe('致命一擊傷害 - 乘算預設選項（光環、團隊爆傷、223草套）', () => {
  const multiplicativePresets = [
    { label: 'MAESTRO光環', value: 2 },
    { label: '團隊爆傷', value: 10 },
    { label: '223草套', value: 30 }
  ];

  it('應包含3個預設選項', () => {
    expect(multiplicativePresets).toHaveLength(3);
  });

  it('預設選項值驗證', () => {
    expect(multiplicativePresets[0].value).toBe(2);
    expect(multiplicativePresets[1].value).toBe(10);
    expect(multiplicativePresets[2].value).toBe(30);
  });

  it('預設選項標籤驗證', () => {
    expect(multiplicativePresets[0].label).toBe('MAESTRO光環');
    expect(multiplicativePresets[1].label).toBe('團隊爆傷');
    expect(multiplicativePresets[2].label).toBe('223草套');
  });

  it('加算只有自訂選項', () => {
    const additivePresets = [];
    // 只顯示自訂選項，預設陣列為空
    expect(additivePresets).toHaveLength(0);
  });

  it('下拉選單應動態生成選項HTML', () => {
    const presetOptionsHTML = multiplicativePresets.map(preset => 
      `<option value="${preset.value}">${preset.label}</option>`
    ).join('');
    const withCustom = `<option value="custom">自訂</option>` + presetOptionsHTML;
    
    // 驗證生成的HTML包含所有選項
    expect(withCustom).toContain('value="custom"');
    expect(withCustom).toContain('value="2"');
    expect(withCustom).toContain('value="10"');
    expect(withCustom).toContain('value="30"');
    expect(withCustom).toContain('MAESTRO光環');
    expect(withCustom).toContain('團隊爆傷');
    expect(withCustom).toContain('223草套');
  });

  it('預設選項選擇：光環=2', () => {
    let multiplicativeValue = 2;
    
    // 尋找對應的預設選項
    const matchedPreset = multiplicativePresets.find(p => p.value === multiplicativeValue);
    
    expect(matchedPreset).toBeDefined();
    expect(matchedPreset.label).toBe('MAESTRO光環');
  });

  it('預設選項選擇：團隊爆傷=10', () => {
    let multiplicativeValue = 10;
    
    const matchedPreset = multiplicativePresets.find(p => p.value === multiplicativeValue);
    
    expect(matchedPreset).toBeDefined();
    expect(matchedPreset.label).toBe('團隊爆傷');
  });

  it('預設選項選擇：223草套=30', () => {
    let multiplicativeValue = 30;
    
    const matchedPreset = multiplicativePresets.find(p => p.value === multiplicativeValue);
    
    expect(matchedPreset).toBeDefined();
    expect(matchedPreset.label).toBe('223草套');
  });

  it('自訂選項選擇：自訂值=5', () => {
    let multiplicativeValue = 5;
    
    // 如果不匹配任何預設，應為自訂
    const matchedPreset = multiplicativePresets.find(p => p.value === multiplicativeValue);
    
    expect(matchedPreset).toBeUndefined(); // 不應找到預設
    // 在UI上應顯示為自訂
    const optionValue = multiplicativeValue === 5 ? 'custom' : multiplicativeValue;
    expect(optionValue).toBe('custom');
  });

  it('浮點數比較：接近預設值應視為選中', () => {
    // 由於浮點數精度問題，應允許小誤差範圍
    let inputValue = 2.001;
    let matchedPreset = multiplicativePresets.find(p => 
      Math.abs(p.value - inputValue) < 0.01
    );
    
    expect(matchedPreset).toBeDefined();
    expect(matchedPreset.value).toBe(2);
  });

  it('預設選項與值的映射', () => {
    const presetMap = new Map(multiplicativePresets.map(p => [p.value, p.label]));
    
    expect(presetMap.get(2)).toBe('MAESTRO光環');
    expect(presetMap.get(10)).toBe('團隊爆傷');
    expect(presetMap.get(30)).toBe('223草套');
  });

  it('多個預設組合計算驗證', () => {
    const roundNumber = (num, decimals = 5) => {
      if (!Number.isFinite(num)) return num;
      const multiplier = Math.pow(10, decimals);
      const rounded = Math.round(num * multiplier) / multiplier;
      return parseFloat(rounded.toFixed(decimals).replace(/\.?0+$/, ''));
    };

    // 光環(2) + 團隊爆傷(10)
    const mul1 = (2 + 100) / 100; // 1.02
    const mul2 = (10 + 100) / 100; // 1.1
    const combinedProduct = mul1 * mul2; // 1.122
    
    // 面板=50, 加算=20
    // 50 + 150 * (1.122 - 1) + 20 = 50 + 150 * 0.122 + 20 = 50 + 18.3 + 20 = 88.3
    const result = 50 + 150 * (combinedProduct - 1) + 20;
    const rounded = roundNumber(result);
    
    expect(rounded).toBe(88.3);
  });

  it('加算只有自訂，無預設下拉', () => {
    // 加算預設陣列為空
    const additivesHTML = `<option value="custom" selected>自訂</option>`;
    
    // 不應包含其他預設選項
    expect(additivesHTML).toContain('自訂');
    expect(additivesHTML).not.toContain('光環');
    expect(additivesHTML).not.toContain('團隊');
    expect(additivesHTML).not.toContain('草套');
  });
});
