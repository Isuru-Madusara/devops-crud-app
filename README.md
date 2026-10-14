# 🚀 DevOps CRUD Application on AWS

An end-to-end DevOps project demonstrating how to build, test, containerize, and deploy a CRUD web application using AWS, Jenkins, Docker, Ansible, Terraform, and MySQL.

The project focuses on automating application deployment, managing cloud infrastructure, and connecting a Node.js application to a managed MySQL database.

## 📌 Project Overview

This project implements a CRUD (Create, Read, Update, Delete) web application and deploys it to AWS using an automated CI/CD pipeline.

When code changes are pushed to GitHub, Jenkins checks out the source code, runs automated tests, builds a Docker image, pushes the image to Docker Hub, and triggers Ansible to deploy the updated application on an AWS EC2 instance.

The application uses Amazon RDS MySQL to store task data and Nginx as a reverse proxy.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend web framework |
| EJS / HTML / CSS | Web interface |
| MySQL | Relational database |
| Amazon RDS | Managed MySQL database |
| AWS EC2 | Application hosting |
| Docker | Application containerization |
| Docker Hub | Docker image registry |
| Jenkins | CI/CD automation |
| Ansible | Server configuration and deployment |
| Terraform | Infrastructure as Code |
| Nginx | Reverse proxy |
| Git & GitHub | Version control and source code hosting |

## 🏗️ Architecture

```text
                    Developer
                        |
                        v
                  GitHub Repository
                        |
                        v
                 Jenkins CI/CD Pipeline
                        |
              +---------+----------+
              |         |          |
              v         v          v
          Checkout    Run Tests   Build Image
                                    |
                                    v
                              Docker Hub
                                    |
                                    v
                             Ansible Playbook
                                    |
                                  SSH
                                    |
                                    v
                     +---------------------------+
                     |       AWS EC2             |
                     |                           |
User Browser ------>| Nginx Reverse Proxy :80    |
                     |            |              |
                     |            v              |
                     | Docker Container          |
                     | Node.js + Express :3000   |
                     +------------+--------------+
                                  |
                                  v
                     +---------------------------+
                     | Amazon RDS                 |
                     | MySQL - tasksdb            |
                     | Private Database           |
                     +---------------------------+

               Terraform provisions AWS resources
```

## ⚙️ CI/CD Workflow

### 1. Source Code Management

The application source code is maintained in GitHub. Developers push changes to the `main` branch.

### 2. Continuous Integration with Jenkins

Jenkins automates the pipeline:

- Checks out the latest source code.
- Installs Node.js dependencies.
- Runs automated application tests.
- Builds a Docker image.
- Tags the image using the Jenkins build number and `latest`.
- Pushes the images to Docker Hub.

### 3. Docker Containerization

Docker packages the application and its runtime dependencies into a portable image.

This helps maintain a consistent application environment across development and deployment.

### 4. Deployment with Ansible

Ansible connects to the EC2 instance over SSH and automates deployment tasks:

- Configures the application environment.
- Retrieves the required Docker image.
- Replaces the previous application container.
- Configures Nginx as a reverse proxy.
- Verifies the application health endpoint.

### 5. AWS Infrastructure with Terraform

Terraform is used for Infrastructure as Code. Where configured, it provisions and manages AWS resources such as EC2, RDS, and related networking and security settings.

### 6. Database Integration

The Node.js application connects to MySQL hosted on Amazon RDS.

The database is intended to remain private, with access restricted to the application server through appropriate network and security-group rules.

## 🔄 Application Request Flow

1. A user opens the web application in a browser.
2. The request reaches Nginx on the EC2 instance.
3. Nginx forwards the request to the Node.js/Express application running in a Docker container.
4. The application processes CRUD operations.
5. Data is retrieved from or saved to Amazon RDS MySQL.
6. The application returns a response to the browser.

## 📂 Project Structure

```text
devops-crud-app/
├── app/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── Dockerfile
│   ├── views/
│   │   └── index.ejs
│   └── test/
│       └── app.test.js
├── ansible/
│   ├── inventory.ini
│   └── deploy.yml
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── Jenkinsfile
├── .gitignore
└── README.md
```

*Note: Adjust the Terraform filenames or directory structure if your repository differs from this example.*

## 🧪 Run Locally

### Prerequisites

- Node.js and npm
- MySQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Isuru-Madusara/devops-crud-app.git
cd devops-crud-app
```

### 2. Install dependencies

```bash
npm ci --prefix app
```

### 3. Configure environment variables

Configure the application with your local MySQL database details.

Example:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tasksdb
DB_USER=appadmin
DB_PASSWORD=your_local_database_password
```

Create a local `.env` file only if your application is configured to load it. Never commit real credentials to GitHub.

### 4. Start the application

```bash
npm start --prefix app
```

Open:

```text
http://localhost:3000
```

The local database must be running, and the required database and tables must be initialized.

## ✅ Run Automated Tests

Run the application's test suite:

```bash
npm test --prefix app
```

The test suite includes checks for application health, creating and reading tasks, and rejecting an empty task title.

## 🐳 Build the Docker Image

From the repository root:

```bash
docker build \
  -t devops-crud-app:latest \
  -f app/Dockerfile \
  app
```

Run the container:

```bash
docker run --rm \
  -p 3000:3000 \
  --env-file app/.env \
  devops-crud-app:latest
```

Ensure `app/.env` exists and contains the appropriate database configuration before starting the container.

## ☁️ AWS Deployment

The application is deployed using the following components:

- **EC2:** Runs the application container and Nginx.
- **Amazon RDS:** Stores application data in MySQL.
- **Security Groups:** Restrict network access between components.
- **Terraform:** Provisions infrastructure defined in the Terraform configuration.
- **Ansible:** Configures the EC2 server and deploys the application.
- **Jenkins:** Automates testing, image building, publishing, and deployment.

The application health endpoint is:

```text
/health
```

A successful health check returns a response indicating that the application is healthy and the database connection is working.

## 🔐 Security Considerations

- Store credentials in Jenkins Credentials or another suitable secrets manager.
- Never commit `.env` files, passwords, SSH private keys, AWS access keys, or Terraform state containing secrets.
- Keep Amazon RDS private and restrict inbound database traffic to the application server.
- Apply least-privilege IAM permissions.
- Restrict SSH access to trusted IP addresses.
- Configure HTTPS using a valid TLS certificate before exposing the application for production use.
- Review Terraform plans before applying or destroying infrastructure.
- Back up database data before deleting AWS resources.

## 🎯 Key Learning Outcomes

Through this project, I gained practical experience with:

- Building a CRUD web application.
- Writing and running automated tests.
- Containerizing applications with Docker.
- Building a Jenkins CI/CD pipeline.
- Publishing versioned Docker images.
- Deploying applications using Ansible.
- Provisioning AWS infrastructure with Terraform.
- Integrating Node.js with Amazon RDS MySQL.
- Configuring Nginx as a reverse proxy.
- Understanding cloud networking and deployment automation.


**Isuru Madusara**

GitHub: [Isuru-Madusara](https://github.com/Isuru-Madusara)

Project Repository: [devops-crud-app](https://github.com/Isuru-Madusara/devops-crud-app)

---

*Built as a hands-on project to develop practical skills in DevOps, cloud infrastructure, CI/CD, and deployment automation.*
