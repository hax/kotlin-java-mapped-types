package java.lang;

public interface String {
    public char charAt(int index);
    public IntStream chars();
    public int codePointAt(int index);
    public int codePointBefore(int index);
    public int codePointCount(int beginIndex, int endIndex);
    public IntStream codePoints();
    public int compareTo(String anotherString);
    public int compareToIgnoreCase(String str);
    public String concat(String str);
    public boolean contains(CharSequence s);
    public boolean contentEquals(StringBuffer sb);
    public boolean contentEquals(CharSequence cs);
    public static
        
        
        String copyValueOf(char[] data, int offset, int count);
    public static
        
        
        String copyValueOf(char[] data);
    public boolean endsWith(String suffix);
    public boolean equals(Object anObject);
    public boolean equalsIgnoreCase(String anotherString);
    public static
        
        
        String format(String format, Object... args);
    public static
        
        
        String format(Locale l, String format, Object... args);
    public String formatted(Object... args);
    public byte[] getBytes(String charsetName);
    public byte[] getBytes();
    public byte[] getBytes(Charset charset);
    public void getBytes(int srcBegin, int srcEnd, byte[] dst, int dstBegin);
    public void getChars(int srcBegin, int srcEnd, char[] dst, int dstBegin);
    public int hashCode();
    public String indent(int n);
    public int indexOf(int ch, int fromIndex);
    public int indexOf(String str);
    public int indexOf(int ch);
    public int indexOf(String str, int fromIndex);
    public String intern();
    public boolean isBlank();
    public boolean isEmpty();
    public static
        
        
        String join(CharSequence delimiter, CharSequence... elements);
    public static
        
        
        String join(CharSequence delimiter, Iterable<? extends CharSequence> elements);
    public int lastIndexOf(int ch);
    public int lastIndexOf(String str, int fromIndex);
    public int lastIndexOf(String str);
    public int lastIndexOf(int ch, int fromIndex);
    public int length();
    public Stream<String> lines();
    public boolean matches(String regex);
    public int offsetByCodePoints(int index, int codePointOffset);
    public boolean regionMatches(boolean ignoreCase, int toffset, String other, int ooffset, int len);
    public boolean regionMatches(int toffset, String other, int ooffset, int len);
    public String repeat(int count);
    public String replace(CharSequence target, CharSequence replacement);
    public String replace(char oldChar, char newChar);
    public String replaceAll(String regex, String replacement);
    public String replaceFirst(String regex, String replacement);
    public String[] split(String regex);
    public String[] split(String regex, int limit);
    public boolean startsWith(String prefix);
    public boolean startsWith(String prefix, int toffset);
    public String strip();
    public String stripIndent();
    public String stripLeading();
    public String stripTrailing();
    public CharSequence subSequence(int beginIndex, int endIndex);
    public String substring(int beginIndex, int endIndex);
    public String substring(int beginIndex);
    public char[] toCharArray();
    public String toLowerCase();
    public String toLowerCase(Locale locale);
    public String toString();
    public String toUpperCase(Locale locale);
    public String toUpperCase();
    public <R>
        R transform(Function<? super String, ? extends R> f);
    public String translateEscapes();
    public String trim();
    public static
        
        
        String valueOf(boolean b);
    public static
        
        
        String valueOf(double d);
    public static
        
        
        String valueOf(char[] data, int offset, int count);
    public static
        
        
        String valueOf(float f);
    public static
        
        
        String valueOf(int i);
    public static
        
        
        String valueOf(char c);
    public static
        
        
        String valueOf(long l);
    public static
        
        
        String valueOf(Object obj);
    public static
        
        
        String valueOf(char[] data);
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
    public abstract
        
        
        
        
        int compareTo(String o);
}
