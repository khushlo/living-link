-- Preserve the newest goal for each donor/metric and move older readings to it.
WITH ranked_goals AS (
  SELECT
    id,
    FIRST_VALUE(id) OVER (
      PARTITION BY donor_profile_id, metric
      ORDER BY created_at DESC, id DESC
    ) AS keeper_id,
    ROW_NUMBER() OVER (
      PARTITION BY donor_profile_id, metric
      ORDER BY created_at DESC, id DESC
    ) AS row_number
  FROM health_goals
)
UPDATE goal_progress_logs AS logs
SET goal_id = ranked.keeper_id
FROM ranked_goals AS ranked
WHERE logs.goal_id = ranked.id
  AND ranked.row_number > 1;

WITH ranked_goals AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY donor_profile_id, metric
      ORDER BY created_at DESC, id DESC
    ) AS row_number
  FROM health_goals
)
DELETE FROM health_goals AS goals
USING ranked_goals AS ranked
WHERE goals.id = ranked.id
  AND ranked.row_number > 1;

CREATE UNIQUE INDEX health_goals_donor_profile_id_metric_key
ON health_goals(donor_profile_id, metric);
