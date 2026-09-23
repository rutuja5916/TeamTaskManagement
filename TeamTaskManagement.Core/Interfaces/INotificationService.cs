using TeamTaskManagement.Core.DTOs.Notifications;
using TeamTaskManagement.Core.Enums;

namespace TeamTaskManagement.Core.Interfaces
{
    public interface INotificationService
    {
        Task CreateAsync(
            int userId,
            int taskId,
            string message,
            NotificationType type);

        Task<IEnumerable<NotificationResponse>> GetMyNotificationsAsync(
            int userId);

        Task MarkAsReadAsync(
            int notificationId,
            int userId);
    }
}