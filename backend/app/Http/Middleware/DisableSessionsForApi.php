<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DisableSessionsForApi
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Completely disable session for API routes
        config(['session.driver' => 'array']);
        config(['session.lifetime' => 0]);
        
        // Remove any session cookies
        if ($request->hasSession()) {
            $request->session()->flush();
        }
        
        return $next($request);
    }
}
