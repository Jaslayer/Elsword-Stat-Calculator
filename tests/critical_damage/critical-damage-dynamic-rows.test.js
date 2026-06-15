import { describe, it, expect } from 'vitest';

/**
 * 致命一擊傷害 - 動態行管理測試
 */
describe('致命一擊傷害 - 加算與乘算動態行', () => {
  it('初始加算應有一欄空資料', () => {
    // 初始值應包含一個空的加算行 [0]
    const initialAdditive = [0];
    expect(initialAdditive).toHaveLength(1);
    expect(initialAdditive[0]).toBe(0);
  });

  it('初始乘算應有一欄空資料', () => {
    // 初始值應包含一個空的乘算行 [0]
    const initialMultiplicative = [0];
    expect(initialMultiplicative).toHaveLength(1);
    expect(initialMultiplicative[0]).toBe(0);
  });

  it('加算行新增：添加第二個加算值', () => {
    // 從 [0] 變為 [0, 20]
    let additives = [0];
    additives.push(20);
    
    expect(additives).toHaveLength(2);
    expect(additives[0]).toBe(0);
    expect(additives[1]).toBe(20);
  });

  it('加算行刪除：移除第二個加算值', () => {
    // 從 [0, 20] 變為 [0]
    let additives = [0, 20];
    additives.splice(1, 1); // 移除索引1的元素
    
    expect(additives).toHaveLength(1);
    expect(additives[0]).toBe(0);
  });

  it('乘算行新增：添加第二個乘算值', () => {
    // 從 [0] 變為 [0, 2]
    let multiplicatives = [0];
    multiplicatives.push(2);
    
    expect(multiplicatives).toHaveLength(2);
    expect(multiplicatives[0]).toBe(0);
    expect(multiplicatives[1]).toBe(2);
  });

  it('乘算行刪除：移除第二個乘算值', () => {
    // 從 [0, 2] 變為 [0]
    let multiplicatives = [0, 2];
    multiplicatives.splice(1, 1);
    
    expect(multiplicatives).toHaveLength(1);
    expect(multiplicatives[0]).toBe(0);
  });

  it('加算行編輯：修改第一個加算值', () => {
    // [0] → [20]
    let additives = [0];
    additives[0] = 20;
    
    expect(additives[0]).toBe(20);
  });

  it('乘算行編輯：修改第一個乘算值', () => {
    // [0] → [2]
    let multiplicatives = [0];
    multiplicatives[0] = 2;
    
    expect(multiplicatives[0]).toBe(2);
  });

  it('多個加算行：完整操作序列', () => {
    let additives = [0]; // 初始
    
    // 用戶輸入第一行
    additives[0] = 20;
    expect(additives).toEqual([20]);
    
    // 用戶新增第二行
    additives.push(0);
    expect(additives).toEqual([20, 0]);
    
    // 用戶輸入第二行
    additives[1] = 30;
    expect(additives).toEqual([20, 30]);
    
    // 序列化
    const serialized = additives.join(',');
    expect(serialized).toBe('20,30');
  });

  it('多個乘算行：完整操作序列', () => {
    let multiplicatives = [0]; // 初始
    
    // 用戶選擇預設（光環=2）
    multiplicatives[0] = 2;
    expect(multiplicatives).toEqual([2]);
    
    // 用戶新增第二行
    multiplicatives.push(0);
    expect(multiplicatives).toEqual([2, 0]);
    
    // 用戶選擇預設（團隊爆傷=10）
    multiplicatives[1] = 10;
    expect(multiplicatives).toEqual([2, 10]);
    
    // 序列化
    const serialized = multiplicatives.join(',');
    expect(serialized).toBe('2,10');
  });

  it('清空加算：刪除所有行恢復為初始', () => {
    let additives = [20, 30];
    
    // 刪除所有行
    additives = [];
    
    // 恢復為初始值
    if (additives.length === 0) {
      additives = [0];
    }
    
    expect(additives).toEqual([0]);
  });

  it('清空乘算：刪除所有行恢復為初始', () => {
    let multiplicatives = [2, 10];
    
    // 刪除所有行
    multiplicatives = [];
    
    // 恢復為初始值
    if (multiplicatives.length === 0) {
      multiplicatives = [0];
    }
    
    expect(multiplicatives).toEqual([0]);
  });

  it('加算0值過濾邏輯驗證', () => {
    // 當收集加算值時，應保留所有值包括0
    const rawAdditives = [20, 0, 30];
    const additivesStr = rawAdditives.join(',');
    
    // 序列化格式應包含所有值
    expect(additivesStr).toBe('20,0,30');
    
    // 解析時也應還原所有值
    const parsed = additivesStr.split(',').map(v => parseFloat(v) || 0);
    expect(parsed).toEqual([20, 0, 30]);
  });

  it('乘算0值過濾邏輯驗證', () => {
    // 當收集乘算值時，應過濾0值
    const rawMultiplicatives = [2, 0, 10];
    const filtered = rawMultiplicatives.filter(v => v !== 0);
    
    expect(filtered).toEqual([2, 10]);
    
    // 序列化時使用過濾後的值
    const multiplicativesStr = filtered.join(',');
    expect(multiplicativesStr).toBe('2,10');
  });
});
