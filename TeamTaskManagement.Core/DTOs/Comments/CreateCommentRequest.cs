using System.ComponentModel.DataAnnotations;

namespace TeamTaskManagement.Core.DTOs.Comments
{
    public class CreateCommentRequest
    {
        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}