<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Midtrans Payment Gateway Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Midtrans payment gateway integration.
    | Used for QRIS payments and Snap payment popup.
    |
    | Get your keys at: https://dashboard.midtrans.com
    |
    */

    /*
     * Server Key is used for server-to-server API calls.
     * Keep this secret and never expose it to the frontend.
     */
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),

    /*
     * Client Key is used on the frontend (Snap.js popup).
     * This is safe to expose to the frontend.
     */
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),

    /*
     * Set to true when going live.
     * false = Sandbox mode (for development/testing)
     * true  = Production mode (live transactions)
     */
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),

    /*
     * Sanitized mode will sanitize HTML tags in the payload
     * to prevent potential XSS attacks via payment metadata.
     */
    'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),

    /*
     * 3D Secure (3DS) is required for card transactions.
     * Recommended to keep this enabled.
     */
    'is_3ds' => env('MIDTRANS_IS_3DS', true),

    /*
     * Snap API URL (resolved automatically based on is_production).
     * Sandbox: https://app.sandbox.midtrans.com/snap/snap.js
     * Production: https://app.midtrans.com/snap/snap.js
     */
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', false)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',

];
