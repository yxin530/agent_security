using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace App {
    public class UserRepository {
        public void GetUser(MyContext context, string name) {
            void query() {
                var users = context.Users.FromSqlRaw($"SELECT * FROM users WHERE Name = '{name}'").ToList();
            }
            query();
        }
    }
}
