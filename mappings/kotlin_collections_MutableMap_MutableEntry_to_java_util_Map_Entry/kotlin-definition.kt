package kotlin.collections.MutableMap

interface MutableEntry : kotlin.collections.Map.Entry {
    val key: Any // property
    val value: Any // property
    fun setValue() // method
}