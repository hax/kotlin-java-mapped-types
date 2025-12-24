# 映射 Java 类型定义到 Kotlin 类型定义

类型定义以 **d.ts 格式**描述。详细的映射关系请参考：
- [Kotlin 官方映射文档](https://kotlinlang.org/docs/java-interop.html#mapped-types)
- [本项目生成的详细映射](mapped-types.md)

## 功能特性

- **类型映射**: 自动将 Java 类型映射到其 Kotlin 等价类型
  - 处理基本类型 (int → Int, boolean → Boolean 等)
  - 映射集合类型 (java.util.List → kotlin.collections.List)
  - 支持泛型类型参数
  - 可空类型 (X?) 在 d.ts 中表示为 ?X
  - 平台类型 (X!) 在 d.ts 中表示为 X

- **接口和父类映射**: 转换 `extends` 和 `implements` 子句

- **成员映射**: 根据映射规则转换方法和属性
  - getter/setter 方法映射到属性
  - 特定方法映射 (如集合类型的 keySet() → keys)
  - 根据继承关系应用超类型的映射规则

## 使用方法

### 命令行

```bash
# 映射单个 Java 类型
npm run map java.util.SortedMap

# 从 stdin 读取 Java 定义文件或 d.ts 文件
cat my-type.java | npm run map
cat my-type.d.ts | npm run map

# 或直接使用 node
node lib/cli/map-java-to-kotlin.ts java.util.ArrayList
cat my-type.java | node lib/cli/map-java-to-kotlin.ts
```

### 编程 API

```typescript
import { mapJavaToKotlin } from './lib/map-java-to-kotlin.ts';
import { getJavaDef } from './lib/get-java-def.ts';

// 获取 Java 定义
const javaDefContent = await getJavaDef('java.util.ArrayList');

// 映射到 d.ts
const result = await mapJavaToKotlin(javaDefContent);

console.log(result.dts);
console.log('应用的映射:', result.appliedMappings);
console.log('未映射的类型:', result.unmappedTypes);
```

## 示例

### 示例 1: java.util.ArrayList

**输入 (Java):**
```java
package java.util;

public class ArrayList<E> extends AbstractList<E> implements List<E> {
    public boolean add(E e);
    public E get(int index);
    public int size();
    public boolean isEmpty();
}
```

**输出 (d.ts):**
```typescript
// Package: java.util

class ArrayList<E> extends AbstractList<E> implements List<E> {
  public add(e: E): kotlin.Boolean
  public get(index: kotlin.Int): E
  public size(): kotlin.Int
  public isEmpty(): kotlin.Boolean
}
```

### 示例 2: 自定义类型继承映射类型

假设有一个自定义类继承 java.util.Map:

**输入 (Java):**
```java
package com.example;

public class MyMap<K, V> extends java.util.HashMap<K, V> {
    public V getValue(K key);
    public Set<K> keySet();
}
```

**输出 (d.ts，应用映射):**
```typescript
// Package: com.example

class MyMap<K, V> extends HashMap<K, V> {
  public getValue(key: K): V
  public keys: Set<K>  // keySet() 映射为属性
}
```

注意：`keySet()` 方法因为继承自 Map 而被映射为 `keys` 属性。

## 工作原理

1. **解析 Java 定义**: 提取包名、类型名、父类、接口和成员
2. **转换为 d.ts 格式**: 将 Java 语法转换为 TypeScript 声明格式
3. **加载类型映射**: 从 Kotlin 文档构建 Java 到 Kotlin 的类型映射表
4. **应用类型映射**: 
   - 转换类型名称（包括泛型参数）
   - 处理可空类型标记 (? 和 !)
5. **应用成员映射**:
   - 对于继承映射类型的类，检查超类型的映射规则
   - getter/setter 映射到属性
   - 应用特定的方法到属性映射
6. **生成 d.ts 定义**: 输出最终的 TypeScript 声明

## 限制

- **静态成员**: 在 d.ts 中保持为静态成员（不需要映射）
- **构造函数**: 在 d.ts 中保持原样（不需要映射）
- **未映射类型**: 不在官方映射列表中的类型保持原样
- **复杂泛型**: 深度嵌套的泛型可能需要手动调整

## 相关工具

- `npm run gen:defs`: 从文档生成类型定义
- `npm run calc:mappings`: 计算类型之间的成员映射
- `npm run gen:mt`: 生成 mapped-types.md 文档
