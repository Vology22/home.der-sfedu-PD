namespace DataAccess.BusinessLogic;

public static class Extentions
{
    public static IServiceCollection AddBusinessLogic(this IServiceCollection serviceCollection)
    {
        serviceCollection.AddScoped<IServices, Services>();
        return serviceCollection;
    }
}