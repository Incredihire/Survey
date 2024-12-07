locals {
  app_hosted_zone_domain = "${var.app_hosted_zone_name}.${var.root_domain}"
  sample_app_domain      = "${var.app_subdomain}.${local.app_hosted_zone_domain}"
}

data "aws_caller_identity" "current" {}


#hold
# create vpc
module "vpc" {
  source                        = "./modules/vpc"
  region                        = var.region
  project_name                  = var.project_name
  vpc_data                      = var.vpc_data
}

# create nat gateway
module "nat_gateway" {
  source              = "./modules/nat-gateway"
  vpc_id              = module.vpc.vpc_id
  vpc_data            = var.vpc_data
  public_subnets      = module.vpc.public_subnets
  private_app_subnets = module.vpc.private_app_subnets
}

# create iam role
module "iam" {
  source = "./modules/iam"
}



# Create application load balancer
module "alb-backend" {
  source              = "./modules/alb"
  public_subnets      = module.vpc.public_subnets
  vpc_id              = module.vpc.vpc_id
  project_name        = var.project_name
  app_name            = "backend"
}

# Create ecs cluster, service and task definition
module "ecs-backend" {
  source                          = "./modules/ecs"
  region                          = var.region
  project_name                    = var.project_name
  app_name                        = "backend"
  private_app_subnets             = module.vpc.private_app_subnets
  vpc_id                          = module.vpc.vpc_id
  load_balancer_security_group_id = module.alb-backend.alb_security_group_id
  target_group_arn                = module.alb-backend.target_group_arn
  ecs_task_execution_role_arn     = module.iam.ecs_task_execution_role_arn
  image_path                      =  "913524926070.dkr.ecr.us-west-2.amazonaws.com/survey_backend"
  image_tag                       = var.image_tag
}



##FRONTEND
# Create application load balancer
module "alb-frontend" {
  source              = "./modules/alb"
  public_subnets      = module.vpc.public_subnets
  vpc_id              = module.vpc.vpc_id
  project_name        = var.project_name
  app_name            = "frontend"
}

# Create ecs cluster, service and task definition
module "ecs-frontend" {
  source                          = "./modules/ecs"
  region                          = var.region
  project_name                    = var.project_name
  app_name                        = "frontend"
  private_app_subnets             = module.vpc.private_app_subnets
  vpc_id                          = module.vpc.vpc_id
  load_balancer_security_group_id = module.alb-frontend.alb_security_group_id
  target_group_arn                = module.alb-frontend.target_group_arn
  ecs_task_execution_role_arn     = module.iam.ecs_task_execution_role_arn
  image_path                      =  "913524926070.dkr.ecr.us-west-2.amazonaws.com/survey_frontend"
  image_tag                       = var.image_tag
}

