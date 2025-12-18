// Kotlin type definition
// This shows only the methods and properties available in Kotlin
// Note: MutableEntry is a nested interface/class within the parent type

package kotlin.collections

interface MutableEntry : kotlin.collections.Map.Entry {
    val key: Any // property
    val value: Any // property
    fun setValue() // method
}