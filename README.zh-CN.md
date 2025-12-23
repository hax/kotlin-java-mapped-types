# Kotlin-Java 映射类型

中文文档 | [English](README.md)

## 概述

本项目为 [Kotlin 文档](https://kotlinlang.org/docs/java-interop.html#mapped-types)中指定的 Kotlin 与 Java 之间的类型映射生成全面而精确的文档。生成的文档采用适合自动化处理的结构化格式，可被其他工具（如 IDE 插件或静态分析工具）以编程方式消费，并提供详细的成员间映射。

类型信息自动从官方文档获取：
- **Java 类型**: [Android 开发者文档](https://developer.android.com/reference/)
- **Kotlin 类型**: [Kotlin API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/)

## 快速开始

### 前置要求

- Node.js >= 24.0.0

### 安装

```bash
npm install
```

### 使用

```bash
# 生成所有映射类型文档（默认工作流程）
npm start

# 单独命令：
# 1. 获取映射类型列表
npm run get:mt

# 2. 为所有映射生成类型定义
npm run gen:defs

# 3. 生成带详细映射的 mapped-types.md
npm run gen:mt
```

**附加选项：**
- 使用 `--offline` 标志仅使用缓存内容（例如 `npm run get:mt -- --offline`）。
- 使用 `--dry-run` 标志预览操作而不写入文件。
- 所有 HTTP 请求自动缓存，首次获取后可离线操作。

## 工作原理

工具按以下步骤工作：

1. **获取映射类型列表**：从 Kotlin 文档获取
2. **生成类型定义**：从官方 Java 和 Kotlin 文档获取并提取签名
3. **计算成员映射**：分析定义并匹配对应成员
4. **输出文档**：生成带详细映射的 `mapped-types.md`

有关实现的更多技术细节，请参阅 [TECHNICAL.md](TECHNICAL.md)。

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

完整的映射类型列表及详细成员映射请参见 [mapped-types.md](mapped-types.md)。
