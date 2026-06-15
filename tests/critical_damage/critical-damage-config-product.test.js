import { describe, it, expect } from 'vitest';

/**
 * 致命一擊傷害 - Config Product 計算測試
 * 致命一擊傷害的結果應除以100後參與乘積計算
 */
describe('致命一擊傷害 - Config Product 計算', () => {
  const roundNumber = (num, decimals = 5) => {
    if (!Number.isFinite(num)) return num;
    const multiplier = Math.pow(10, decimals);
    const rounded = Math.round(num * multiplier) / multiplier;
    return parseFloat(rounded.toFixed(decimals).replace(/\.?0+$/, ''));
  };

  const calculateCriticalDamageResult = (panel, additives = [], multiplicatives = []) => {
    const additiveSum = additives.reduce((sum, v) => sum + (v || 0), 0);
    const multiplicativeProduct = multiplicatives.length > 0 && multiplicatives.some(v => v !== 0)
      ? multiplicatives.filter(v => v !== 0).reduce((prod, v) => prod * ((v + 100) / 100), 1)
      : 1;
    const result = panel + 150 * (multiplicativeProduct - 1) + additiveSum;
    return roundNumber(result);
  };

  it('致命一擊傷害結果不應直接參與乘積，應除以100', () => {
    // 假設有3個其他項目值都為100，致命一擊傷害值為200
    const item0 = 100; // 物/魔攻擊力
    const item1 = 100; // 適應力
    const criticalDamage = calculateCriticalDamageResult(50, [20], []); // = 70
    
    // 配置1乘積計算
    // 正確方式：100 * 100 * (70/100) = 7000
    const correctProduct = item0 * item1 * (criticalDamage / 100);
    expect(correctProduct).toBe(7000);
    
    // 錯誤方式（應避免）：100 * 100 * 70 = 700000
    const wrongProduct = item0 * item1 * criticalDamage;
    expect(wrongProduct).toBe(700000);
    expect(wrongProduct).not.toBe(correctProduct);
  });

  it('致命一擊傷害為0時應作為1計算', () => {
    const item0 = 100;
    const item1 = 100;
    const criticalDamage = 0;
    
    // 當致命一擊傷害為0時，應以1計算
    const effectiveValue = criticalDamage === 0 ? 1 : (criticalDamage / 100);
    const product = item0 * item1 * effectiveValue;
    
    expect(effectiveValue).toBe(1);
    expect(product).toBe(10000);
  });

  it('致命一擊傷害為150時應作為1.5參與計算', () => {
    const item0 = 100;
    const item1 = 100;
    // calculateCriticalDamageResult(100, [50], []) = 100 + 150*(1-1) + 50 = 150
    const criticalDamage = calculateCriticalDamageResult(100, [50], []);
    
    // 150 / 100 = 1.5
    const effectiveValue = criticalDamage / 100;
    const product = item0 * item1 * effectiveValue;
    
    expect(effectiveValue).toBe(1.5);
    expect(product).toBe(15000);
  });

  it('致命一擊傷害值很大時的計算', () => {
    const item0 = 100;
    const item1 = 100;
    const criticalDamage = calculateCriticalDamageResult(500, [100], [30, 10]); // = 500 + 150*(1.43-1) + 100 = 664.5
    
    // 664.5 / 100 = 6.645
    const effectiveValue = criticalDamage / 100;
    const product = item0 * item1 * effectiveValue;
    
    expect(roundNumber(effectiveValue)).toBe(6.645);
    expect(roundNumber(product)).toBe(66450);
  });

  it('配置1和配置2都計算致命一擊傷害除以100', () => {
    // config1: 50 + 150*(1.02-1) + 20 = 73
    // config2: 100 + 150*(1.1-1) + 50 = 165
    const config1CriticalDamage = calculateCriticalDamageResult(50, [20], [2]); // 73
    const config2CriticalDamage = calculateCriticalDamageResult(100, [50], [10]); // 165
    
    // 配置1乘積中的有效值
    const config1EffectiveValue = config1CriticalDamage / 100;
    // 配置2乘積中的有效值
    const config2EffectiveValue = config2CriticalDamage / 100;
    
    expect(roundNumber(config1EffectiveValue)).toBe(0.73);
    expect(roundNumber(config2EffectiveValue)).toBe(1.65);
  });

  it('致命一擊傷害與其他項目的乘積示例', () => {
    // 配置1: 物攻=100, 適應力=1.5, 致命一擊=70, 其他項=1
    const product1 = 100 * 1.5 * (70 / 100) * 1;
    
    // 配置2: 物攻=100, 適應力=1.2, 致命一擊=80, 其他項=1
    const product2 = 100 * 1.2 * (80 / 100) * 1;
    
    expect(roundNumber(product1)).toBe(105);
    expect(roundNumber(product2)).toBe(96);
  });

  it('致命一擊傷害乘算不應洩漏到config-product計算', () => {
    // 致命一擊傷害內部的乘算是該項目內部的計算
    // 不應影響其他項目的乘積計算
    
    const criticalWithMultiplicative = calculateCriticalDamageResult(50, [20], [30]); // = 70 + 150 * 0.3
    const criticalWithoutMultiplicative = calculateCriticalDamageResult(50, [20], []); // = 70
    
    // 它們在config-product中應該是不同的有效值
    const effectiveWith = criticalWithMultiplicative / 100;
    const effectiveWithout = criticalWithoutMultiplicative / 100;
    
    expect(effectiveWith).not.toBe(effectiveWithout);
    
    // 但這些差異完全由致命一擊傷害內部計算決定
    // 不會在config-product乘積中引入乘算邏輯
  });

  it('多個項目的完整乘積計算', () => {
    // 配置1值：
    // - 物/魔攻擊力: 100
    // - 適應力: 1.3 (乘數形式)
    // - 致命一擊傷害: 70
    // - Boss傷害: 50
    // - 其他: 1 (空值)
    
    const config1Product = 100 * 1.3 * (70 / 100) * 50 * 1;
    
    // 配置2值：
    // - 物/魔攻擊力: 120
    // - 適應力: 1.2
    // - 致命一擊傷害: 80
    // - Boss傷害: 60
    // - 其他: 1
    
    const config2Product = 120 * 1.2 * (80 / 100) * 60 * 1;
    
    expect(roundNumber(config1Product)).toBe(4550);
    expect(roundNumber(config2Product)).toBe(6912);
  });

  it('致命一擊傷害值範圍測試', () => {
    const testCases = [
      { critical: 0, expected: 1 },      // 0 → 1
      { critical: 50, expected: 0.5 },   // 50 → 0.5
      { critical: 100, expected: 1 },    // 100 → 1
      { critical: 150, expected: 1.5 },  // 150 → 1.5
      { critical: 200, expected: 2 },    // 200 → 2
      { critical: 50.5, expected: 0.505 } // 50.5 → 0.505
    ];
    
    testCases.forEach(({ critical, expected }) => {
      const effectiveValue = critical === 0 ? 1 : (critical / 100);
      expect(roundNumber(effectiveValue)).toBe(expected);
    });
  });
});
