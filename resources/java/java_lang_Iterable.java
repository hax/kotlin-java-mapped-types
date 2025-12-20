package java.lang;

public interface Iterable {
    public default
        
        
        
        void forEach(Consumer<? super T> action);
    public abstract
        
        
        
        
        Iterator<T> iterator();
    public default
        
        
        
        Spliterator<T> spliterator();
}
