
import { createBrowserClient } from '@supabase/ssr'

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;
let isPlaceholderInstance = false;

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasConfig = supabaseUrl && supabaseUrl.startsWith('http');

    // Return cached instance if it's a real one, OR if it's a placeholder and we still don't have config
    if (supabaseInstance && (!isPlaceholderInstance || !hasConfig)) {
        return supabaseInstance;
    }

    // Fallback for development to prevent crash if keys are missing
    if (!hasConfig) {
        console.warn('⚠️ Supabase credentials missing or invalid. Using placeholder to prevent crash.');
        supabaseInstance = createBrowserClient(
            'https://placeholder.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQwNjcyMDB9.placeholder_signature_for_development_only'
        );
        isPlaceholderInstance = true;
        return supabaseInstance;
    }

    supabaseInstance = createBrowserClient(supabaseUrl!, supabaseKey!);
    isPlaceholderInstance = false;
    return supabaseInstance;
}

export function isSupabaseConfigured() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return supabaseUrl && supabaseUrl.startsWith('http');
}
