<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
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

    public function profile(Request $request)
    {
        try {
            $user = $request->user();
            $latestOrder = $user->latestOrder();

            $autofillData = [
                'email' => $user->email,
                'firstName' => '',
                'lastName' => '',
                'phone' => '',
                'address' => '',
                'city' => '',
                'state' => '',
                'zipCode' => '',
                'country' => ''
            ];

            if ($latestOrder) {
                // Parse the customer name into first and last name
                $nameParts = explode(' ', $latestOrder->customer_name, 2);
                $autofillData['firstName'] = $nameParts[0] ?? '';
                $autofillData['lastName'] = $nameParts[1] ?? '';
                $autofillData['phone'] = $latestOrder->customer_phone ?? '';

                // Parse the shipping address
                if ($latestOrder->shipping_address) {
                    $addressParts = explode(', ', $latestOrder->shipping_address);
                    $autofillData['address'] = $addressParts[0] ?? '';
                    $autofillData['city'] = $addressParts[1] ?? '';

                    if (count($addressParts) >= 3) {
                        $stateZip = $addressParts[2] ?? '';
                        $stateZipParts = explode(' ', $stateZip);
                        $autofillData['state'] = $stateZipParts[0] ?? '';
                        $autofillData['zipCode'] = $stateZipParts[1] ?? '';
                    }

                    $autofillData['country'] = $addressParts[3] ?? '';
                }
            } else {
                // If no previous orders, try to extract name from user's name field
                $nameParts = explode(' ', $user->name, 2);
                $autofillData['firstName'] = $nameParts[0] ?? '';
                $autofillData['lastName'] = $nameParts[1] ?? '';
            }

            return response()->json([
                'user' => $user,
                'autofill' => $autofillData
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user profile', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'An error occurred while fetching user profile.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function forgotPassword(Request $request)
    {
        try {
            Log::info('Forgot password attempt', ['email' => $request->email]);

            $request->validate([
                'email' => 'required|email|exists:users,email'
            ], [
                'email.required' => 'البريد الإلكتروني مطلوب.',
                'email.email' => 'يرجى إدخال عنوان بريد إلكتروني صالح.',
                'email.exists' => 'لم نتمكن من العثور على مستخدم بهذا البريد الإلكتروني.'
            ]);

            $user = User::where('email', $request->email)->first();

            // Generate reset token
            $token = Str::random(60);

            // Store token in password_resets table
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => Carbon::now()
                ]
            );

            // Send reset email
            $this->sendPasswordResetEmail($user, $token);

            Log::info('Password reset email sent', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'تم إرسال رابط إعادة تعيين كلمة المرور إلى عنوان بريدك الإلكتروني.'
            ]);

        } catch (ValidationException $e) {
            Log::warning('Validation error during forgot password', [
                'email' => $request->email,
                'errors' => $e->errors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Forgot password error', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'حدث خطأ أثناء معالجة طلبك.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        try {
            Log::info('Password reset attempt', ['email' => $request->email]);

            $request->validate([
                'email' => 'required|email|exists:users,email',
                'token' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ], [
                'email.required' => 'البريد الإلكتروني مطلوب.',
                'email.email' => 'يرجى إدخال عنوان بريد إلكتروني صالح.',
                'email.exists' => 'لم نتمكن من العثور على مستخدم بهذا البريد الإلكتروني.',
                'token.required' => 'رمز إعادة التعيين مطلوب.',
                'password.required' => 'كلمة المرور مطلوبة.',
                'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
                'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            ]);

            // Check if reset token exists and is valid
            $passwordReset = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$passwordReset || !Hash::check($request->token, $passwordReset->token)) {
                Log::warning('Invalid reset token', ['email' => $request->email]);
                return response()->json([
                    'message' => 'Invalid or expired reset token.'
                ], 400);
            }

            // Check if token is not expired (24 hours)
            if (Carbon::parse($passwordReset->created_at)->addHours(24)->isPast()) {
                Log::warning('Expired reset token', ['email' => $request->email]);
                DB::table('password_reset_tokens')->where('email', $request->email)->delete();
                return response()->json([
                    'message' => 'Reset token has expired. Please request a new one.'
                ], 400);
            }

            // Update user password
            $user = User::where('email', $request->email)->first();
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            // Delete the reset token
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            Log::info('Password reset successful', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Password has been reset successfully.'
            ]);

        } catch (ValidationException $e) {
            Log::warning('Validation error during password reset', [
                'email' => $request->email,
                'errors' => $e->errors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Password reset error', [
                'email' => $request->email,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'An error occurred while resetting your password.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        try {
            Log::info('Change password attempt', ['user_id' => $request->user()->id]);

            $request->validate([
                'current_password' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
            ], [
                'password.confirmed' => 'The password confirmation does not match.',
                'password.min' => 'The password must be at least 8 characters.',
            ]);

            $user = $request->user();

            // Check if current password is correct
            if (!Hash::check($request->current_password, $user->password)) {
                Log::warning('Incorrect current password', ['user_id' => $user->id]);
                return response()->json([
                    'message' => 'Current password is incorrect.'
                ], 400);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            Log::info('Password changed successfully', ['user_id' => $user->id]);

            return response()->json([
                'message' => 'Password has been changed successfully.'
            ]);

        } catch (ValidationException $e) {
            Log::warning('Validation error during password change', [
                'user_id' => $request->user()->id,
                'errors' => $e->errors()
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('Password change error', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'message' => 'An error occurred while changing your password.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function sendPasswordResetEmail(User $user, string $token)
    {
        try {
            $resetUrl = config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            $subject = 'إعادة تعيين كلمة المرور | البركة للتمور';

            $emailContent = $this->formatPasswordResetEmail($user, $resetUrl);

            Mail::raw($emailContent, function ($message) use ($user, $subject) {
                $message->to($user->email)
                       ->subject($subject)
                       ->from(config('mail.from.address'), config('mail.from.name'));
            });

        } catch (\Exception $e) {
            Log::error('Failed to send password reset email', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function formatPasswordResetEmail(User $user, string $resetUrl): string
    {
        return "=== إعادة تعيين كلمة المرور ===\n\n" .
               "مرحباً {$user->name}،\n\n" .
               "لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في البركة للتمور ومنتجات النخيل.\n\n" .
               "لإعادة تعيين كلمة المرور، يرجى النقر على الرابط التالي:\n\n" .
               "{$resetUrl}\n\n" .
               "ملاحظة مهمة:\n" .
               "• هذا الرابط صالح لمدة 24 ساعة فقط من وقت إرسال هذا البريد\n" .
               "• إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني\n" .
               "• لأمانك، لا تشارك هذا الرابط مع أي شخص آخر\n\n" .
               "إذا واجهت أي مشاكل أو كان لديك أي استفسارات، لا تتردد في التواصل معنا.\n\n" .
               "مع أطيب التحيات،\n" .
               "فريق البركة للتمور ومنتجات النخيل\n\n" .
               "---\n" .
               "تم إنشاء هذا البريد الإلكتروني تلقائياً، يرجى عدم الرد عليه مباشرة.\n" .
               "للاستفسارات والدعم الفني، يرجى التواصل معنا عبر الموقع الإلكتروني.";
    }
}
