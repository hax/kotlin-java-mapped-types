package java.util;

public interface Set {
    public abstract
        
        
        
        
        boolean add(E e);
    public abstract
        
        
        
        
        boolean addAll(Collection<? extends E> c);
    public abstract
        
        
        
        
        void clear();
    public abstract
        
        
        
        
        boolean contains(Object o);
    public abstract
        
        
        
        
        boolean containsAll(Collection<?> c);
    public static
        
        <E>
        Set<E> copyOf(Collection<? extends E> coll);
    public abstract
        
        
        
        
        boolean equals(Object o);
    public abstract
        
        
        
        
        int hashCode();
    public abstract
        
        
        
        
        boolean isEmpty();
    public abstract
        
        
        
        
        Iterator<E> iterator();
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3);
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7, E e8, E e9);
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3, E e4, E e5);
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3, E e4, E e5, E e6);
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7, E e8);
    public static
        
        <E>
        Set<E> of(E... elements);
    public static
        
        <E>
        Set<E> of();
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7, E e8, E e9, E e10);
    public static
        
        <E>
        Set<E> of(E e1, E e2);
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7);
    public static
        
        <E>
        Set<E> of(E e1, E e2, E e3, E e4);
    public static
        
        <E>
        Set<E> of(E e1);
    public abstract
        
        
        
        
        boolean remove(Object o);
    public abstract
        
        
        
        
        boolean removeAll(Collection<?> c);
    public abstract
        
        
        
        
        boolean retainAll(Collection<?> c);
    public abstract
        
        
        
        
        int size();
    public default
        
        
        
        Spliterator<E> spliterator();
    public abstract
        
        
        
        
        Object[] toArray();
    public abstract
        
        
        
        <T>
        T[] toArray(T[] a);
    public abstract
        
        
        
        
        boolean add(E e);
    public abstract
        
        
        
        
        boolean addAll(Collection<? extends E> c);
    public abstract
        
        
        
        
        void clear();
    public abstract
        
        
        
        
        boolean contains(Object o);
    public abstract
        
        
        
        
        boolean containsAll(Collection<?> c);
    public abstract
        
        
        
        
        boolean equals(Object o);
    public abstract
        
        
        
        
        int hashCode();
    public abstract
        
        
        
        
        boolean isEmpty();
    public abstract
        
        
        
        
        Iterator<E> iterator();
    public default
        
        
        
        Stream<E> parallelStream();
    public abstract
        
        
        
        
        boolean remove(Object o);
    public abstract
        
        
        
        
        boolean removeAll(Collection<?> c);
    public default
        
        
        
        boolean removeIf(Predicate<? super E> filter);
    public abstract
        
        
        
        
        boolean retainAll(Collection<?> c);
    public abstract
        
        
        
        
        int size();
    public default
        
        
        
        Spliterator<E> spliterator();
    public default
        
        
        
        Stream<E> stream();
    public abstract
        
        
        
        <T>
        T[] toArray(T[] a);
    public abstract
        
        
        
        
        Object[] toArray();
    public default
        
        
        <T>
        T[] toArray(IntFunction<T[]> generator);
    public default
        
        
        
        void forEach(Consumer<? super T> action);
    public abstract
        
        
        
        
        Iterator<E> iterator();
    public default
        
        
        
        Spliterator<E> spliterator();
}
