-- Check the current trigger function
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';