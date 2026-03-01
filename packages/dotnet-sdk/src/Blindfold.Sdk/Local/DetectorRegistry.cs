using Blindfold.Sdk.Local.Detectors;

namespace Blindfold.Sdk.Local;

internal static class DetectorRegistration
{
    private static readonly List<Func<IDetector>> UniversalFactories = new();
    private static readonly Dictionary<string, List<Func<IDetector>>> RegionalFactories = new()
    {
        ["us"] = new(),
        ["eu"] = new(),
        ["uk"] = new()
    };

    private static bool _initialized;

    public static void RegisterUniversal(Func<IDetector> factory)
    {
        UniversalFactories.Add(factory);
    }

    public static void RegisterRegion(string locale, Func<IDetector> factory)
    {
        var key = locale.ToLowerInvariant();
        if (!RegionalFactories.ContainsKey(key))
            RegionalFactories[key] = new List<Func<IDetector>>();
        RegionalFactories[key].Add(factory);
    }

    private static void EnsureInitialized()
    {
        if (_initialized) return;
        _initialized = true;

        UniversalDetectors.EnsureRegistered();
        UsDetectors.EnsureRegistered();
        UkDetectors.EnsureRegistered();
        EuDetectors.EnsureRegistered();
        DeDetectors.EnsureRegistered();
        FrDetectors.EnsureRegistered();
        EsDetectors.EnsureRegistered();
        ItDetectors.EnsureRegistered();
        PtDetectors.EnsureRegistered();
        RuDetectors.EnsureRegistered();
        IeDetectors.EnsureRegistered();
        ChDetectors.EnsureRegistered();
        NordicsDetectors.EnsureRegistered();
        BeneluxDetectors.EnsureRegistered();
        EasternEuropeDetectors.EnsureRegistered();
        BalticsDetectors.EnsureRegistered();
        AmericasDetectors.EnsureRegistered();
        AsiaPacificDetectors.EnsureRegistered();
    }

    public static List<IDetector> BuildDetectors(string[]? locales)
    {
        EnsureInitialized();

        var effectiveLocales = locales != null && locales.Length > 0 ? locales : new[] { "us" };
        var detectors = new List<IDetector>();

        foreach (var factory in UniversalFactories)
            detectors.Add(factory());

        foreach (var locale in effectiveLocales)
        {
            var key = locale.ToLowerInvariant();
            if (RegionalFactories.TryGetValue(key, out var factories))
            {
                foreach (var factory in factories)
                    detectors.Add(factory());
            }
        }

        return detectors;
    }
}
