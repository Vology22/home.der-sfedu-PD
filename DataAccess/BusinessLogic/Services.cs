using DataAccess.Models;
using DataAccess.Repository;

namespace DataAccess.BusinessLogic;

internal class Services(IRepository propRepository) : IServices
{
    public async Task CreateProp(string title, string describe, int price, string city,
        CancellationToken cancellationToken = default)
    {
        var prop = new Props
        {
            Title = title,
            Description = describe,
            Price = price,
            City = city
        };
    }


    public async Task UpdateProp(string title, string describe, int price, string city,
        CancellationToken cancellationToken = default)
    {
        var prop = new Props
        {
            Title = title,
            Description = describe,
            Price = price,
            City = city
        };
    }

    public async Task CreateUser(string name, string tgUsername, string Bio,
        CancellationToken cancellationToken = default)
    {
        var user = new Users
        {
            Name = name,
            TgUsername = tgUsername,
            Bio = Bio
        };
    }

    public async Task UpdateUser(string name, string tgUsername, string Bio,
        CancellationToken cancellationToken = default)
    {
        var user = new Users
        {
            Name = name,
            TgUsername = tgUsername,
            Bio = Bio
        };
    }
}