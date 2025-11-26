using Isopoh.Cryptography.Argon2;
using Isopoh.Cryptography.SecureArray;
using System;
using System.Security.Cryptography;
using System.Text;

namespace api.security
{
    public static class PasswordHasher
    {
        public static string Hash(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);

            var config = new Argon2Config
            {
                Type = Argon2Type.HybridAddressing, // ✅ Argon2id
                Version = Argon2Version.Nineteen,

                TimeCost = 4,
                MemoryCost = 65536, // 64 MB
                Lanes = 2,
                Threads = Environment.ProcessorCount,

                Password = Encoding.UTF8.GetBytes(password),
                Salt = salt
            };

            using var argon2 = new Argon2(config);
            using SecureArray<byte> hash = argon2.Hash();

            return config.EncodeString(hash.Buffer);
        }

        public static bool Verify(string hash, string password)
        {
            return Argon2.Verify(hash, password);
        }
    }
}