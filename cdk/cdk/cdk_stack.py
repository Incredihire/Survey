from aws_cdk import (
    Stack,
    CfnOutput,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_iam as iam,
    aws_elasticloadbalancingv2 as elb,
    aws_secretsmanager as secretsmanager,
    aws_logs as logs
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

        # Create security group for ALB
        alb_security_group = ec2.SecurityGroup(
            self, "ALBSecurityGroup",
            vpc=vpc,
            description="Security group for the application load balancer"
        )

        # Allow HTTP and HTTPS traffic from anywhere
        alb_security_group.add_ingress_rule(
            ec2.Peer.any_ipv4(),
            ec2.Port.tcp(80),
            "Allow HTTP traffic from anywhere"
        )
        alb_security_group.add_ingress_rule(
            ec2.Peer.any_ipv4(),
            ec2.Port.tcp(443),
            "Allow HTTPS traffic from anywhere"
        )

        # Create ALB with security group
        lb = elb.ApplicationLoadBalancer(
            self, "SurveyALB", 
            vpc=vpc, 
            internet_facing=True,
            security_group=alb_security_group
        )

        # Create security groups for services
        backend_security_group = ec2.SecurityGroup(
            self, "BackendSecurityGroup",
            vpc=vpc,
            description="Security group for the backend service"
        )

        frontend_security_group = ec2.SecurityGroup(
            self, "FrontendSecurityGroup",
            vpc=vpc,
            description="Security group for the frontend service"
        )

        # Allow traffic from ALB to backend and frontend
        backend_security_group.add_ingress_rule(
            alb_security_group,
            ec2.Port.tcp(8000),
            "Allow traffic from ALB to backend"
        )

        frontend_security_group.add_ingress_rule(
            alb_security_group,
            ec2.Port.tcp(80),
            "Allow traffic from ALB to frontend"
        )

        # Create target groups
        backend_target_group = elb.ApplicationTargetGroup(
            self, "BackendTargetGroup",
            vpc=vpc,
            port=8000,
            protocol=elb.ApplicationProtocol.HTTP,
            target_type=elb.TargetType.IP,
            health_check=elb.HealthCheck(
                path="/api/v1/health/health",
                healthy_http_codes="200"
            )
        )

        frontend_target_group = elb.ApplicationTargetGroup(
            self, "FrontendTargetGroup",
            vpc=vpc,
            port=80,
            protocol=elb.ApplicationProtocol.HTTP,
            target_type=elb.TargetType.IP,
            health_check=elb.HealthCheck(
                path="/",
                healthy_http_codes="200"
            )
        )

        # Create HTTPS listener and add target groups
        https_listener = lb.add_listener(
            "HttpsListener", 
            port=443, 
            open=True, 
            certificates=[elb.ListenerCertificate.from_arn(certificate_arn)]
        )

       # After creating the HTTPS listener, add an HTTP listener that redirects to HTTPS
        http_listener = lb.add_listener(
            "HttpListener",
            port=80,
            open=True,
            default_action=elb.ListenerAction.redirect(
                protocol="HTTPS",
                port="443",
                host="#{host}",
                path="/#{path}",
                query="#{query}",
                permanent=True
            )
        )
        
        # Add rules to route traffic to the appropriate target group
        https_listener.add_action(
            "BackendRule",
            priority=10,
            conditions=[
                elb.ListenerCondition.path_patterns(["/api/*", "/docs", "/redoc"])
            ],
            action=elb.ListenerAction.forward([backend_target_group])
        )

        # Default action routes to frontend
        https_listener.add_action(
            "DefaultAction",
            action=elb.ListenerAction.forward([frontend_target_group])
        )

        # Create Fargate Task Definition for Backend
        backend_task_definition = ecs.FargateTaskDefinition(
            self, "SurveyTaskDef",
            cpu=512,
            memory_limit_mib=1024,
            execution_role=execution_role  # Use execution_role instead of task_role
        )

        # Rest of the code remains the same...

        backend_arn = f"{backend_ecr_repo_uri}:{commit_sha}"
        print(f"Backend ARN: {backend_arn}")

        backend_container = backend_task_definition.add_container(
            "SurveyBackendContainer",
            image=ecs.ContainerImage.from_registry(backend_arn),
            logging=ecs.LogDrivers.aws_logs(stream_prefix="backend"),
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
            port_mappings=[ecs.PortMapping(container_port=8000)]
        )

        # Create Fargate Service for Backend
        backend_service = ecs.FargateService(
            self, "SurveyBackendService",
            cluster=cluster,
            task_definition=backend_task_definition,
            desired_count=1,
            assign_public_ip=True,
            min_healthy_percent=100,
            max_healthy_percent=200,
            security_groups=[backend_security_group]
        )

        # Register backend service with target group
        backend_service.attach_to_application_target_group(backend_target_group)

        # Create Fargate Task Definition for Frontend
        frontend_task_definition = ecs.FargateTaskDefinition(
            self, "FrontendTaskDef",
            cpu=256,
            memory_limit_mib=512,
            execution_role=execution_role
        )

        frontend_arn = f"{frontend_ecr_repo_uri}:{commit_sha}"
        print(f"Frontend ARN: {frontend_arn}")
                                        
        frontend_container = frontend_task_definition.add_container(
            "SurveyFrontendContainer",
            image=ecs.ContainerImage.from_registry(frontend_arn),
            logging=ecs.LogDrivers.aws_logs(stream_prefix="frontend"),
            environment={
                "VITE_API_URL": "//survey.incredihire.com",
                "PROJECT_NAME": "Survey-frontend",
                "WITH_CREDENTIALS": "true",
            },
            port_mappings=[ecs.PortMapping(container_port=80)]
        )

        # Create Fargate Service for Frontend
        frontend_service = ecs.FargateService(
            self, "SurveyFrontendService",
            cluster=cluster,
            task_definition=frontend_task_definition,
            desired_count=1,
            assign_public_ip=True,
            min_healthy_percent=100,
            max_healthy_percent=200,
            security_groups=[frontend_security_group]
        )

        # Register frontend service with target group
        frontend_service.attach_to_application_target_group(frontend_target_group)

        CfnOutput(self, "LoadBalancerDNS", value=lb.load_balancer_dns_name)
