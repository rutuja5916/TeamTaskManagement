using Microsoft.EntityFrameworkCore;
using TeamTaskManagement.Core.DTOs.Comments;
using TeamTaskManagement.Core.Entities;
using TeamTaskManagement.Core.Interfaces;
using TeamTaskManagement.Infrastructure.Data;

namespace TeamTaskManagement.Infrastructure.Services
{
    public class CommentService : ICommentService
    {
        private readonly ApplicationDbContext _context;

        public CommentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CommentResponse> CreateAsync(
            int taskId,
            CreateCommentRequest request,
            int userId)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == userId &&
                    u.IsActive);

            if (user == null)
                throw new KeyNotFoundException("User not found.");

            var comment = new Comment
            {
                TaskId = taskId,
                UserId = userId,
                Content = request.Content.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);

            await _context.SaveChangesAsync();

            return new CommentResponse
            {
                Id = comment.Id,
                TaskId = comment.TaskId,
                UserId = comment.UserId,
                UserName = $"{user.FirstName} {user.LastName}",
                Content = comment.Content,
                CreatedAt = comment.CreatedAt,
                UpdatedAt = comment.UpdatedAt
            };
        }

        public async Task<IEnumerable<CommentResponse>> GetByTaskIdAsync(
            int taskId,
            int currentUserId,
            string currentUserRole)
        {
            var task = await _context.Tasks
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
                throw new KeyNotFoundException("Task not found.");

            if (currentUserRole == "User" &&
                task.AssignedTo != currentUserId)
            {
                throw new UnauthorizedAccessException(
                    "You do not have access to this task.");
            }

            if (currentUserRole == "Manager")
            {
                var hasAccess = task.AssignedBy == currentUserId ||
                    await _context.TeamMembers.AnyAsync(tm =>
                        tm.TeamId == task.TeamId &&
                        tm.UserId == currentUserId);

                if (!hasAccess)
                {
                    throw new UnauthorizedAccessException(
                        "You do not have access to this task.");
                }
            }

            return await _context.Comments
                .AsNoTracking()
                .Where(c => c.TaskId == taskId)
                .Include(c => c.User)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentResponse
                {
                    Id = c.Id,
                    TaskId = c.TaskId,
                    UserId = c.UserId,
                    UserName = c.User.FirstName + " " + c.User.LastName,
                    Content = c.Content,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task DeleteAsync(
            int commentId,
            int currentUserId,
            string currentUserRole)
        {
            var comment = await _context.Comments
                .Include(c => c.Task)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
                throw new KeyNotFoundException("Comment not found.");

            if (currentUserRole == "User" &&
                comment.UserId != currentUserId)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete your own comments.");
            }

            if (currentUserRole == "Manager")
            {
                var hasAccess = comment.Task.AssignedBy == currentUserId ||
                    await _context.TeamMembers.AnyAsync(tm =>
                        tm.TeamId == comment.Task.TeamId &&
                        tm.UserId == currentUserId);

                if (!hasAccess)
                {
                    throw new UnauthorizedAccessException(
                        "You do not have access to this comment.");
                }
            }

            _context.Comments.Remove(comment);

            await _context.SaveChangesAsync();
        }
    }
}