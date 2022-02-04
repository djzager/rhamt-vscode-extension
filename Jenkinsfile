#!/usr/bin/env groovy

node('rhel7'){
	stage('Checkout repo') {
		deleteDir()
		git url: 'https://github.com/windup/rhamt-vscode-extension.git'
	}

	stage('Install requirements') {
		def nodeHome = tool 'nodejs-12.13.1'
		env.PATH="${env.PATH}:${nodeHome}/bin"
		sh 'npm install -g typescript "vsce@<2"'
	}

	stage('Build') {
		sh "npm install"
		sh "npm run vscode:prepublish"
	}

	stage('Package') {
		try {
			def packageJson = readJSON file: 'package.json'
			sh "vsce package -o mta-vscode-extension-${packageJson.version}-${env.BUILD_NUMBER}.vsix"
			sh "npm pack && mv mta-vscode-extension-${packageJson.version}.tgz mta-vscode-extension-${packageJson.version}-${env.BUILD_NUMBER}.tgz"
		}
		finally {
			archiveArtifacts artifacts: '*.vsix,**.tgz'
		}
	}
	if(params.UPLOAD_LOCATION) {
		stage('Snapshot') {
			def filesToPush = findFiles(glob: '**.vsix')
			sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${filesToPush[0].path} ${UPLOAD_LOCATION}/snapshots/mta-vscode-extension/"
			stash name:'vsix', includes:filesToPush[0].path
			def tgzFilesToPush = findFiles(glob: '**.tgz')
			sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${tgzFilesToPush[0].path} ${UPLOAD_LOCATION}/snapshots/mta-vscode-extension/"
			stash name:'tgz', includes:tgzFilesToPush[0].path
		}
	}
}

node('rhel7'){
	if(publishToMarketPlace.equals('true')){
		timeout(time:5, unit:'DAYS') {
			input message:'Approve deployment?', submitter: 'josteele'
		}

		stage("Publish to Marketplace") {
            unstash 'vsix'
            unstash 'tgz'
            withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
                def vsix = findFiles(glob: '**.vsix')
                sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
            }
            archiveArtifacts artifacts:"**.vsix,**.tgz"

            stage "Promote the build to stable"
            def vsix = findFiles(glob: '**.vsix')
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} ${UPLOAD_LOCATION}/stable/mta-vscode-extension/"
            def tgz = findFiles(glob: '**.tgz')
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${tgz[0].path} ${UPLOAD_LOCATION}/stable/mta-vscode-extension/"

			sh "npm install -g ovsx"
			withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
				def packageJson = readJSON file: 'package.json'
				sh "ovsx publish -p ${OVSX_TOKEN} mta-vscode-extension-${packageJson.version}-${env.BUILD_NUMBER}.vsix"
			}
        }
	}
}

