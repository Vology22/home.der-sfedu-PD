cat > /var/www/myapi/Data/ApplicationDbContext.cs << 'EOF'
using HomederProfile.Models;
using Microsoft.EntityFrameworkCore;

namespace HomederProfile.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<PropImage> PropImages { get; set; }
        public DbSet<Favorite> Favorites { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Исправлено: используем OwnerId вместо UserId
            modelBuilder.Entity<User>()
                .HasMany(u => u.Properties)
                .WithOne(p => p.Owner)
                .HasForeignKey(p => p.OwnerId);
                
            // Если нужно настроить связь для Favorites
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId);
                
            modelBuilder.Entity<Favorite>()
                .HasOne(f => f.Property)
                .WithMany()
                .HasForeignKey(f => f.PropertyId);
                
            modelBuilder.Entity<PropImage>()
                .HasOne(pi => pi.Property)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.PropertyId);
        }
    }
}
EOF