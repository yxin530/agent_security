using Microsoft.EntityFrameworkCore;
using System.Linq;

public class UserRepository {
    public void GetUser(MyContext context, string name) {
        var users = context.Users.FromSqlInterpolated($"SELECT * FROM users WHERE Name = {name}").ToList();
    }
}
