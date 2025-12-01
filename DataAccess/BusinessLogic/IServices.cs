namespace DataAccess.BusinessLogic;

public interface IServices
{
    Task CreateProp(string title, string describe, int price, string city, CancellationToken cancellationToken = default);
    Task UpdateProp(string title, string describe, int price, string city, CancellationToken cancellationToken = default);
    
    
    Task CreateUser(string name, string tgUsername, string Bio, CancellationToken cancellationToken = default);
    Task UpdateUser(string name, string tgUsername, string Bio, CancellationToken cancellationToken = default);
}