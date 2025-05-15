using System;

namespace Common.Constants
{
    public static class RoleConstants
    {
        public const string Admin = "Admin";
        public const string AdminNormalized = "ADMIN";
        public const string User = "User";
        public const string UserNormalized = "USER";
        public const string All = Admin + "," + User;
    }
}
