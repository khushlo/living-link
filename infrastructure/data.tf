resource "aws_db_subnet_group" "main" {
  name       = local.prefix
  subnet_ids = aws_subnet.data[*].id
}

resource "aws_db_parameter_group" "postgres" {
  name   = "${local.prefix}-postgres16"
  family = "postgres16"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }
  parameter {
    name         = "log_connections"
    value        = "1"
    apply_method = "immediate"
  }
  parameter {
    name         = "log_disconnections"
    value        = "1"
    apply_method = "immediate"
  }
}

resource "aws_db_instance" "postgres" {
  identifier = local.prefix

  engine                        = "postgres"
  engine_version                = "16.6"
  instance_class                = var.db_instance_class
  db_name                       = var.db_name
  username                      = var.db_username
  manage_master_user_password   = true
  master_user_secret_kms_key_id = aws_kms_key.data.arn

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.data.arn

  multi_az                   = true
  publicly_accessible        = false
  db_subnet_group_name       = aws_db_subnet_group.main.name
  vpc_security_group_ids     = [aws_security_group.database.id]
  parameter_group_name       = aws_db_parameter_group.postgres.name
  port                       = 5432
  backup_retention_period    = var.db_backup_retention_days
  backup_window              = "03:00-04:00"
  maintenance_window         = "sun:05:00-sun:06:00"
  auto_minor_version_upgrade = true
  deletion_protection        = true
  skip_final_snapshot        = false
  final_snapshot_identifier  = "${local.prefix}-final"
  copy_tags_to_snapshot      = true

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true
  performance_insights_kms_key_id = aws_kms_key.data.arn
  monitoring_interval             = 60
  monitoring_role_arn             = aws_iam_role.rds_monitoring.arn
}

resource "aws_elasticache_serverless_cache" "redis" {
  engine = "redis"
  name   = "${local.prefix}-rate-limit"

  description              = "Distributed application rate limiting"
  major_engine_version     = "7"
  kms_key_id               = aws_kms_key.data.arn
  security_group_ids       = [aws_security_group.redis.id]
  subnet_ids               = aws_subnet.data[*].id
  daily_snapshot_time      = "04:00"
  snapshot_retention_limit = 35

  cache_usage_limits {
    data_storage {
      maximum = 10
      unit    = "GB"
    }
    ecpu_per_second {
      maximum = 5000
    }
  }
}
