using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TeamTaskManagement.Core.Entities;

namespace TeamTaskManagement.Infrastructure.Configurations
{
    public class RoleConfiguration : IEntityTypeConfiguration<Role>
    {
        public void Configure(EntityTypeBuilder<Role> builder)
        {
            builder.ToTable("Roles");

            builder.HasKey(r => r.Id);

            builder.Property(r => r.Name)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(20);

            builder.HasData(
                new Role
                {
                    Id = 1,
                    Name = TeamTaskManagement.Core.Enums.RoleType.Admin
                },
                new Role
                {
                    Id = 2,
                    Name = TeamTaskManagement.Core.Enums.RoleType.Manager
                },
                new Role
                {
                    Id = 3,
                    Name = TeamTaskManagement.Core.Enums.RoleType.User
                });
        }
    }
}
