import os
import aws_cdk as cdk
import aws_cdk.assertions as assertions

from cdk.cdk_stack import FastApiFargateStack

def test_vpc_and_basic_resources_created():
    # Get values from environment variables with fallbacks for CI/testing
    aws_account_id = os.environ.get("AWS_ACCOUNT_ID", "123456789012")
    aws_region = os.environ.get("AWS_REGION", "us-west-2")
    commit_sha = os.environ.get("COMMIT_SHA", "latest")
    certificate_arn = os.environ.get("CERTIFICATE_ARN", 
                                    f"arn:aws:acm:{aws_region}:{aws_account_id}:certificate/example-cert")
    app = cdk.App(context={
        "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_backend",
        "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_frontend",
        "commit_sha": commit_sha,
        "certificate_arn": certificate_arn
    })
    stack = FastApiFargateStack(app, "SurveyStack")
    template = assertions.Template.from_stack(stack)

    # Test VPC resources
    template.resource_count_is("AWS::EC2::VPC", 1)
    template.resource_count_is("AWS::EC2::Subnet", 4)  # 2 public, 2 private subnets
    template.resource_count_is("AWS::EC2::RouteTable", 4)  # 1 for each subnet
    template.resource_count_is("AWS::EC2::NatGateway", 2)  # 1 per AZ

    # Test ECS resources
    template.resource_count_is("AWS::ECS::Cluster", 1)
    template.has_resource_properties("AWS::ECS::Cluster", {
        "ClusterName": assertions.Match.any_value()
    })

    # Test security groups
    template.resource_count_is("AWS::EC2::SecurityGroup", 3)  # ALB, Backend, Frontend

def test_load_balancer_configuration():
    aws_account_id = os.environ.get("AWS_ACCOUNT_ID", "123456789012")
    aws_region = os.environ.get("AWS_REGION", "us-west-2")
    commit_sha = os.environ.get("COMMIT_SHA", "latest")
    certificate_arn = os.environ.get("CERTIFICATE_ARN", 
                                    f"arn:aws:acm:{aws_region}:{aws_account_id}:certificate/example-cert")
    app = cdk.App(context={
        "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_backend",
        "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_frontend",
        "commit_sha": commit_sha,
        "certificate_arn": certificate_arn
    })
    stack = FastApiFargateStack(app, "SurveyStack")
    template = assertions.Template.from_stack(stack)

    # Test ALB resources
    template.resource_count_is("AWS::ElasticLoadBalancingV2::LoadBalancer", 1)
    template.has_resource_properties("AWS::ElasticLoadBalancingV2::LoadBalancer", {
        "LoadBalancerAttributes": assertions.Match.array_with([
            {
                "Key": "deletion_protection.enabled",
                "Value": "false"
            }
        ]),
        "Scheme": "internet-facing",
        "Type": "application"
    })

    # Test target groups
    template.resource_count_is("AWS::ElasticLoadBalancingV2::TargetGroup", 2)  # Backend and Frontend

    # Test listeners
    template.resource_count_is("AWS::ElasticLoadBalancingV2::Listener", 2)  # HTTP and HTTPS

def test_fargate_services():
    aws_account_id = os.environ.get("AWS_ACCOUNT_ID", "123456789012")
    aws_region = os.environ.get("AWS_REGION", "us-west-2")
    commit_sha = os.environ.get("COMMIT_SHA", "latest")
    certificate_arn = os.environ.get("CERTIFICATE_ARN", 
                                    f"arn:aws:acm:{aws_region}:{aws_account_id}:certificate/example-cert")
    app = cdk.App(context={
        "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_backend",
        "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_frontend",
        "commit_sha": commit_sha,
        "certificate_arn": certificate_arn
    })
    stack = FastApiFargateStack(app, "SurveyStack")
    template = assertions.Template.from_stack(stack)

    # Test Fargate task definitions
    template.resource_count_is("AWS::ECS::TaskDefinition", 2)  # Backend and Frontend

    # Test Fargate services
    template.resource_count_is("AWS::ECS::Service", 2)  # Backend and Frontend

    # Test backend service properties
    template.has_resource_properties("AWS::ECS::Service", {
        "LaunchType": "FARGATE",
        "DesiredCount": 1,
        "AssignPublicIp": "ENABLED"
    })

def test_iam_roles():
    aws_account_id = os.environ.get("AWS_ACCOUNT_ID", "123456789012")
    aws_region = os.environ.get("AWS_REGION", "us-west-2")
    commit_sha = os.environ.get("COMMIT_SHA", "latest")
    certificate_arn = os.environ.get("CERTIFICATE_ARN", 
                                    f"arn:aws:acm:{aws_region}:{aws_account_id}:certificate/example-cert")
    app = cdk.App(context={
        "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_backend",
        "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_frontend",
        "commit_sha": commit_sha,
        "certificate_arn": certificate_arn
    })
    stack = FastApiFargateStack(app, "SurveyStack")
    template = assertions.Template.from_stack(stack)

    # Test IAM roles
    template.resource_count_is("AWS::IAM::Role", 3)  # Execution role and task roles

    # Test execution role has proper permissions
    template.has_resource_properties("AWS::IAM::Role", {
        "AssumeRolePolicyDocument": {
            "Statement": [
                {
                    "Action": "sts:AssumeRole",
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "ecs-tasks.amazonaws.com"
                    }
                }
            ]
        },
        "ManagedPolicyArns": [
            {
                "Fn::Join": [
                    "",
                    [
                        "arn:",
                        {"Ref": "AWS::Partition"},
                        ":iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
                    ]
                ]
            }
        ]
    })

def test_route53_records():
    aws_account_id = os.environ.get("AWS_ACCOUNT_ID", "123456789012")
    aws_region = os.environ.get("AWS_REGION", "us-west-2")
    commit_sha = os.environ.get("COMMIT_SHA", "latest")
    certificate_arn = os.environ.get("CERTIFICATE_ARN", 
                                    f"arn:aws:acm:{aws_region}:{aws_account_id}:certificate/example-cert")
    hosted_zone_id = os.environ.get("HOSTED_ZONE_ID", "Z1234567890ABC")

    app = cdk.App(context={
        "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_backend",
        "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_frontend",
        "commit_sha": commit_sha,
        "certificate_arn": certificate_arn,
        "hosted_zone_id": hosted_zone_id
    })

    # Skip this test if hosted_zone_id is not provided
    if hosted_zone_id == "Z1234567890ABC":
        return

    stack = FastApiFargateStack(app, "SurveyStack", hosted_zone_id=hosted_zone_id)
    template = assertions.Template.from_stack(stack)

    # Test Route53 record
    template.resource_count_is("AWS::Route53::RecordSet", 1)
    template.has_resource_properties("AWS::Route53::RecordSet", {
        "Name": "survey.aws.incredihire.com.",
        "Type": "A"
    })

def test_outputs():
    aws_account_id = os.environ.get("AWS_ACCOUNT_ID", "123456789012")
    aws_region = os.environ.get("AWS_REGION", "us-west-2")
    commit_sha = os.environ.get("COMMIT_SHA", "latest")
    certificate_arn = os.environ.get("CERTIFICATE_ARN", 
                                    f"arn:aws:acm:{aws_region}:{aws_account_id}:certificate/example-cert")
    app = cdk.App(context={
        "backend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_backend",
        "frontend_ecr_repo_uri": f"{aws_account_id}.dkr.ecr.{aws_region}.amazonaws.com/survey_frontend",
        "commit_sha": commit_sha,
        "certificate_arn": certificate_arn
    })
    stack = FastApiFargateStack(app, "SurveyStack")
    template = assertions.Template.from_stack(stack)

    # Test CloudFormation outputs
    template.has_output("LoadBalancerDNS", {})
    template.has_output("Route53RecordName", {
        "Value": "survey.aws.incredihire.com"
    })
