resource "aws_ecr_repository" "instance" {
  name = "survey-sandbox"
}

data "aws_ecr_repository" "instance" {
  name = aws_ecr_repository.instance.name
}
