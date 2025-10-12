-- ===================================================================
-- MIGRATION: Add life_points column to game_state table
-- Date: 2025-10-12
-- Description: Adds life_points field to track character health
-- ===================================================================

-- Add life_points column to game_state table
ALTER TABLE game_state
ADD COLUMN IF NOT EXISTS life_points INTEGER DEFAULT 0;

-- Add comment to document the column
COMMENT ON COLUMN game_state.life_points IS 'Puntos de vida actuales del personaje';
