using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Data
{
    public class DbContent(DbContextOptions<DbContent> options) : DbContext(options)
    {
        public DbSet<Props>     Props       { get; set; }
        public DbSet<Users>     Users       { get; set; }
        public DbSet<PropImage> PropImage   { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Props>().HasKey(x => x.PropId);
            modelBuilder.Entity<Users>().HasKey(x => x.UserId);
            modelBuilder.Entity<PropImage>().HasKey(x => x.ImageId);
            modelBuilder.Entity<Props>().Property(x => x.Description).HasMaxLength(512);
            modelBuilder.Entity<Users>().Property(x => x.Bio).HasMaxLength(256);
            modelBuilder.Entity<Users>().Property(x => x.Name).HasMaxLength(120);
            modelBuilder.Entity<Users>().Property(x => x.TgUsername).HasMaxLength(32);
            base.OnModelCreating(modelBuilder);
        }
    }
}