package java.lang;

public interface Enum {
    public final
        
        int compareTo(E o);
    public final
        
        boolean equals(Object other);
    public final
        
        Class<E> getDeclaringClass();
    public final
        
        int hashCode();
    public final
        
        String name();
    public final
        
        int ordinal();
    public String toString();
    public static
        
        <T extends Enum<T>>
        T valueOf(Class<T> enumClass, String name);
    public final
        
        Object clone();
    public final
        
        void finalize();
    public Object clone();
    public boolean equals(Object obj);
    public void finalize();
    public final
        
        Class<?> getClass();
    public int hashCode();
    public final
        
        void notify();
    public final
        
        void notifyAll();
    public String toString();
    public final
        
        void wait(long timeoutMillis, int nanos);
    public final
        
        void wait(long timeoutMillis);
    public final
        
        void wait();
    public abstract
        
        
        
        
        int compareTo(E o);
}
