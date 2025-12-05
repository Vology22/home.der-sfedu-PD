using Microsoft.Build.Tasks;
using DataAccess.Models;

namespace DataAccess.Repository;

public interface IRepository
{
    Task CreateProp(Props prop, CancellationToken cancellationToken = default);
    Task CreateUser(Users users, CancellationToken cancellationToken = default);
}