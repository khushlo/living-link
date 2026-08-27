# AWS production baseline (WP-10)

This directory is a HIPAA-oriented Terraform baseline for the KidneyX workload. It creates a multi-AZ VPC, private Fargate application and FHIR tasks, public and private ALBs with TLS on both sides, WAF, encrypted PostgreSQL and Redis, customer-managed KMS keys, managed database credentials, centralized logging and alarms, and locked backups.

**This baseline is not compliance evidence or a certification. Deployment requires an executed AWS Business Associate Addendum (BAA), legal approval, a documented security and privacy risk assessment, architecture review, operational controls, and confirmation that every selected AWS service is HIPAA eligible in the deployed region.**

## Prerequisites

- Terraform 1.8.x and AWS provider 5.94.1.
- An AWS account governed through AWS Organizations, SCPs, IAM Identity Center, MFA, CloudTrail, Config, GuardDuty, Security Hub, and centralized security logging. Those account controls are intentionally outside this workload baseline.
- ACM certificates for the public and private ALBs. Both containers must serve HTTPS on their configured ports.
- Approved, scanned ECR images pinned by digest.
- Existing application secrets in Secrets Manager encrypted with the data KMS key, or an approved equivalent key whose decrypt permission is added to the execution role.
- A separately bootstrapped, encrypted and access-logged S3 Terraform backend with state locking. Terraform state and plans are sensitive security data.

## Use

1. Review every value and control with security, privacy, legal, and operations teams.
2. Copy `backend.tf.example` to `backend.tf` and replace placeholders only after the backend is provisioned.
3. Copy `examples/production.tfvars.example` to an untracked file outside source control and replace references. Never add secret values.
4. Authenticate using short-lived AWS credentials and run:

```sh
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -var-file=/secure/path/production.tfvars
```

Review plans for unexpected public access, replacement of protected resources, secret exposure, and tag content before applying. The RDS password is generated and rotated through RDS-managed Secrets Manager integration; only its ARN is passed to ECS.

## Security characteristics

- One NAT gateway per AZ and no public IPs on tasks or data resources.
- Data subnets have no default internet route. PrivateLink endpoints cover common ECS runtime dependencies.
- Security-group references constrain ALB, task, database, Redis, and endpoint traffic.
- TLS 1.2+ listeners and HTTPS target groups require encryption through to each container.
- RDS uses Multi-AZ, deletion protection, forced SSL, encrypted storage, Performance Insights, enhanced monitoring, 35-day automated backups, final snapshots, and AWS Backup.
- ElastiCache Serverless for Redis provides TLS in transit, KMS encryption at rest, snapshots, and a shared endpoint for distributed rate limiting.
- WAF uses AWS managed rules and an IP rate rule. WAF request sampling is disabled and authorization/cookie fields are redacted from WAF logs.
- CloudWatch log groups are KMS encrypted and retained for one year by default. ALB logs are encrypted, versioned, transitioned, and retained for seven years.
- ECS Exec is disabled on services. Task roles have no permissions until explicitly added; execution-role secret access is scoped to supplied ARNs.

## Intentional limitations

- This is a workload baseline, not a complete landing zone, threat model, incident response program, disaster recovery implementation, or HIPAA administrative/physical safeguards package.
- No Route 53 records, public DNS validation, certificate issuance, ECR repositories, image signing/scanning, CI/CD, deployment approvals, or application/FHIR implementation are included.
- Secret values are not created. Referenced secrets must be provisioned and rotated through an approved out-of-band process. If they use another KMS key, update the scoped execution-role policy.
- Database access currently uses the RDS master credential as an integration placeholder. Before production, create least-privilege, separately rotated application and FHIR database users and update secret references.
- Redis authorization is network-isolated and TLS protected; confirm whether the selected ElastiCache Serverless engine/version supports and requires an additional approved data-plane authentication design for the organization's threat model.
- WAF managed rules and thresholds require tuning, application-specific exclusions, bot/DDoS review, and false-positive testing. AWS Shield Advanced is not enabled.
- Alarms are a starting set only. Add SLOs, log-derived security detections, paging/escalation, synthetic checks, RDS/Redis event subscriptions, and tested runbooks.
- Backups remain in-region and in-account. Add an organization-approved immutable cross-account/cross-region copy strategy and routinely test restores. Vault Lock becomes immutable after its grace period.
- ALB access logs use AWS-supported SSE-S3 rather than a customer-managed KMS key. Validate this exception against organizational policy.
- IPv6, Network Firewall/egress filtering, private CA lifecycle, mTLS, FIPS endpoint requirements, and tenant isolation are not implemented.
- Terraform does not prevent PHI from being written by the application into logs, metrics, tags, URLs, traces, or error messages. Application-level minimization and redaction must be verified separately.
