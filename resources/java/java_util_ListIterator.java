package java.util;

public interface ListIterator {
    public abstract
        
        
        
        
        void add(E e);
    public abstract
        
        
        
        
        boolean hasNext();
    public abstract
        
        
        
        
        boolean hasPrevious();
    public abstract
        
        
        
        
        E next();
    public abstract
        
        
        
        
        int nextIndex();
    public abstract
        
        
        
        
        E previous();
    public abstract
        
        
        
        
        int previousIndex();
    public abstract
        
        
        
        
        void remove();
    public abstract
        
        
        
        
        void set(E e);
    public default
        
        
        
        void forEachRemaining(Consumer<? super E> action);
    public abstract
        
        
        
        
        boolean hasNext();
    public abstract
        
        
        
        
        E next();
    public default
        
        
        
        void remove();
}
