resource "aws_security_group" "public_alb" {
  name        = "${local.prefix}-public-alb"
  description = "Public TLS ingress"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "app" {
  name        = "${local.prefix}-app"
  description = "Application Fargate tasks"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "fhir_alb" {
  name        = "${local.prefix}-fhir-alb"
  description = "Private FHIR load balancer"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "fhir" {
  name        = "${local.prefix}-fhir"
  description = "Private FHIR Fargate tasks"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "database" {
  name        = "${local.prefix}-database"
  description = "PostgreSQL from workload tasks"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "redis" {
  name        = "${local.prefix}-redis"
  description = "Redis from application tasks"
  vpc_id      = aws_vpc.main.id
}

resource "aws_security_group" "endpoints" {
  name        = "${local.prefix}-endpoints"
  description = "AWS PrivateLink endpoints"
  vpc_id      = aws_vpc.main.id
}

resource "aws_vpc_security_group_ingress_rule" "public_https" {
  for_each = toset(var.allowed_ipv4_cidrs)

  security_group_id = aws_security_group.public_alb.id
  description       = "HTTPS from approved network"
  cidr_ipv4         = each.value
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "public_to_app" {
  security_group_id            = aws_security_group.public_alb.id
  description                  = "TLS to application tasks"
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = var.app_port
  to_port                      = var.app_port
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "app_from_public" {
  security_group_id            = aws_security_group.app.id
  description                  = "Application TLS from public ALB"
  referenced_security_group_id = aws_security_group.public_alb.id
  from_port                    = var.app_port
  to_port                      = var.app_port
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "app_https" {
  security_group_id = aws_security_group.app.id
  description       = "TLS to AWS services and approved external dependencies"
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "fhir_alb_from_app" {
  security_group_id            = aws_security_group.fhir_alb.id
  description                  = "FHIR TLS from application"
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "fhir_alb_to_tasks" {
  security_group_id            = aws_security_group.fhir_alb.id
  description                  = "TLS to FHIR tasks"
  referenced_security_group_id = aws_security_group.fhir.id
  from_port                    = var.fhir_port
  to_port                      = var.fhir_port
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "fhir_from_alb" {
  security_group_id            = aws_security_group.fhir.id
  description                  = "FHIR TLS from private ALB"
  referenced_security_group_id = aws_security_group.fhir_alb.id
  from_port                    = var.fhir_port
  to_port                      = var.fhir_port
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "fhir_https" {
  security_group_id = aws_security_group.fhir.id
  description       = "TLS to AWS services and approved external dependencies"
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "database_from_app" {
  security_group_id            = aws_security_group.database.id
  description                  = "PostgreSQL from application"
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "database_from_fhir" {
  security_group_id            = aws_security_group.database.id
  description                  = "PostgreSQL from FHIR"
  referenced_security_group_id = aws_security_group.fhir.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "app_to_database" {
  security_group_id            = aws_security_group.app.id
  description                  = "PostgreSQL to database"
  referenced_security_group_id = aws_security_group.database.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "fhir_to_database" {
  security_group_id            = aws_security_group.fhir.id
  description                  = "PostgreSQL to database"
  referenced_security_group_id = aws_security_group.database.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "redis_from_app" {
  security_group_id            = aws_security_group.redis.id
  description                  = "TLS Redis from application"
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_egress_rule" "app_to_redis" {
  security_group_id            = aws_security_group.app.id
  description                  = "TLS Redis for distributed rate limiting"
  referenced_security_group_id = aws_security_group.redis.id
  from_port                    = 6379
  to_port                      = 6379
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "endpoints_from_app" {
  security_group_id            = aws_security_group.endpoints.id
  description                  = "PrivateLink TLS from application"
  referenced_security_group_id = aws_security_group.app.id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
}

resource "aws_vpc_security_group_ingress_rule" "endpoints_from_fhir" {
  security_group_id            = aws_security_group.endpoints.id
  description                  = "PrivateLink TLS from FHIR"
  referenced_security_group_id = aws_security_group.fhir.id
  from_port                    = 443
  to_port                      = 443
  ip_protocol                  = "tcp"
}
