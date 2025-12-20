package java.util;

public interface Collection {
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
