using Isopoh.Cryptography.Argon2;
using Isopoh.Cryptography.SecureArray;
using System.Security.Cryptography;
using System.Text;

namespace api.security
{
    public static class PasswordHasher
    {
        // ✅ Fly.io safe parameters
        private const int MemoryKb = 16 * 1024; // 16 MB
        private const int TimeCost = 2;
        private const int Parallelism = 2;
        private const int HashLength = 32;

        public static string Hash(string password)
        {
            byte[] salt = RandomNumberGenerator.GetBytes(16);
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);

            var config = new Argon2Config
            {
                Type = Argon2Type.HybridAddressing, // Argon2id
                Version = Argon2Version.Nineteen,

                TimeCost = TimeCost,
                MemoryCost = MemoryKb,
                Lanes = Parallelism,
                Threads = Parallelism,
                HashLength = HashLength,

                Password = passwordBytes,
                Salt = salt
            };

            using var argon2 = new Argon2(config);
            using SecureArray<byte> hash = argon2.Hash();

            return config.EncodeString(hash.Buffer);
        }

        public static bool Verify(string existingHash, string password)
        {
            // ✅ This already parses params from the hash string
            // ✅ Uses constant-time comparison
            return Argon2.Verify(existingHash, password);
        }
    }
}
