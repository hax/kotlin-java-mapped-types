package kotlin.collections

interface ListIterator : kotlin.collections.Iterator {
    fun hasNext() // method
    fun hasPrevious() // method
    fun next() // method
    fun nextIndex() // method
    fun previous() // method
    fun previousIndex() // method
}