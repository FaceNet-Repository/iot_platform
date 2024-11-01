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
                bat 'docker compose up -d --build'
            }
        }
    }
}
