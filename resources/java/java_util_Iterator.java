package java.util;

public interface Iterator {
    public default
        
        
        
        void forEachRemaining(Consumer<? super E> action);
    public abstract
        
        
        
        
        boolean hasNext();
    public abstract
        
        
        
        
        E next();
    public default
        
        
        
        void remove();
}
