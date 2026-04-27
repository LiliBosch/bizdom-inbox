<?php

namespace Tests\Feature;

use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_receive_token(): void
    {
        User::factory()->create([
            'email' => 'ana@bizdom.test',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'ana@bizdom.test',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);

        $this->assertCount(3, explode('.', $response->json('token')));
    }

    public function test_authenticated_user_can_fetch_profile_with_jwt(): void
    {
        $user = User::factory()->create([
            'email' => 'ana@bizdom.test',
        ]);

        $response = $this->actingAsJwt($user)->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.email', 'ana@bizdom.test');
    }

    public function test_invalid_jwt_is_rejected(): void
    {
        $response = $this
            ->withHeader('Authorization', 'Bearer invalid-token')
            ->getJson('/api/auth/me');

        $response->assertUnauthorized();
    }

    public function test_expired_jwt_is_rejected(): void
    {
        $secret = str_repeat('a', 32);

        config(['auth.jwt_secret' => $secret]);

        $user = User::factory()->create();
        $issuedAt = Carbon::now()->subHours(2);
        $token = JWT::encode([
            'iss' => config('app.url'),
            'sub' => (string) $user->id,
            'email' => $user->email,
            'iat' => $issuedAt->timestamp,
            'exp' => $issuedAt->copy()->addMinute()->timestamp,
        ], $secret, 'HS256');

        $response = $this
            ->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me');

        $response->assertUnauthorized();
    }
}
