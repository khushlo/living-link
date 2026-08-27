output "public_alb_dns_name" {
  description = "Create an approved DNS record pointing at this public ALB."
  value       = aws_lb.public.dns_name
}

output "private_fhir_url" {
  description = "Private FHIR endpoint reachable only from the application security group."
  value       = "https://${aws_lb.fhir.dns_name}"
}

output "rds_endpoint" {
  value     = aws_db_instance.postgres.endpoint
  sensitive = true
}

output "rds_master_secret_arn" {
  description = "AWS-managed database master credential secret ARN; no secret value is output."
  value       = aws_db_instance.postgres.master_user_secret[0].secret_arn
  sensitive   = true
}

output "redis_endpoint" {
  value     = aws_elasticache_serverless_cache.redis.endpoint[0].address
  sensitive = true
}

output "alarm_topic_arn" {
  value = aws_sns_topic.alarms.arn
}

output "kms_key_arns" {
  value = {
    data = aws_kms_key.data.arn
    logs = aws_kms_key.logs.arn
  }
}
