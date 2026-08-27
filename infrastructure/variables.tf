variable "aws_region" {
  description = "AWS region approved for the workload and its data residency requirements."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "production"

  validation {
    condition     = can(regex("^[a-z0-9-]+$", var.environment))
    error_message = "environment must contain only lowercase letters, numbers, and hyphens."
  }
}

variable "name" {
  description = "Short workload name used in resource names."
  type        = string
  default     = "kidneyx"
}

variable "availability_zones" {
  description = "At least two availability zones in aws_region."
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]

  validation {
    condition     = length(var.availability_zones) >= 2
    error_message = "At least two availability zones are required."
  }
}

variable "vpc_cidr" {
  type    = string
  default = "10.40.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.40.0.0/24", "10.40.1.0/24"]
}

variable "private_app_subnet_cidrs" {
  type    = list(string)
  default = ["10.40.10.0/24", "10.40.11.0/24"]
}

variable "private_data_subnet_cidrs" {
  type    = list(string)
  default = ["10.40.20.0/24", "10.40.21.0/24"]
}

variable "app_image" {
  description = "Immutable application image URI, preferably an ECR digest."
  type        = string
}

variable "fhir_image" {
  description = "Immutable private FHIR service image URI, preferably an ECR digest."
  type        = string
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "fhir_port" {
  type    = number
  default = 8443
}

variable "app_health_check_path" {
  type    = string
  default = "/api/health"
}

variable "fhir_health_check_path" {
  type    = string
  default = "/health"
}

variable "public_certificate_arn" {
  description = "ACM certificate ARN for the public application ALB."
  type        = string
}

variable "fhir_certificate_arn" {
  description = "ACM certificate ARN for the private FHIR ALB."
  type        = string
}

variable "app_secret_arns" {
  description = "Map of ECS environment variable names to Secrets Manager secret ARNs. Values are references, not secret material."
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "fhir_secret_arns" {
  description = "Map of FHIR ECS environment variable names to Secrets Manager secret ARNs."
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "app_cpu" {
  type    = number
  default = 512
}

variable "app_memory" {
  type    = number
  default = 1024
}

variable "fhir_cpu" {
  type    = number
  default = 1024
}

variable "fhir_memory" {
  type    = number
  default = 2048
}

variable "app_desired_count" {
  type    = number
  default = 2
}

variable "fhir_desired_count" {
  type    = number
  default = 2
}

variable "db_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "db_name" {
  type    = string
  default = "kidneyx"
}

variable "db_username" {
  type    = string
  default = "kidneyx_admin"
}

variable "db_allocated_storage" {
  type    = number
  default = 100
}

variable "db_max_allocated_storage" {
  type    = number
  default = 500
}

variable "db_backup_retention_days" {
  type    = number
  default = 35
}

variable "log_retention_days" {
  type    = number
  default = 365
}

variable "alarm_email" {
  description = "Optional operations mailbox. Subscription confirmation is required."
  type        = string
  default     = null
}

variable "allowed_ipv4_cidrs" {
  description = "IPv4 networks allowed to reach the public ALB. Restrict where possible."
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "tags" {
  description = "Additional non-PHI resource tags. Never put PHI or secrets in tags."
  type        = map(string)
  default     = {}
}
