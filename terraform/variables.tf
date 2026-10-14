
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

variable "db_name" {
  description = "Application database name"
  type        = string
  default     = "tasksdb"
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "appadmin"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.db_password) >= 12
    error_message = "Database password must have at least 12 characters."
  }
}

variable "admin_cidr" {
  description = "Your public IP with /32 for SSH"
  type        = string

  validation {
    condition     = can(cidrhost(var.admin_cidr, 0))
    error_message = "Use a valid CIDR, for example 203.0.113.10/32."
  }
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ec2_key_name" {
  description = "Existing EC2 key pair name"
  type        = string
}

variable "ec2_ami_id" {
  description = "Ubuntu AMI ID"
  type        = string
}

