package java.lang;

public final class Integer extends Number implements Comparable<Integer> {
    public int compareTo(Integer anotherInteger);
    public int intValue();
    public byte byteValue();
    public short shortValue();
    public long longValue();
    public float floatValue();
    public double doubleValue();
    public String toString();
    public boolean equals(Object obj);
    public int hashCode();
    public static int parseInt(String s);
    public static Integer valueOf(int i);
    public static Integer valueOf(String s);
}
