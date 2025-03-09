import os
from aws_cdk import (
    Stack,
    CfnOutput,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_iam as iam,
    aws_elasticloadbalancingv2 as elb,
    aws_secretsmanager as secretsmanager,
    Duration,
    aws_route53 as route53,
    aws_route53_targets as targets,
)
from constructs import Construct

class FastApiFargateStack(Stack):
    def __init__(self, scope: Construct, id: str, 
             backend_ecr_repo_uri=None, 
             frontend_ecr_repo_uri=None,
             commit_sha="latest",
             certificate_arn=None,
             hosted_zone_id=None,
             **kwargs) -> None:
        super().__init__(scope, id, **kwargs)

        # Print debug information
        print(f"Stack initialization with:")
        print(f"  Backend ECR Repo URI: {backend_ecr_repo_uri}")
        print(f"  Frontend ECR Repo URI: {frontend_ecr_repo_uri}")
        print(f"  Commit SHA: {commit_sha}")
        print(f"  Certificate ARN: {certificate_arn}")
        print(f"  Hosted Zone ID: {hosted_zone_id}")
        # Create VPC
        vpc = ec2.Vpc(self, "SurveyVPC", max_azs=2)

        # Create ECS Cluster
        cluster = ecs.Cluster(self, "SurveyCluster", vpc=vpc)

        # Fetch secrets from AWS Secrets Manager (e.g., database credentials)
        db_secret, oidc_secret = self._fetch_secrets()
        execution_role = self._create_execution_role(db_secret, oidc_secret)
        
        # Create security groups
        backend_security_group, frontend_security_group, alb_security_group = self._create_security_groups(vpc)

        lb = self._configure_dns(vpc, alb_security_group, hosted_zone_id)
        backend_target_group, frontend_target_group = self._create_target_groups(vpc)

        self._configure_listeners(lb, certificate_arn, backend_target_group, frontend_target_group)
        
        self._configure_backend_service(execution_role, backend_ecr_repo_uri, commit_sha,
                                        cluster, backend_security_group, backend_target_group,
                                        db_secret, oidc_secret)
        
        self._configure_frontend_service(execution_role, frontend_ecr_repo_uri, commit_sha,
                                         cluster, frontend_security_group, frontend_target_group)


        CfnOutput(self, "LoadBalancerDNS", value=lb.load_balancer_dns_name)

        CfnOutput(self, "Route53RecordName", 
            value=f"survey.aws.incredihire.com",  # Adjust this to match your actual record name
            description="The Route53 record name to use for CNAME in Cloudflare"
        )

    def _fetch_secrets(self):
        """Fetch secrets from AWS Secrets Manager"""
        db_secret = secretsmanager.Secret.from_secret_name_v2(
            self, "StagingRdsSecret", "staging/survey/rds"
        )
        oidc_secret = secretsmanager.Secret.from_secret_name_v2(
            self, "StagingOIDCSecret", "staging/survey/googleoauth2"
        )
        return db_secret, oidc_secret
    
    def _create_execution_role(self, db_secret, oidc_secret):
        """Create IAM Role for Fargate Task Execution"""
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
        
        return execution_role

    def _create_alb_security_group(self, vpc):
        """Create security group for ALB"""
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
        
        return alb_security_group
    
    def _create_security_groups(self, vpc):
        """Create security groups for backend and frontend services"""
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
        
        alb_security_group = self._create_alb_security_group(vpc)

        # Allow traffic from ALB to backend and frontend
        backend_security_group.add_ingress_rule(
            alb_security_group,
            ec2.Port.tcp(80),
            "Allow traffic from ALB to backend"
        )
        
        frontend_security_group.add_ingress_rule(
            alb_security_group,
            ec2.Port.tcp(80),
            "Allow traffic from ALB to frontend"
        )
        
        return backend_security_group, frontend_security_group, alb_security_group

    def _create_target_groups(self, vpc):
        """Create target groups for backend and frontend"""
        backend_target_group = elb.ApplicationTargetGroup(
            self, "BackendTargetGroup",
            vpc=vpc,
            port=80,
            protocol=elb.ApplicationProtocol.HTTP,
            target_type=elb.TargetType.IP,
            health_check=elb.HealthCheck(
                path="/api/v1/health/health",
                healthy_http_codes="200,404,403",  # Accept more status codes
                healthy_threshold_count=2,         # Fewer successful checks needed
                unhealthy_threshold_count=5,       # More failures allowed
                timeout=Duration.seconds(10),      # Longer timeout
                interval=Duration.seconds(30)      # Less frequent checks
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
        
        return backend_target_group, frontend_target_group
    
    def _configure_listeners(self, lb, certificate_arn, backend_target_group, frontend_target_group):
        """Configure ALB listeners and routing rules"""
        # Create HTTPS listener
        https_listener = lb.add_listener(
            "HttpsListener", 
            port=443, 
            open=True, 
            certificates=[elb.ListenerCertificate.from_arn(certificate_arn)]
        )
        
        # Create HTTP listener that redirects to HTTPS
        lb.add_listener(
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
    
    def _configure_dns(self, vpc, alb_security_group, hosted_zone_id):
        # Create ALB with security group
        lb = elb.ApplicationLoadBalancer(
            self, "SurveyALB", 
            vpc=vpc, 
            internet_facing=True,
            security_group=alb_security_group,
            load_balancer_name="survey-incredihire-alb"
        )

        """Configure DNS for the application"""
        domain_name = os.environ.get("DOMAIN_NAME", "aws.incredihire.com")
        hosted_zone = route53.HostedZone.from_hosted_zone_attributes(
            self, id="SurveyStack", 
            zone_name=domain_name,
            hosted_zone_id=hosted_zone_id
        )
        
        route53.ARecord(
            self, "AliasRecord",
            zone=hosted_zone,
            record_name="survey.aws.incredihire.com",  # The full domain for your app
            target=route53.RecordTarget.from_alias(
                targets.LoadBalancerTarget(lb)
            )
        )
        return lb
    
    def _configure_backend_service(self, execution_role, backend_ecr_repo_uri, commit_sha,
                                   cluster, backend_security_group, backend_target_group,
                                   db_secret, oidc_secret):
        
        # Create Fargate Task Definition for Backend
        backend_task_definition = ecs.FargateTaskDefinition(
            self, "SurveyTaskDef",
            cpu=512,
            memory_limit_mib=1024,
            execution_role=execution_role  # Use execution_role instead of task_role
        )

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
            port_mappings=[ecs.PortMapping(container_port=80)]
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

    def _configure_frontend_service(self, execution_role, frontend_ecr_repo_uri, commit_sha,
                                    cluster, frontend_security_group, frontend_target_group):
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
