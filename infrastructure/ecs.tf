resource "aws_ecs_cluster" "main" {
  name = local.prefix

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  configuration {
    execute_command_configuration {
      kms_key_id = aws_kms_key.data.arn
      logging    = "OVERRIDE"
      log_configuration {
        cloud_watch_encryption_enabled = true
        cloud_watch_log_group_name     = aws_cloudwatch_log_group.ecs_exec.name
      }
    }
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = "${local.prefix}-app"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.app_cpu
  memory                   = var.app_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.app_task.arn

  container_definitions = jsonencode([{
    name                   = "app"
    image                  = var.app_image
    essential              = true
    readonlyRootFilesystem = true
    portMappings           = [{ containerPort = var.app_port, protocol = "tcp" }]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "DB_HOST", value = aws_db_instance.postgres.address },
      { name = "DB_PORT", value = tostring(aws_db_instance.postgres.port) },
      { name = "DB_NAME", value = var.db_name },
      { name = "DB_USER", value = var.db_username },
      { name = "DB_SSL", value = "true" },
      { name = "REDIS_HOST", value = aws_elasticache_serverless_cache.redis.endpoint[0].address },
      { name = "REDIS_PORT", value = tostring(aws_elasticache_serverless_cache.redis.endpoint[0].port) },
      { name = "REDIS_TLS", value = "true" },
      { name = "FHIR_BASE_URL", value = "https://${aws_lb.fhir.dns_name}" }
    ]
    secrets = concat(
      [{ name = "DB_PASSWORD", valueFrom = "${aws_db_instance.postgres.master_user_secret[0].secret_arn}:password::" }],
      [for name, arn in var.app_secret_arns : { name = name, valueFrom = arn }]
    )
    mountPoints     = []
    volumesFrom     = []
    linuxParameters = { initProcessEnabled = true }
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.app.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "app"
      }
    }
  }])

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }
}

resource "aws_ecs_task_definition" "fhir" {
  family                   = "${local.prefix}-fhir"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.fhir_cpu
  memory                   = var.fhir_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.fhir_task.arn

  container_definitions = jsonencode([{
    name                   = "fhir"
    image                  = var.fhir_image
    essential              = true
    readonlyRootFilesystem = true
    portMappings           = [{ containerPort = var.fhir_port, protocol = "tcp" }]
    environment = [
      { name = "DB_HOST", value = aws_db_instance.postgres.address },
      { name = "DB_PORT", value = tostring(aws_db_instance.postgres.port) },
      { name = "DB_NAME", value = var.db_name },
      { name = "DB_USER", value = var.db_username },
      { name = "DB_SSL", value = "true" }
    ]
    secrets = concat(
      [{ name = "DB_PASSWORD", valueFrom = "${aws_db_instance.postgres.master_user_secret[0].secret_arn}:password::" }],
      [for name, arn in var.fhir_secret_arns : { name = name, valueFrom = arn }]
    )
    mountPoints     = []
    volumesFrom     = []
    linuxParameters = { initProcessEnabled = true }
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.fhir.name
        awslogs-region        = var.aws_region
        awslogs-stream-prefix = "fhir"
      }
    }
  }])
}

resource "aws_ecs_service" "app" {
  name                               = "app"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.app.arn
  desired_count                      = var.app_desired_count
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  enable_execute_command             = false
  health_check_grace_period_seconds  = 60

  network_configuration {
    subnets          = aws_subnet.app[*].id
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = var.app_port
  }

  depends_on = [aws_lb_listener.public_https]
}

resource "aws_ecs_service" "fhir" {
  name                               = "fhir"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.fhir.arn
  desired_count                      = var.fhir_desired_count
  launch_type                        = "FARGATE"
  platform_version                   = "LATEST"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  enable_execute_command             = false
  health_check_grace_period_seconds  = 90

  network_configuration {
    subnets          = aws_subnet.app[*].id
    security_groups  = [aws_security_group.fhir.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.fhir.arn
    container_name   = "fhir"
    container_port   = var.fhir_port
  }

  depends_on = [aws_lb_listener.fhir_https]
}

resource "aws_appautoscaling_target" "app" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "app_cpu" {
  name               = "${local.prefix}-app-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.app.resource_id
  scalable_dimension = aws_appautoscaling_target.app.scalable_dimension
  service_namespace  = aws_appautoscaling_target.app.service_namespace
  target_tracking_scaling_policy_configuration {
    target_value = 60
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
  }
}
