package java.util;

public interface Map {
    public abstract
        
        
        
        
        void clear();
    public default
        
        
        
        V compute(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction);
    public default
        
        
        
        V computeIfAbsent(K key, Function<? super K, ? extends V> mappingFunction);
    public default
        
        
        
        V computeIfPresent(K key, BiFunction<? super K, ? super V, ? extends V> remappingFunction);
    public abstract
        
        
        
        
        boolean containsKey(Object key);
    public abstract
        
        
        
        
        boolean containsValue(Object value);
    public static
        
        <K, V>
        Map<K, V> copyOf(Map<? extends K, ? extends V> map);
    public static
        
        <K, V>
        Entry<K, V> entry(K k, V v);
    public abstract
        
        
        
        
        Set<Entry<K, V>> entrySet();
    public abstract
        
        
        
        
        boolean equals(Object o);
    public default
        
        
        
        void forEach(BiConsumer<? super K, ? super V> action);
    public abstract
        
        
        
        
        V get(Object key);
    public default
        
        
        
        V getOrDefault(Object key, V defaultValue);
    public abstract
        
        
        
        
        int hashCode();
    public abstract
        
        
        
        
        boolean isEmpty();
    public abstract
        
        
        
        
        Set<K> keySet();
    public default
        
        
        
        V merge(K key, V value, BiFunction<? super V, ? super V, ? extends V> remappingFunction);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5, K k6, V v6, K k7, V v7, K k8, V v8);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3);
    public static
        
        <K, V>
        Map<K, V> of();
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5, K k6, V v6, K k7, V v7, K k8, V v8, K k9, V v9);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5, K k6, V v6);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5, K k6, V v6, K k7, V v7);
    public static
        
        <K, V>
        Map<K, V> of(K k1, V v1, K k2, V v2, K k3, V v3, K k4, V v4, K k5, V v5, K k6, V v6, K k7, V v7, K k8, V v8, K k9, V v9, K k10, V v10);
    public static
        
        <K, V>
        Map<K, V> ofEntries(Entry...<? extends K, ? extends V> entries);
    public abstract
        
        
        
        
        V put(K key, V value);
    public abstract
        
        
        
        
        void putAll(Map<? extends K, ? extends V> m);
    public default
        
        
        
        V putIfAbsent(K key, V value);
    public default
        
        
        
        boolean remove(Object key, Object value);
    public abstract
        
        
        
        
        V remove(Object key);
    public default
        
        
        
        boolean replace(K key, V oldValue, V newValue);
    public default
        
        
        
        V replace(K key, V value);
    public default
        
        
        
        void replaceAll(BiFunction<? super K, ? super V, ? extends V> function);
    public abstract
        
        
        
        
        int size();
    public abstract
        
        
        
        
        Collection<V> values();
}
