using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

public class Startup {
    public void ConfigureServices(IServiceCollection services) {
        services.AddCors(options => {
            options.AddPolicy("CorsPolicy", builder => 
                builder.AllowAnyOrigin().AllowAnyMethod());
        });
    }
}
