pipeline {
    agent {label "thingsboard"}
    stages{
        stage('Build') {
            steps {
                sh 'git config --global core.autocrlf input'
                sh 'mvn clean install -DskipTests -Ddockerfile.skip=false'
            }
        }
        stage('Run docker') {
            steps {
                dir('docker') {
                    sh 'docker compose up -d --build'
                }
            }
        }
    }
}
