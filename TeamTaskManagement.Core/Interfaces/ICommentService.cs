using TeamTaskManagement.Core.DTOs.Comments;

namespace TeamTaskManagement.Core.Interfaces
{
    public interface ICommentService
    {
        Task<CommentResponse> CreateAsync(
            int taskId,
            CreateCommentRequest request,
            int userId);

        Task<IEnumerable<CommentResponse>> GetByTaskIdAsync(
            int taskId,
            int currentUserId,
            string currentUserRole);

        Task DeleteAsync(
            int commentId,
            int currentUserId,
            string currentUserRole);
    }
}