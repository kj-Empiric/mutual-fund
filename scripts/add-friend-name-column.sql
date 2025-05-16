-- Add the friend_name column to the transactions table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'friend_name'
    ) THEN
        ALTER TABLE transactions ADD COLUMN friend_name TEXT DEFAULT NULL;
        RAISE NOTICE 'Column friend_name added to transactions table';
    ELSE
        RAISE NOTICE 'Column friend_name already exists in transactions table';
    END IF;
END $$; 