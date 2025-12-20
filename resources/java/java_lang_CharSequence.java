package java.lang;

public interface CharSequence {
    public abstract
        
        
        
        
        char charAt(int index);
    public default
        
        
        
        IntStream chars();
    public default
        
        
        
        IntStream codePoints();
    public static
        
        
        int compare(CharSequence cs1, CharSequence cs2);
    public default
        
        
        
        boolean isEmpty();
    public abstract
        
        
        
        
        int length();
    public abstract
        
        
        
        
        CharSequence subSequence(int start, int end);
    public abstract
        
        
        
        
        String toString();
}
