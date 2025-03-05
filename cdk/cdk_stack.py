from aws_cdk import (
    Stack,
    CfnOutput,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_iam as iam,
    aws_elasticloadbalancingv2 as elb,
    aws_secretsmanager as secretsmanager,
    aws_logs as logs,
    aws_ecs_patterns as ecs_patterns
)
from constructs import Construct

class FastApiFargateStack(Stack):
    def __init__(self, scope: Construct, id: str, 
             backend_ecr_repo_uri=None, 
             frontend_ecr_repo_uri=None,
             commit_sha="latest",
             certificate_arn=None,
             **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Print debug information
        print(f"Stack initialization with:")
        print(f"  Backend ECR Repo URI: {backend_ecr_repo_uri}")
        print(f"  Frontend ECR Repo URI: {frontend_ecr_repo_uri}")
        print(f"  Commit SHA: {commit_sha}")
        print(f"  Certificate ARN: {certificate_arn}")

        # Create VPC
        vpc = ec2.Vpc(self, "SurveyVPC", max_azs=2)

        # Create ECS Cluster
        cluster = ecs.Cluster(self, "SurveyCluster", vpc=vpc)

        # Fetch secrets from AWS Secrets Manager (e.g., database credentials)
        db_secret = secretsmanager.Secret.from_secret_name_v2(self, "StagingRdsSecret", "staging/survey/rds")
        oidc_secret = secretsmanager.Secret.from_secret_name_v2(self, "StagingOIDCSecret", "staging/survey/googleoauth2")
        
        # Create IAM Role for Fargate Task Execution
        execution_role = iam.Role(
            self, "SurveyExecutionRole",
            assumed_by=iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name("service-role/AmazonECSTaskExecutionRolePolicy")
            ]
        )

        # Add specific permissions for Secrets Manager
        execution_role.add_to_policy(
            iam.PolicyStatement(
                actions=["secretsmanager:GetSecretValue"],
                resources=[
                    db_secret.secret_arn,
                    oidc_secret.secret_arn
                ]
            )
        )

        # Backend Fargate Service with Application Load Balancer
        backend_arn = f"{backend_ecr_repo_uri}:{commit_sha}"
        print(f"Backend ARN: {backend_arn}")

        backend_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "SurveyBackendService",
            cluster=cluster,
            cpu=512,
            memory_limit_mib=1024,
            desired_count=1,
            task_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC),
            assign_public_ip=True,
            public_load_balancer=True,
            certificate=certificate_arn,
            redirect_http=True,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_registry(backend_arn),
                container_name="SurveyBackendContainer",
                container_port=8000,
                execution_role=execution_role,
                log_driver=ecs.LogDrivers.aws_logs(stream_prefix="backend"),
                environment={
                    "FIRST_SUPERUSER": "admin@example.com",
                    "FIRST_SUPERUSER_PASSWORD": "ABC123456789",
                    "DOMAIN": "survey.incredihire.com",
                    "ENVIRONMENT": "staging",
                    "PROJECT_NAME": "Survey",
                    "BACKEND_CORS_ORIGINS": "https://survey.incredihire.com",
                    "OPENID_CONNECT_URL": "https://accounts.google.com/.well-known/openid-configuration",
                    "OIDC_ISSUER": "https://accounts.google.com",
                    "OIDC_REDIRECT_URI": "https://survey.incredihire.com/api/v1/auth/callback",
                    "FORWARDED_ALLOW_IPS": "*",
                    "PROXY_HEADERS": "1",
                    "POSTGRES_DB": "postgres",
                },
                secrets={
                    "OIDC_CLIENT_ID": ecs.Secret.from_secrets_manager(oidc_secret, "GOOGLE_CLIENT_ID"),
                    "OIDC_CLIENT_SECRET": ecs.Secret.from_secrets_manager(oidc_secret,"GOOGLE_CLIENT_SECRET"),
                    "POSTGRES_USER": ecs.Secret.from_secrets_manager(db_secret,"username"),
                    "POSTGRES_PASSWORD": ecs.Secret.from_secrets_manager(db_secret,"password"),
                    "POSTGRES_SERVER":ecs.Secret.from_secrets_manager(db_secret,"host"),
                    "POSTGRES_PORT": ecs.Secret.from_secrets_manager(db_secret,"port")
                },
            ),
            health_check_grace_period=ecs.Duration.seconds(60)
        )

        # Configure health check for backend service
        backend_service.target_group.configure_health_check(
            path="/health",
            healthy_http_codes="200"
        )

        # Frontend Fargate Service with Application Load Balancer
        frontend_arn = f"{frontend_ecr_repo_uri}:{commit_sha}"
        print(f"Frontend ARN: {frontend_arn}")

        frontend_service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "SurveyFrontendService",
            cluster=cluster,
            cpu=256,
            memory_limit_mib=512,
            desired_count=1,
            task_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC),
            assign_public_ip=True,
            public_load_balancer=True,
            certificate=certificate_arn,
            redirect_http=True,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_registry(frontend_arn),
                container_name="SurveyFrontendContainer",
                container_port=80,
                execution_role=execution_role,
                log_driver=ecs.LogDrivers.aws_logs(stream_prefix="frontend"),
                environment={
                    "VITE_API_URL": "//survey.incredihire.com",
                    "PROJECT_NAME": "Survey-frontend",
                    "WITH_CREDENTIALS": "true",
                },
            ),
            health_check_grace_period=ecs.Duration.seconds(60)
        )

        # Configure health check for frontend service
        frontend_service.target_group.configure_health_check(
            path="/",
            healthy_http_codes="200"
        )

        # Output the load balancer DNS names
        CfnOutput(self, "BackendLoadBalancerDNS", value=backend_service.load_balancer.load_balancer_dns_name)
        CfnOutput(self, "FrontendLoadBalancerDNS", value=frontend_service.load_balancer.load_balancer_dns_name)