package java.util;

public interface List {
    public abstract
        
        
        
        
        boolean add(E e);
    public abstract
        
        
        
        
        void add(int index, E element);
    public abstract
        
        
        
        
        boolean addAll(Collection<? extends E> c);
    public abstract
        
        
        
        
        boolean addAll(int index, Collection<? extends E> c);
    public default
        
        
        
        void addFirst(E e);
    public default
        
        
        
        void addLast(E e);
    public abstract
        
        
        
        
        void clear();
    public abstract
        
        
        
        
        boolean contains(Object o);
    public abstract
        
        
        
        
        boolean containsAll(Collection<?> c);
    public static
        
        <E>
        List<E> copyOf(Collection<? extends E> coll);
    public abstract
        
        
        
        
        boolean equals(Object o);
    public abstract
        
        
        
        
        E get(int index);
    public default
        
        
        
        E getFirst();
    public default
        
        
        
        E getLast();
    public abstract
        
        
        
        
        int hashCode();
    public abstract
        
        
        
        
        int indexOf(Object o);
    public abstract
        
        
        
        
        boolean isEmpty();
    public abstract
        
        
        
        
        Iterator<E> iterator();
    public abstract
        
        
        
        
        int lastIndexOf(Object o);
    public abstract
        
        
        
        
        ListIterator<E> listIterator(int index);
    public abstract
        
        
        
        
        ListIterator<E> listIterator();
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3);
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7, E e8, E e9);
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3, E e4, E e5);
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3, E e4, E e5, E e6);
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7, E e8);
    public static
        
        <E>
        List<E> of(E... elements);
    public static
        
        <E>
        List<E> of();
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7, E e8, E e9, E e10);
    public static
        
        <E>
        List<E> of(E e1, E e2);
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3, E e4, E e5, E e6, E e7);
    public static
        
        <E>
        List<E> of(E e1, E e2, E e3, E e4);
    public static
        
        <E>
        List<E> of(E e1);
    public abstract
        
        
        
        
        E remove(int index);
    public abstract
        
        
        
        
        boolean remove(Object o);
    public abstract
        
        
        
        
        boolean removeAll(Collection<?> c);
    public default
        
        
        
        E removeFirst();
    public default
        
        
        
        E removeLast();
    public default
        
        
        
        void replaceAll(UnaryOperator<E> operator);
    public abstract
        
        
        
        
        boolean retainAll(Collection<?> c);
    public default
        
        
        
        List<E> reversed();
    public abstract
        
        
        
        
        E set(int index, E element);
    public abstract
        
        
        
        
        int size();
    public default
        
        
        
        void sort(Comparator<? super E> c);
    public default
        
        
        
        Spliterator<E> spliterator();
    public abstract
        
        
        
        
        List<E> subList(int fromIndex, int toIndex);
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
        
        
        
        void addFirst(E e);
    public default
        
        
        
        void addLast(E e);
    public default
        
        
        
        E getFirst();
    public default
        
        
        
        E getLast();
    public default
        
        
        
        E removeFirst();
    public default
        
        
        
        E removeLast();
    public abstract
        
        
        
        
        SequencedCollection<E> reversed();
    public default
        
        
        
        void forEach(Consumer<? super T> action);
    public abstract
        
        
        
        
        Iterator<E> iterator();
    public default
        
        
        
        Spliterator<E> spliterator();
    public IndexOutOfBoundsException size();
    public IndexOutOfBoundsException size();
    public IndexOutOfBoundsException size();
    public IndexOutOfBoundsException size();
    public IndexOutOfBoundsException size();
    public IndexOutOfBoundsException size();
}
