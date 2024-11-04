pipeline {
    agent {label "thingsboard"}
    stages{
        stage('Build') {
            steps {
                dir('docker') { 
                    bat 'git config --global core.autocrlf input'
                    bat 'mvn clean install -DskipTests -Ddockerfile.skip=false'
                }
            }
        }
        stage('Run docker') {
            steps {
                bat 'docker compose up -d --build'
            }
        }
    }
}
