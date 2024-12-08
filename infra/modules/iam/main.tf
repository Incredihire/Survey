resource "aws_iam_role" "ecs_task_execution" {
  name = "iam_role_for_ecs_task_exec"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

  inline_policy {
    name = "ecs_secrets_and_logs_access"

    policy = jsonencode({
      Version = "2012-10-17",
      Statement = [
        {
          Effect = "Allow",
          Action = [
            "secretsmanager:GetSecretValue"
          ],
          Resource = "arn:aws:secretsmanager:us-west-2:913524926070:secret:staging/survey/rds-6cId0d"
        },
        {
          Effect = "Allow",
          Action = [
            "logs:CreateLogGroup",
            "logs:PutRetentionPolicy",
            "logs:TagResource"
          ],
          Resource = [
            "arn:aws:logs:us-west-2:913524926070:log-group:survey-backend-logs:*",
            "arn:aws:logs:us-west-2:913524926070:log-group:survey-frontend-logs:*"
          ]
        }
      ]
    })
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}