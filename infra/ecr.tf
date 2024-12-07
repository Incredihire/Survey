resource "aws_ecr_repository" "instance" {
  name = "survey-sandbox"
  image_tag_mutability = "IMMUTABLE"

}

data "aws_ecr_repository" "instance" {
  name = aws_ecr_repository.instance.name
}
