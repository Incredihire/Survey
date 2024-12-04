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


