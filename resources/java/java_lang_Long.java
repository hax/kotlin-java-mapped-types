package java.lang;

public interface Long {
    public static
        
        
        int bitCount(long i);
    public byte byteValue();
    public static
        
        
        int compare(long x, long y);
    public int compareTo(Long anotherLong);
    public static
        
        
        int compareUnsigned(long x, long y);
    public static
        
        
        long compress(long i, long mask);
    public static
        
        
        Long decode(String nm);
    public static
        
        
        long divideUnsigned(long dividend, long divisor);
    public double doubleValue();
    public boolean equals(Object obj);
    public static
        
        
        long expand(long i, long mask);
    public float floatValue();
    public static
        
        
        Long getLong(String nm, Long val);
    public static
        
        
        Long getLong(String nm, long val);
    public static
        
        
        Long getLong(String nm);
    public int hashCode();
    public static
        
        
        int hashCode(long value);
    public static
        
        
        long highestOneBit(long i);
    public int intValue();
    public long longValue();
    public static
        
        
        long lowestOneBit(long i);
    public static
        
        
        long max(long a, long b);
    public static
        
        
        long min(long a, long b);
    public static
        
        
        int numberOfLeadingZeros(long i);
    public static
        
        
        int numberOfTrailingZeros(long i);
    public static
        
        
        long parseLong(CharSequence s, int beginIndex, int endIndex, int radix);
    public static
        
        
        long parseLong(String s, int radix);
    public static
        
        
        long parseLong(String s);
    public static
        
        
        long parseUnsignedLong(String s, int radix);
    public static
        
        
        long parseUnsignedLong(String s);
    public static
        
        
        long parseUnsignedLong(CharSequence s, int beginIndex, int endIndex, int radix);
    public static
        
        
        long remainderUnsigned(long dividend, long divisor);
    public static
        
        
        long reverse(long i);
    public static
        
        
        long reverseBytes(long i);
    public static
        
        
        long rotateLeft(long i, int distance);
    public static
        
        
        long rotateRight(long i, int distance);
    public short shortValue();
    public static
        
        
        int signum(long i);
    public static
        
        
        long sum(long a, long b);
    public static
        
        
        String toBinaryString(long i);
    public static
        
        
        String toHexString(long i);
    public static
        
        
        String toOctalString(long i);
    public static
        
        
        String toString(long i, int radix);
    public String toString();
    public static
        
        
        String toString(long i);
    public static
        
        
        String toUnsignedString(long i);
    public static
        
        
        String toUnsignedString(long i, int radix);
    public static
        
        
        Long valueOf(String s);
    public static
        
        
        Long valueOf(String s, int radix);
    public static
        
        
        Long valueOf(long l);
    public byte byteValue();
    public abstract
        
        
        
        
        double doubleValue();
    public abstract
        
        
        
        
        float floatValue();
    public abstract
        
        
        
        
        int intValue();
    public abstract
        
        
        
        
        long longValue();
    public short shortValue();
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
        
        
        
        
        int compareTo(Long o);
}
