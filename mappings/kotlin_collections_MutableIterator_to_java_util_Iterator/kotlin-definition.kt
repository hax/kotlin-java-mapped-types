package kotlin.collections

interface MutableIterator : kotlin.collections.Iterator {
    fun hasNext() // method
    fun next() // method
    fun remove() // method
}