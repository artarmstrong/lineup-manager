-- Enable RLS on lineups table
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own lineups
CREATE POLICY "Users can view their own lineups"
  ON lineups
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert lineups with their own user_id
CREATE POLICY "Users can create their own lineups"
  ON lineups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own lineups
CREATE POLICY "Users can update their own lineups"
  ON lineups
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own lineups
CREATE POLICY "Users can delete their own lineups"
  ON lineups
  FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on lineup_activity table
ALTER TABLE lineup_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activity for their own lineups
CREATE POLICY "Users can view their lineup activity"
  ON lineup_activity
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lineups
      WHERE lineups.id = lineup_activity.lineup_id
      AND lineups.user_id = auth.uid()
    )
  );

-- Policy: Users can insert activity for their own lineups
CREATE POLICY "Users can create lineup activity"
  ON lineup_activity
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lineups
      WHERE lineups.id = lineup_activity.lineup_id
      AND lineups.user_id = auth.uid()
    )
  );
