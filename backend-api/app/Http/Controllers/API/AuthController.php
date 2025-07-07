<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            Log::info('Login attempt', ['email' => $request->email]);

            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if (!Auth::attempt($request->only('email', 'password'))) {
                Log::warning('Failed login attempt', ['email' => $request->email]);
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                Log::error('User not found after successful authentication', ['email' => $request->email]);
                throw ValidationException::withMessages([
                    'email' => ['User not found.'],
                ]);
            }

            $token = $user->createToken('auth-token')->plainTextToken;
            Log::info('Successful login', ['user_id' => $user->id]);

            return response()->json([
                'token' => $token,
                'user' => $user,
            ]);
        } catch (ValidationException $e) {
            Log::warning('Validation error during login', [
                'email' => $request->email,
                'errors' => $e->errors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Login error', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'An error occurred during login.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function register(Request $request)
    {
        try {
            Log::info('Registration attempt', [
                'email' => $request->email,
                'name' => $request->name,
                'has_password' => !empty($request->password),
                'has_password_confirmation' => !empty($request->password_confirmation),
                'passwords_match' => $request->password === $request->password_confirmation
            ]);

            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'password_confirmation' => 'required|same:password',
            ], [
                'password_confirmation.same' => 'The password confirmation does not match.',
                'password.min' => 'The password must be at least 8 characters.',
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            Log::info('User registered successfully', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
            ], 201);
        } catch (ValidationException $e) {
            Log::warning('Validation error during registration', [
                'email' => $request->email,
                'errors' => $e->errors(),
                'input' => $request->except(['password', 'password_confirmation'])
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Registration error', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'An error occurred during registration.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            Log::info('Logout attempt', ['user_id' => $request->user()->id]);
            $request->user()->currentAccessToken()->delete();
            Log::info('User logged out successfully', ['user_id' => $request->user()->id]);
            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            Log::error('Logout error', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'An error occurred during logout.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function me(Request $request)
    {
        try {
            Log::info('Fetching user data', ['user_id' => $request->user()->id]);
            return response()->json($request->user());
        } catch (\Exception $e) {
            Log::error('Error fetching user data', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'An error occurred while fetching user data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
