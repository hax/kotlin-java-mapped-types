package java.lang;

public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    public char charAt(int index);
    public int length();
    public String substring(int beginIndex);
    public String substring(int beginIndex, int endIndex);
    public int compareTo(String anotherString);
    public boolean equals(Object anObject);
    public boolean isEmpty();
    public String toLowerCase();
    public String toUpperCase();
    public String trim();
    public String replace(CharSequence target, CharSequence replacement);
    public boolean contains(CharSequence s);
    public boolean startsWith(String prefix);
    public boolean endsWith(String suffix);
    public int indexOf(int ch);
    public int indexOf(String str);
    public int lastIndexOf(int ch);
    public String[] split(String regex);
    public String toString();
}
