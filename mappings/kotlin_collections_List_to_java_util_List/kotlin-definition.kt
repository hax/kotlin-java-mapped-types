package kotlin.collections

interface List : kotlin.collections.Collection {
    val size: Any // property
    fun contains() // method
    fun containsAll() // method
    fun get() // method
    fun indexOf() // method
    fun isEmpty() // method
    fun iterator() // method
    fun lastIndexOf() // method
    fun listIterator() // method
    fun subList() // method
}