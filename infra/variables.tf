variable "region" {
  description = "The default AWS region to use for provisioning infrastructure"
  type        = string
  default     = "us-west-2"
}

variable "AWS-accountID" {
  description = "AWS Account ID"
  type        = string
  default     = "913524926070"
}


variable "project_name" {
  description = "The name of the project used for tagging resources"
  type        = string
  default     = "survey"
}

variable "vpc_data" {
  description = "Variable to hold and object for vpc configuration"

  type = object({
    vpc_cidr = string
    availability_zones = list(object({
      az_name                 = string
      public_subnet_cidr      = string
      private_app_subnet_cidr = string
    }))
  })

  default = {
    vpc_cidr = "10.0.0.0/16"
    availability_zones = [{
      az_name                 = "us-west-2a"
      public_subnet_cidr      = "10.0.0.0/20"
      private_app_subnet_cidr = "10.0.64.0/20"
      },
      {
        az_name                 = "us-west-2b"
        public_subnet_cidr      = "10.0.16.0/20"
        private_app_subnet_cidr = "10.0.80.0/20"
      },
      {
        az_name                 = "us-west-2c"
        public_subnet_cidr      = "10.0.32.0/20"
        private_app_subnet_cidr = "10.0.96.0/20"
    }]
  }
}


variable "image_tag" {
  description = "The tag to fetch for the image from the repository"
  type        = string
  default     = "latest"
}
