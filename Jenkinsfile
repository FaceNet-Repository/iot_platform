pipeline {
    agent {label "thingsboard"}
    stages{
        stage('Build') {
            steps {
                dir('docker') {
                    sh 'git config --global core.autocrlf input'
                    sh 'mvn clean install -DskipTests -Ddockerfile.skip=false'
                }
            }
        }
        stage('Run docker') {
            steps {
                sh 'docker compose up -d --build'
            }
        }
    }
}
