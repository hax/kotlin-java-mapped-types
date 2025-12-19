# Kotlin-Java 映射类型

使用 TypeScript/Node.js 为 Kotlin-Java 类型映射生成文档。

## 概述

本项目为 [Kotlin 文档](https://kotlinlang.org/docs/java-interop.html#mapped-types)中指定的 32 个 Kotlin 与 Java 之间的类型映射生成全面的文档。

类型信息直接从官方 API 文档获取：
- **Java 类型**: [Android 开发者文档](https://developer.android.com/reference/)
- **Kotlin 类型**: [Kotlin API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/)

## 快速开始

### 前置要求

- Node.js >= 22.0.0 (支持原生 TypeScript)

### 安装

```bash
npm install
```

### 生成映射

```bash
# 生成所有类型映射
npm run generate

# 仅从现有定义生成映射详情
npm run generate:mapping-details

# 将所有映射聚合到 mapped-types.yaml
npm run generate:mapped-types
```

## 项目结构

```
.
├── lib/                          # TypeScript 源文件
│   ├── extract-mapped-types.ts  # 从 Kotlin 文档提取映射
│   ├── fetch-java-api.ts        # 从 Android 文档获取
│   ├── fetch-kotlin-api.ts      # 从 Kotlin 文档获取
│   ├── fetch-java-definition.ts # 生成 Java 定义
│   ├── fetch-kotlin-definition.ts # 生成 Kotlin 定义
│   ├── generate-mapping-details.ts # 创建签名映射
│   ├── generate-mapped-types-yaml.ts # 聚合所有映射
│   └── generate-all.ts          # 主协调器
├── mappings/                     # 生成的映射目录
│   └── <kotlin类型>_to_<java类型>/
│       ├── java-definition.java     # 带签名的 Java 类型
│       ├── kotlin-definition.kt     # 带签名的 Kotlin 类型
│       └── mapping-details.yaml     # 签名到签名的映射
└── mapped-types.yaml             # 主映射文件（生成）
```

## 类型定义

类型定义通过从官方文档获取的完整方法/函数签名生成。

### Java 示例

```java
package java.lang;

public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    public char charAt(int index);
    public int length();
    public String substring(int beginIndex);
    // ...
}
```

### Kotlin 示例

```kotlin
package kotlin

class String : Comparable<String>, CharSequence {
    val length: Int
    operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
    // ...
}
```

## 映射详情

映射使用直接的签名到签名比较：

```yaml
- kotlin: "val length: Int"
  java: public int length()
- kotlin: "operator fun get(index: Int): Char"
  java: public char charAt(int index)
```

## 主 YAML 文件

`mapped-types.yaml` 文件聚合所有映射，仅包含类型和名称：

```yaml
mappings:
  - kotlin:
      kind: class
      name: kotlin.String
    java:
      kind: class
      name: java.lang.String
```

## 映射类型

项目涵盖 32 个类型映射：

- **基本类型** (8): Byte, Short, Int, Long, Char, Float, Double, Boolean
- **常用类型** (4): Any, String, CharSequence, Throwable
- **接口** (4): Cloneable, Comparable, Enum, Annotation
- **只读集合** (8): Iterator, Iterable, Collection, Set, List, ListIterator, Map, Map.Entry
- **可变集合** (8): MutableIterator, MutableIterable, MutableCollection, MutableSet, MutableList, MutableListIterator, MutableMap, MutableMap.MutableEntry

## 工作原理

1. **提取映射类型**：首先，从官方 Kotlin 文档 https://kotlinlang.org/docs/java-interop.html 提取类型映射列表
2. **获取类型信息**：脚本从官方 Android 和 Kotlin API 文档获取类型签名
3. **生成定义**：创建带完整签名的 Java 和 Kotlin 定义文件
4. **比较签名**：解析定义并匹配语言间的签名
5. **生成映射**：创建记录映射的 YAML 文件
6. **聚合**：将所有映射信息合并到 `mapped-types.yaml`

## 许可证

ISC
