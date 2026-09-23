using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.Core.Entities;
using TeamTaskManagement.Core.Enums;
using TeamTaskManagement.Infrastructure.Data;
using TeamTaskManagement.Infrastructure.Services;

namespace TeamTaskManagement.Tests.Unit
{
    public class TeamServiceTests
    {
        private static ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            context.Roles.AddRange(
                new Role
                {
                    Id = 1,
                    Name = RoleType.Admin
                },
                new Role
                {
                    Id = 2,
                    Name = RoleType.Manager
                },
                new Role
                {
                    Id = 3,
                    Name = RoleType.User
                });

            context.Users.Add(
                new User
                {
                    Id = 1,
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@test.com",
                    PasswordHash = "hashed-password",
                    RoleId = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateTeamSuccessfully()
        {
            // Arrange
            await using var context = CreateDbContext();

            var service = new TeamService(context);

            var request = new TeamTaskManagement.Core.DTOs.Teams.CreateTeamRequest
            {
                Name = "Development Team",
                Description = "Software development team"
            };

            // Act
            var result = await service.CreateAsync(request, 1);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Development Team", result.Name);
            Assert.Equal("Software development team", result.Description);
            Assert.Equal(1, result.CreatedBy);

            var team = await context.Teams
                .FirstOrDefaultAsync(t => t.Name == "Development Team");

            Assert.NotNull(team);
        }

        [Fact]
        public async Task CreateAsync_ShouldRejectDuplicateTeamName()
        {
            // Arrange
            await using var context = CreateDbContext();

            context.Teams.Add(new Team
            {
                Name = "Development Team",
                Description = "Existing team",
                CreatedBy = 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

            await context.SaveChangesAsync();

            var service = new TeamService(context);

            var request = new TeamTaskManagement.Core.DTOs.Teams.CreateTeamRequest
            {
                Name = "Development Team",
                Description = "Another team"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.CreateAsync(request, 1));
        }
    }
}