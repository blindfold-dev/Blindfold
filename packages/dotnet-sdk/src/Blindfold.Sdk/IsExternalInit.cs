// Polyfill for netstandard2.1 which does not define IsExternalInit (required by C# 9 init properties)
#if !NET5_0_OR_GREATER
namespace System.Runtime.CompilerServices
{
    internal static class IsExternalInit { }
}
#endif
