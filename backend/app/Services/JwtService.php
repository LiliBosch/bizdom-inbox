<?php

namespace App\Services;

use App\Models\User;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Carbon;
use InvalidArgumentException;
use RuntimeException;

class JwtService
{
    private const ALGORITHM = 'HS256';

    public function issue(User $user): string
    {
        $now = Carbon::now();
        $ttlMinutes = (int) config('auth.jwt_ttl', 1440);

        return JWT::encode([
            'iss' => config('app.url'),
            'sub' => (string) $user->id,
            'email' => $user->email,
            'iat' => $now->timestamp,
            'exp' => $now->copy()->addMinutes($ttlMinutes)->timestamp,
        ], $this->secret(), self::ALGORITHM);
    }

    public function userFromToken(string $token): ?User
    {
        $payload = $this->decode($token);
        $userId = $payload['sub'] ?? null;

        if (! is_string($userId) && ! is_int($userId)) {
            return null;
        }

        return User::find((int) $userId);
    }

    private function decode(string $token): array
    {
        $payload = (array) JWT::decode($token, new Key($this->secret(), self::ALGORITHM));

        if (($payload['iss'] ?? null) !== config('app.url')) {
            throw new InvalidArgumentException('Invalid JWT issuer.');
        }

        if (($payload['exp'] ?? 0) < Carbon::now()->timestamp) {
            throw new InvalidArgumentException('Expired JWT.');
        }

        return $payload;
    }

    private function secret(): string
    {
        $key = (string) config('auth.jwt_secret', '');

        if ($key !== '') {
            return $key;
        }

        $key = (string) config('app.key');

        if (str_starts_with($key, 'base64:')) {
            $decoded = base64_decode(substr($key, 7), true);

            if ($decoded === false) {
                throw new RuntimeException('Invalid base64 APP_KEY.');
            }

            return $decoded;
        }

        if ($key === '') {
            throw new RuntimeException('APP_KEY is required to sign JWT tokens.');
        }

        return $key;
    }
}
