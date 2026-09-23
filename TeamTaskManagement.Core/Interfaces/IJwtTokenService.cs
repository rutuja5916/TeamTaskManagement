using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TeamTaskManagement.Core.Interfaces
{
    public interface IJwtTokenService
    {
        string GenerateToken(
            int userId,
            string email,
            string role,
            DateTime expiresAt);
    }
}

