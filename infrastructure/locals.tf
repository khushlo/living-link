locals {
  prefix = "${var.name}-${var.environment}"
  tags = merge({
    Application        = var.name
    Environment        = var.environment
    ManagedBy          = "Terraform"
    DataClassification = "PHI-capable"
  }, var.tags)

  app_secret_arns  = values(var.app_secret_arns)
  fhir_secret_arns = values(var.fhir_secret_arns)
  all_secret_arns  = distinct(concat(local.app_secret_arns, local.fhir_secret_arns))
}

check "subnet_counts" {
  assert {
    condition = alltrue([
      length(var.public_subnet_cidrs) == length(var.availability_zones),
      length(var.private_app_subnet_cidrs) == length(var.availability_zones),
      length(var.private_data_subnet_cidrs) == length(var.availability_zones)
    ])
    error_message = "Each subnet CIDR list must have one entry per availability zone."
  }
}
