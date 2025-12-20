# Kotlin-Java 映射类型

使用 TypeScript/Node.js 为 Kotlin-Java 类型映射生成文档。

## 概述

本项目为 [Kotlin 文档](https://kotlinlang.org/docs/java-interop.html#mapped-types)中指定的 32 个 Kotlin 与 Java 之间的类型映射生成全面的文档。

项目使用**两阶段架构**：
1. **同步阶段**：从官方文档获取并缓存类型信息
2. **生成阶段**：从缓存数据生成映射（可离线工作）

类型信息来源：
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
# 步骤 1：同步数据源（需要网络访问）
# 获取 Kotlin 文档和类型定义，缓存到 resources/ 目录
npm run sync

# 步骤 2：生成映射（可离线使用缓存数据）
npm run generate

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
│   ├── generate-all.ts          # 主生成器（从 resources 读取）
│   └── sync-resources.ts        # 同步脚本，获取并缓存数据
├── resources/                    # 缓存的数据源
│   ├── mapped-types.yaml        # 所有映射类型列表
│   ├── kotlin/                  # 缓存的 Kotlin 类型定义
│   └── java/                    # 缓存的 Java 类型定义
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

**同步阶段** (`npm run sync`):
1. **获取文档**：使用 HTTP 缓存下载包含映射类型表的 Kotlin 文档页面
2. **提取映射类型**：解析文档提取 32 个类型映射并保存到 `resources/mapped-types.yaml`
3. **获取类型定义**：对每个映射类型，从官方文档获取 Kotlin 和 Java 类型签名，自动使用 HTTP 缓存（If-Modified-Since、ETag）
4. **智能缓存**：使用符合 RFC 7234 的 HTTP 缓存机制，避免重新下载未更改的资源，显著提高后续同步的性能

**生成阶段** (`npm run generate`):
1. **读取缓存数据**：从 `resources/mapped-types.yaml` 加载类型映射
2. **生成定义**：将缓存的定义文件复制到各个映射目录
3. **比较签名**：解析定义并匹配语言间的签名
4. **生成映射**：创建记录签名到签名映射的 `mapping-details.yaml` 文件
5. **聚合**：将所有映射信息合并到主 `mapped-types.yaml`

这种两阶段架构允许在初始同步后完全离线地进行生成过程。HTTP 缓存层确保后续同步仅下载远程服务器上实际更改的资源。

## HTTP 缓存

项目使用 [`make-fetch-happen`](https://github.com/npm/make-fetch-happen) 进行智能 HTTP 缓存：
- **自动缓存头**：支持 If-Modified-Since 和 ETag 头
- **RFC 7234 合规**：符合行业标准的 HTTP 缓存语义
- **重试逻辑**：自动重试瞬时网络故障
- **基于磁盘的存储**：在系统临时目录中缓存响应
- **性能提升**：显著减少网络调用和未更改资源的同步时间

## 许可证

ISC
