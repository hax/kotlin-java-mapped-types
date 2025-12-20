package java.lang;

public interface Float {
    public byte byteValue();
    public static
        
        
        int compare(float f1, float f2);
    public int compareTo(Float anotherFloat);
    public double doubleValue();
    public boolean equals(Object obj);
    public static
        
        
        float float16ToFloat(short floatBinary16);
    public static
        
        
        short floatToFloat16(float f);
    public static
        
        
        int floatToIntBits(float value);
    public static
        
        
        int floatToRawIntBits(float value);
    public float floatValue();
    public int hashCode();
    public static
        
        
        int hashCode(float value);
    public static
        
        
        float intBitsToFloat(int bits);
    public int intValue();
    public static
        
        
        boolean isFinite(float f);
    public boolean isInfinite();
    public static
        
        
        boolean isInfinite(float v);
    public static
        
        
        boolean isNaN(float v);
    public boolean isNaN();
    public long longValue();
    public static
        
        
        float max(float a, float b);
    public static
        
        
        float min(float a, float b);
    public static
        
        
        float parseFloat(String s);
    public short shortValue();
    public static
        
        
        float sum(float a, float b);
    public static
        
        
        String toHexString(float f);
    public String toString();
    public static
        
        
        String toString(float f);
    public static
        
        
        Float valueOf(String s);
    public static
        
        
        Float valueOf(float f);
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
        
        
        
        
        int compareTo(Float o);
}
