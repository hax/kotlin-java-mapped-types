package kotlin.collections

interface MutableList : kotlin.collections.MutableCollection {
    val size: Any // property
    fun add() // method
    fun addAll() // method
    fun clear() // method
    fun contains() // method
    fun containsAll() // method
    fun get() // method
    fun indexOf() // method
    fun isEmpty() // method
    fun iterator() // method
    fun lastIndexOf() // method
    fun listIterator() // method
    fun remove() // method
    fun removeAll() // method
    fun removeAt() // method
    fun retainAll() // method
    fun set() // method
    fun subList() // method
}