
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'isurumadusara/devops-crud-app'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install and Test') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefix app'
                sh 'npm test --prefix app'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      -t ${IMAGE_NAME}:latest \
                      -f app/Dockerfile app
                '''
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$DOCKER_TOKEN" | docker login \
                          -u "$DOCKER_USER" --password-stdin

                        docker push ${IMAGE_NAME}:${BUILD_NUMBER}
                        docker push ${IMAGE_NAME}:latest
                        docker logout
                    '''
                }
            }
        }


stage('Deploy with Ansible') {
    steps {
        sshagent(credentials: ['ec2-ssh']) {
            withCredentials([
                string(
                    credentialsId: 'rds-db-password',
                    variable: 'TF_VAR_db_password'
                )
            ]) {
                sh '''
                    set +x

                    ansible-playbook \
                      -i ansible/inventory.ini \
                      ansible/deploy.yml \
                      --extra-vars "app_image=${IMAGE_NAME}:${BUILD_NUMBER}"
                '''
            }
        }
    }
}

    post {
        always {
            echo 'CI/CD pipeline finished. Check stage results above.'
        }
    }
}
