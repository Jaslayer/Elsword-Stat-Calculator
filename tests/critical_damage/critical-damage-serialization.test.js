import { describe, it, expect } from 'vitest';

/**
 * 致命一擊傷害 - 資料序列化與三向綁定測試
 */
describe('致命一擊傷害 - 資料序列化與三向綁定', () => {
  /**
   * Parse: 字符串 → 物件
   * Format: panel|additive1,additive2,...|multiplicative1,multiplicative2,...
   */
  const parse = (value) => {
    const parts = value ? value.split('|') : [];
    const panel = parseFloat(parts[0]) || 0;
    
    const additiveDamages = parts[1] ? parts[1].split(',').map(v => {
      const num = parseFloat(v);
      return Number.isNaN(num) ? 0 : num;
    }).filter(v => v !== 0 || parts[1].includes('0')) : [];
    
    const multiplicativeDamages = parts[2] ? parts[2].split(',').map(v => {
      const num = parseFloat(v);
      return Number.isNaN(num) ? 1 : num;
    }).filter(v => v !== 0 && !Number.isNaN(v)) : [];
    
    return {
      panel,
      additive_damages: additiveDamages.length > 0 ? additiveDamages : [0],
      multiplicative_damages: multiplicativeDamages.length > 0 ? multiplicativeDamages : [0]
    };
  };

  /**
   * Serialize: 物件 → 字符串
   */
  const serialize = (values) => {
    const additivesStr = (values.additive_damages || [0]).filter(v => v !== undefined).join(',');
    const multiplicativesStr = (values.multiplicative_damages || [0]).filter(v => v !== undefined).join(',');
    return `${values.panel}|${additivesStr}|${multiplicativesStr}`;
  };

  it('解析初始空值', () => {
    const result = parse('0||');
    
    expect(result.panel).toBe(0);
    expect(result.additive_damages).toEqual([0]);
    expect(result.multiplicative_damages).toEqual([0]);
  });

  it('解析有值的資料', () => {
    const result = parse('50|20,30|2,10');
    
    expect(result.panel).toBe(50);
    expect(result.additive_damages).toEqual([20, 30]);
    expect(result.multiplicative_damages).toEqual([2, 10]);
  });

  it('序列化資料', () => {
    const values = {
      panel: 50,
      additive_damages: [20, 30],
      multiplicative_damages: [2, 10]
    };
    
    const result = serialize(values);
    expect(result).toBe('50|20,30|2,10');
  });

  it('序列化包含0值的加算', () => {
    const values = {
      panel: 50,
      additive_damages: [20, 0, 10],
      multiplicative_damages: [0]
    };
    
    const result = serialize(values);
    expect(result).toBe('50|20,0,10|0');
  });

  it('往返序列化：parse → serialize → parse', () => {
    const original = '50|20,30|2,10';
    
    const parsed1 = parse(original);
    const serialized = serialize(parsed1);
    const parsed2 = parse(serialized);
    
    expect(parsed1).toEqual(parsed2);
    expect(serialized).toBe(original);
  });

  it('加算行編輯的三向綁定', () => {
    let value = '50|20|0';
    let parsed = parse(value);
    
    // 用戶編輯第一個加算值
    parsed.additive_damages[0] = 30;
    
    // 序列化
    value = serialize(parsed);
    expect(value).toBe('50|30|0');
    
    // 再次解析應得到相同結果
    let reparsed = parse(value);
    expect(reparsed.additive_damages[0]).toBe(30);
  });

  it('乘算行編輯的三向綁定', () => {
    let value = '50|20|2';
    let parsed = parse(value);
    
    // 用戶編輯乘算值
    parsed.multiplicative_damages[0] = 10;
    
    // 序列化
    value = serialize(parsed);
    expect(value).toBe('50|20|10');
    
    // 再次解析應得到相同結果
    let reparsed = parse(value);
    expect(reparsed.multiplicative_damages[0]).toBe(10);
  });

  it('面板編輯的三向綁定', () => {
    let value = '50|20|2';
    let parsed = parse(value);
    
    // 用戶按上升按鈕或輸入新值
    parsed.panel = 60;
    
    // 序列化
    value = serialize(parsed);
    expect(value).toBe('60|20|2');
    
    // 再次解析應得到相同結果
    let reparsed = parse(value);
    expect(reparsed.panel).toBe(60);
  });

  it('新增加算行的流程', () => {
    let value = '50|20|2';
    let parsed = parse(value);
    
    // 用戶點擊「+ 加算」按鈕
    parsed.additive_damages.push(0); // 新增一行
    expect(parsed.additive_damages).toEqual([20, 0]);
    
    // 用戶在新行輸入值
    parsed.additive_damages[1] = 30;
    expect(parsed.additive_damages).toEqual([20, 30]);
    
    // 序列化並保存
    value = serialize(parsed);
    expect(value).toBe('50|20,30|2');
  });

  it('新增乘算行的流程', () => {
    let value = '50|20|2';
    let parsed = parse(value);
    
    // 用戶點擊「+ 乘算」按鈕
    parsed.multiplicative_damages.push(0); // 新增一行
    expect(parsed.multiplicative_damages).toEqual([2, 0]);
    
    // 用戶在新行選擇預設（團隊爆傷=10）
    parsed.multiplicative_damages[1] = 10;
    expect(parsed.multiplicative_damages).toEqual([2, 10]);
    
    // 序列化並保存
    value = serialize(parsed);
    expect(value).toBe('50|20|2,10');
  });

  it('刪除加算行的流程', () => {
    let value = '50|20,30|2';
    let parsed = parse(value);
    
    expect(parsed.additive_damages).toEqual([20, 30]);
    
    // 用戶點擊第二個刪除按鈕
    parsed.additive_damages.splice(1, 1);
    expect(parsed.additive_damages).toEqual([20]);
    
    // 序列化並保存
    value = serialize(parsed);
    expect(value).toBe('50|20|2');
  });

  it('刪除乘算行的流程', () => {
    let value = '50|20|2,10';
    let parsed = parse(value);
    
    expect(parsed.multiplicative_damages).toEqual([2, 10]);
    
    // 用戶點擊第二個刪除按鈕
    parsed.multiplicative_damages.splice(1, 1);
    expect(parsed.multiplicative_damages).toEqual([2]);
    
    // 序列化並保存
    value = serialize(parsed);
    expect(value).toBe('50|20|2');
  });

  it('複雜操作序列', () => {
    let value = '50|20|2';
    
    // 1. 編輯面板
    let parsed = parse(value);
    parsed.panel = 100;
    value = serialize(parsed);
    expect(value).toBe('100|20|2');
    
    // 2. 新增加算
    parsed = parse(value);
    parsed.additive_damages.push(30);
    value = serialize(parsed);
    expect(value).toBe('100|20,30|2');
    
    // 3. 新增乘算
    parsed = parse(value);
    parsed.multiplicative_damages.push(10);
    value = serialize(parsed);
    expect(value).toBe('100|20,30|2,10');
    
    // 4. 編輯乘算值
    parsed = parse(value);
    parsed.multiplicative_damages[0] = 5;
    value = serialize(parsed);
    expect(value).toBe('100|20,30|5,10');
    
    // 5. 刪除加算
    parsed = parse(value);
    parsed.additive_damages.splice(0, 1);
    value = serialize(parsed);
    expect(value).toBe('100|30|5,10');
    
    // 最終狀態驗證
    parsed = parse(value);
    expect(parsed).toEqual({
      panel: 100,
      additive_damages: [30],
      multiplicative_damages: [5, 10]
    });
  });

  it('特殊字符和空白處理', () => {
    // 不應包含空白
    const values = {
      panel: 50,
      additive_damages: [20, 30],
      multiplicative_damages: [2, 10]
    };
    
    const serialized = serialize(values);
    expect(serialized).not.toContain(' ');
    expect(serialized).toBe('50|20,30|2,10');
  });

  it('浮點數序列化與解析', () => {
    const values = {
      panel: 50.5,
      additive_damages: [20.5, 30.5],
      multiplicative_damages: [2.5, 10.5]
    };
    
    const serialized = serialize(values);
    const parsed = parse(serialized);
    
    expect(parsed.panel).toBe(50.5);
    expect(parsed.additive_damages).toEqual([20.5, 30.5]);
    expect(parsed.multiplicative_damages).toEqual([2.5, 10.5]);
  });
});
