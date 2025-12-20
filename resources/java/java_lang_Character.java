package java.lang;

public interface Character {
    public static
        
        
        int charCount(int codePoint);
    public char charValue();
    public static
        
        
        int codePointAt(char[] a, int index, int limit);
    public static
        
        
        int codePointAt(char[] a, int index);
    public static
        
        
        int codePointAt(CharSequence seq, int index);
    public static
        
        
        int codePointBefore(char[] a, int index);
    public static
        
        
        int codePointBefore(CharSequence seq, int index);
    public static
        
        
        int codePointBefore(char[] a, int index, int start);
    public static
        
        
        int codePointCount(CharSequence seq, int beginIndex, int endIndex);
    public static
        
        
        int codePointCount(char[] a, int offset, int count);
    public static
        
        
        int codePointOf(String name);
    public static
        
        
        int compare(char x, char y);
    public int compareTo(Character anotherCharacter);
    public static
        
        
        int digit(int codePoint, int radix);
    public static
        
        
        int digit(char ch, int radix);
    public boolean equals(Object obj);
    public static
        
        
        char forDigit(int digit, int radix);
    public static
        
        
        byte getDirectionality(char ch);
    public static
        
        
        byte getDirectionality(int codePoint);
    public static
        
        
        String getName(int codePoint);
    public static
        
        
        int getNumericValue(int codePoint);
    public static
        
        
        int getNumericValue(char ch);
    public static
        
        
        int getType(char ch);
    public static
        
        
        int getType(int codePoint);
    public static
        
        
        int hashCode(char value);
    public int hashCode();
    public static
        
        
        char highSurrogate(int codePoint);
    public static
        
        
        boolean isAlphabetic(int codePoint);
    public static
        
        
        boolean isBmpCodePoint(int codePoint);
    public static
        
        
        boolean isDefined(int codePoint);
    public static
        
        
        boolean isDefined(char ch);
    public static
        
        
        boolean isDigit(char ch);
    public static
        
        
        boolean isDigit(int codePoint);
    public static
        
        
        boolean isEmoji(int codePoint);
    public static
        
        
        boolean isEmojiComponent(int codePoint);
    public static
        
        
        boolean isEmojiModifier(int codePoint);
    public static
        
        
        boolean isEmojiModifierBase(int codePoint);
    public static
        
        
        boolean isEmojiPresentation(int codePoint);
    public static
        
        
        boolean isExtendedPictographic(int codePoint);
    public static
        
        
        boolean isHighSurrogate(char ch);
    public static
        
        
        boolean isISOControl(char ch);
    public static
        
        
        boolean isISOControl(int codePoint);
    public static
        
        
        boolean isIdentifierIgnorable(char ch);
    public static
        
        
        boolean isIdentifierIgnorable(int codePoint);
    public static
        
        
        boolean isIdeographic(int codePoint);
    public static
        
        
        boolean isJavaIdentifierPart(char ch);
    public static
        
        
        boolean isJavaIdentifierPart(int codePoint);
    public static
        
        
        boolean isJavaIdentifierStart(int codePoint);
    public static
        
        
        boolean isJavaIdentifierStart(char ch);
    public static
        
        
        boolean isJavaLetter(char ch);
    public static
        
        
        boolean isJavaLetterOrDigit(char ch);
    public static
        
        
        boolean isLetter(char ch);
    public static
        
        
        boolean isLetter(int codePoint);
    public static
        
        
        boolean isLetterOrDigit(char ch);
    public static
        
        
        boolean isLetterOrDigit(int codePoint);
    public static
        
        
        boolean isLowSurrogate(char ch);
    public static
        
        
        boolean isLowerCase(char ch);
    public static
        
        
        boolean isLowerCase(int codePoint);
    public static
        
        
        boolean isMirrored(int codePoint);
    public static
        
        
        boolean isMirrored(char ch);
    public static
        
        
        boolean isSpace(char ch);
    public static
        
        
        boolean isSpaceChar(char ch);
    public static
        
        
        boolean isSpaceChar(int codePoint);
    public static
        
        
        boolean isSupplementaryCodePoint(int codePoint);
    public static
        
        
        boolean isSurrogate(char ch);
    public static
        
        
        boolean isSurrogatePair(char high, char low);
    public static
        
        
        boolean isTitleCase(int codePoint);
    public static
        
        
        boolean isTitleCase(char ch);
    public static
        
        
        boolean isUnicodeIdentifierPart(int codePoint);
    public static
        
        
        boolean isUnicodeIdentifierPart(char ch);
    public static
        
        
        boolean isUnicodeIdentifierStart(int codePoint);
    public static
        
        
        boolean isUnicodeIdentifierStart(char ch);
    public static
        
        
        boolean isUpperCase(char ch);
    public static
        
        
        boolean isUpperCase(int codePoint);
    public static
        
        
        boolean isValidCodePoint(int codePoint);
    public static
        
        
        boolean isWhitespace(int codePoint);
    public static
        
        
        boolean isWhitespace(char ch);
    public static
        
        
        char lowSurrogate(int codePoint);
    public static
        
        
        int offsetByCodePoints(CharSequence seq, int index, int codePointOffset);
    public static
        
        
        int offsetByCodePoints(char[] a, int start, int count, int index, int codePointOffset);
    public static
        
        
        char reverseBytes(char ch);
    public static
        
        
        int toChars(int codePoint, char[] dst, int dstIndex);
    public static
        
        
        char[] toChars(int codePoint);
    public static
        
        
        int toCodePoint(char high, char low);
    public static
        
        
        int toLowerCase(int codePoint);
    public static
        
        
        char toLowerCase(char ch);
    public String toString();
    public static
        
        
        String toString(char c);
    public static
        
        
        String toString(int codePoint);
    public static
        
        
        char toTitleCase(char ch);
    public static
        
        
        int toTitleCase(int codePoint);
    public static
        
        
        char toUpperCase(char ch);
    public static
        
        
        int toUpperCase(int codePoint);
    public static
        
        
        Character valueOf(char c);
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
        
        
        
        
        int compareTo(Character o);
}
