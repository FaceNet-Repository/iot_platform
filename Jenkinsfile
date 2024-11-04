pipeline {
    agent {label "thingsboard"}
    stages{
        stage("Check old image") {
            steps {
                bat 'docker rm -f ubuntu_thingsboard|| echo "this container does not exist" '
                bat 'docker image rm -f ubuntu_thingsboard || echo "this image dose not exist" '
            }
        }
        stage('Build and Run') {
            steps {
                bat 'cd docker'
                bat 'git config --global core.autocrlf input'
                bat 'mvn clean install -DskipTests -Ddockerfile.skip=false'
                bat 'docker compose up -d --build'
            }
        }
    }
}
