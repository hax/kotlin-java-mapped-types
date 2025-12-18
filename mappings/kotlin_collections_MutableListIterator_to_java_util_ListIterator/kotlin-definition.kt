package kotlin.collections

interface MutableListIterator : kotlin.collections.ListIterator {
    fun add() // method
    fun hasNext() // method
    fun hasPrevious() // method
    fun next() // method
    fun nextIndex() // method
    fun previous() // method
    fun previousIndex() // method
    fun remove() // method
    fun set() // method
}