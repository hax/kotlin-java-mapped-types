package kotlin.collections

interface Set : kotlin.collections.Collection {
    val size: Any // property
    fun contains() // method
    fun containsAll() // method
    fun isEmpty() // method
    fun iterator() // method
}