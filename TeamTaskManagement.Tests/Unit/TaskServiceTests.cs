using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.Core.Entities;
using TeamTaskManagement.Core.Enums;
using TeamTaskManagement.Infrastructure.Data;
using TeamTaskManagement.Infrastructure.Services;
using TeamTaskManagement.Core.DTOs.Tasks;
using TaskStatusEnum = TeamTaskManagement.Core.Enums.TaskStatus;

namespace TeamTaskManagement.Tests.Unit
{
    public class TaskServiceTests
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

            context.Users.AddRange(
                new User
                {
                    Id = 1,
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@test.com",
                    PasswordHash = "hashed",
                    RoleId = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 2,
                    FirstName = "Manager",
                    LastName = "User",
                    Email = "manager@test.com",
                    PasswordHash = "hashed",
                    RoleId = 2,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 3,
                    FirstName = "Test",
                    LastName = "User",
                    Email = "user@test.com",
                    PasswordHash = "hashed",
                    RoleId = 3,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

            context.Teams.Add(
                new Team
                {
                    Id = 1,
                    Name = "Development Team",
                    Description = "Development team",
                    CreatedBy = 2,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });

            context.TeamMembers.Add(
                new TeamMember
                {
                    Id = 1,
                    TeamId = 1,
                    UserId = 3,
                    JoinedAt = DateTime.UtcNow
                });

            context.SaveChanges();

            return context;
        }

        private static NotificationService CreateNotificationService(
            ApplicationDbContext context)
        {
            return new NotificationService(context);
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateTaskForTeamMember()
        {
            // Arrange
            await using var context = CreateDbContext();

            var notificationService =
                CreateNotificationService(context);

            var service = new TaskService(
                context,
                notificationService);

            var request = new CreateTaskRequest
            {
                Title = "Implement Login API",
                Description = "Create JWT login API",
                TeamId = 1,
                AssignedTo = 3,
                Status = TaskStatusEnum.ToDo,
                Priority = TaskPriority.High,
                Deadline = DateTime.UtcNow.AddDays(7)
            };

            // Act
            var result = await service.CreateAsync(
                request,
                2);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Implement Login API", result.Title);
            Assert.Equal(3, result.AssignedTo);
            Assert.Equal(2, result.AssignedBy);
            Assert.Equal(TaskStatusEnum.ToDo, result.Status);

            var task = await context.Tasks
                .FirstOrDefaultAsync(t => t.Id == result.Id);

            Assert.NotNull(task);

            var notification = await context.Notifications
                .FirstOrDefaultAsync(n =>
                    n.TaskId == result.Id &&
                    n.UserId == 3);

            Assert.NotNull(notification);
            Assert.Equal(
                NotificationType.TaskAssigned,
                notification.Type);
        }

        [Fact]
        public async Task CreateAsync_ShouldRejectNonTeamMember()
        {
            // Arrange
            await using var context = CreateDbContext();

            var notificationService =
                CreateNotificationService(context);

            var service = new TaskService(
                context,
                notificationService);

            var request = new CreateTaskRequest
            {
                Title = "Invalid Assignment",
                Description = "This should fail",
                TeamId = 1,
                AssignedTo = 1,
                Status = TaskStatusEnum.ToDo,
                Priority = TaskPriority.Medium,
                Deadline = DateTime.UtcNow.AddDays(7)
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => service.CreateAsync(request, 2));
        }
    }
}