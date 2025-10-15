| table_name      | column_name            | data_type                | is_nullable | column_default               |
| --------------- | ---------------------- | ------------------------ | ----------- | ---------------------------- |
| lineup_activity | id                     | uuid                     | NO          | uuid_generate_v4()           |
| lineup_activity | lineup_id              | uuid                     | YES         | null                         |
| lineup_activity | user_id                | uuid                     | YES         | null                         |
| lineup_activity | action                 | character varying        | NO          | null                         |
| lineup_activity | changes                | jsonb                    | YES         | null                         |
| lineup_activity | created_at             | timestamp with time zone | YES         | now()                        |
| lineups         | id                     | uuid                     | NO          | uuid_generate_v4()           |
| lineups         | name                   | character varying        | NO          | null                         |
| lineups         | data                   | jsonb                    | NO          | null                         |
| lineups         | user_id                | uuid                     | YES         | null                         |
| lineups         | team_id                | uuid                     | YES         | null                         |
| lineups         | created_by             | uuid                     | YES         | null                         |
| lineups         | created_at             | timestamp with time zone | YES         | now()                        |
| lineups         | updated_at             | timestamp with time zone | YES         | now()                        |
| profiles        | id                     | uuid                     | NO          | null                         |
| profiles        | full_name              | text                     | YES         | null                         |
| profiles        | avatar_url             | text                     | YES         | null                         |
| profiles        | updated_at             | timestamp with time zone | YES         | timezone('utc'::text, now()) |
| subscriptions   | id                     | uuid                     | NO          | uuid_generate_v4()           |
| subscriptions   | user_id                | uuid                     | YES         | null                         |
| subscriptions   | status                 | character varying        | NO          | null                         |
| subscriptions   | stripe_customer_id     | character varying        | YES         | null                         |
| subscriptions   | stripe_subscription_id | character varying        | YES         | null                         |
| subscriptions   | current_period_end     | timestamp with time zone | YES         | null                         |
| subscriptions   | created_at             | timestamp with time zone | YES         | now()                        |
| subscriptions   | updated_at             | timestamp with time zone | YES         | now()                        |
| team_members    | id                     | uuid                     | NO          | uuid_generate_v4()           |
| team_members    | team_id                | uuid                     | YES         | null                         |
| team_members    | user_id                | uuid                     | YES         | null                         |
| team_members    | role                   | character varying        | YES         | 'member'::character varying  |
| team_members    | joined_at              | timestamp with time zone | YES         | now()                        |
| teams           | id                     | uuid                     | NO          | uuid_generate_v4()           |
| teams           | name                   | character varying        | NO          | null                         |
| teams           | owner_id               | uuid                     | YES         | null                         |
| teams           | created_at             | timestamp with time zone | YES         | now()                        |