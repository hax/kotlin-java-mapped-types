package java.lang;

public interface Throwable {
    public final
        
        void addSuppressed(Throwable exception);
    public Throwable fillInStackTrace();
    public Throwable getCause();
    public String getLocalizedMessage();
    public String getMessage();
    public StackTraceElement[] getStackTrace();
    public final
        
        Throwable[] getSuppressed();
    public Throwable initCause(Throwable cause);
    public void printStackTrace();
    public void printStackTrace(PrintWriter s);
    public void printStackTrace(PrintStream s);
    public void setStackTrace(StackTraceElement[] stackTrace);
    public String toString();
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
    public IllegalStateException Throwable(java.lang.Throwable);
}
