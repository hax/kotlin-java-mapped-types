# Technical Documentation / 技术文档

[English](#english) | [中文](#chinese)

---

<a name="english"></a>
## English

### Architecture Overview

This project generates comprehensive documentation for Kotlin-Java type mappings by fetching type information from official documentation sources and analyzing member-to-member correspondences.

#### Core Components

1. **Fetching Layer** (`fetch-text.ts`): HTTP client with automatic caching via `make-fetch-happen`
2. **Extraction Layer** (`get-java-def.ts`, `get-kotlin-def.ts`): Parse HTML and source code to extract type definitions
3. **Analysis Layer** (`mappings.ts`): Parse definitions and calculate member mappings
4. **Generation Layer** (`cli/`): Orchestrate the process and generate output files

#### Workflow

```
1. Fetch mapped types list from kotlinlang.org
   ↓
2. For each type pair:
   - Fetch Java type HTML from developer.android.com
   - Fetch Kotlin type HTML from kotlinlang.org/api
   - Fetch Kotlin source code from GitHub (via kotlinlang.org reference)
   ↓
3. Extract type signatures from HTML/source
   ↓
4. Generate definition files (.java, .kt)
   ↓
5. Parse definition files to structured data
   ↓
6. Calculate member mappings between Java and Kotlin
   ↓
7. Generate mapped-types.md documentation
```

### Project Structure

```
.
├── lib/                          # TypeScript source files
│   ├── cli/                     # Command-line entry points
│   │   ├── gen-defs.ts          # Generate type definitions
│   │   ├── gen-mapped-types.ts  # Generate mapped-types.md
│   │   ├── calc-mappings.ts     # Calculate member mappings
│   │   ├── get-def.ts           # Get single type definition
│   │   └── get-mapped-types.ts  # Fetch mapped types list
│   ├── config.ts                # Path configuration
│   ├── utils.ts                 # Shared utilities
│   ├── fetch-text.ts            # HTTP fetch with caching
│   ├── get-java-def.ts          # Fetch and parse Java definitions
│   ├── get-kotlin-def.ts        # Fetch and parse Kotlin definitions
│   └── mappings.ts              # Parse and map type members
├── .cache/                      # HTTP cache (auto-generated)
├── .defs/                       # Generated type definitions
│   └── <java.type.Name>/
│       ├── def.java             # Java type definition
│       └── kotlin.Type.kt       # Kotlin type definition
└── mapped-types.md              # Generated documentation
```

### Data Flow

#### Phase 1: Type List Extraction

**Input**: Kotlin documentation URL  
**Process**: 
- Fetch HTML from `https://kotlinlang.org/docs/java-interop.html`
- Parse tables in the "Mapped Types" section
- Extract Java and Kotlin type names from table cells
- Qualify type names with full packages

**Output**: Array of `[java: string, kotlin: string]` tuples

#### Phase 2: Definition Generation

**For Java Types:**
- Fetch HTML from Android Developer documentation
- Extract `.api-signature` elements containing:
  - Class/interface declaration
  - Method signatures
  - Inheritance relationships
- Format as Java source with package and type declaration

**For Kotlin Types:**
- Fetch HTML from Kotlin API documentation
- Extract source link from documentation page
- Fetch source code from GitHub
- Extract type definition starting from documented line number
- Return source code segment (class declaration and members)

**Output**: Definition files in `.defs/` directory

#### Phase 3: Mapping Calculation

**Parsing:**
- Java definitions: Parse package, type declaration, modifiers, members
- Kotlin definitions: Parse package, type declaration, properties, functions
- Extract: name, kind (property/method/constructor), modifiers, type signature

**Mapping Algorithm:**

1. **Nullary Method to Property**: 
   - Java: `public T methodName()`
   - Kotlin: `val propertyName: T`
   - Match by name or accessor pattern (getter/setter)

2. **Accessor Pattern Recognition**:
   - `getMessage()` → `message`
   - `getName()` → `name`
   - `getCause()` → `cause`

3. **Collection Naming Conventions**:
   - `keySet()` → `keys`
   - `entrySet()` → `entries`
   - `values()` → `values`

4. **Special Operators**:
   - `charAt(int)` → `get(index: Int)` (operator function)
   - `remove(int)` → `removeAt(index: Int)`

5. **Conversion Methods**:
   - `byteValue()` → `toByte()`
   - `intValue()` → `toInt()`
   - Pattern: `*Value()` → `to*()`

#### Phase 4: Documentation Generation

**Format**: Markdown with hierarchical structure
- Type pair heading: `## java.type <-> kotlin.Type`
- Member mappings:
  ```
  - memberName
    `java signature`
    `kotlin signature`
  ```

### Implementation Details

#### URL Generation

**Kotlin Types:**
```typescript
// kotlin.collections.MutableMap
// → https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-mutable-map/

function kotlinDocUrl(packageName: string, typeName: string): string {
  const kebabNames = typeName.split('.')
    .map(name => name.replaceAll(/[A-Z]/g, m => '-' + m.toLowerCase()))
    .join('/');
  return `https://kotlinlang.org/api/core/kotlin-stdlib/${packageName}/${kebabNames}/`;
}
```

**Java Types:**
```typescript
// java.util.Map
// → https://developer.android.com/reference/java/util/Map

function androidDocUrl(packageName: string, typeName: string): string {
  const packagePath = packageName.replaceAll('.', '/');
  return `https://developer.android.com/reference/${packagePath}/${typeName}`;
}
```

#### Type Name Qualification

The project automatically qualifies short type names:

**Java:**
- Primitives: `int`, `byte`, etc. → unchanged
- `String`, `Iterable` → `java.lang.*`
- `List`, `Map`, etc. → `java.util.*`
- Arrays: `String[]` → `java.lang.String[]`

**Kotlin:**
- Collections: `List`, `MutableMap`, etc. → `kotlin.collections.*`
- Other: Must start with `kotlin.` prefix

#### Caching Strategy

Uses `make-fetch-happen` for transparent HTTP caching:

**Cache Behavior:**
- Default: Fetch from network, store in cache
- Offline mode (`--offline`): Only use cache, fail if missing
- Cache location: `.cache/` directory (configurable)
- Cache headers: Respects standard HTTP caching headers

**Benefits:**
- Reduced network requests during development
- Faster iteration cycles
- Reproducible builds (cache can be committed)
- CI/CD friendly (works offline after initial setup)

### Parsing Strategy

#### Java Definition Parsing

**Input Format:**
```java
// Source: <url>

package java.lang;

public final class String {
    public int length();
    public char charAt(int index);
}
```

**Parser Logic:**
1. Remove comments (`//` and `/* */`)
2. Extract package name from `package ...;`
3. Parse class/interface declaration with regex
4. Extract modifiers, kind, name, super types
5. Parse each member line:
   - Detect kind: constructor, method (ends with `)`), or property
   - Extract modifiers (public, static, final, etc.)
   - Extract return type
   - Extract method/property name
   - Extract parameters (for methods)

#### Kotlin Definition Parsing

**Input Format:**
```kotlin
// Source: <url>

package kotlin

class String {
    val length: Int
    operator fun get(index: Int): Char
}
```

**Parser Logic:**
1. Remove comments and empty lines
2. Filter out annotations (`@...`)
3. Extract package name
4. Parse class/interface declaration
5. Handle primary constructor in declaration
6. Remove nested type declarations (inner classes)
7. Parse each member:
   - Match pattern: `modifiers (val|var|fun|constructor) name type`
   - Extract modifiers (open, override, operator, etc.)
   - Determine kind: property (val/var), method (fun), constructor
   - Extract name and type signature

#### Member Signature Comparison

**TypeScript Representation (DTS-like):**
```typescript
// Java: public int length();
// → "public length(): int"

// Kotlin: val length: Int
// → "public length: Int"

function toDTS(member: ParsedMember): string {
  const mods = member.modifiers.join(' ') + ' ';
  if (member.kind === 'constructor') {
    return `${mods}constructor${member.type}`;
  } else {
    return `${mods}${member.name}${member.type}`;
  }
}
```

### Type Categories and Statistics

#### Total Coverage
- **Primitive Types**: 8 mappings
- **Common Types**: 4 mappings  
- **Interfaces**: 4 mappings
- **Read-only Collections**: 8 mappings
- **Mutable Collections**: 8 mappings

#### Mapping Patterns

**1. Direct Mappings** (same name, different syntax):
- `toString()` ↔ `toString()`
- `equals(Object)` ↔ `equals(other: Any?)`
- `hashCode()` ↔ `hashCode()`

**2. Property-Method Mappings**:
- Kotlin properties map to Java nullary methods
- Example: `length: Int` ↔ `length()`

**3. Operator Mappings**:
- Kotlin operators map to specific Java methods
- Example: `get(index)` ↔ `charAt(index)`

**4. Collection Convention Mappings**:
- Java uses method names, Kotlin uses properties
- Example: `keySet()` ↔ `keys`

**5. Type Hierarchy**:
- Read-only and mutable Kotlin collections map to same Java types
- Kotlin enforces read-only at compile time
- Java types include all methods (read and write)

#### Special Cases

**Cloneable**: Skipped in generation (see issue #21)

**Arrays**: Skipped (only have `length` property)

**Primitives**: Skipped (no members to map)

**Platform Types**: Kotlin uses `!` suffix for platform types (nullable unknown)
- `java.lang.String` ↔ `kotlin.String!`

**Read-only vs Mutable Collections**:
- Same Java type, different Kotlin types
- Example: `java.util.List` ↔ both `kotlin.collections.List` and `kotlin.collections.MutableList`
- Definitions differ: read-only shows only read operations, mutable shows all operations

### Error Handling

#### Network Failures
- Logged as errors with duration and URL
- Process continues with remaining types
- Returns `null` for failed fetches

#### Parse Failures
- Throws detailed error messages
- Indicates which part of parsing failed
- Includes context (file content, line, etc.)

#### Offline Mode
- Uses `only-if-cached` option for `make-fetch-happen`
- Fails fast if cache missing
- Ensures no network access when `--offline` flag is set

### Development Patterns

#### Modular Design
- Each module has single responsibility
- Clear separation between fetching, parsing, and generation
- Reusable utilities for common operations

#### Type Safety
- Full TypeScript typing throughout
- Interfaces for all data structures
- No `any` types in public APIs

#### Functional Approach
- Pure functions for parsing and transformation
- Side effects isolated to I/O boundaries
- Testable and predictable behavior

#### CLI Design
- Separate CLI scripts for each major operation
- Consistent `--offline` flag support
- Dry-run mode for testing (`--dry-run`)

### Future Enhancements

#### Possible Improvements

1. **Incremental Generation**: Track changes and only regenerate modified types
2. **Validation Tests**: Automated tests to verify mapping accuracy
3. **Alternative Output Formats**: JSON, YAML, or structured data formats
4. **Coverage Metrics**: Track which members are mapped vs unmapped
5. **Documentation Links**: Add direct links to official documentation for each member
6. **Type Hierarchy Visualization**: Generate diagrams showing inheritance relationships
7. **Interactive Explorer**: Web-based tool to browse mappings
8. **Parallel Processing**: Generate definitions concurrently for faster execution
9. **Diff Tool**: Compare mappings between Kotlin/Java versions

#### Known Limitations

1. **Generic Type Parameters**: Not fully analyzed (stripped from type names)
2. **Overloaded Methods**: All overloads shown, but not individually mapped
3. **Nested Types**: Limited support for inner classes
4. **Annotation Details**: Annotations are filtered out from parsing
5. **Default Parameters**: Kotlin default parameters not reflected in mappings
6. **Extension Functions**: Not included (not part of Java interop mappings)

### Use Cases

This documentation serves multiple purposes:

1. **Learning Resource**: Understand Kotlin-Java interoperability
2. **Reference Guide**: Look up specific type mappings when writing code
3. **Migration Tool**: Assist in converting Java code to Kotlin
4. **Teaching Material**: Educational resource for Kotlin courses
5. **API Documentation**: Comprehensive reference for library authors
6. **Code Generation**: Potential input for automated code generators

---

<a name="chinese"></a>
## 中文

### 架构概述

本项目通过从官方文档源获取类型信息并分析成员间的对应关系，生成 Kotlin-Java 类型映射的全面文档。

#### 核心组件

1. **获取层** (`fetch-text.ts`)：带自动缓存的 HTTP 客户端，使用 `make-fetch-happen`
2. **提取层** (`get-java-def.ts`, `get-kotlin-def.ts`)：解析 HTML 和源代码以提取类型定义
3. **分析层** (`mappings.ts`)：解析定义并计算成员映射
4. **生成层** (`cli/`)：编排流程并生成输出文件

#### 工作流程

```
1. 从 kotlinlang.org 获取映射类型列表
   ↓
2. 对每个类型对：
   - 从 developer.android.com 获取 Java 类型 HTML
   - 从 kotlinlang.org/api 获取 Kotlin 类型 HTML
   - 从 GitHub 获取 Kotlin 源代码（通过 kotlinlang.org 引用）
   ↓
3. 从 HTML/源代码提取类型签名
   ↓
4. 生成定义文件（.java, .kt）
   ↓
5. 将定义文件解析为结构化数据
   ↓
6. 计算 Java 和 Kotlin 之间的成员映射
   ↓
7. 生成 mapped-types.md 文档
```

### 项目结构

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

### 数据流

#### 阶段 1：类型列表提取

**输入**：Kotlin 文档 URL  
**处理**： 
- 从 `https://kotlinlang.org/docs/java-interop.html` 获取 HTML
- 解析"Mapped Types"部分的表格
- 从表格单元格提取 Java 和 Kotlin 类型名称
- 使用完整包名限定类型名称

**输出**：`[java: string, kotlin: string]` 元组数组

#### 阶段 2：定义生成

**对于 Java 类型：**
- 从 Android Developer 文档获取 HTML
- 提取包含以下内容的 `.api-signature` 元素：
  - 类/接口声明
  - 方法签名
  - 继承关系
- 格式化为带包和类型声明的 Java 源代码

**对于 Kotlin 类型：**
- 从 Kotlin API 文档获取 HTML
- 从文档页面提取源代码链接
- 从 GitHub 获取源代码
- 从文档指示的行号开始提取类型定义
- 返回源代码片段（类声明和成员）

**输出**：`.defs/` 目录中的定义文件

#### 阶段 3：映射计算

**解析：**
- Java 定义：解析包、类型声明、修饰符、成员
- Kotlin 定义：解析包、类型声明、属性、函数
- 提取：名称、类型（属性/方法/构造函数）、修饰符、类型签名

**映射算法：**

1. **无参方法到属性**： 
   - Java：`public T methodName()`
   - Kotlin：`val propertyName: T`
   - 按名称或访问器模式（getter/setter）匹配

2. **访问器模式识别**：
   - `getMessage()` → `message`
   - `getName()` → `name`
   - `getCause()` → `cause`

3. **集合命名约定**：
   - `keySet()` → `keys`
   - `entrySet()` → `entries`
   - `values()` → `values`

4. **特殊运算符**：
   - `charAt(int)` → `get(index: Int)`（运算符函数）
   - `remove(int)` → `removeAt(index: Int)`

5. **转换方法**：
   - `byteValue()` → `toByte()`
   - `intValue()` → `toInt()`
   - 模式：`*Value()` → `to*()`

#### 阶段 4：文档生成

**格式**：带层次结构的 Markdown
- 类型对标题：`## java.type <-> kotlin.Type`
- 成员映射：
  ```
  - memberName
    `java signature`
    `kotlin signature`
  ```

### 实现细节

#### URL 生成

**Kotlin 类型：**
```typescript
// kotlin.collections.MutableMap
// → https://kotlinlang.org/api/core/kotlin-stdlib/kotlin.collections/-mutable-map/

function kotlinDocUrl(packageName: string, typeName: string): string {
  const kebabNames = typeName.split('.')
    .map(name => name.replaceAll(/[A-Z]/g, m => '-' + m.toLowerCase()))
    .join('/');
  return `https://kotlinlang.org/api/core/kotlin-stdlib/${packageName}/${kebabNames}/`;
}
```

**Java 类型：**
```typescript
// java.util.Map
// → https://developer.android.com/reference/java/util/Map

function androidDocUrl(packageName: string, typeName: string): string {
  const packagePath = packageName.replaceAll('.', '/');
  return `https://developer.android.com/reference/${packagePath}/${typeName}`;
}
```

#### 类型名称限定

项目自动限定短类型名称：

**Java：**
- 基本类型：`int`、`byte` 等 → 不变
- `String`、`Iterable` → `java.lang.*`
- `List`、`Map` 等 → `java.util.*`
- 数组：`String[]` → `java.lang.String[]`

**Kotlin：**
- 集合：`List`、`MutableMap` 等 → `kotlin.collections.*`
- 其他：必须以 `kotlin.` 前缀开头

#### 缓存策略

使用 `make-fetch-happen` 进行透明 HTTP 缓存：

**缓存行为：**
- 默认：从网络获取，存储在缓存中
- 离线模式（`--offline`）：仅使用缓存，如果缺失则失败
- 缓存位置：`.cache/` 目录（可配置）
- 缓存头：遵循标准 HTTP 缓存头

**好处：**
- 减少开发期间的网络请求
- 更快的迭代周期
- 可重现的构建（缓存可提交）
- CI/CD 友好（初始设置后可离线工作）

### 解析策略

#### Java 定义解析

**输入格式：**
```java
// Source: <url>

package java.lang;

public final class String {
    public int length();
    public char charAt(int index);
}
```

**解析器逻辑：**
1. 删除注释（`//` 和 `/* */`）
2. 从 `package ...;` 提取包名
3. 使用正则表达式解析类/接口声明
4. 提取修饰符、类型、名称、超类型
5. 解析每个成员行：
   - 检测类型：构造函数、方法（以 `)` 结尾）或属性
   - 提取修饰符（public、static、final 等）
   - 提取返回类型
   - 提取方法/属性名称
   - 提取参数（对于方法）

#### Kotlin 定义解析

**输入格式：**
```kotlin
// Source: <url>

package kotlin

class String {
    val length: Int
    operator fun get(index: Int): Char
}
```

**解析器逻辑：**
1. 删除注释和空行
2. 过滤掉注解（`@...`）
3. 提取包名
4. 解析类/接口声明
5. 处理声明中的主构造函数
6. 删除嵌套类型声明（内部类）
7. 解析每个成员：
   - 匹配模式：`modifiers (val|var|fun|constructor) name type`
   - 提取修饰符（open、override、operator 等）
   - 确定类型：属性（val/var）、方法（fun）、构造函数
   - 提取名称和类型签名

#### 成员签名比较

**TypeScript 表示（类似 DTS）：**
```typescript
// Java: public int length();
// → "public length(): int"

// Kotlin: val length: Int
// → "public length: Int"

function toDTS(member: ParsedMember): string {
  const mods = member.modifiers.join(' ') + ' ';
  if (member.kind === 'constructor') {
    return `${mods}constructor${member.type}`;
  } else {
    return `${mods}${member.name}${member.type}`;
  }
}
```

### 类型类别和统计

#### 总覆盖范围
- **基本类型**：8 个映射
- **常用类型**：4 个映射  
- **接口**：4 个映射
- **只读集合**：8 个映射
- **可变集合**：8 个映射

#### 映射模式

**1. 直接映射**（相同名称，不同语法）：
- `toString()` ↔ `toString()`
- `equals(Object)` ↔ `equals(other: Any?)`
- `hashCode()` ↔ `hashCode()`

**2. 属性-方法映射**：
- Kotlin 属性映射到 Java 无参方法
- 示例：`length: Int` ↔ `length()`

**3. 运算符映射**：
- Kotlin 运算符映射到特定 Java 方法
- 示例：`get(index)` ↔ `charAt(index)`

**4. 集合约定映射**：
- Java 使用方法名，Kotlin 使用属性
- 示例：`keySet()` ↔ `keys`

**5. 类型层次结构**：
- 只读和可变 Kotlin 集合映射到相同 Java 类型
- Kotlin 在编译时强制只读
- Java 类型包括所有方法（读和写）

#### 特殊情况

**Cloneable**：在生成中跳过（参见问题 #21）

**数组**：跳过（仅有 `length` 属性）

**基本类型**：跳过（没有成员映射）

**平台类型**：Kotlin 对平台类型使用 `!` 后缀（可空性未知）
- `java.lang.String` ↔ `kotlin.String!`

**只读 vs 可变集合**：
- 相同 Java 类型，不同 Kotlin 类型
- 示例：`java.util.List` ↔ 既有 `kotlin.collections.List` 也有 `kotlin.collections.MutableList`
- 定义不同：只读仅显示读操作，可变显示所有操作

### 错误处理

#### 网络故障
- 记录带持续时间和 URL 的错误
- 继续处理剩余类型
- 对失败的获取返回 `null`

#### 解析故障
- 抛出详细错误消息
- 指示哪部分解析失败
- 包括上下文（文件内容、行等）

#### 离线模式
- 使用 `make-fetch-happen` 的 `only-if-cached` 选项
- 如果缓存缺失则快速失败
- 确保设置 `--offline` 标志时不访问网络

### 开发模式

#### 模块化设计
- 每个模块具有单一职责
- 获取、解析和生成之间清晰分离
- 常见操作的可重用工具

#### 类型安全
- 全面的 TypeScript 类型
- 所有数据结构的接口
- 公共 API 中没有 `any` 类型

#### 函数式方法
- 用于解析和转换的纯函数
- 将副作用隔离到 I/O 边界
- 可测试和可预测的行为

#### CLI 设计
- 为每个主要操作单独的 CLI 脚本
- 一致的 `--offline` 标志支持
- 用于测试的试运行模式（`--dry-run`）

### 未来增强

#### 可能的改进

1. **增量生成**：跟踪更改并仅重新生成修改的类型
2. **验证测试**：自动化测试以验证映射准确性
3. **替代输出格式**：JSON、YAML 或结构化数据格式
4. **覆盖率指标**：跟踪映射和未映射的成员
5. **文档链接**：为每个成员添加官方文档的直接链接
6. **类型层次结构可视化**：生成显示继承关系的图表
7. **交互式浏览器**：基于 Web 的工具浏览映射
8. **并行处理**：并发生成定义以加快执行
9. **差异工具**：比较 Kotlin/Java 版本之间的映射

#### 已知限制

1. **泛型类型参数**：未完全分析（从类型名称中剥离）
2. **重载方法**：显示所有重载，但未单独映射
3. **嵌套类型**：对内部类的有限支持
4. **注解详情**：注解从解析中过滤掉
5. **默认参数**：Kotlin 默认参数未反映在映射中
6. **扩展函数**：不包括（不是 Java 互操作映射的一部分）

### 用例

此文档服务于多个目的：

1. **学习资源**：理解 Kotlin-Java 互操作性
2. **参考指南**：编写代码时查找特定类型映射
3. **迁移工具**：协助将 Java 代码转换为 Kotlin
4. **教学材料**：Kotlin 课程的教育资源
5. **API 文档**：库作者的综合参考
6. **代码生成**：自动代码生成器的潜在输入
