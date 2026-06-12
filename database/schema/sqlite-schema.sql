CREATE TABLE IF NOT EXISTS "migrations"(
  "id" integer primary key autoincrement not null,
  "migration" varchar not null,
  "batch" integer not null
);
CREATE TABLE IF NOT EXISTS "password_reset_tokens"(
  "email" varchar not null,
  "token" varchar not null,
  "created_at" datetime,
  primary key("email")
);
CREATE TABLE IF NOT EXISTS "sessions"(
  "id" varchar not null,
  "user_id" integer,
  "ip_address" varchar,
  "user_agent" text,
  "payload" text not null,
  "last_activity" integer not null,
  primary key("id")
);
CREATE INDEX "sessions_user_id_index" on "sessions"("user_id");
CREATE INDEX "sessions_last_activity_index" on "sessions"("last_activity");
CREATE TABLE IF NOT EXISTS "cache"(
  "key" varchar not null,
  "value" text not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE INDEX "cache_expiration_index" on "cache"("expiration");
CREATE TABLE IF NOT EXISTS "cache_locks"(
  "key" varchar not null,
  "owner" varchar not null,
  "expiration" integer not null,
  primary key("key")
);
CREATE INDEX "cache_locks_expiration_index" on "cache_locks"("expiration");
CREATE TABLE IF NOT EXISTS "jobs"(
  "id" integer primary key autoincrement not null,
  "queue" varchar not null,
  "payload" text not null,
  "attempts" integer not null,
  "reserved_at" integer,
  "available_at" integer not null,
  "created_at" integer not null
);
CREATE INDEX "jobs_queue_index" on "jobs"("queue");
CREATE TABLE IF NOT EXISTS "job_batches"(
  "id" varchar not null,
  "name" varchar not null,
  "total_jobs" integer not null,
  "pending_jobs" integer not null,
  "failed_jobs" integer not null,
  "failed_job_ids" text not null,
  "options" text,
  "cancelled_at" integer,
  "created_at" integer not null,
  "finished_at" integer,
  primary key("id")
);
CREATE TABLE IF NOT EXISTS "failed_jobs"(
  "id" integer primary key autoincrement not null,
  "uuid" varchar not null,
  "connection" varchar not null,
  "queue" varchar not null,
  "payload" text not null,
  "exception" text not null,
  "failed_at" datetime not null default CURRENT_TIMESTAMP
);
CREATE INDEX "failed_jobs_connection_queue_failed_at_index" on "failed_jobs"(
  "connection",
  "queue",
  "failed_at"
);
CREATE UNIQUE INDEX "failed_jobs_uuid_unique" on "failed_jobs"("uuid");
CREATE TABLE IF NOT EXISTS "personal_access_tokens"(
  "id" integer primary key autoincrement not null,
  "tokenable_type" varchar not null,
  "tokenable_id" integer not null,
  "name" text not null,
  "token" varchar not null,
  "abilities" text,
  "last_used_at" datetime,
  "expires_at" datetime,
  "created_at" datetime,
  "updated_at" datetime
);
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" on "personal_access_tokens"(
  "tokenable_type",
  "tokenable_id"
);
CREATE UNIQUE INDEX "personal_access_tokens_token_unique" on "personal_access_tokens"(
  "token"
);
CREATE INDEX "personal_access_tokens_expires_at_index" on "personal_access_tokens"(
  "expires_at"
);
CREATE TABLE IF NOT EXISTS "courses"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "description" text,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime
);
CREATE TABLE IF NOT EXISTS "batches"(
  "id" integer primary key autoincrement not null,
  "course_id" integer not null,
  "name" varchar not null,
  "fee" numeric not null default '0',
  "schedule_time" varchar,
  "is_active" tinyint(1) not null default '1',
  "is_hidden" tinyint(1) not null default '0',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("course_id") references "courses"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "mcq_papers"(
  "id" integer primary key autoincrement not null,
  "batch_id" integer not null,
  "title" varchar not null,
  "description" text,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  "exam_date" date,
  "exam_password" varchar,
  foreign key("batch_id") references "batches"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "mcq_questions"(
  "id" integer primary key autoincrement not null,
  "mcq_paper_id" integer not null,
  "question_text" text not null,
  "option_a" varchar not null,
  "option_b" varchar not null,
  "option_c" varchar not null,
  "option_d" varchar not null,
  "correct_option" varchar not null,
  "is_active" tinyint(1) not null default '1',
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("mcq_paper_id") references "mcq_papers"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "users"(
  "id" integer primary key autoincrement not null,
  "name" varchar not null,
  "email" varchar not null,
  "email_verified_at" datetime,
  "password" varchar not null,
  "role" varchar not null default('student'),
  "is_active" tinyint(1) not null default('1'),
  "remember_token" varchar,
  "created_at" datetime,
  "updated_at" datetime,
  "batch_id" integer,
  "father_name" varchar,
  "phone" varchar,
  "registration_id" varchar,
  "address" text,
  "dob" date,
  "gender" varchar,
  foreign key("batch_id") references "batches"("id") on delete set null
);
CREATE UNIQUE INDEX "users_email_unique" on "users"("email");
CREATE TABLE IF NOT EXISTS "exam_results"(
  "id" integer primary key autoincrement not null,
  "user_id" integer not null,
  "mcq_paper_id" integer not null,
  "score" integer not null,
  "total_questions" integer not null,
  "percentage" float not null,
  "created_at" datetime,
  "updated_at" datetime,
  foreign key("user_id") references "users"("id") on delete cascade,
  foreign key("mcq_paper_id") references "mcq_papers"("id") on delete cascade
);
CREATE TABLE IF NOT EXISTS "batch_user"(
  "id" integer primary key autoincrement not null,
  "batch_id" integer not null,
  "user_id" integer not null,
  "created_at" datetime,
  "updated_at" datetime,
  "amount_paid" numeric,
  "transaction_id" varchar,
  "status" varchar default 'unpaid',
  foreign key("batch_id") references "batches"("id") on delete cascade,
  foreign key("user_id") references "users"("id") on delete cascade
);

INSERT INTO migrations VALUES(1,'0001_01_01_000000_create_users_table',1);
INSERT INTO migrations VALUES(2,'0001_01_01_000001_create_cache_table',1);
INSERT INTO migrations VALUES(3,'0001_01_01_000002_create_jobs_table',1);
INSERT INTO migrations VALUES(4,'2026_06_12_160043_create_personal_access_tokens_table',1);
INSERT INTO migrations VALUES(5,'2026_06_12_163001_create_courses_table',1);
INSERT INTO migrations VALUES(6,'2026_06_12_163002_create_batches_table',1);
INSERT INTO migrations VALUES(7,'2026_06_12_163002_create_mcq_papers_table',1);
INSERT INTO migrations VALUES(8,'2026_06_12_163002_create_mcq_questions_table',1);
INSERT INTO migrations VALUES(9,'2026_06_12_163026_add_batch_id_to_users_table',1);
INSERT INTO migrations VALUES(10,'2026_06_12_200548_create_exam_results_table',2);
INSERT INTO migrations VALUES(11,'2026_06_12_200611_add_exam_fields_to_mcq_papers_table',2);
INSERT INTO migrations VALUES(12,'2026_06_12_203900_create_batch_user_table',3);
INSERT INTO migrations VALUES(13,'2026_06_13_023100_add_payment_columns_to_batch_user_table',4);
INSERT INTO migrations VALUES(14,'2026_06_13_023100_add_profile_columns_to_users_table',5);
