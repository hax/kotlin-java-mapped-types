package kotlin

class Int : Comparable<Int> {
    override fun compareTo(other: Int): Int
    fun plus(other: Int): Int
    fun minus(other: Int): Int
    fun times(other: Int): Int
    fun div(other: Int): Int
    fun rem(other: Int): Int
    fun rangeTo(other: Int): IntRange
    fun toInt(): Int
    fun toByte(): Byte
    fun toShort(): Short
    fun toLong(): Long
    fun toFloat(): Float
    fun toDouble(): Double
    fun toChar(): Char
    override fun toString(): String
}
