namespace TeamTaskManagement.Core.DTOs.Dashboard
{
    public class TaskStatusSummary
    {
        public int ToDo { get; set; }

        public int InProgress { get; set; }

        public int Done { get; set; }

        public int Total { get; set; }
    }
}