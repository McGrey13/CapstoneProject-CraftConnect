<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        // Log all exceptions for debugging
        $this->reportable(function (Throwable $e) {
            \Log::error('Exception occurred', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
        });
    }

    /**
     * Convert an authentication exception into a response.
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        // For API routes, return JSON response
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
                'error' => 'Authentication required'
            ], 401);
        }

        return redirect()->guest($exception->redirectTo() ?? route('login'));
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        // For API routes, always return JSON
        if ($request->is('api/*') || $request->expectsJson()) {
            
            // Handle 404 errors
            if ($exception instanceof NotFoundHttpException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found',
                    'error' => 'The requested resource was not found'
                ], 404);
            }

            // Handle authentication errors
            if ($exception instanceof AuthenticationException) {
                return $this->unauthenticated($request, $exception);
            }

            // Handle validation errors
            if ($exception instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $exception->errors()
                ], 422);
            }

            // Handle other exceptions
            $statusCode = method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;
            
            // Always log the exception for debugging
            \Log::error('API Exception', [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);
            
            // Return detailed error in debug mode, generic in production
            $isDebug = config('app.debug', false);
            
            return response()->json([
                'success' => false,
                'message' => 'Server Error',
                'error' => $isDebug ? $exception->getMessage() : 'Internal Server Error',
                'file' => $isDebug ? $exception->getFile() : null,
                'line' => $isDebug ? $exception->getLine() : null,
            ], $statusCode);
        }

        return parent::render($request, $exception);
    }
}
