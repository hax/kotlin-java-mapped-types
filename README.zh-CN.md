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

- Node.js >= 24.0.0 (支持原生 TypeScript)

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

# 可选：仅生成带详细映射的汇总文件
npm run generate:mapped-types-details
```

## 项目结构

```
.
├── lib/                          # TypeScript 源文件
│   ├── config.ts                # 路径配置
│   ├── utils.ts                 # 共享工具函数（URL 转换、类型信息提取）
│   ├── fetch-text.ts            # 带缓存的 HTTP 请求
│   ├── extract-mapped-types.ts  # 从 Kotlin 文档提取类型映射
│   ├── fetch-java-api.ts        # 从 HTML 提取 Java 签名
│   ├── fetch-kotlin-api.ts      # 从 HTML 提取 Kotlin 签名
│   ├── fetch-java-definition.ts # 生成 Java 定义
│   ├── fetch-kotlin-definition.ts # 生成 Kotlin 定义
│   ├── get-def-cli.ts           # 通过语言选项获取 Kotlin/Java 定义的 CLI
│   ├── generate-mapping-details.ts # 创建签名映射
│   ├── generate-mapped-types-details-yaml.ts # 生成带简化映射的汇总文件
│   ├── generate-all.ts          # 主生成器（从 doc-cache 读取）
│   └── sync-resources.ts        # 同步脚本，获取并缓存数据
├── doc-cache/                    # 缓存的文档（提交到仓库）
├── mappings/                     # 生成的映射目录
│   └── <kotlin类型>_to_<java类型>/
│       ├── java-definition.java     # 带签名和源 URL 的 Java 类型
│       └── kotlin-definition.kt     # 带签名和源 URL 的 Kotlin 类型
├── mapped-types.yaml             # 主映射列表（在根目录，从文档生成）
└── mapped-types-details.yaml     # 带简化映射列表的汇总文件
```

## 定义 CLI

手动获取定义可以使用：

```bash
node lib/get-def-cli.ts java java.lang.String
node lib/get-def-cli.ts kotlin kotlin.CharSequence
```

## 类型定义

类型定义通过从官方文档获取的完整方法/函数签名生成。

### Java 示例

```java
// Source: https://developer.android.com/reference/java/lang/String

package java.lang;

public final class String {
    public char charAt(int index);
    public int length();
    public String substring(int beginIndex);
}
```

### Kotlin 示例

```kotlin
// Source: https://kotlinlang.org/api/core/kotlin-stdlib/kotlin/-string/

package kotlin

class String {
    val length: Int
    operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
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

## 映射详情 YAML 文件

`mapped-types-details.yaml` 文件在 `mapped-types.yaml` 的基础上增加了 `mappings` 列表。通过解析定义文件并比较签名来生成方法/属性映射，仅显示简化的名称和参数名：

```yaml
mappings:
  - kotlin:
      kind: class
      name: kotlin.String
    java:
      kind: class
      name: java.lang.String
    mappings:
      - kotlin: length
        java: length()
      - kotlin: get(index)
        java: charAt(index)
      - kotlin: compareTo(other)
        java: compareTo(anotherString)
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
1. 获取包含映射类型表的 Kotlin 文档页面
2. 提取 32 个类型映射并保存到 `mapped-types.yaml`
3. 对每个类型，从官方文档获取 HTML 页面并缓存到 `doc-cache/`
4. 使用 `--offline` 标志在无网络访问的情况下验证缓存

**生成阶段** (`npm run generate`):
1. 从 `mapped-types.yaml` 加载类型映射
2. 对每组类型：
   - 从 `doc-cache/` 读取缓存的 HTML
   - 直接从 HTML 提取签名（Java: `.api-signature`，Kotlin: signature 元素）
   - 生成带源 URL 头的定义文件
3. 通过解析定义并创建简化映射来生成 `mapped-types-details.yaml`

这种基于缓存的架构允许完全离线生成。缓存被提交到仓库供 CI 环境使用。

## 许可证

ISC
