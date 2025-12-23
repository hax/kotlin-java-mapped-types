# Kotlin-Java 映射类型

使用 TypeScript/Node.js 为 Kotlin-Java 类型映射生成文档。

中文文档 | [English](README.md)

## 概述

本项目为 [Kotlin 文档](https://kotlinlang.org/docs/java-interop.html#mapped-types)中指定的 Kotlin 与 Java 之间的类型映射生成全面的文档。

类型信息自动从官方文档获取并缓存：
- **Java 类型**: [Android 开发者文档](https://developer.android.com/reference/)
- **Kotlin 类型**: [Kotlin API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/)

项目使用自动 HTTP 缓存（通过 `make-fetch-happen`），在首次获取后可离线生成。

## 快速开始

### 前置要求

- Node.js >= 24.0.0 (支持原生 TypeScript)

### 安装

```bash
npm install
```

### 使用

```bash
# 生成所有映射类型文档（默认工作流程）
npm start

# 单独命令：
# 1. 获取映射类型列表（使用 --offline 标志仅使用缓存）
npm run get:mt

# 2. 为所有映射生成类型定义
npm run gen:defs

# 3. 生成带详细映射的 mapped-types.md
npm run gen:mt

# 4. 将 Java 类型定义转换为 Kotlin（新功能！）
npm run convert java.util.SortedMap
```

## Java 到 Kotlin 转换器

本项目现在包含一个工具，可以根据映射关系将 Java 类型定义转换为 Kotlin 定义。详细文档请参阅 [CONVERTER.md](CONVERTER.md)。

**快速示例：**
```bash
# 将 java.util.Map 转换为 Kotlin
npm run convert java.util.Map
```

转换器自动完成：
- 转换类型名称（java.util.Map → kotlin.collections.MutableMap）
- 转换接口和父类
- 将方法转换为 Kotlin 语法
- 在适当的地方将 Java 方法映射到 Kotlin 属性（例如 `keySet()` → `keys`）


## 项目结构

```
.
├── lib/                          # TypeScript 源文件
│   ├── cli/                     # 命令行入口
│   │   ├── gen-defs.ts          # 生成类型定义
│   │   ├── gen-mapped-types.ts  # 生成 mapped-types.md
│   │   ├── calc-mappings.ts     # 计算成员映射
│   │   ├── get-def.ts           # 获取单个类型定义
│   │   └── get-mapped-types.ts  # 获取映射类型列表
│   ├── config.ts                # 路径配置
│   ├── utils.ts                 # 共享工具函数
│   ├── fetch-text.ts            # 带缓存的 HTTP 请求
│   ├── get-java-def.ts          # 获取并解析 Java 定义
│   ├── get-kotlin-def.ts        # 获取并解析 Kotlin 定义
│   └── mappings.ts              # 解析和映射类型成员
├── .cache/                      # HTTP 缓存（自动生成）
├── .defs/                       # 生成的类型定义
│   └── <java.type.Name>/
│       ├── def.java             # Java 类型定义
│       └── kotlin.Type.kt       # Kotlin 类型定义
└── mapped-types.md              # 生成的文档
```

## 工作原理

1. **获取映射类型**：从 [Kotlin 文档](https://kotlinlang.org/docs/java-interop.html#mapped-types)提取类型映射列表
2. **生成定义**：对每个类型对：
   - 从 Android Developer 和 Kotlin API 文档获取 HTML
   - 直接从 HTML 提取类型签名
   - 生成带源 URL 头的定义文件
3. **计算映射**：解析定义文件并匹配 Java 和 Kotlin 之间对应的成员
4. **输出文档**：生成带详细成员映射的 `mapped-types.md`

所有 HTTP 请求使用 `make-fetch-happen` 自动缓存，在首次获取后可离线操作。使用 `--offline` 标志确保不访问网络。

## 示例输出

类型定义包含从官方文档提取的完整签名：

### Java 定义
```java
// Source: https://developer.android.com/reference/java/lang/String

package java.lang;

public final class String {
    public int length();
    public char charAt(int index);
    public String substring(int beginIndex);
}
```

### Kotlin 定义
```kotlin
// Source: https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/

package kotlin

class String {
    val length: Int
    operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
}
```

### 映射类型文档

生成的 `mapped-types.md` 展示成员间的映射：

```markdown
## java.lang.String <-> kotlin.String!
- length
  `public length(): int`
  `public override length: Int`
- charAt
  `public charAt(int index): char`
  `public override get(index: Int): Char`
```

## 映射类型

项目涵盖 Kotlin 官方文档中指定的所有 Kotlin 与 Java 之间的类型映射：

### 基本类型
- `kotlin.Byte` ↔ `java.lang.Byte`
- `kotlin.Short` ↔ `java.lang.Short`
- `kotlin.Int` ↔ `java.lang.Integer`
- `kotlin.Long` ↔ `java.lang.Long`
- `kotlin.Char` ↔ `java.lang.Character`
- `kotlin.Float` ↔ `java.lang.Float`
- `kotlin.Double` ↔ `java.lang.Double`
- `kotlin.Boolean` ↔ `java.lang.Boolean`

### 常用类型
- `kotlin.Any` ↔ `java.lang.Object`
- `kotlin.String` ↔ `java.lang.String`
- `kotlin.CharSequence` ↔ `java.lang.CharSequence`
- `kotlin.Throwable` ↔ `java.lang.Throwable`

### 接口
- `kotlin.Cloneable` ↔ `java.lang.Cloneable`
- `kotlin.Comparable` ↔ `java.lang.Comparable`
- `kotlin.Enum` ↔ `java.lang.Enum`
- `kotlin.Annotation` ↔ `java.lang.annotation.Annotation`

### 只读集合
- `kotlin.collections.Iterator` ↔ `java.util.Iterator`
- `kotlin.collections.Iterable` ↔ `java.lang.Iterable`
- `kotlin.collections.Collection` ↔ `java.util.Collection`
- `kotlin.collections.Set` ↔ `java.util.Set`
- `kotlin.collections.List` ↔ `java.util.List`
- `kotlin.collections.ListIterator` ↔ `java.util.ListIterator`
- `kotlin.collections.Map` ↔ `java.util.Map`
- `kotlin.collections.Map.Entry` ↔ `java.util.Map.Entry`

### 可变集合
- `kotlin.collections.MutableIterator` ↔ `java.util.Iterator`
- `kotlin.collections.MutableIterable` ↔ `java.lang.Iterable`
- `kotlin.collections.MutableCollection` ↔ `java.util.Collection`
- `kotlin.collections.MutableSet` ↔ `java.util.Set`
- `kotlin.collections.MutableList` ↔ `java.util.List`
- `kotlin.collections.MutableListIterator` ↔ `java.util.ListIterator`
- `kotlin.collections.MutableMap` ↔ `java.util.Map`
- `kotlin.collections.MutableMap.MutableEntry` ↔ `java.util.Map.Entry`

## 技术细节

### 缓存策略

项目使用 `make-fetch-happen` 进行 HTTP 缓存：
- 首次获取下载并缓存内容到 `.cache/`
- 后续运行自动使用缓存内容
- 使用 `--offline` 标志强制仅使用缓存模式（如果缓存缺失则失败）
- 缓存可提交到仓库供 CI/CD 环境使用

### 定义提取

**Java 类型**：从 Android Developer 文档 HTML 解析 `.api-signature` 元素。

**Kotlin 类型**：
1. 解析 Kotlin API 文档 HTML 查找源代码链接
2. 从 GitHub 获取源代码
3. 从文档指示的行开始提取类型定义

### 成员映射算法

映射算法比较 Java 和 Kotlin 成员以识别对应的功能：

1. **属性到 Getter**：Kotlin 属性映射到 Java getter 方法（例如 `length` → `length()`）
2. **访问器方法**：Java 访问器映射到 Kotlin 属性（例如 `getMessage()` → `message`）
3. **特殊情况**：运算符函数映射到特定方法（例如 `get(index)` → `charAt(index)`）
4. **集合属性**：集合的特殊映射（例如 `keySet()` → `keys`，`entrySet()` → `entries`）
5. **转换方法**：Java 的 `*Value()` 方法映射到 Kotlin 的 `to*()` 函数

## 许可证

ISC
