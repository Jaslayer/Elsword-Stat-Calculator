/**
 * ID Manager 验证脚本 - 测试 ID 生成和管理功能
 */

// 导入 IdManager
import IdManager from '../src/id-manager.js';

console.log('=== ID Manager 验证测试 ===\n');

// 测试 1: 生成统计项目 ID
console.log('✓ 测试 1: 生成统计项目 ID');
const leftId = IdManager.stat.leftId(0);
const middleId = IdManager.stat.middleId(2);
const resultId = IdManager.stat.resultId(5);
console.log(`  - stat-0-left: ${leftId}`);
console.log(`  - stat-2-middle: ${middleId}`);
console.log(`  - stat-5-result: ${resultId}`);
console.log(`  状态: ${leftId === 'stat-0-left' && middleId === 'stat-2-middle' && resultId === 'stat-5-result' ? '✅ 通过' : '❌ 失败'}\n`);

// 测试 2: 生成对话框 ID
console.log('✓ 测试 2: 生成对话框 ID');
const timestamp = 1721968234567;
const additiveId = IdManager.dialog.additiveInputId(timestamp);
const multiplicativeId = IdManager.dialog.multiplicativeInputId(timestamp);
console.log(`  - dialog-additive-${timestamp}: ${additiveId}`);
console.log(`  - dialog-multiplicative-${timestamp}: ${multiplicativeId}`);
console.log(`  状态: ${additiveId === `dialog-additive-${timestamp}` ? '✅ 通过' : '❌ 失败'}\n`);

// 测试 3: 验证 ID 格式
console.log('✓ 测试 3: 验证 ID 格式');
const isValidLeft = IdManager.patterns.isStatLeftInput('stat-0-left');
const isValidResult = IdManager.patterns.isStatResultInput('stat-2-result');
const isValidAdditive = IdManager.patterns.extractAdditiveIndex(`dialog-additive-${timestamp}`);
console.log(`  - stat-0-left 有效: ${isValidLeft}`);
console.log(`  - stat-2-result 有效: ${isValidResult}`);
console.log(`  - 提取加成索引: ${isValidAdditive}`);
console.log(`  状态: ${isValidLeft && isValidResult && isValidAdditive ? '✅ 通过' : '❌ 失败'}\n`);

// 测试 4: 提取索引
console.log('✓ 测试 4: 从 ID 中提取索引');
const extractedIndex = IdManager.patterns.extractStatIndex('stat-7-left');
console.log(`  - 从 stat-7-left 提取索引: ${extractedIndex}`);
console.log(`  状态: ${extractedIndex === 7 ? '✅ 通过' : '❌ 失败'}\n`);

// 测试 5: 序列化
console.log('✓ 测试 5: 序列化 ID 配置');
const serialized = IdManager.serialize();
const parsed = JSON.parse(serialized);
console.log(`  - 序列化成功: ${serialized.length} 字符`);
console.log(`  - 包含 stat 配置: ${parsed.stat ? '✅' : '❌'}`);
console.log(`  - 包含 dialog 配置: ${parsed.dialog ? '✅' : '❌'}`);
console.log(`  - 包含 containers: ${parsed.containers ? '✅' : '❌'}`);
console.log(`  状态: ${parsed.stat && parsed.dialog && parsed.containers ? '✅ 通过' : '❌ 失败'}\n`);

// 测试 6: 反序列化
console.log('✓ 测试 6: 反序列化 ID 配置');
const deserialized = IdManager.deserialize(serialized);
console.log(`  - 反序列化成功: ${deserialized !== null ? '✅' : '❌'}`);
console.log(`  - 恢复 stat.pattern: ${deserialized.stat.pattern}`);
console.log(`  状态: ${deserialized && deserialized.stat.pattern === 'stat-{index}-{type}' ? '✅ 通过' : '❌ 失败'}\n`);

// 测试 7: 验证函数
console.log('✓ 测试 7: ID 验证函数');
const valid1 = IdManager.isValidId('stat-0-left', 'stat-left');
const valid2 = IdManager.isValidId('stat-2-middle', 'stat-middle');
const valid3 = IdManager.isValidId(`dialog-additive-${timestamp}`, 'additive');
console.log(`  - stat-0-left (stat-left): ${valid1 ? '✅' : '❌'}`);
console.log(`  - stat-2-middle (stat-middle): ${valid2 ? '✅' : '❌'}`);
console.log(`  - dialog-additive-{timestamp} (additive): ${valid3 ? '✅' : '❌'}`);
console.log(`  状态: ${valid1 && valid2 && valid3 ? '✅ 通过' : '❌ 失败'}\n`);

// 测试 8: 摘要信息
console.log('✓ 测试 8: 获取摘要信息');
const summary = IdManager.getSummary();
console.log(`  - 描述: ${summary.description}`);
console.log(`  - 版本: ${summary.version}`);
console.log(`  - 可序列化: ${summary.serializable ? '✅' : '❌'}`);
console.log(`  状态: ${summary.version === '1.0' && summary.serializable ? '✅ 通过' : '❌ 失败'}\n`);

console.log('=== 所有测试完成 ===');
