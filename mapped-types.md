# Mapped Types

## byte <-> kotlin.Byte

## short <-> kotlin.Short

## int <-> kotlin.Int

## long <-> kotlin.Long

## char <-> kotlin.Char

## float <-> kotlin.Float

## double <-> kotlin.Double

## boolean <-> kotlin.Boolean

## java.lang.Object <-> kotlin.Any!

## java.lang.Cloneable <-> kotlin.Cloneable!

## java.lang.Comparable <-> kotlin.Comparable!

## java.lang.Enum <-> kotlin.Enum!
- name
  `public final name(): String`
  `public final name: String`
- ordinal
  `public final ordinal(): int`
  `public final ordinal: Int`

## java.lang.annotation.Annotation <-> kotlin.Annotation!

## java.lang.CharSequence <-> kotlin.CharSequence!
- length
  `public abstract length(): int`
  `public length: Int`
- charAt
  `public abstract charAt(int index): char`
  `public operator get(index: Int): Char`

## java.lang.String <-> kotlin.String!
- length
  `public length(): int`
  `public override length: Int`
- charAt
  `public charAt(int index): char`
  `public override get(index: Int): Char`

## java.lang.Number <-> kotlin.Number!
- byteValue
  `public byteValue(): byte`
  `public abstract toByte(): Byte`
- doubleValue
  `public abstract doubleValue(): double`
  `public abstract toDouble(): Double`
- floatValue
  `public abstract floatValue(): float`
  `public abstract toFloat(): Float`
- intValue
  `public abstract intValue(): int`
  `public abstract toInt(): Int`
- longValue
  `public abstract longValue(): long`
  `public abstract toLong(): Long`
- shortValue
  `public shortValue(): short`
  `public abstract toShort(): Short`

## java.lang.Throwable <-> kotlin.Throwable!
- getCause
  `public getCause(): Throwable`
  `public open cause: Throwable?`
- getMessage
  `public getMessage(): String`
  `public open message: String?`

## java.lang.Byte <-> kotlin.Byte?
- byteValue
  `public byteValue(): byte`
  `public override toByte(): Byte`
- doubleValue
  `public doubleValue(): double`
  `public override toDouble(): Double`
- floatValue
  `public floatValue(): float`
  `public override toFloat(): Float`
- intValue
  `public intValue(): int`
  `public override toInt(): Int`
- longValue
  `public longValue(): long`
  `public override toLong(): Long`
- shortValue
  `public shortValue(): short`
  `public override toShort(): Short`

## java.lang.Short <-> kotlin.Short?
- byteValue
  `public byteValue(): byte`
  `public override toByte(): Byte`
- doubleValue
  `public doubleValue(): double`
  `public override toDouble(): Double`
- floatValue
  `public floatValue(): float`
  `public override toFloat(): Float`
- intValue
  `public intValue(): int`
  `public override toInt(): Int`
- longValue
  `public longValue(): long`
  `public override toLong(): Long`
- shortValue
  `public shortValue(): short`
  `public override toShort(): Short`

## java.lang.Integer <-> kotlin.Int?
- byteValue
  `public byteValue(): byte`
  `public override toByte(): Byte`
- doubleValue
  `public doubleValue(): double`
  `public override toDouble(): Double`
- floatValue
  `public floatValue(): float`
  `public override toFloat(): Float`
- intValue
  `public intValue(): int`
  `public override toInt(): Int`
- longValue
  `public longValue(): long`
  `public override toLong(): Long`
- shortValue
  `public shortValue(): short`
  `public override toShort(): Short`

## java.lang.Long <-> kotlin.Long?
- byteValue
  `public byteValue(): byte`
  `public override toByte(): Byte`
- doubleValue
  `public doubleValue(): double`
  `public override toDouble(): Double`
- floatValue
  `public floatValue(): float`
  `public override toFloat(): Float`
- intValue
  `public intValue(): int`
  `public override toInt(): Int`
- longValue
  `public longValue(): long`
  `public override toLong(): Long`
- shortValue
  `public shortValue(): short`
  `public override toShort(): Short`

## java.lang.Character <-> kotlin.Char?
- charValue
  `public charValue(): char`
  `public toChar(): Char`

## java.lang.Float <-> kotlin.Float?
- byteValue
  `public byteValue(): byte`
  `public override toByte(): Byte`
- doubleValue
  `public doubleValue(): double`
  `public override toDouble(): Double`
- floatValue
  `public floatValue(): float`
  `public override toFloat(): Float`
- intValue
  `public intValue(): int`
  `public override toInt(): Int`
- longValue
  `public longValue(): long`
  `public override toLong(): Long`
- shortValue
  `public shortValue(): short`
  `public override toShort(): Short`

## java.lang.Double <-> kotlin.Double?
- byteValue
  `public byteValue(): byte`
  `public override toByte(): Byte`
- doubleValue
  `public doubleValue(): double`
  `public override toDouble(): Double`
- floatValue
  `public floatValue(): float`
  `public override toFloat(): Float`
- intValue
  `public intValue(): int`
  `public override toInt(): Int`
- longValue
  `public longValue(): long`
  `public override toLong(): Long`
- shortValue
  `public shortValue(): short`
  `public override toShort(): Short`

## java.lang.Boolean <-> kotlin.Boolean?

## java.util.Iterator<T> <-> kotlin.collections.Iterator<T>

## java.util.Iterator<T> <-> kotlin.collections.MutableIterator<T>

## java.lang.Iterable<T> <-> kotlin.collections.Iterable<T>

## java.lang.Iterable<T> <-> kotlin.collections.MutableIterable<T>

## java.util.Collection<T> <-> kotlin.collections.Collection<T>
- size
  `public abstract size(): int`
  `public size: Int`

## java.util.Collection<T> <-> kotlin.collections.MutableCollection<T>

## java.util.Set<T> <-> kotlin.collections.Set<T>
- size
  `public abstract size(): int`
  `override size: Int`

## java.util.Set<T> <-> kotlin.collections.MutableSet<T>

## java.util.List<T> <-> kotlin.collections.List<T>
- size
  `public abstract size(): int`
  `override size: Int`

## java.util.List<T> <-> kotlin.collections.MutableList<T>

## java.util.ListIterator<T> <-> kotlin.collections.ListIterator<T>
- size
  `public abstract size(): int`
  `override size: Int`

## java.util.ListIterator<T> <-> kotlin.collections.MutableListIterator<T>

## java.util.Map<K, V> <-> kotlin.collections.Map<K, V>
- entrySet
  `public abstract entrySet(): Set<Entry<K, V>>`
  `public entries: Set<Map.Entry<K, V>>`
- keySet
  `public abstract keySet(): Set<K>`
  `public keys: Set<K>`
- size
  `public abstract size(): int`
  `public size: Int`
- values
  `public abstract values(): Collection<V>`
  `public values: Collection<V>`

## java.util.Map<K, V> <-> kotlin.collections.MutableMap<K, V>
- entrySet
  `public abstract entrySet(): Set<Entry<K, V>>`
  `public override entries: MutableSet<MutableMap.MutableEntry<K, V>>`
- keySet
  `public abstract keySet(): Set<K>`
  `public override keys: MutableSet<K>`
- values
  `public abstract values(): Collection<V>`
  `public override values: MutableCollection<V>`

## java.util.Map.Entry<K, V> <-> kotlin.collections.Map.Entry<K, V>
- entrySet
  `public abstract entrySet(): Set<Entry<K, V>>`
  `public entries: Set<Map.Entry<K, V>>`
- keySet
  `public abstract keySet(): Set<K>`
  `public keys: Set<K>`
- size
  `public abstract size(): int`
  `public size: Int`
- values
  `public abstract values(): Collection<V>`
  `public values: Collection<V>`

## java.util.Map.Entry<K, V> <-> kotlin.collections.MutableMap.MutableEntry<K,V>
- entrySet
  `public abstract entrySet(): Set<Entry<K, V>>`
  `public override entries: MutableSet<MutableMap.MutableEntry<K, V>>`
- keySet
  `public abstract keySet(): Set<K>`
  `public override keys: MutableSet<K>`
- values
  `public abstract values(): Collection<V>`
  `public override values: MutableCollection<V>`

## int[] <-> kotlin.IntArray!

## java.lang.String[] <-> kotlin.Array<(out) String!>!

## java.util.SortedMap<K, V> <-> kotlin.collections.MutableMap<K, V>
- entrySet
  `public abstract entrySet(): Set<Entry<K, V>>`
  `public override entries: MutableSet<MutableMap.MutableEntry<K, V>>`
- keySet
  `public abstract keySet(): Set<K>`
  `public override keys: MutableSet<K>`
- values
  `public abstract values(): Collection<V>`
  `public override values: MutableCollection<V>`

## java.util.SortedSet<E> <-> kotlin.collections.MutableSet<E>
