-- Debug script voor weekberekening probleem
-- Probleem: Taken zichtbaar in admin en week erna, maar niet in week 3-7 augustus

-- Stap 1: Controleer alle taken in augustus met weeknummer
SELECT 
    id,
    title,
    due_date,
    EXTRACT(WEEK FROM due_date) as week_number,
    EXTRACT(YEAR FROM due_date) as year,
    TO_CHAR(due_date, 'Day DD-MM-YYYY') as formatted_date,
    EXTRACT(DOW FROM due_date) as day_of_week, -- 0=Sunday, 1=Monday, etc.
    completed
FROM tasks 
WHERE due_date >= '2024-08-01' 
AND due_date <= '2024-08-31'
ORDER BY due_date;

-- Stap 2: Bereken welke week 3 augustus 2024 is (zaterdag)
-- En welke week 5 augustus 2024 is (maandag)
SELECT 
    '2024-08-03' as datum,
    '2024-08-03'::date as parsed_date,
    EXTRACT(DOW FROM '2024-08-03'::date) as day_of_week,
    EXTRACT(WEEK FROM '2024-08-03'::date) as week_number,
    TO_CHAR('2024-08-03'::date, 'Day DD-MM-YYYY') as formatted

UNION ALL

SELECT 
    '2024-08-05' as datum,
    '2024-08-05'::date as parsed_date,
    EXTRACT(DOW FROM '2024-08-05'::date) as day_of_week,
    EXTRACT(WEEK FROM '2024-08-05'::date) as week_number,
    TO_CHAR('2024-08-05'::date, 'Day DD-MM-YYYY') as formatted

UNION ALL

SELECT 
    '2024-08-07' as datum,
    '2024-08-07'::date as parsed_date,
    EXTRACT(DOW FROM '2024-08-07'::date) as day_of_week,
    EXTRACT(WEEK FROM '2024-08-07'::date) as week_number,
    TO_CHAR('2024-08-07'::date, 'Day DD-MM-YYYY') as formatted;

-- Stap 3: Bereken week start/end zoals de applicatie dat doet
-- Voor 3 augustus 2024 (zaterdag)
WITH week_calc AS (
    SELECT 
        '2024-08-03'::date as input_date,
        EXTRACT(DOW FROM '2024-08-03'::date) as day_of_week
),
week_start AS (
    SELECT 
        input_date,
        day_of_week,
        -- JavaScript logic: adjust when day is Sunday (0), otherwise Monday (1) 
        input_date - INTERVAL '1 day' * (day_of_week - CASE WHEN day_of_week = 0 THEN -6 ELSE 1 END) as calculated_start
    FROM week_calc
)
SELECT 
    input_date as original_date,
    day_of_week,
    calculated_start as week_start,
    calculated_start + INTERVAL '6 days' as week_end,
    TO_CHAR(calculated_start, 'Day DD-MM-YYYY') as week_start_formatted,
    TO_CHAR(calculated_start + INTERVAL '6 days', 'Day DD-MM-YYYY') as week_end_formatted
FROM week_start;

-- Stap 4: Test met verschillende datums in die periode
WITH test_dates AS (
    SELECT date_val
    FROM generate_series('2024-08-01'::date, '2024-08-15'::date, '1 day'::interval) as date_val
),
week_calculations AS (
    SELECT 
        date_val,
        EXTRACT(DOW FROM date_val) as day_of_week,
        date_val - INTERVAL '1 day' * (EXTRACT(DOW FROM date_val) - CASE WHEN EXTRACT(DOW FROM date_val) = 0 THEN -6 ELSE 1 END) as week_start,
        TO_CHAR(date_val, 'Day DD-MM') as date_formatted
    FROM test_dates
)
SELECT 
    date_formatted,
    TO_CHAR(week_start, 'Mon DD') as week_start_formatted,
    TO_CHAR(week_start + INTERVAL '6 days', 'Mon DD') as week_end_formatted,
    CASE 
        WHEN date_val BETWEEN '2024-08-03' AND '2024-08-07' THEN '← DEZE PERIODE'
        ELSE ''
    END as highlight
FROM week_calculations
ORDER BY date_val;

-- Stap 5: Controleer taken die zichtbaar zijn in "week erna"
SELECT 
    id,
    title,
    due_date,
    TO_CHAR(due_date, 'Day DD-MM-YYYY') as formatted_date,
    'Week erna' as label
FROM tasks 
WHERE due_date >= '2024-08-12' 
AND due_date <= '2024-08-18'
ORDER BY due_date;