using DataAccess.Data;
using DataAccess.Models;

namespace DataAccess.Repository;

internal class Repository(DbContent DbContext) : IRepository
{
    public async Task CreateProp(Props prop, CancellationToken cancellationToken = default)
    {
        prop.CreatedAt = DateTime.UtcNow;
        await DbContext.Props.AddAsync(prop, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task CreateUser(Users user, CancellationToken cancellationToken = default)
    {
        await DbContext.Users.AddAsync(user, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);
    }
}