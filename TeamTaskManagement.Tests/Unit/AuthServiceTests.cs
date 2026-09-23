using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.Core.DTOs.Auth;
using TeamTaskManagement.Core.Entities;
using TeamTaskManagement.Core.Services;
using TeamTaskManagement.Infrastructure.Data;
using TeamTaskManagement.Infrastructure.Services;

namespace TeamTaskManagement.Tests.Unit
{
    public class AuthServiceTests
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
                    Name = Core.Enums.RoleType.Admin
                },
                new Role
                {
                    Id = 2,
                    Name = Core.Enums.RoleType.Manager
                },
                new Role
                {
                    Id = 3,
                    Name = Core.Enums.RoleType.User
                });

            context.SaveChanges();

            return context;
        }

        [Fact]
        public async Task RegisterAsync_ShouldCreateUserWithUserRole()
        {
            // Arrange
            await using var context = CreateDbContext();

            var passwordHasher = new PasswordHasher<User>();

            var jwtTokenService =
                new FakeJwtTokenService();

            var authService = new AuthService(
                context,
                passwordHasher,
                jwtTokenService);

            var request = new RegisterRequest
            {
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                Password = "Test@12345"
            };

            // Act
            var result = await authService.RegisterAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("User", result.Role);
            Assert.Equal("test@example.com", result.Email);

            var user = await context.Users
                .FirstOrDefaultAsync(u =>
                    u.Email == "test@example.com");

            Assert.NotNull(user);
            Assert.Equal(3, user.RoleId);
            Assert.NotEqual("Test@12345", user.PasswordHash);
        }

        [Fact]
        public async Task RegisterAsync_ShouldRejectDuplicateEmail()
        {
            // Arrange
            await using var context = CreateDbContext();

            var passwordHasher = new PasswordHasher<User>();

            var jwtTokenService =
                new FakeJwtTokenService();

            var authService = new AuthService(
                context,
                passwordHasher,
                jwtTokenService);

            var firstRequest = new RegisterRequest
            {
                FirstName = "First",
                LastName = "User",
                Email = "duplicate@example.com",
                Password = "Test@12345"
            };

            await authService.RegisterAsync(firstRequest);

            var secondRequest = new RegisterRequest
            {
                FirstName = "Second",
                LastName = "User",
                Email = "duplicate@example.com",
                Password = "Test@12345"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => authService.RegisterAsync(secondRequest));
        }
    }

    internal class FakeJwtTokenService
        : TeamTaskManagement.Core.Interfaces.IJwtTokenService
    {
        public string GenerateToken(
            int userId,
            string email,
            string role,
            DateTime expiresAt)
        {
            return "test-token";
        }
    }
}