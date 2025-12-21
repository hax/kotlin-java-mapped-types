# Kotlin-Java 映射类型

使用 TypeScript/Node.js 为 Kotlin-Java 类型映射生成文档。

## 概述

本项目为 [Kotlin 文档](https://kotlinlang.org/docs/java-interop.html#mapped-types)中指定的 32 个 Kotlin 与 Java 之间的类型映射生成全面的文档。

项目使用**基于缓存的架构**：
1. **同步阶段**：从官方文档获取并缓存类型信息到 `doc-cache/` 目录
2. **生成阶段**：从缓存数据生成映射（可离线工作）

类型信息来源：
- **Java 类型**: [Android 开发者文档](https://developer.android.com/reference/)
- **Kotlin 类型**: [Kotlin API 参考](https://kotlinlang.org/api/core/kotlin-stdlib/)

所有文档都缓存在 `doc-cache/` 目录中并提交到仓库，使得 CI 环境中可以完全离线生成。

## 快速开始

### 前置要求

- Node.js >= 22.0.0 (支持原生 TypeScript)

### 安装

```bash
npm install
```

### 生成映射

```bash
# 步骤 1：从缓存数据生成映射（可离线，默认模式）
npm run generate

# 步骤 2（可选）：使用最新文档更新缓存（需要网络）
npm run sync

# 可选：在离线模式下验证缓存
npm run sync -- --offline

# 可选：仅从现有定义生成映射详情
npm run generate:mapping-details

# 可选：将所有映射聚合到 mapped-types.yaml
npm run generate:mapped-types
```

## 项目结构

```
.
├── lib/                          # TypeScript 源文件
│   ├── extract-mapped-types.ts  # 从 Kotlin 文档提取类型映射
│   ├── fetch-java-api.ts        # 从 Android 文档获取
│   ├── fetch-kotlin-api.ts      # 从 Kotlin 文档获取
│   ├── fetch-java-definition.ts # 生成 Java 定义
│   ├── fetch-kotlin-definition.ts # 生成 Kotlin 定义
│   ├── generate-mapping-details.ts # 创建签名映射
│   ├── generate-mapped-types-yaml.ts # 聚合所有映射
│   ├── generate-all.ts          # 主生成器（从 doc-cache 读取）
│   └── sync-resources.ts        # 同步脚本，获取并缓存数据
├── doc-cache/                    # 缓存的文档（提交到仓库）
│   ├── kotlin-doc.html          # 缓存的 Kotlin 互操作文档
│   ├── kotlin/                  # 缓存的 Kotlin 类型定义（HTML）
│   └── java/                    # 缓存的 Java 类型定义（HTML）
├── mappings/                     # 生成的映射目录
│   └── <kotlin类型>_to_<java类型>/
│       ├── java-definition.java     # 带签名的 Java 类型
│       ├── kotlin-definition.kt     # 带签名的 Kotlin 类型
│       └── mapping-details.yaml     # 签名到签名的映射
└── mapped-types.yaml             # 主映射列表（在根目录，从文档生成）
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

**同步阶段** (`npm run sync`):
1. **获取文档**：下载包含映射类型表的 Kotlin 文档页面
2. **提取映射类型**：解析文档提取 32 个类型映射并保存到根目录的 `mapped-types.yaml`
3. **获取类型定义**：对每个映射类型，从官方文档获取 Kotlin 和 Java 类型签名并缓存到 `doc-cache/kotlin/` 和 `doc-cache/java/`
4. **智能更新**：比较新内容与现有缓存文件，仅在有变化时更新
5. **离线模式**：使用 `--offline` 标志在无网络访问的情况下验证缓存

**生成阶段** (`npm run generate`):
1. **读取缓存数据**：从根目录的 `mapped-types.yaml` 加载类型映射
2. **解析缓存的 HTML**：从 `doc-cache/` 读取并解析缓存的 HTML 文件以提取类型信息
3. **生成定义**：在各个映射目录中创建格式化的类型定义文件
4. **比较签名**：解析定义并匹配语言间的签名
5. **生成映射**：创建记录签名到签名映射的 `mapping-details.yaml` 文件
6. **聚合**：将所有映射信息合并到主 `mapped-types.yaml`

这种基于缓存的架构允许在初始同步后完全离线地进行生成过程。缓存被提交到仓库，因此 CI 环境可以在无网络访问的情况下运行。

## 许可证

ISC
