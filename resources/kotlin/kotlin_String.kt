package kotlin

class String : Comparable<String>, CharSequence {
    override val length: Int
    override operator fun get(index: Int): Char
    fun substring(startIndex: Int): String
    fun substring(startIndex: Int, endIndex: Int): String
    override fun compareTo(other: String): Int
    fun equals(other: Any?): Boolean
    fun isEmpty(): Boolean
    fun isNotEmpty(): Boolean
    fun toLowerCase(): String
    fun toUpperCase(): String
    fun trim(): String
    fun replace(oldValue: String, newValue: String): String
    fun contains(other: CharSequence): Boolean
    fun startsWith(prefix: String): Boolean
    fun endsWith(suffix: String): Boolean
    fun indexOf(char: Char): Int
    fun indexOf(string: String): Int
    fun lastIndexOf(char: Char): Int
    fun split(delimiter: String): List<String>
    override fun toString(): String
}
