using DataAccess.Data;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Repository;

public static class Extentions
{
   public static IServiceCollection AddData(this IServiceCollection serviceCollection)
   {
      serviceCollection.AddScoped<IRepository, Repository>();
      serviceCollection.AddDbContext<DbContent>(x =>
      {
         x.UseSqlServer("Host=localhost;Database=homeder;Username=root;Password=12345");
      });
      
      return serviceCollection;
   }
}