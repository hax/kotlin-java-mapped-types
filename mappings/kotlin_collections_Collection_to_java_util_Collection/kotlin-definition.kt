package kotlin.collections

interface Collection : kotlin.collections.Iterable {
    val size: Any // property
    fun contains() // method
    fun containsAll() // method
    fun isEmpty() // method
    fun iterator() // method
}